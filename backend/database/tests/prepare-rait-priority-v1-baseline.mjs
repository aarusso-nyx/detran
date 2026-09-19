import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import pg from 'pg';

const { Client } = pg;
const database = 'detran_r7_ctg1_a2';
const tenantId = '00000000-0000-7000-8000-00000000a001';
const legacyCaseId = '00000000-0000-7000-8000-000010000020';
const unknownLegacyPriority = 'legacy_unmapped_task0028';
const oldPolicy = '[{60+:1},{80+:2}] + PcD';
const v3Policy = {
  schemaVersion: 1,
  policyCode: 'ADR-0024-2026-09-16',
  basisRanks: { pcd: 2, age_80_plus: 2, age_60_plus: 1 },
  noneRank: 0,
  postProtocolRevision: 'forbidden',
};
const here = dirname(fileURLToPath(import.meta.url));
const databaseDirectory = resolve(here, '..');
const fixtureDirectory = join(here, 'fixtures/rait-priority-upgrade/v1.1.0');
const ordinary = [
  '00-extensions.sql',
  '01-schemas.sql',
  '02-auth.sql',
  '03-audit.sql',
  '04-integration-storage.sql',
  '05-role-catalog.sql',
  '10-postgis-functions.sql',
  '11-auth-functions.sql',
  '12-audit-functions.sql',
  '13-ops-agency.sql',
  '13-ops-field-operations.sql',
  '14-inf-lifecycle-vocabulary.sql',
  '15-ops-parameter.sql',
  '16-ops-snapshots.sql',
  '17-ops-evidence.sql',
  '18-ops-offline-sync.sql',
  '20-rls-policies.sql',
  '30-inf-normative.sql',
  '30-ops-example.sql',
  '31-inf-ait.sql',
  '32-inf-measures.sql',
  '33-inf-alcohol.sql',
  '34-inf-rait-case.sql',
  '35-inf-rait-worklist.sql',
  '36-inf-rait-session.sql',
  '37-inf-speed.sql',
  '38-inf-infraction.sql',
  '39-inf-rait-org.sql',
  '40-ch-clinical-network.sql',
  '41-ch-patients.sql',
  '42-ch-encounters.sql',
  '43-ch-exams.sql',
  '44-ch-reports.sql',
  '45-ch-biometrics.sql',
  '46-ch-scheduling.sql',
  '47-ch-restrictions.sql',
  '48-ch-retention.sql',
  '49-ch-process-blocks.sql',
  '50-ch-telehealth.sql',
  '51-ch-billing.sql',
  '52-ch-clinical-controls.sql',
  '53-ch-inconsistencies.sql',
  '54-ch-operational-controls.sql',
  '55-ch-juntas.sql',
  '56-ch-toxicology.sql',
  '57-inf-collection.sql',
  '58-inf-rait-integration.sql',
  '59-inf-notification.sql',
  '60-portal-complaints.sql',
];
const legacySeeds = [
  '00-fixtures-core.sql',
  '05-parameters.sql',
  '10-fixtures-inf-ait.sql',
  '20-fixtures-rait.sql',
  '25-fixtures-teat.sql',
  '30-fixtures-infraction.sql',
  '40-fixtures-rait-org.sql',
  '50-fixtures-collection.sql',
  '60-fixtures-rait-integration.sql',
];

function blocked(message) {
  return new Error(`BLOCKED legacy baseline: ${message}`);
}

function requiredUrl(name, expectedDatabase) {
  const raw = process.env[name];
  if (!raw) throw blocked(`${name} is required`);
  const url = new URL(raw);
  if (!['postgres:', 'postgresql:'].includes(url.protocol))
    throw blocked(`${name} must be a PostgreSQL URL`);
  if (decodeURIComponent(url.pathname.slice(1)) !== expectedDatabase)
    throw blocked(`${name} must target ${expectedDatabase}`);
  if (!url.hostname || !url.username)
    throw blocked(`${name} must contain an explicit host and user`);
  return url;
}

function authorizedUrls() {
  if (process.env.DETRAN_PRIORITY_UPGRADE_BASELINE_AUTHORIZED !== '1')
    throw blocked('explicit baseline authorization flag is absent');
  if (process.env.DETRAN_PRIORITY_UPGRADE_BASELINE_RESET_AUTHORIZED !== '1')
    throw blocked('explicit disposable reset authorization flag is absent');
  if (process.env.DETRAN_PRIORITY_UPGRADE_RESTORE_AUTHORIZED !== '1')
    throw blocked(
      'explicit post-rehearsal restoration authorization flag is absent',
    );
  return {
    admin: requiredUrl(
      'DETRAN_PRIORITY_BASELINE_ADMIN_DATABASE_URL',
      'postgres',
    ),
    target: requiredUrl('DETRAN_TEST_DATABASE_URL', database),
  };
}

function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonicalJson(item)]),
    );
  return value;
}

