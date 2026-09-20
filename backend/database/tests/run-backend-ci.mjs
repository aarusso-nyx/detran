// Fail-closed sequence for the disposable RAIT integration database.
// The destructive upgrade rehearsal is the final mandatory gate.
import { spawn } from 'node:child_process';

import { restoreFreshPriorityV3Database } from './prepare-rait-priority-v1-baseline.mjs';

const databaseUrl = process.env.DETRAN_TEST_DATABASE_URL;
if (!databaseUrl) {
  throw new Error('BLOCKED: DETRAN_TEST_DATABASE_URL is required');
}
const database = new URL(databaseUrl);
const databaseName = decodeURIComponent(database.pathname.replace(/^\//u, ''));
if (!databaseName || !database.username || !database.hostname) {
  throw new Error(
    'BLOCKED: DETRAN_TEST_DATABASE_URL must identify database, user and host',
  );
}
// Shell-based DDL/seed helpers use libpq variables. Derive them from the one
// mandatory owner URL so every subprocess targets the same disposable DB.
process.env.DB_NAME = databaseName;
process.env.DB_HOST = database.hostname;
process.env.DB_PORT = database.port || '5432';
process.env.DB_USER = decodeURIComponent(database.username);
process.env.DB_PASSWORD = decodeURIComponent(database.password);

function run(script) {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', [script], { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (code === 0) resolve();
      else
        reject(new Error(`BLOCKED: pnpm ${script} exited ${code ?? signal}`));
    });
  });
}

let prepared = false;
let upgradePassed = false;
let failure;
try {
  await run('backend:test:unit');
  await run('backend:test:prepare-legacy');
  prepared = true;
  await run('backend:test:integration');
  // Reset integration mutations before the E2E fixture assumes canonical
  // RAIT cases, documents and schedules.
  await run('backend:test:prepare-legacy');
  await run('backend:test:e2e');
  await run('backend:test:upgrade');
  upgradePassed = true;
} catch (error) {
  failure = error;
}

// The upgrade suite asserts its own fresh restoration on success. Every
// earlier failure still restores the disposable DB and retains the root error.
if (prepared && !upgradePassed) {
  try {
    await restoreFreshPriorityV3Database();
  } catch (restoreError) {
    failure = failure
      ? new AggregateError(
          [failure, restoreError],
          'BLOCKED: backend tests and mandatory DB restoration both failed',
        )
      : restoreError;
  }
}
if (failure) throw failure;
