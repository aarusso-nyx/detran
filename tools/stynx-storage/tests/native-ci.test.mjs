// Inspector source/invalid-CLI gate only. No native execution, SDK, Docker or SQL.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const source = (name) =>
  readFileSync(path.join(root, 'tools/ci', name), 'utf8');
for (const [name, reason] of [
  ['verify-stynx-native-node.mjs', 'NATIVE_STYNX_NODE_REFUSED:root-only'],
  ['stynx-postgis-runtime.mjs', 'NATIVE_STYNX_PG_REFUSED:fixed-private-cli'],
  ['run-native-stynx.mjs', 'NATIVE_STYNX_PHASE_REFUSED:fixed-cli'],
])
  test('native CI invalid CLI typed refusal ' + name, () => {
    const result = spawnSync(
      process.execPath,
      [path.join(root, 'tools/ci', name), root, '--unknown'],
      {
        cwd: root,
        env: { PATH: '/usr/bin:/bin' },
        encoding: 'utf8',
        timeout: 10000,
      },
    );
    assert.notEqual(result.status, 0);
    assert.ok(
      result.stderr.includes(reason),
      'Missing program is RED, not an expected typed CLI refusal: ' +
        result.stderr,
    );
  });
test('native CI Node proof checks exact executable platform loaders and all tracked fixture bytes before any package step', () => {
  const s = source('verify-stynx-native-node.mjs');
  assert.match(s, /(?:async\s+)?function (?:verifyNativeNode|main)\(root\)/u);
  for (const text of [
    '89af8424',
    'linux',
    'x64',
    '24.20.0',
    'realpathSync',
    'process.binding',
    'natives',
    'sha256',
    'git',
    'ls-files',
  ])
    assert.ok(s.includes(text), text);
  assert.ok(s.includes('ambient-or-emulated-profile'));
  assert.ok(s.includes('DETRAN_STYNX_PROJECTOR_EXECUTION_SHA'));
  assert.doesNotMatch(
    s,
    /generation-03|installer-custody|cluster-0[123]|\/Users\/|\/Volumes\//u,
  );
});
test('native CI PostGIS has immutable packet fixed83 and job-owned container identity checks before cleanup', () => {
  const s = source('stynx-postgis-runtime.mjs');
  for (const text of [
    'function packet(',
    'function identity(',
    'function ownedContainer(',
    'ownedContainer',
    'tools/stynx-storage/consumer-fixtures/postgis-runtime',
    'a4bfb761',
    '83',
    '999',
    'initdb',
    'postgres',
    'readFileSync',
    'sha256',
  ])
    assert.ok(s.includes(text), text);
  assert.match(s, /actual\.(?:Id|ID)/u);
  assert.match(s, /actual\.Name/u);
  assert.match(s, /actual\.Config\.User/u);
  assert.match(s, /actual\.Config\.Labels/u);
  assert.doesNotMatch(
    s,
    /docker-entrypoint\.sh|generation-03|installer-custody|cluster-0[123]|\/Users\/|\/Volumes\//u,
  );
});
test('native CI fixed phases keep token only in producer and ordinary projector plus whole meaningful test glob', () => {
  const s = source('run-native-stynx.mjs');
  for (const text of [
    'producer',
    'projector',
    'tests',
    'tools/stynx-storage-ci-inputs.mjs',
    'tools/stynx-storage-project-published.mjs',
    'NODE_AUTH_TOKEN',
    'ordinary-empty',
  ])
    assert.ok(s.includes(text), text);
  assert.match(
    s,
    /readdirSync\(path\.join\(root, ['"]tools\/stynx-storage\/tests['"]\)\)/u,
  );
  assert.match(s, /filter\(\(n\) => n\.endsWith\(['"]\.test\.mjs['"]\)\)/u);
  assert.match(
    s,
    /files\.map\(\(n\) => ['"]tools\/stynx-storage\/tests\/['"] \+ n\)/u,
  );
  assert.doesNotMatch(
    s,
    /test-name-pattern|test\.skip|describe\.skip|continue-on-error/u,
  );
});

// Four actual frozen-draft review regressions; source-only, not live lifecycle proof.
test('native CI correction cleans owned birth gaps and attempts later resources after logs failure', () => {
  const s = source('stynx-postgis-runtime.mjs');
  assert.match(s, /function inspectIfPresent\(job,\s*phase,\s*kind,\s*name\)/u);
  const cleanup = s.slice(s.indexOf('function cleanup('));
  assert.match(
    cleanup,
    /inspectIfPresent\(job,[\s\S]*?['"]container['"],\s*job\.name\)/u,
  );
  assert.match(
    cleanup,
    /inspectIfPresent\(job,[\s\S]*?['"]image['"],\s*job\.tag\)/u,
  );
  assert.match(cleanup, /(?:cleanupErrors|errors|failures)/u);
  assert.match(cleanup, /container\.Name === ['"]\/['"] \+ job\.name/u);
  assert.match(cleanup, /container\.Image === prepared\.imageId/u);
  assert.match(
    cleanup,
    /container\.Config\.Labels\?\.\[job\.label\] === job\.owner/u,
  );
  assert.match(cleanup, /logs/u);
  assert.match(cleanup, /remove|['"]rm['"]/u);
  assert.doesNotMatch(cleanup, /['"]prune['"]|--all/u);
});
test('native CI correction retains actual owned server identity before sole CREATE and actual target OID afterward', () => {
  const s = source('stynx-postgis-runtime.mjs');
  assert.match(s, /function serverIdentity\(job,\s*id,\s*database,\s*phase\)/u);
  assert.match(s, /actual-owned-server-identity/u);
  const start = s.slice(
    s.indexOf('function start('),
    s.indexOf('function cleanup('),
  );
  const create = start.indexOf('CREATE DATABASE detran_r7_ctg1_a2');
  assert.ok(create > 0);
  assert.match(start.slice(0, create), /serverIdentity\(/u);
  assert.match(
    start.slice(0, create),
    /const beforeCreate = serverIdentity\(/u,
  );
  assert.match(start.slice(0, create), /output\(job,/u);
  for (const text of [
    'system_identifier',
    'postmaster.pid',
    'data_directory',
    'server_version',
    'databaseOid',
  ])
    assert.ok(s.includes(text), text);
  assert.match(start.slice(create), /serverIdentity\(/u);
});
test('native CI correction actual container controls compare full immutable image initializer and three tmpfs and loopback binding', () => {
  const s = source('stynx-postgis-runtime.mjs');
  assert.match(s, /actual\.Image === record\.imageId/u);
  assert.match(s, /isDeepStrictEqual\(actual\.HostConfig\.Tmpfs, tmpfs\)/u);
  for (const text of [
    'Config.Image',
    'Entrypoint',
    'Cmd',
    'HostConfig',
    'Tmpfs',
    'CapDrop',
    'CapAdd',
    'ReadonlyRootfs',
    'SecurityOpt',
    'PortBindings',
    '127.0.0.1',
    '/var/lib/postgresql/18/docker',
    '/var/run/postgresql',
    '/tmp',
  ])
    assert.ok(s.includes(text), text);
  assert.match(s, /new Set\(actual\.Mounts\.map\(/u);
  assert.match(s, /HostConfig\.Binds\?\.length/u);
  assert.match(s, /HostConfig\.Mounts\?\.length/u);
});
test('native CI correction retains hashes sizes and resolved paths of all actual transitive libraries before SQL', () => {
  const s = source('stynx-postgis-runtime.mjs');
  assert.match(s, /function imageProof\(job,\s*imageId,\s*input,\s*phase\)/u);
  for (const text of [
    'transitive-library-provenance',
    'sha256sum',
    'historical.actualTransitiveLibraries',
    'sha256',
    'libraryPaths',
  ])
    assert.ok(s.includes(text), text);
  assert.match(s, /isDeepStrictEqual\(libraries, historicalLibraries\)/u);
  const start = s.slice(
    s.indexOf('function start('),
    s.indexOf('function cleanup('),
  );
  assert.ok(start.indexOf('imageProof(') < start.indexOf('CREATE DATABASE'));
});

// TEST_ONLY evaluation of the exact private source predicate; no Docker/SQL.
function actualControlPredicate() {
  const s = source('stynx-postgis-runtime.mjs');
  const begin = s.indexOf('requireFact(\n    actual.Image === record.imageId');
  const end = s.indexOf(",\n    'container-controls',\n  );", begin);
  assert.ok(begin >= 0 && end > begin);
  const expression = s.slice(begin + 'requireFact('.length, end);
  return (
    createRequire(import.meta.url)('node:util').isDeepStrictEqual &&
    new Function(
      'actual',
      'record',
      'initializer',
      'tmpfs',
      'expectedPorts',
      'isDeepStrictEqual',
      'return (' + expression + ');',
    )
  );
}
function testOnlyContainerControls() {
  const tmpfs = {
    '/var/lib/postgresql': 'rw,uid=999,gid=999,mode=0700',
    '/var/run/postgresql': 'rw,uid=999,gid=999,mode=0700',
    '/tmp': 'rw,uid=999,gid=999,mode=0700',
  };
  const expectedPorts = {
    '5432/tcp': [{ HostIp: '127.0.0.1', HostPort: '5432' }],
  };
  const actual = {
    Image: 'TEST_ONLY_IMAGE',
    Config: {
      Image: 'TEST_ONLY_IMAGE',
      Entrypoint: ['/bin/sh'],
      Cmd: ['-ec', 'TEST_ONLY_INIT'],
      ExposedPorts: { '5432/tcp': {} },
    },
    HostConfig: {
      ReadonlyRootfs: true,
      CapDrop: ['ALL'],
      CapAdd: null,
      Privileged: false,
      SecurityOpt: ['no-new-privileges'],
      Memory: 2 * 1024 * 1024 * 1024,
      NanoCpus: 2 * 1000000000,
      ShmSize: 256 * 1024 * 1024,
      Tmpfs: {
        '/tmp': tmpfs['/tmp'],
        '/var/run/postgresql': tmpfs['/var/run/postgresql'],
        '/var/lib/postgresql': tmpfs['/var/lib/postgresql'],
      },
      Binds: null,
      Mounts: null,
      PortBindings: expectedPorts,
    },
    Mounts: Object.keys(tmpfs).map((Destination) => ({
      Type: 'tmpfs',
      Destination,
    })),
    NetworkSettings: { Ports: expectedPorts },
  };
  return { actual, tmpfs, expectedPorts };
}
for (const [label, change] of [
  ['added capability', (actual) => (actual.HostConfig.CapAdd = ['SYS_ADMIN'])],
  ['privileged container', (actual) => (actual.HostConfig.Privileged = true)],
]) {
  test(
    'native CI actual controls refuse ' +
      label +
      ' without weakening reordered tmpfs equality',
    () => {
      const { actual, tmpfs, expectedPorts } = testOnlyContainerControls();
      const predicate = actualControlPredicate();
      const equal = createRequire(import.meta.url)(
        'node:util',
      ).isDeepStrictEqual;
      assert.equal(
        predicate(
          actual,
          { imageId: 'TEST_ONLY_IMAGE' },
          'TEST_ONLY_INIT',
          tmpfs,
          expectedPorts,
          equal,
        ),
        true,
      );
      change(actual);
      assert.equal(
        predicate(
          actual,
          { imageId: 'TEST_ONLY_IMAGE' },
          'TEST_ONLY_INIT',
          tmpfs,
          expectedPorts,
          equal,
        ),
        false,
      );
    },
  );
}