function sameJson(left, right) {
  return (
    JSON.stringify(canonicalJson(left)) === JSON.stringify(canonicalJson(right))
  );
}

function environment(url) {
  return {
    ...process.env,
    DB_NAME: database,
    DB_HOST: url.hostname,
    DB_PORT: url.port || '5432',
    DB_USER: decodeURIComponent(url.username),
    DB_PASSWORD: decodeURIComponent(url.password),
  };
}

function quote(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function run(command, args, options) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    const timer = setTimeout(() => child.kill('SIGKILL'), 120_000);
    child.stdout.on('data', (chunk) => (output += chunk.toString()));
    child.stderr.on('data', (chunk) => (output += chunk.toString()));
    child.on('error', reject);
    child.on('close', (code) => {
      clearTimeout(timer);
      resolveResult({ code, output });
    });
  });
}

async function assertFixtureBytes() {
  const expected = new Map(
    (await readFile(join(fixtureDirectory, 'SHA256SUMS'), 'utf8'))
      .trim()
      .split('\n')
      .map((line) => {
        const match = line.match(/^([a-f0-9]{64})  ([^\s]+)$/);
        if (!match) throw blocked('malformed fixture SHA256SUMS');
        return [match[2], match[1]];
      }),
  );
  const files = await fixtureFiles(fixtureDirectory);
  if (files.length !== expected.size)
    throw blocked('fixture inventory diverges');
  for (const [relative, digest] of expected) {
    const bytes = await readFile(join(fixtureDirectory, relative));
    if (createHash('sha256').update(bytes).digest('hex') !== digest)
      throw blocked(`fixture hash diverges: ${relative}`);
  }
}

async function fixtureFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = `${prefix}${entry.name}`;
    if (entry.isDirectory())
      files.push(
        ...(await fixtureFiles(join(directory, entry.name), `${relative}/`)),
      );
    else if (entry.isFile() && relative !== 'SHA256SUMS') files.push(relative);
    else if (!entry.isFile())
      throw blocked(`fixture entry is not a regular file: ${relative}`);
  }
  return files.sort();
}

function sourceForDdl(name) {
  if (
    [
      '05-role-catalog.sql',
      '34-inf-rait-case.sql',
      '35-inf-rait-worklist.sql',
      '36-inf-rait-session.sql',
    ].includes(name)
  )
    return join(fixtureDirectory, 'ddl', name);
  return join(databaseDirectory, 'ddl', name);
}

function sourceForSeed(name) {
  if (['05-parameters.sql', '20-fixtures-rait.sql'].includes(name))
    return join(fixtureDirectory, 'seed', name);
  return join(databaseDirectory, 'seed', name);
}

async function psql(url, files, commands = []) {
  const args = [
    '-X',
    '-v',
    'ON_ERROR_STOP=1',
    '-q',
    '-h',
    url.hostname,
    '-p',
    url.port || '5432',
    '-U',
    decodeURIComponent(url.username),
    '-d',
    database,
    '--single-transaction',
    '-c',
    'SET LOCAL ROLE postgres',
  ];
  for (const command of commands) args.push('-c', command);
  for (const file of files) args.push('-f', file);
  const result = await run('psql', args, {
    cwd: databaseDirectory,
    env: environment(url),
  });
  if (result.code !== 0)
    throw blocked(`psql baseline phase failed: ${result.output}`);
}

async function createDedicatedDatabase(adminUrl, onResetStarted) {
  const client = new Client({ connectionString: adminUrl.toString() });
  await client.connect();
  try {
    const state = await client.query(
      `SELECT d.datname, pg_get_userbyid(d.datdba) AS owner,
              (SELECT count(*)::integer FROM pg_stat_activity
               WHERE datname = d.datname AND backend_type = 'client backend') AS clients
       FROM pg_database d WHERE d.datname = $1`,
      [database],
    );
    if (state.rowCount === 1 && state.rows[0].owner !== 'postgres')
      throw blocked('refusing to drop a target database not owned by postgres');
    if (state.rowCount === 1 && state.rows[0].clients !== 0)
      throw blocked('target database has concurrent client sessions');
    onResetStarted();
    if (state.rowCount === 1)
      await client.query(`DROP DATABASE ${quote(database)}`);
    await client.query(`CREATE DATABASE ${quote(database)} OWNER postgres`);
  } finally {
    await client.end();
  }
}

