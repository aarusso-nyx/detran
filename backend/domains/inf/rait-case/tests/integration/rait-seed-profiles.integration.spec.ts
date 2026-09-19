import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const scratchDatabase = 'detran_r7_ctg1_a2_seed_profiles';
const tenantId = '00000000-0000-7000-8000-00000000a001';
const freshCaseId = '00000000-0000-7000-8000-000051020001';
const legacyCaseIds = Array.from(
  { length: 20 },
  (_, index) =>
    `00000000-0000-7000-8000-000010${String(index + 1).padStart(6, '0')}`,
);
const repo = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../..',
);
const databaseDirectory = join(repo, 'backend/database');

type ConnectionUrls = { admin: URL; scratch: URL };
type RunnerResult = { code: number | null; output: string };
type FreshSnapshot = {
  cases: string;
  assessments: string;
  bases: string;
  revision: number;
  outcome: string;
  assessedMatchesProtocolled: boolean;
  legacyCases: string;
  priorityGuardEnabled: boolean;
};

function requiredPostgresUrl(name: string, database: string): URL {
  const raw = process.env[name];
  if (!raw)
    throw new Error(`${name} is required; no database URL fallback exists`);
  const url = new URL(raw);
  if (!['postgres:', 'postgresql:'].includes(url.protocol))
    throw new Error(`${name} must be a PostgreSQL URL`);
  if (decodeURIComponent(url.pathname.slice(1)) !== database)
    throw new Error(`${name} must target ${database}`);
  if (!url.hostname || !url.username)
    throw new Error(`${name} must include an explicit host and user`);
  return url;
}

function connectionUrls(): ConnectionUrls {
  return {
    admin: requiredPostgresUrl('DETRAN_SEED_ADMIN_DATABASE_URL', 'postgres'),
    scratch: requiredPostgresUrl(
      'DETRAN_SEED_SCRATCH_DATABASE_URL',
      scratchDatabase,
    ),
  };
}

function commandEnvironment(url: URL): NodeJS.ProcessEnv {
  return {
    ...process.env,
    DB_NAME: scratchDatabase,
    DB_HOST: url.hostname,
    DB_PORT: url.port || '5432',
    DB_USER: decodeURIComponent(url.username),
    DB_PASSWORD: decodeURIComponent(url.password),
  };
}

function quoteIdentifier(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

async function runRunner(
  script: 'apply.sh' | 'seed.sh',
  profile?: 'fresh' | 'legacy-upgrade',
): Promise<RunnerResult> {
  const urls = connectionUrls();
  const env = commandEnvironment(urls.scratch);
  if (profile) env.SEED_PROFILE = profile;
  else delete env.SEED_PROFILE;
  return new Promise((resolveResult, reject) => {
    const child = spawn('bash', [join(databaseDirectory, script)], {
      cwd: databaseDirectory,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    const timer = setTimeout(() => child.kill('SIGKILL'), 120_000);
    child.stdout.on('data', (chunk: Buffer) => (output += chunk.toString()));
    child.stderr.on('data', (chunk: Buffer) => (output += chunk.toString()));
    child.on('error', reject);
    child.on('close', (code) => {
      clearTimeout(timer);
      resolveResult({ code, output });
    });
  });
}

async function freshSnapshot(url: URL): Promise<FreshSnapshot> {
  const client = new Client({ connectionString: url.toString() });
  await client.connect();
  try {
    const result = await client.query<FreshSnapshot>(
      `select
         (select count(*)::text from inf.rait_case where tenant_id = $1) as cases,
         (select count(*)::text from inf.rait_priority_assessment where tenant_id = $1) as assessments,
         (select count(*)::text from inf.rait_priority_basis where tenant_id = $1) as bases,
         (select revision from inf.rait_priority_assessment where tenant_id = $1 and case_id = $2) as revision,
         (select outcome from inf.rait_priority_assessment where tenant_id = $1 and case_id = $2) as outcome,
         (select assessment.assessed_at = item.protocolled_at
            from inf.rait_priority_assessment assessment
            join inf.rait_case item on item.tenant_id = assessment.tenant_id and item.id = assessment.case_id
           where assessment.tenant_id = $1 and assessment.case_id = $2) as "assessedMatchesProtocolled",
         (select count(*)::text from inf.rait_case
           where tenant_id = $1 and id = any($3::uuid[])) as "legacyCases",
         (select t.tgenabled = 'O'
            from pg_trigger t
            join pg_class c on c.oid = t.tgrelid
            join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'inf' and c.relname = 'rait_case'
             and t.tgname = 'rait_priority_case_guard'
             and not t.tgisinternal) as "priorityGuardEnabled"`,
      [tenantId, freshCaseId, legacyCaseIds],
    );
    if (!result.rows[0])
      throw new Error('fresh profile produced no observable snapshot');
    return result.rows[0];
  } finally {
    await client.end();
  }
}

describe('CTG-0001 — perfis de fixture RAIT executados em banco scratch', () => {
  const urls = connectionUrls();
  let createdScratch = false;

  beforeAll(async () => {
    const admin = new Client({ connectionString: urls.admin.toString() });
    await admin.connect();
    try {
      const existing = await admin.query<{ exists: boolean }>(
        'select exists(select from pg_database where datname = $1) as exists',
        [scratchDatabase],
      );
      if (existing.rows[0]?.exists)
        throw new Error(
          `scratch database ${scratchDatabase} already exists; refusing to reuse or destroy it`,
        );
      await admin.query(`create database ${quoteIdentifier(scratchDatabase)}`);
      createdScratch = true;
    } finally {
      await admin.end();
    }

    const applied = await runRunner('apply.sh');
    if (applied.code !== 0)
      throw new Error('apply.sh failed for the newly-created scratch database');
  }, 120_000);

  afterAll(async () => {
    if (!createdScratch) return;
    const admin = new Client({ connectionString: urls.admin.toString() });
    await admin.connect();
    try {
      await admin.query(
        `drop database ${quoteIdentifier(scratchDatabase)} with (force)`,
      );
    } finally {
      await admin.end();
    }
  }, 30_000);

  it('aplica fresh pelo runner inteiro, preserva DDL19, é idempotente e recusa legacy-upgrade sem baseline', async () => {
    const firstFresh = await runRunner('seed.sh');
    expect(firstFresh.code).toBe(0);

    const first = await freshSnapshot(urls.scratch);
    expect(first).toMatchObject({
      cases: '1',
      assessments: '1',
      bases: '0',
      revision: 1,
      outcome: 'none',
      assessedMatchesProtocolled: true,
      legacyCases: '0',
      priorityGuardEnabled: true,
    });

    const secondFresh = await runRunner('seed.sh', 'fresh');
    expect(secondFresh.code).toBe(0);
    expect(await freshSnapshot(urls.scratch)).toEqual(first);

    const refusedLegacy = await runRunner('seed.sh', 'legacy-upgrade');
    expect(refusedLegacy.code).not.toBe(0);
    expect(refusedLegacy.output).toContain(
      'legacy-upgrade requires all 20 existing legacy RAIT cases; found 0',
    );
    expect(await freshSnapshot(urls.scratch)).toEqual(first);
  }, 120_000);
});
