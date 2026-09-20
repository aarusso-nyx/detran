// Prepare the disposable, current-schema 20-case fixture for the ordinary
// integration and E2E tiers. The destructive upgrade sensor runs separately
// as the final mandatory backend:test:ci step.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import pg from 'pg';

import {
  prepareLegacyPriorityV1Baseline,
  restoreFreshPriorityV3Database,
} from './prepare-rait-priority-v1-baseline.mjs';

const { Client } = pg;
const execFileAsync = promisify(execFile);
const database = 'detran_r7_ctg1_a2';
const tenant = '00000000-0000-7000-8000-00000000a001';
const legacyCase = '00000000-0000-7000-8000-000010000020';
const databaseDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
);

function requiredUrl(name) {
  const raw = process.env[name];
  if (!raw) throw new Error(`BLOCKED: ${name} is required`);
  const url = new URL(raw);
  if (
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    decodeURIComponent(url.pathname.slice(1)) !== database ||
    !url.hostname ||
    !url.username
  )
    throw new Error(`BLOCKED: ${name} must explicitly target ${database}`);
  return url;
}

const target = requiredUrl('DETRAN_TEST_DATABASE_URL');
if (target.search || target.hash)
  throw new Error('BLOCKED: test owner URL must have no options or fragment');
const adminRaw = process.env.DETRAN_PRIORITY_BASELINE_ADMIN_DATABASE_URL;
if (!adminRaw) throw new Error('BLOCKED: baseline admin URL is required');
const admin = new URL(adminRaw);
if (
  !['postgres:', 'postgresql:'].includes(admin.protocol) ||
  decodeURIComponent(admin.pathname.slice(1)) !== 'postgres' ||
  admin.hostname !== target.hostname ||
  (admin.port || '5432') !== (target.port || '5432') ||
  !admin.username
)
  throw new Error(
    'BLOCKED: baseline admin must target postgres on the same server',
  );
if (admin.search || admin.hash || admin.username !== target.username)
  throw new Error(
    'BLOCKED: baseline admin must match the unmodified owner identity',
  );
for (const name of [
  'DATABASE_URL',
  'STYNX_OWNER_DATABASE_URL',
  'STYNX_APP_DATABASE_URL',
  'STYNX_READER_DATABASE_URL',
]) {
  const url = requiredUrl(name);
  if (
    url.hostname !== target.hostname ||
    (url.port || '5432') !== (target.port || '5432') ||
    url.username !== target.username ||
    url.hash
  )
    throw new Error(`BLOCKED: ${name} diverges from the target owner/server`);
  if (name.includes('_APP_') || name.includes('_READER_')) {
    if (
      [...url.searchParams.keys()].length !== 1 ||
      url.searchParams.getAll('options').length !== 1 ||
      url.searchParams.get('options') !== '-c role=role_app_backend'
    )
      throw new Error(`BLOCKED: ${name} must use role_app_backend`);
  } else if (url.search) {
    throw new Error(`BLOCKED: ${name} must not modify the owner role`);
  }
}

let baselinePrepared = false;
try {
  // This verifies the closed historical fixture hashes, owner, zero clients,
  // exact target and all explicit reset/restore authorizations before DROP.
  await prepareLegacyPriorityV1Baseline();
  baselinePrepared = true;
  const env = {
    ...process.env,
    DB_NAME: database,
    DB_HOST: target.hostname,
    DB_PORT: target.port || '5432',
    DB_USER: decodeURIComponent(target.username),
    DB_PASSWORD: decodeURIComponent(target.password),
  };
  await execFileAsync('bash', [resolve(databaseDirectory, 'apply.sh')], {
    cwd: databaseDirectory,
    env,
    timeout: 180_000,
    maxBuffer: 8 * 1024 * 1024,
  });
  // The ordinary/E2E fixture needs current document links; the final upgrade
  // sensor independently recreates the untouched historical seed snapshot.
  await execFileAsync('bash', [resolve(databaseDirectory, 'seed.sh')], {
    cwd: databaseDirectory,
    env: { ...env, SEED_PROFILE: 'legacy-upgrade' },
    timeout: 180_000,
    maxBuffer: 8 * 1024 * 1024,
  });
  const client = new Client({ connectionString: target.toString() });
  await client.connect();
  try {
    const result = await client.query(
      `SELECT
         (SELECT count(*)::integer FROM inf.rait_case
           WHERE tenant_id = $1
             AND id::text LIKE '00000000-0000-7000-8000-0000100000%') AS legacy_cases,
         (SELECT legal_priority FROM inf.rait_case
           WHERE tenant_id = $1 AND id = $2) AS legacy_priority,
         (SELECT document_id::text FROM inf.rait_draft
           WHERE tenant_id = $1 AND id = '00000000-0000-7000-8000-000038000004') AS signed_draft_document,
         to_regclass('inf.rait_priority_assessment') IS NOT NULL AS has_assessments,
         to_regclass('inf.rait_priority_basis') IS NOT NULL AS has_bases`,
      [tenant, legacyCase],
    );
    const state = result.rows[0];
    if (
      state?.legacy_cases !== 20 ||
      state.legacy_priority !== 'legacy_unmapped_task0028' ||
      state.signed_draft_document !== '00000000-0000-7000-8000-000012000010' ||
      !state.has_assessments ||
      !state.has_bases
    )
      throw new Error('BLOCKED: upgraded legacy fixture is incomplete');
  } finally {
    await client.end();
  }
  process.stdout.write(
    'upgraded legacy fixture: 20 cases and priority schema verified\n',
  );
} catch (error) {
  if (baselinePrepared) {
    try {
      await restoreFreshPriorityV3Database();
    } catch (restoreError) {
      throw new AggregateError(
        [error, restoreError],
        'BLOCKED: legacy fixture preparation and mandatory restoration failed',
      );
    }
  }
  throw error;
}
