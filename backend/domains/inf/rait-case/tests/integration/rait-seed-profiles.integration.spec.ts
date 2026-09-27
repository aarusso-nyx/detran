import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';

import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const scratchDatabases = {
  fresh: 'detran_r17_task0011_fresh',
  local: 'detran_r17_task0011_local',
  legacy: 'detran_r17_task0011_legacy',
} as const;
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
const seedSource = readFileSync(join(databaseDirectory, 'seed.sh'), 'utf8');

const freshManifest = [
  '00-fixtures-core.sql',
  '05-parameters.sql',
  '10-fixtures-inf-ait.sql',
  '21-fixtures-rait-fresh.sql',
  '25-fixtures-teat.sql',
  '26-fixtures-teat-field.sql',
  '27-fixtures-teat-evidence.sql',
  '28-fixtures-teat-measures-alcohol.sql',
  '29-fixtures-ops-provisioning.sql',
  '30-fixtures-infraction.sql',
  '50-fixtures-collection.sql',
  '70-fixtures-est-crash.sql',
  '70-fixtures-portal.sql',
  '71-fixtures-portal-events.sql',
  '72-fixtures-boat-projections.sql',
  '80-fixtures-dashboard-catalog.sql',
  '81-fixtures-dashboard-state.sql',
];
const localStackManifest = [
  ...freshManifest.slice(0, 10),
  '40-fixtures-rait-org-fresh-local-stack.sql',
  ...freshManifest.slice(10, 11),
  '60-fixtures-rait-integration-fresh-local-stack.sql',
  ...freshManifest.slice(11),
];
const legacyManifest = [
  ...freshManifest.slice(0, 3),
  '20-fixtures-rait.sql',
  ...freshManifest.slice(4, 10),
  '40-fixtures-rait-org.sql',
  '50-fixtures-collection.sql',
  '60-fixtures-rait-integration.sql',
  ...freshManifest.slice(11),
];

function manifestFor(profile: string): string[] {
  const section = seedSource.match(
    new RegExp(`${profile}\\)\\n([\\s\\S]*?)\\n    \\)\\n`),
  )?.[1];
  return [...(section?.matchAll(/^[ ]{6}(\S+)$/gm) ?? [])].map(
    ([, file]) => file,
  );
}

type ScratchName = keyof typeof scratchDatabases;
type ConnectionUrls = {
  admin: URL;
  scratch: Record<ScratchName, URL>;
};
type RunnerResult = { code: number | null; output: string };
type SeedProfile = 'fresh' | 'legacy-upgrade' | 'fresh-local-stack';
type FreshSnapshot = {
  cases: string;
  assessments: string;
  bases: string;
  revision: number;
  outcome: string;
  assessedMatchesProtocolled: boolean;
  legacyCases: string;
  priorityGuardEnabled: boolean;
  jetonLines: string;
  orphanMembers: string;
  orphanSessions: string;
  orphanMinutes: string;
  legacyMemberReferences: string;
  legacySessionReferences: string;
  legacyMinutesReferences: string;
  legacyPoolMembers: string;
  legacySessions: string;
  legacyMinutes: string;
};

function requiredAdminPostgresUrl(): URL {
  const name = 'DETRAN_SEED_ADMIN_DATABASE_URL';
  const raw = process.env.DETRAN_SEED_ADMIN_DATABASE_URL;
  if (!raw)
    throw new Error(`${name} is required; no database URL fallback exists`);
  const url = new URL(raw);
  if (!['postgres:', 'postgresql:'].includes(url.protocol))
    throw new Error(`${name} must be a PostgreSQL URL`);
  if (decodeURIComponent(url.pathname.slice(1)) !== 'postgres')
    throw new Error(`${name} must target postgres`);
  if (!url.hostname || !url.username)
    throw new Error(`${name} must include an explicit host and user`);
  return url;
}

function scratchUrl(admin: URL, database: string): URL {
  const url = new URL(admin);
  url.pathname = `/${database}`;
  if (
    url.hostname !== admin.hostname ||
    url.username !== admin.username ||
    decodeURIComponent(url.pathname.slice(1)) !== database
  ) {
    throw new Error(`scratch URL must clone admin host/user for ${database}`);
  }
  return url;
}

function connectionUrls(): ConnectionUrls {
  const admin = requiredAdminPostgresUrl();
  return {
    admin,
    scratch: Object.fromEntries(
      Object.entries(scratchDatabases).map(([name, database]) => [
        name,
        scratchUrl(admin, database),
      ]),
    ) as Record<ScratchName, URL>,
  };
}

