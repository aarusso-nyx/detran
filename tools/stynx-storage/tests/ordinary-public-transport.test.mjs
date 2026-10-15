// Inspector TEST_ONLY isolated settings admission, never SQL/SDK/installer parity.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';
import { requireFact } from '../../stynx-storage-public-custody.mjs';

const root = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const source = readFileSync(
  path.join(root, 'tools/stynx-storage-public-install.mjs'),
  'utf8',
);
// Compile only this actual builtin-only function, with a detached TEST_ONLY env.
// No module evaluation, createRequire, pg, guard installation or connection.
const start = source.indexOf('function settingsFor(full) {');
const end = source.indexOf('function storagePlan(root) {', start);
assert.ok(start >= 0 && end > start, 'Missing public settings function');
const settingsSource = source.slice(start, end).trim();
const authStart = source.indexOf('const fullAuthorizations = {');
const authEnd = source.indexOf('\n};', authStart);
assert.ok(
  authStart >= 0 && authEnd > authStart,
  'Missing fixed full authorization',
);
const fullSource = source.slice(authStart, authEnd + 3);
const environment = Object.freeze({
  DB_NAME: 'TEST_ONLY_ordinary_transport',
  DB_HOST: '127.0.0.1',
  DB_PORT: '65462',
  DB_USER: 'postgres',
  DB_PASSWORD: '',
});
function settings(env, full = false) {
  const detachedProcess = Object.freeze({ env: Object.freeze({ ...env }) });
  const isolated = new Function(
    'process',
    'requireFact',
    fullSource + '\nreturn (' + settingsSource + ');',
  );
  return isolated(detachedProcess, requireFact)(full);
}
const refusal = (error) => error?.code === 'STYNX_PUBLIC_INSTALL_REFUSED';
test('TEST_ONLY ordinary settings returns protected owner maintenance connection without effects', () => {
  assert.deepEqual(settings(environment), {
    database: 'TEST_ONLY_ordinary_transport',
    host: '127.0.0.1',
    port: 65462,
    user: 'postgres',
    password: '',
    ssl: false,
    options: '-c row_security=on -c search_path=pg_catalog,public',
    client_encoding: 'UTF8',
  });
});
for (const key of ['DB_NAME', 'DB_HOST', 'DB_PORT', 'DB_USER']) {
  test(
    'TEST_ONLY ordinary settings refuses missing explicit ' +
      key +
      ' without fallback',
    () => {
      const env = { ...environment };
      delete env[key];
      assert.throws(() => settings(env), refusal);
    },
  );
}
for (const port of ['0', '65536', '-1', '65462x', '']) {
  test(
    'TEST_ONLY ordinary settings refuses malformed port ' +
      JSON.stringify(port),
    () => {
      assert.throws(() => settings({ ...environment, DB_PORT: port }), refusal);
    },
  );
}
for (const key of ['NODE_OPTIONS', 'NODE_PATH', 'NODE_PG_FORCE_NATIVE']) {
  test('TEST_ONLY ordinary settings refuses ambient override ' + key, () => {
    assert.throws(
      () => settings({ ...environment, [key]: 'TEST_ONLY' }),
      refusal,
    );
  });
}
for (const [field, value] of [
  ['DB_HOST', '127.0.0.1\n'],
  ['DB_HOST', '127.0.0.1\0'],
  ['DB_PASSWORD', 'secret\r'],
]) {
  test(
    'TEST_ONLY ordinary settings refuses control bytes in ' +
      field +
      ' ' +
      JSON.stringify(value),
    () => {
      assert.throws(
        () => settings({ ...environment, [field]: value }),
        refusal,
      );
    },
  );
}
test('TEST_ONLY ordinary settings refuses reserved private rehearsal subject', () => {
  assert.throws(
    () => settings({ ...environment, DB_NAME: 'detran_r22_161_fresh' }),
    refusal,
  );
});
test('TEST_ONLY ordinary installer owner gate refuses an application login', () => {
  assert.throws(
    () => settings({ ...environment, DB_USER: 'role_app_backend' }),
    refusal,
  );
});
for (const [database, flag] of [
  ['detran_local_stack', 'DETRAN_LOCAL_STACK_FULL_AUTHORIZED'],
  ['detran_r7_ctg1_a2', 'DETRAN_PRIORITY_UPGRADE_FULL_AUTHORIZED'],
  ['detran_r13', 'DETRAN_R13_FULL_AUTHORIZED'],
]) {
  test(
    'TEST_ONLY ordinary full requires only exact literal flag for ' + database,
    () => {
      for (const value of [undefined, '', 'true', '0', '01']) {
        assert.throws(
          () =>
            settings(
              { ...environment, DB_NAME: database, [flag]: value },
              true,
            ),
          refusal,
        );
      }
      assert.equal(
        settings({ ...environment, DB_NAME: database, [flag]: '1' }, true)
          .database,
        database,
      );
    },
  );
}
test('TEST_ONLY ordinary full cannot select unlisted subject with a known authorization flag', () => {
  assert.throws(
    () =>
      settings(
        { ...environment, DETRAN_PRIORITY_UPGRADE_FULL_AUTHORIZED: '1' },
        true,
      ),
    refusal,
  );
});