async function reconcileParameter(targetUrl) {
  const client = new Client({ connectionString: targetUrl.toString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE postgres');
    const before = await client.query(
      `SELECT id, version, value_json
       FROM ops.parameter
       WHERE tenant_id = $1 AND traffic_agency_id IS NULL AND surface = 'rait'
         AND key = 'rait.priority.legal_bases' AND effective_to IS NULL
       FOR UPDATE`,
      [tenantId],
    );
    if (
      before.rowCount !== 1 ||
      before.rows[0].version !== 1 ||
      !sameJson(before.rows[0].value_json, oldPolicy)
    )
      throw blocked(
        'historical priority parameter does not match the recorded fixture value',
      );
    const changed = await client.query(
      `UPDATE ops.parameter
       SET value_json = $1::jsonb, version = version + 1,
           reason = 'TASK-0042 dedicated fixture reconciliation',
           updated_at = clock_timestamp()
       WHERE id = $2
       RETURNING version, value_json`,
      [JSON.stringify(v3Policy), before.rows[0].id],
    );
    if (
      changed.rowCount !== 1 ||
      changed.rows[0].version !== 2 ||
      !sameJson(changed.rows[0].value_json, v3Policy)
    )
      throw blocked('explicit priority parameter reconciliation was not exact');
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

async function markLegacyCase(targetUrl) {
  const client = new Client({ connectionString: targetUrl.toString() });
  await client.connect();
  try {
    const result = await client.query(
      `UPDATE inf.rait_case SET legal_priority = $1
       WHERE tenant_id = $2 AND id = $3 AND legal_priority IS NULL
       RETURNING id, protocolled_at, legal_priority`,
      [unknownLegacyPriority, tenantId, legacyCaseId],
    );
    if (result.rowCount !== 1)
      throw blocked('legacy marker could not be prepared before enforcement');
  } finally {
    await client.end();
  }
}

async function assertPreV3State(targetUrl) {
  const client = new Client({ connectionString: targetUrl.toString() });
  await client.connect();
  try {
    const result = await client.query(
      `SELECT current_database() AS database,
              (SELECT pg_get_userbyid(datdba) FROM pg_database WHERE datname = current_database()) AS owner,
              (SELECT count(*)::integer FROM inf.rait_case
                WHERE tenant_id = $1 AND id::text LIKE '00000000-0000-7000-8000-0000100000%') AS legacy_cases,
              to_regclass('inf.rait_priority_assessment') IS NULL AS no_assessments,
              to_regclass('inf.rait_priority_basis') IS NULL AS no_bases,
              NOT EXISTS(SELECT FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
                         WHERE c.oid='inf.rait_case'::regclass AND t.tgname LIKE 'rait_priority_%') AS no_priority_trigger`,
      [tenantId],
    );
    const state = result.rows[0];
    if (
      !state ||
      state.database !== database ||
      state.owner !== 'postgres' ||
      state.legacy_cases !== 20 ||
      !state.no_assessments ||
      !state.no_bases ||
      !state.no_priority_trigger
    )
      throw blocked(
        'prepared database is not the exact pre-V3 legacy baseline',
      );
  } finally {
    await client.end();
  }
}

export async function prepareLegacyPriorityV1Baseline() {
  const urls = authorizedUrls();
  await assertFixtureBytes();
  let resetStarted = false;
  try {
    await createDedicatedDatabase(urls.admin, () => {
      resetStarted = true;
    });
    const ordered = ordinary
      .filter((name) => name !== '20-rls-policies.sql')
      .sort();
    if (ordered.length !== 48 || ordinary.length !== 49)
      throw blocked('closed ordinary DDL inventory is incomplete');
    await psql(urls.target, [
      ...ordered.map(sourceForDdl),
      sourceForDdl('20-rls-policies.sql'),
    ]);
    await psql(urls.target, legacySeeds.map(sourceForSeed));
    await reconcileParameter(urls.target);
    await markLegacyCase(urls.target);
    await assertPreV3State(urls.target);
  } catch (error) {
    if (!resetStarted) throw error;
    try {
      await restoreFreshPriorityV3Database();
    } catch (restoreError) {
      throw new AggregateError(
        [error, restoreError],
        'BLOCKED: baseline preparation and mandatory restoration both failed',
      );
    }
    throw error;
  }
}

export async function restoreFreshPriorityV3Database() {
  const urls = authorizedUrls();
  const admin = new Client({ connectionString: urls.admin.toString() });
  await admin.connect();
  try {
    const clients = await admin.query(
      `SELECT count(*)::integer AS count FROM pg_stat_activity
       WHERE datname = $1 AND backend_type = 'client backend'`,
      [database],
    );
    if (clients.rows[0]?.count !== 0)
      throw blocked(
        'cannot restore while the dedicated database has client sessions',
      );
  } finally {
    await admin.end();
  }
  const env = {
    ...environment(urls.target),
    DETRAN_PRIORITY_UPGRADE_FULL_AUTHORIZED: '1',
  };
  const applied = await run(
    'bash',
    [join(databaseDirectory, 'apply.sh'), '--full'],
    {
      cwd: databaseDirectory,
      env,
    },
  );
  if (applied.code !== 0)
    throw blocked(`fresh restoration apply failed: ${applied.output}`);
  const seeded = await run('bash', [join(databaseDirectory, 'seed.sh')], {
    cwd: databaseDirectory,
    env,
  });
  if (seeded.code !== 0)
    throw blocked(`fresh restoration seed failed: ${seeded.output}`);
}