function commandEnvironment(url: URL, database: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    DB_NAME: database,
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
  scratch: ScratchName,
  profile?: SeedProfile,
): Promise<RunnerResult> {
  const urls = connectionUrls();
  const env = commandEnvironment(
    urls.scratch[scratch],
    scratchDatabases[scratch],
  );
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
             and not t.tgisinternal) as "priorityGuardEnabled",
         (select count(*)::text from inf.rait_jeton_line where tenant_id = $1) as "jetonLines",
         (select count(*)::text from inf.rait_jeton_line line
            left join inf.rait_pool_member member on member.id = line.member_id
           where line.tenant_id = $1 and member.id is null) as "orphanMembers",
         (select count(*)::text from inf.rait_jeton_line line
            left join inf.rait_session session on session.id = line.session_id
           where line.tenant_id = $1 and session.id is null) as "orphanSessions",
         (select count(*)::text from inf.rait_jeton_line line
            left join inf.rait_minutes minutes on minutes.id = line.minutes_id
           where line.tenant_id = $1 and line.minutes_id is not null and minutes.id is null) as "orphanMinutes",
         (select count(*)::text from inf.rait_jeton_line
           where tenant_id = $1 and member_id = any($4::uuid[])) as "legacyMemberReferences",
         (select count(*)::text from inf.rait_jeton_line
           where tenant_id = $1 and session_id = any($5::uuid[])) as "legacySessionReferences",
         (select count(*)::text from inf.rait_jeton_line
           where tenant_id = $1 and minutes_id = any($6::uuid[])) as "legacyMinutesReferences",
         (select count(*)::text from inf.rait_pool_member
           where tenant_id = $1 and id = any($4::uuid[])) as "legacyPoolMembers",
         (select count(*)::text from inf.rait_session
           where tenant_id = $1 and id = any($5::uuid[])) as "legacySessions",
         (select count(*)::text from inf.rait_minutes
           where tenant_id = $1 and id = any($6::uuid[])) as "legacyMinutes"`,
      [
        tenantId,
        freshCaseId,
        legacyCaseIds,
        [
          '00000000-0000-7000-8000-000021000008',
          '00000000-0000-7000-8000-000021000009',
          '00000000-0000-7000-8000-000021000010',
          '00000000-0000-7000-8000-000021000011',
        ],
        ['00000000-0000-7000-8000-000030000003'],
        ['00000000-0000-7000-8000-000034000001'],
      ],
    );
    if (!result.rows[0])
      throw new Error('fresh profile produced no observable snapshot');
    return result.rows[0];
  } finally {
    await client.end();
  }
}

describe('CTG-0002 — perfis de fixture RAIT executados em banco scratch', () => {
  const urls = connectionUrls();
  const createdScratch: ScratchName[] = [];
  const legacyBaselineDirectory = join(
    databaseDirectory,
    'tests/fixtures/rait-priority-upgrade/v1.1.0',
  );

  beforeAll(async () => {
    const admin = new Client({ connectionString: urls.admin.toString() });
    await admin.connect();
    try {
      const roles = await admin.query<{ count: string }>(
        "select count(*)::text from pg_roles where rolname in ('role_app_backend', 'role_auditor_min')",
      );
      if (roles.rows[0]?.count !== '2')
        throw new Error(
          'scratch cluster must provide role_app_backend and role_auditor_min before apply.sh',
        );
      for (const [scratch, database] of Object.entries(scratchDatabases) as [
        ScratchName,
        string,
      ][]) {
        const existing = await admin.query<{ exists: boolean }>(
          'select exists(select from pg_database where datname = $1) as exists',
          [database],
        );
        if (existing.rows[0]?.exists)
          throw new Error(
            `scratch database ${database} already exists; refusing to reuse or destroy it`,
          );
        await admin.query(`create database ${quoteIdentifier(database)}`);
        createdScratch.push(scratch);
      }
    } finally {
      await admin.end();
    }

    for (const scratch of createdScratch) {
      const applied = await runRunner('apply.sh', scratch);
      if (applied.code !== 0)
        throw new Error(
          `apply.sh failed for newly-created scratch database ${scratchDatabases[scratch]}`,
        );
    }
  }, 180_000);

  it('dado os três perfis fechados quando o manifesto é lido então fresh e legacy permanecem e o perfil local deriva somente duas fixtures RAIT', () => {
    expect(manifestFor('fresh')).toEqual(freshManifest);
    expect(manifestFor('legacy-upgrade')).toEqual(legacyManifest);
    expect(manifestFor('fresh-local-stack')).toEqual(localStackManifest);
  });

  it('dado a URL admin explícita quando os três scratch são derivados então preservam host e usuário e trocam somente o pathname', () => {
    for (const [scratch, database] of Object.entries(scratchDatabases) as [
      ScratchName,
      string,
    ][]) {
      expect(urls.scratch[scratch].hostname).toBe(urls.admin.hostname);
      expect(urls.scratch[scratch].username).toBe(urls.admin.username);
      expect(decodeURIComponent(urls.scratch[scratch].pathname.slice(1))).toBe(
        database,
      );
    }
  });

  afterAll(async () => {
    if (createdScratch.length === 0) return;
    const admin = new Client({ connectionString: urls.admin.toString() });
    await admin.connect();
    try {
      for (const scratch of createdScratch) {
        await admin.query(
          `drop database ${quoteIdentifier(scratchDatabases[scratch])} with (force)`,
        );
      }
    } finally {
      await admin.end();
    }
  }, 30_000);

  it('dado o scratch fresh quando o runner inteiro o semeia então preserva DDL19 e é idempotente', async () => {
    const firstFresh = await runRunner('seed.sh', 'fresh');
    expect(firstFresh.code).toBe(0);

    const first = await freshSnapshot(urls.scratch.fresh);
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

    const secondFresh = await runRunner('seed.sh', 'fresh', 'fresh');
    expect(secondFresh.code).toBe(0);
    expect(await freshSnapshot(urls.scratch.fresh)).toEqual(first);
  }, 120_000);

  it('dado o scratch legacy sem os 20 casos quando legacy-upgrade é solicitado então recusa e o candidato de baseline não é tratado como positivo', async () => {
    const refusedLegacy = await runRunner(
      'seed.sh',
      'legacy',
      'legacy-upgrade',
    );
    expect(refusedLegacy.code).not.toBe(0);
    expect(refusedLegacy.output).toContain(
      'legacy-upgrade requires all 20 existing legacy RAIT cases; found 0',
    );
    expect(existsSync(legacyBaselineDirectory)).toBe(true);
    expect(
      existsSync(join(legacyBaselineDirectory, 'seed/20-fixtures-rait.sql')),
    ).toBe(true);
    expect(
      existsSync(
        join(legacyBaselineDirectory, 'ddl/19-rait-priority-enforce.sql'),
      ),
    ).toBe(false);
  }, 120_000);

  it('dado o scratch local separado quando fresh-local-stack é aplicado duas vezes então preserva FKs, contagens e não referencia IDs RAIT legados', async () => {
    const firstRun = await runRunner('seed.sh', 'local', 'fresh-local-stack');
    expect(firstRun.code).toBe(0);

    const first = await freshSnapshot(urls.scratch.local);
    expect(first).toMatchObject({
      orphanMembers: '0',
      orphanSessions: '0',
      orphanMinutes: '0',
      legacyMemberReferences: '0',
      legacySessionReferences: '0',
      legacyMinutesReferences: '0',
      legacyPoolMembers: '0',
      legacySessions: '0',
      legacyMinutes: '0',
    });
    expect(Number(first.jetonLines)).toBeGreaterThan(0);

    const fixtureText = [
      readFileSync(
        join(
          databaseDirectory,
          'seed/40-fixtures-rait-org-fresh-local-stack.sql',
        ),
        'utf8',
      ),
      readFileSync(
        join(
          databaseDirectory,
          'seed/60-fixtures-rait-integration-fresh-local-stack.sql',
        ),
        'utf8',
      ),
    ].join('\n');
    for (const legacyId of [
      '00000000-0000-7000-8000-000021000008',
      '00000000-0000-7000-8000-000021000009',
      '00000000-0000-7000-8000-000021000010',
      '00000000-0000-7000-8000-000021000011',
      '00000000-0000-7000-8000-000030000003',
      '00000000-0000-7000-8000-000034000001',
    ]) {
      expect(fixtureText).not.toContain(legacyId);
    }

    const secondRun = await runRunner('seed.sh', 'local', 'fresh-local-stack');
    expect(secondRun.code).toBe(0);
    expect(await freshSnapshot(urls.scratch.local)).toEqual(first);
  }, 120_000);
});
