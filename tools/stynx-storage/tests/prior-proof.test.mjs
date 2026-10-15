// Inspector D source-only prospective sensors. No SDK, SQL, fabricated baseline or live transaction proof.
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { isDeepStrictEqual } from 'node:util';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readHistoricalPlanInput } from '../../stynx-storage-portable-plan-inputs.mjs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const source = () =>
  readFileSync(
    new URL('../../stynx-storage-install.mjs', import.meta.url),
    'utf8',
  );
const main = () =>
  source().slice(
    source().indexOf('export async function runStorageInstall'),
    source().indexOf('function createLegacyApplyPlan'),
  );
test('main installer owns a real target write BEGIN and explicit COMMIT in Node', () => {
  const s = main();
  assert.match(
    s,
    /target\.query\(\s*['"`]BEGIN(?:['"`]|\s+(?:ISOLATION|TRANSACTION))/u,
  );
  assert.match(s, /target\.query\(\s*['"`]COMMIT['"`]/u);
  assert.match(s, /7007\s*,\s*1\b/u);
});
test('main no longer delegates COMMIT authority to a spawned psql process', () => {
  const s = main();
  assert.doesNotMatch(s, /spawn\(\s*['"]psql['"]/u);
  assert.doesNotMatch(s, /child\.stdin\.end\(executionSql\)/u);
});
test('fixed Node execution inventory contains late S06/S31 and original normal RLS stage', () => {
  const s = source();
  assert.match(s, /createNodeStorageExecutionPlan/u);
  for (const name of [
    '20-rls-policies.sql',
    '06-storage-signed-documents.sql',
    '31-inf-signature-policy-guards.sql',
  ])
    assert.ok(s.includes(name), name);
  assert.ok(s.includes('ledgerFinalPrivilegesSql'));
});
test('durable candidate retention and unknown COMMIT state are explicit distinct runner paths', () => {
  const s = main();
  assert.match(s, /candidate/iu);
  assert.match(s, /before.?commit/iu);
  assert.match(s, /unknown.?commit|commit.?unknown/iu);
  assert.match(s, /read.?back/iu);
});
test('prior verifier is selected only for a sealed prior read-only child and never as a latest schema verifier', () => {
  const s = source();
  assert.match(s, /prior-runtime\/closure-manifest\.json/u);
  assert.match(s, /verifyOutboxStorage/u);
  assert.match(s, /verifyOfflineStorage/u);
  assert.match(
    s,
    /prior[\s\S]{0,150}read.?only|read.?only[\s\S]{0,150}prior/iu,
  );
});
test('ledger assertion names only the three admitted incoming custody FKs and exact parent RI functions', () => {
  const s = source().slice(
    source().indexOf('export const ledgerAssertionSql'),
    source().indexOf('export async function inspectStorageInstallation'),
  );
  for (const name of [
    'baseline_fresh_fk',
    'target_outbox_fresh_fk',
    'target_offline_fresh_fk',
    'RI_FKey_restrict_del',
    'RI_FKey_noaction_upd',
    'tgconstraint',
    'tgconstrrelid',
    'tgconstrindid',
  ])
    assert.ok(s.includes(name), name);
});
test('installer retains a closed root/boolean entry and does not expose caller SQL or a new execution selector', () => {
  const s = source();
  assert.ok(
    s.includes('STYNX runner accepts only the closed boolean full option'),
  );
  assert.doesNotMatch(
    s,
    /export\s+(?:async\s+)?function\s+(?:executeSql|runSql|createNodeStorageExecutionPlan)/u,
  );
});

test('ledger effective access checks include actual principal SET-reachable parent roles', () => {
  const s = source().slice(
    source().indexOf('export const ledgerAssertionSql'),
    source().indexOf('export async function inspectStorageInstallation'),
  );
  assert.match(s, /pg_has_role\([^;]*?'SET'/u);
  assert.match(s, /has_table_privilege\(reachable\.oid/u);
  assert.match(s, /has_function_privilege\(reachable\.oid/u);
});

// Independent private prior-child gate; missing program is RED, never an expected refusal.
const childFile = fileURLToPath(
  new URL('../../stynx-storage-prior-verifier.mjs', import.meta.url),
);
const repositoryRoot = path.resolve(path.dirname(childFile), '..');
const childSource = () => readFileSync(childFile, 'utf8');
test('prior child source has only fixed two-argument internal request/hash discovery and no exported execution API', () => {
  const s = childSource();
  assert.doesNotMatch(
    s,
    /export\s+(?:async\s+)?(?:function|const|class)|export\s*\{/u,
  );
  for (const token of [
    'R22_PRIOR_VERIFIER_REFUSED',
    'prior-verifier-request.json',
    'prior-verifier-report.json',
    'DETRAN_STYNX_PRIOR_VERIFIER_REQUEST_SHA',
    'prior160-before-upgrade',
    '18767',
    '7696293464811719840',
  ])
    assert.ok(s.includes(token), token);
  for (const field of [
    'formatVersion',
    'kind',
    'phase',
    'attemptId',
    'activation',
    'admittedInputs',
    'subject',
    'endpoint',
    'output',
  ])
    assert.ok(s.includes(field), field);
  assert.match(s, /process\.argv/u);
});
test('prior child source owns a fresh READ ONLY UTC RLS transaction and rollback/close cleanup', () => {
  const s = childSource();
  assert.match(s, /BEGIN[^\n`'"]*READ\s+ONLY/iu);
  assert.match(s, /row_security[\s\S]{0,60}on/iu);
  assert.match(s, /UTC/u);
  assert.match(s, /ROLLBACK/u);
  assert.match(s, /\.end\s*\(/u);
  assert.match(s, /finally/u);
});
test('prior child source has exact prior public verifier seeds and no service startup or maintenance-lock reacquisition', () => {
  const s = childSource();
  for (const token of [
    'prior-runtime/closure-manifest.json',
    'verifyOutboxStorage',
    'verifyOfflineStorage',
  ])
    assert.ok(s.includes(token), token);
  assert.doesNotMatch(
    s,
    /NestFactory|createApplicationContext|\.listen\s*\(|pg_(?:try_)?advisory_(?:xact_)?lock\s*\(/u,
  );
});
for (const [name, args] of [
  ['missing arguments', []],
  [
    'foreign root',
    ['/tmp/R22-unadmitted-root', 'e4f58767-221c-4408-8346-5ef7a20d4011'],
  ],
  ['malformed attempt UUID', [repositoryRoot, 'not-an-attempt']],
  [
    'uppercase attempt UUID',
    [repositoryRoot, 'E4F58767-221C-4408-8346-5EF7A20D4011'],
  ],
  [
    'extra caller phase selector',
    [repositoryRoot, 'e4f58767-221c-4408-8346-5ef7a20d4011', '--latest'],
  ],
  [
    'unsealed apparently valid request',
    [repositoryRoot, 'e4f58767-221c-4408-8346-5ef7a20d4011'],
  ],
])
  test(`prior child typed refusal before SDK/SQL for ${name}`, () => {
    const observed = spawnSync(process.execPath, [childFile, ...args], {
      cwd: repositoryRoot,
      env: { LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8', TZ: 'UTC' },
      encoding: 'utf8',
      timeout: 10000,
    });
    assert.equal(observed.signal, null);
    assert.equal(observed.error, undefined);
    assert.notEqual(observed.status, 0);
    assert.match(observed.stderr, /R22_PRIOR_VERIFIER_REFUSED/u);
    assert.doesNotMatch(
      observed.stderr,
      /MODULE_NOT_FOUND|ERR_MODULE_NOT_FOUND|TypeError/u,
    );
    assert.equal(observed.stdout, '');
  });

// 57e2 source predicates, not manufactured replacement-OID admission or executed DROP/CREATE proof.
test('full recreation retains an actual new replacement subject before seed or storage', () => {
  const s = source();
  assert(s.includes('full-recreation.json'));
  assert(s.includes('originalSubject'));
  assert(s.includes('replacementSubject'));
  assert.match(s, /DROP\s+DATABASE/iu);
  assert.match(s, /CREATE\s+DATABASE/iu);
  assert(s.includes('detran_r22_161_full'));
});
test('full normal repeat validates the same sealed recreation ref in lease and detached reviewed candidate', () => {
  const s = source();
  assert.match(
    s,
    /function\s+validateFullRepeatIdentity\s*\(\s*admission\s*,\s*lease\s*,\s*reviewedCandidate\s*\)/u,
  );
  assert.match(s, /lease\.fullRecreation/u);
  assert.match(s, /reviewedCandidate\.inputs/u);
  assert(s.includes('replacementSubject'));
  assert(s.includes('originalSubject'));
});
test('full recreation never rewrites the immutable original subject manifest or exposes caller OID selectors', () => {
  const s = source();
  assert.doesNotMatch(
    s,
    /(?:writeFileSync|writeFile)\([^;]*subject-manifest\.json/u,
  );
  assert.doesNotMatch(
    s,
    /process\.env\.(?:DATABASE_OID|DB_OID|REPLACEMENT_OID)|--(?:database|replacement)-oid/u,
  );
});

test('installed runtime guard exists and binds exact current realm, literal edges and three reviewed misses', () => {
  const s = readFileSync(
    new URL('../../stynx-storage-runtime-guard.mjs', import.meta.url),
    'utf8',
  );
  for (const value of [
    'd237d2e33c48d0b5572517d6730ef29be37dd209c9516cebcdcd5d6da34d5e5a',
    'b8ac160ee31817ab6315541eec4c91a610640c1025bce6d5dbbca87b9cfb63bf',
    'registerHooks',
    'realpathSync',
    'createHash',
    '@nestjs/websockets/socket-module',
    '@nestjs/microservices/microservices-module',
    '@nestjs/swagger',
  ])
    assert(s.includes(value), value);
  assert.doesNotMatch(s, /from\s+['"]@stynx-nyx\//u);
});
test('installed runtime guard scopes leased loopback PostgreSQL and irreversibly tracks denied effects', () => {
  const s = readFileSync(
    new URL('../../stynx-storage-runtime-guard.mjs', import.meta.url),
    'utf8',
  );
  for (const value of [
    '127.0.0.1',
    '65462',
    'detran_r22_161_g03_upgrade',
    'detran_r22_161_fresh',
    'detran_r22_161_negative',
    'detran_r22_161_full',
    'NODE_OPTIONS',
    'NODE_PATH',
    'NODE_PG_FORCE_NATIVE',
    'violations',
    'fetch',
    'http',
    'https',
    'dns',
  ])
    assert(s.includes(value), value);
  assert.match(s, /clean\s*\(/u);
});

test('reviewed candidate validation closes actual SQL and non-SQL source inventory before any connection', () => {
  const s = source();
  assert.match(s, /function\s+validateReviewedCandidate\s*\(/u);
  assert.match(s, /function\s+rehashReviewedInputs\s*\(/u);
  const body = main();
  const checked = body.indexOf('validateReviewedCandidate(');
  const connected = body.search(/\.connect\s*\(/u);
  assert(
    checked >= 0 && connected > checked,
    'Detached exact candidate admission must precede first connection',
  );
  const validation = s.slice(
    s.indexOf('function validateReviewedCandidate'),
    s.indexOf('function validateReviewedCandidate') + 10000,
  );
  assert.match(validation, /Set\s*\(/u);
  assert.match(validation, /inputs/u);
  assert.match(
    validation,
    /73|createLegacyApplyPlan|createNodeStorageExecutionPlan/u,
  );
});
test('reviewed candidate inputs are rehashed immediately before explicit Node COMMIT', () => {
  const body = main();
  const writeBoundary = body.indexOf('commitAttempted = true');
  assert(writeBoundary >= 0, 'Explicit write COMMIT outcome boundary required');
  const relativeCommit = body
    .slice(writeBoundary)
    .search(/target\.query\(\s*['"`]COMMIT['"`]/u);
  assert(relativeCommit >= 0);
  const commit = writeBoundary + relativeCommit;
  const rechecked = body.lastIndexOf('rehashReviewedInputs(', commit);
  assert(
    commit >= 0 && rechecked >= 0 && commit > rechecked,
    'No source drift window after retained candidate and before COMMIT',
  );
  assert(
    commit - rechecked < 1000,
    'Before-COMMIT source rehash cannot be an early unrelated admission check',
  );
});

// Candidate01 lifecycle source witnesses; live signal/COMMIT behavior remains unproven.
test('D1 pre-lock signal cancels maintenance while acquired bridge remains held for cleanup', () => {
  const s = main();
  assert.match(s, /(?:const|function)\s+endMaintenance\b/u);
  const signal = s.slice(
    s.indexOf('const onSignal'),
    s.indexOf('const handlers'),
  );
  assert.match(signal, /interrupted\s*=\s*signal/u);
  assert.match(signal, /!bridgeAcquired[\s\S]*endMaintenance\(/u);
  assert.match(s, /bridgeAcquired\s*=\s*false/u);
  const acquired = s.indexOf('bridgeAcquired = true');
  assert(
    acquired > s.indexOf('pg_advisory_lock'),
    'Bridge ownership only after lock response',
  );
});
test('D2 initial postcommit and recovery observations retain separate exclusive fixed records', () => {
  const s = main();
  assert.match(
    s,
    /retained\.write\('postcommit-locked-readback\.json',\s*actual\)/u,
  );
  assert.match(
    s,
    /retained\.write\('recovery-locked-readback\.json',\s*readback\)/u,
  );
  assert.doesNotMatch(s, /retained\.write\('locked-readback\.json'/u);
});
test('D3 full predecessor candidate source and actual reviewer reports enter transitive sealed closure', () => {
  const s = source();
  const body = s.slice(
    s.indexOf('function validateFullRepeatIdentity'),
    s.indexOf('function validateFullRepeatIdentity') + 16000,
  );
  assert.match(body, /sourceBeforeLease/u);
  assert.match(body, /reviews/u);
  assert.match(body, /\.report/u);
  assert.match(body, /readFixedReference[\s\S]*refs\.push/u);
  const validation = s.slice(
    s.indexOf('function validateReviewedCandidate'),
    s.indexOf('function rehashReviewedInputs'),
  );
  assert.match(validation, /admission\.fullChainRefs/u);
  assert.match(validation, /isDeepStrictEqual/u);
  assert.match(main(), /validateReviewedCandidate\(/u);
  assert.match(s, /rehashReviewedInputs/u);
});
test('D4 prior interruption before Client assignment remains irreversible at connection, verifier and success boundaries', () => {
  const s = readFileSync(
    new URL('../../stynx-storage-prior-verifier.mjs', import.meta.url),
    'utf8',
  );
  const signal = s.slice(
    s.indexOf('const closeOnSignal'),
    s.indexOf(
      "for (const signal of ['SIGINT'",
      s.indexOf('const closeOnSignal'),
    ),
  );
  assert.match(signal, /interrupted\s*=/u);
  assert.match(s, /checkInterrupted/u);
  for (const boundary of [
    'await client.connect(',
    'await outbox.verifyOutboxStorage(',
    'await offline.verifyOfflineStorage(',
  ]) {
    const offset = s.indexOf(boundary);
    assert(offset >= 0);
    assert.match(
      s.slice(Math.max(0, offset - 220), offset),
      /checkInterrupted\(/u,
      boundary,
    );
  }
  assert.match(s, /rolledBack/u);
  assert.match(s, /clientsClosed/u);
});

// Legal pgxevil is a user schema; LIKE pg_% treats underscore as a wildcard.
test('D5 snapshot and pristine admission exclude only the literal pg_ system prefix', () => {
  const s = source();
  for (const name of [
    'async function readStorageSnapshot',
    'async function assertPristineTarget',
  ]) {
    const at = s.indexOf(name);
    assert(at >= 0);
    const next = s.indexOf('\n}', at);
    const body = s.slice(at, next);
    assert.doesNotMatch(
      body,
      /NOT\s+LIKE\s+'pg_%'/iu,
      'pgxevil must remain visible',
    );
    assert.match(
      body,
      /(?:left\s*\(\s*(?:n\.)?nspname\s*,\s*3\s*\)\s*<>\s*'pg_'|NOT\s+starts_with\s*\(\s*(?:n\.)?nspname\s*,\s*'pg_'\s*\))/iu,
      'Use a literal pg_ prefix check for all user catalog/data reads',
    );
  }
});

// Ordinary new work must stop after interruption; locked recovery is deliberately exempt.
test('D1 followup interrupts ordinary verifier and destructive boundaries and cannot return committed success after cleanup', () => {
  const body = main();
  const verifier = body.slice(
    body.indexOf('const verifyReadOnly'),
    body.indexOf('const verifyReadOnly') + 300,
  );
  assert.match(verifier, /checkSignal\(\)/u);
  for (const keyword of ['DROP DATABASE', 'CREATE DATABASE']) {
    const offset = body.indexOf(keyword);
    assert(offset >= 0);
    assert.match(
      body.slice(Math.max(0, offset - 180), offset),
      /checkSignal\(\)/u,
      keyword,
    );
  }
  const final = body.slice(
    body.indexOf("retained.write('reports/cleanup-observation.json'"),
  );
  assert.match(final, /if\s*\(\s*interrupted\s*\)/u);
  assert.match(
    final,
    /committed[\s\S]*commitAttempted[\s\S]*destructiveAttempted/u,
  );
});

// Actual PG42809 whole-row sequence STOP; branch must retain complete exact sequence state.
test('D6 sequence snapshot uses all three explicit state columns in a derived row without skipping sequences', () => {
  const s = source(),
    at = s.indexOf('async function readStorageSnapshot'),
    body = s.slice(at, s.indexOf('\nconst utcContextSql', at));
  assert.match(body, /relation\.relkind\s*===\s*'S'/u);
  assert.match(
    body,
    /SELECT\s+to_jsonb\(s\)::text\s+AS\s+row\s+FROM\s*\(SELECT\s+last_value\s*,\s*log_cnt\s*,\s*is_called\s+FROM/iu,
  );
  assert.match(body, /relkind\s+IN\s*\('r','p','S'\)/u);
  assert.match(body, /SELECT to_jsonb\(t\)::text AS row FROM/u);
  assert.doesNotMatch(body, /relkind\s*===\s*'S'[^;]*\bcontinue\b/u);
});

// Actual PG42723 at ordinary extension installation under protected pg_catalog-first path.
test('D7 ordinary extensions explicitly target public without weakening the protected execution search path', () => {
  const ddl = readFileSync(
    new URL('../../../backend/database/ddl/00-extensions.sql', import.meta.url),
    'utf8',
  );
  const statements = ddl
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  assert.equal(statements.length, 4);
  for (const [index, extension] of [
    'pgcrypto',
    '"uuid-ossp"',
    'citext',
    'postgis',
  ].entries()) {
    assert.equal(
      statements[index],
      `CREATE EXTENSION IF NOT EXISTS ${extension} SCHEMA public`,
    );
  }
  assert.match(
    source(),
    /const utcContextSql = `SET LOCAL TIME ZONE 'UTC'; SET LOCAL row_security=on; SET LOCAL search_path=pg_catalog,public;/u,
  );
  assert.match(main(), /SET LOCAL search_path=pg_catalog,public/u);
});

// F1 closed Engineer substitution; pure private predicate extraction only, never module evaluation.
const executorPrograms = [
  'stynx-storage-install.mjs',
  'stynx-storage-runtime-guard.mjs',
  'stynx-storage-prior-verifier.mjs',
];
for (const program of executorPrograms) {
  test(`D8 exact two-actor executor predicate in ${program}`, () => {
    const text = readFileSync(
      new URL('../../' + program, import.meta.url),
      'utf8',
    );
    const match =
      /function isAdmittedInstallerExecutor\(value\) \{[\s\S]*?\n\}/u.exec(
        text,
      );
    assert(match, 'Missing F1 private closed executor predicate');
    assert.doesNotMatch(
      text,
      /export\s+(?:function|const)\s+isAdmittedInstallerExecutor/u,
    );
    const predicate = runInNewContext(
      '(' + match[0] + ')',
      Object.create(null),
    );
    for (const actor of ['/root', '/root/engineer_outbox_160'])
      assert.equal(predicate(actor), true);
    for (const actor of [
      undefined,
      null,
      '',
      '/root/inspector_adoption_160',
      '/root/architect_adoption_160',
      '/root/auditor',
      '/root/other',
      '/root ',
      '/ROOT',
      {},
      1,
      Promise.resolve('/root'),
    ])
      assert.equal(predicate(actor), false);
  });
}
test('D8 all three independently retain Root issuer Engineer holder active lease and fixed executor callsite', () => {
  for (const program of executorPrograms) {
    const text = readFileSync(
      new URL('../../' + program, import.meta.url),
      'utf8',
    );
    assert.match(
      text,
      /isAdmittedInstallerExecutor\(lease\.grantee\)/u,
      program,
    );
    assert.match(text, /lease\.issuer\s*===\s*'\/root'/u, program);
    assert.match(text, /lease\.holder\s*===\s*'Engineer'/u, program);
    assert.match(text, /lease\.status\s*===\s*'ACTIVE'/u, program);
    assert.match(text, /lease\.subjects/u, program);
    assert.match(text, /lease\.endpoint/u, program);
  }
});

test('D8 prior child independently rejects a lease without exact Root issuer', () => {
  const text = readFileSync(
    new URL('../../stynx-storage-prior-verifier.mjs', import.meta.url),
    'utf8',
  );
  const start = text.indexOf('const lease = readJson(root, activation.lease)');
  assert(start >= 0);
  const gate = text.slice(
    start,
    text.indexOf('Actual exclusive lease differs', start),
  );
  assert.match(gate, /lease\.issuer\s*===\s*'\/root'/u);
});

// Pure profile fixtures are NOT_ADMISSION; writer OIDs below are manufactured DTO values, never SQL evidence.
function roleProfileHelper() {
  const text = source();
  const match =
    /function classifyApprovedRunnerRoleGraph\(actual, prior\) \{[\s\S]*?\n\}/u.exec(
      text,
    );
  assert(match, 'Missing F1 pure closed role profile helper');
  assert.doesNotMatch(
    text,
    /export\s+(?:function|const)\s+classifyApprovedRunnerRoleGraph/u,
  );
  return runInNewContext('(' + match[0] + ')', {
    isDeepStrictEqual,
    structuredClone,
    Object,
    Array,
    Number,
    String,
    Set,
    Map,
    Error,
    requireFact(condition, message) {
      if (!condition) throw Error('STYNX installation STOP: ' + message);
    },
  });
}
function originalRoleGraph() {
  const bytes = readHistoricalPlanInput(
    fileURLToPath(new URL('../../../', import.meta.url)),
    {
      path: 'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03/reference-proof/role-graph-finally.json',
      sha256:
        'sha256:0942cd8e843962c5a40ff2f3d56d999fae430ff580b6ed3107b111785e650797',
    },
  );
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    '0942cd8e843962c5a40ff2f3d56d999fae430ff580b6ed3107b111785e650797',
  );
  return JSON.parse(bytes);
}
function writerProfileFixture() {
  const graph = originalRoleGraph();
  graph.roles.push({
    oid: '4000000001',
    rolname: 'role_rait_priority_writer',
    rolsuper: false,
    rolinherit: true,
    rolcreaterole: false,
    rolcreatedb: false,
    rolcanlogin: false,
    rolreplication: false,
    rolbypassrls: false,
    rolconnlimit: -1,
    rolvaliduntil: null,
  });
  graph.roles.sort((a, b) => a.rolname.localeCompare(b.rolname, 'en'));
  return graph;
}
function typedRoleProfileRefusal(actual, prior = originalRoleGraph()) {
  const helper = roleProfileHelper();
  assert.throws(
    () => helper(actual, prior),
    (e) =>
      e instanceof Error &&
      e.name !== 'TypeError' &&
      /^STYNX installation STOP:/u.test(e.message),
  );
}
test('D9 exact historical graph returns detached closed prior-exact profile', () => {
  const prior = originalRoleGraph(),
    actual = structuredClone(prior),
    result = roleProfileHelper()(actual, prior);
  assert.deepEqual(Object.keys(result).sort(), [
    'graph',
    'profile',
    'writerRoleOid',
  ]);
  assert.equal(result.profile, 'prior-exact');
  assert.equal(result.writerRoleOid, null);
  assert.deepEqual(result.graph, actual);
  assert.notEqual(result.graph, actual);
  result.graph.roles[0].rolname = 'TEST_ONLY mutation';
  assert.deepEqual(actual, prior);
});
test('D9 exactly one approved writer returns actual fixture OID and detached complete graph', () => {
  const actual = writerProfileFixture(),
    prior = originalRoleGraph(),
    result = roleProfileHelper()(actual, prior);
  assert.deepEqual(Object.keys(result).sort(), [
    'graph',
    'profile',
    'writerRoleOid',
  ]);
  assert.equal(result.profile, 'prior-plus-priority-writer');
  assert.equal(result.writerRoleOid, '4000000001');
  assert.deepEqual(result.graph, actual);
  assert.notEqual(result.graph, actual);
  result.graph.roles.find(
    (x) => x.rolname === 'role_rait_priority_writer',
  ).oid = '2';
  assert.equal(
    actual.roles.find((x) => x.rolname === 'role_rait_priority_writer').oid,
    '4000000001',
  );
});
for (const [name, mutate] of [
  [
    'unknown role',
    (g) =>
      g.roles.push({
        ...g.roles[0],
        oid: '4000000002',
        rolname: 'TEST_ONLY_foreign_role',
      }),
  ],
  [
    'duplicate writer',
    (g) =>
      g.roles.push({
        ...g.roles.find((x) => x.rolname === 'role_rait_priority_writer'),
        oid: '4000000002',
      }),
  ],
  [
    'duplicate OID',
    (g) => {
      g.roles.find((x) => x.rolname === 'role_rait_priority_writer').oid =
        g.roles[0].oid;
    },
  ],
  ['deleted existing role', (g) => g.roles.splice(0, 1)],
  [
    'changed existing role',
    (g) => {
      g.roles[0].rolcanlogin = !g.roles[0].rolcanlogin;
    },
  ],
  [
    'changed existing order',
    (g) => {
      [g.roles[0], g.roles[1]] = [g.roles[1], g.roles[0]];
    },
  ],
  [
    'writer member edge',
    (g) =>
      g.memberships.push({
        roleid: g.roles[0].oid,
        member: '4000000001',
        grantor: '10',
        admin_option: false,
        inherit_option: true,
        set_option: true,
      }),
  ],
  [
    'writer parent edge',
    (g) =>
      g.memberships.push({
        roleid: '4000000001',
        member: g.roles[0].oid,
        grantor: '10',
        admin_option: false,
        inherit_option: true,
        set_option: true,
      }),
  ],
  [
    'role setting drift',
    (g) =>
      g.roleSettings.push({
        setdatabase: '18767',
        setrole: '4000000001',
        setconfig: ['search_path=public'],
      }),
  ],
  [
    'effective SET closure drift',
    (g) =>
      g['effective-role-closure'].push({
        principal: 'role_app_backend',
        reachable: 'role_rait_priority_writer',
        can_set: true,
      }),
  ],
  [
    'extra graph key',
    (g) => {
      g.approved = true;
    },
  ],
  [
    'extra writer key',
    (g) => {
      g.roles.find((x) => x.rolname === 'role_rait_priority_writer').approved =
        true;
    },
  ],
  [
    'missing writer field',
    (g) => {
      delete g.roles.find((x) => x.rolname === 'role_rait_priority_writer')
        .rolsuper;
    },
  ],
])
  test(`D9 typed-refuses ${name}`, () => {
    const g = writerProfileFixture();
    mutate(g);
    typedRoleProfileRefusal(g);
  });
for (const [field, value] of [
  ['rolsuper', true],
  ['rolinherit', false],
  ['rolcreaterole', true],
  ['rolcreatedb', true],
  ['rolcanlogin', true],
  ['rolreplication', true],
  ['rolbypassrls', true],
  ['rolconnlimit', 0],
  ['rolvaliduntil', '2099-01-01'],
])
  test(`D9 writer field ${field} must retain exact approved value`, () => {
    const g = writerProfileFixture();
    g.roles.find((x) => x.rolname === 'role_rait_priority_writer')[field] =
      value;
    typedRoleProfileRefusal(g);
  });
for (const oid of ['0', '4294967296', '001', '1e2', '-1', 1, null])
  test(`D9 writer OID ${JSON.stringify(oid)} is not a valid actual unique uint32 decimal string`, () => {
    const g = writerProfileFixture();
    g.roles.find((x) => x.rolname === 'role_rait_priority_writer').oid = oid;
    typedRoleProfileRefusal(g);
  });
for (const [name, actual] of [
  ['null graph', null],
  ['array graph', []],
  ['missing graph arrays', {}],
  [
    'malformed arrays',
    {
      roles: null,
      memberships: [],
      roleSettings: [],
      'effective-role-closure': [],
    },
  ],
])
  test(`D9 malformed ${name} has typed STOP`, () =>
    typedRoleProfileRefusal(actual));
test('D9 malformed prior graph has typed STOP before admission', () =>
  typedRoleProfileRefusal(writerProfileFixture(), null));
test('D9 target candidate and locked readback retain actual role graph with fixed custody path', () => {
  const s = main(),
    before = s.indexOf('role-graph-before-commit.json'),
    commit = s.indexOf('commitAttempted = true');
  assert(before >= 0 && commit > before);
  assert.match(s.slice(0, commit), /classifyApprovedRunnerRoleGraph/u);
  const full = source(),
    readAt = full.indexOf('async function readStorageSnapshot');
  assert.match(
    full.slice(readAt, full.indexOf('const utcContextSql', readAt)),
    /roleGraph|role-graph/u,
  );
  assert.match(full, /classifyApprovedRunnerRoleGraph/u);
});

// Sealed-lane helper DTOs are NOT_ADMISSION; actual caller must prove baseline/state/recreation.
function laneHelper() {
  const match =
    /function classifyStorageExecutionLane\(lease, subject, state, full\) \{[\s\S]*?\n\}/u.exec(
      source(),
    );
  assert(match, 'Missing closed private lane classifier');
  assert.doesNotMatch(
    source(),
    /export\s+(?:function|const)\s+classifyStorageExecutionLane/u,
  );
  return runInNewContext('(' + match[0] + ')', {
    isDeepStrictEqual,
    structuredClone,
    Object,
    Array,
    Number,
    String,
    Set,
    Map,
    Error,
    requireFact(condition, message) {
      if (!condition) throw Error('STYNX installation STOP: ' + message);
    },
  });
}
function laneFacts(
  lane = 'package-only-g03',
  name = 'detran_r22_161_g03_upgrade',
  oid = '18767',
  full = false,
  mode = 'upgrade-fresh-1.6.0',
  group = null,
) {
  const subject = {
    clusterSystemIdentifier: '7696293464811719840',
    databaseName: name,
    databaseOid: oid,
    owner: 'postgres',
  };
  return {
    lease: { executionLane: lane, full, subjects: [structuredClone(subject)] },
    subject,
    state: { mode, group },
    full,
  };
}
function laneRefusal(f) {
  assert.throws(
    () => laneHelper()(f.lease, f.subject, f.state, f.full),
    (e) =>
      e instanceof Error &&
      e.name !== 'TypeError' &&
      /^STYNX installation STOP:/u.test(e.message),
  );
}
for (const [name, facts] of [
  ['package original160 upgrade', () => laneFacts()],
  [
    'package corresponding upgraded repeat',
    () =>
      laneFacts(
        'package-only-g03',
        'detran_r22_161_g03_upgrade',
        '18767',
        false,
        'repeat-1.6.1',
        { mode: 'upgrade-fresh-1.6.0' },
      ),
  ],
  [
    'fullconsumer pristine fresh',
    () =>
      laneFacts(
        'full-consumer',
        'detran_r22_161_fresh',
        '16387',
        false,
        'fresh-1.6.1',
      ),
  ],
  [
    'fullconsumer fresh repeat',
    () =>
      laneFacts(
        'full-consumer',
        'detran_r22_161_fresh',
        '16387',
        false,
        'repeat-1.6.1',
        { mode: 'fresh-1.6.1' },
      ),
  ],
  [
    'full original subject under existing full authorization',
    () =>
      laneFacts(
        'full-consumer',
        'detran_r22_161_full',
        '16389',
        true,
        'fresh-1.6.1',
      ),
  ],
  [
    'full descendant DTO after separate chain admission',
    () =>
      laneFacts(
        'full-consumer',
        'detran_r22_161_full',
        '4000000001',
        true,
        'fresh-1.6.1',
      ),
  ],
])
  test('D10 accepts only admitted lane shape ' + name, () => {
    const f = facts(),
      before = structuredClone(f);
    assert.equal(
      laneHelper()(f.lease, f.subject, f.state, f.full),
      f.lease.executionLane,
    );
    assert.deepEqual(f, before);
  });
for (const [name, mutate] of [
  [
    'missing lane',
    (f) => {
      delete f.lease.executionLane;
    },
  ],
  [
    'unknown lane',
    (f) => {
      f.lease.executionLane = 'TEST_ONLY-other';
    },
  ],
  [
    'null lane',
    (f) => {
      f.lease.executionLane = null;
    },
  ],
  [
    'wrong system identifier',
    (f) => {
      f.subject.clusterSystemIdentifier = '7696248909089426150';
      f.lease.subjects = [structuredClone(f.subject)];
    },
  ],
  [
    'wrong owner',
    (f) => {
      f.subject.owner = 'role_app_backend';
      f.lease.subjects = [structuredClone(f.subject)];
    },
  ],
  [
    'changed actualg03 OID',
    (f) => {
      f.subject.databaseOid = '16386';
      f.lease.subjects = [structuredClone(f.subject)];
    },
  ],
  [
    'foreign subject',
    (f) => {
      f.subject.databaseName = 'detran_r22_161_g03_ref160';
      f.lease.subjects = [structuredClone(f.subject)];
    },
  ],
  [
    'empty lease subjects',
    (f) => {
      f.lease.subjects = [];
    },
  ],
  [
    'multiple lease subjects',
    (f) => {
      f.lease.subjects.push(structuredClone(f.subject));
    },
  ],
  [
    'mismatched lease subject',
    (f) => {
      f.lease.subjects[0].databaseOid = '16386';
    },
  ],
  [
    'package full true',
    (f) => {
      f.full = true;
      f.lease.full = true;
    },
  ],
  [
    'lease full drift',
    (f) => {
      f.lease.full = true;
    },
  ],
  [
    'fresh package state',
    (f) => {
      f.state = { mode: 'fresh-1.6.1', group: null };
    },
  ],
  [
    'unknown package state',
    (f) => {
      f.state = { mode: 'TEST_ONLY-unknown' };
    },
  ],
  [
    'package repeat lacks actualgroup',
    (f) => {
      f.state = { mode: 'repeat-1.6.1', group: null };
    },
  ],
  [
    'package repeat belongs to fresh161group',
    (f) => {
      f.state = { mode: 'repeat-1.6.1', group: { mode: 'fresh-1.6.1' } };
    },
  ],
])
  test('D10 typed-refuses ' + name, () => {
    const f = laneFacts();
    mutate(f);
    laneRefusal(f);
  });
for (const [name, facts] of [
  ['g03 cannot become fullconsumer', () => laneFacts('full-consumer')],
  [
    'fresh target cannot become package',
    () =>
      laneFacts(
        'package-only-g03',
        'detran_r22_161_fresh',
        '16387',
        false,
        'fresh-1.6.1',
      ),
  ],
  [
    'full subject requires full authorization',
    () =>
      laneFacts(
        'full-consumer',
        'detran_r22_161_full',
        '16389',
        false,
        'fresh-1.6.1',
      ),
  ],
  [
    'fresh subject cannot use destructive full',
    () =>
      laneFacts(
        'full-consumer',
        'detran_r22_161_fresh',
        '16387',
        true,
        'fresh-1.6.1',
      ),
  ],
  [
    'fresh OID cannot be replaced by name alone',
    () =>
      laneFacts(
        'full-consumer',
        'detran_r22_161_fresh',
        '4000000001',
        false,
        'fresh-1.6.1',
      ),
  ],
  [
    'full new OID cannot be zero',
    () =>
      laneFacts(
        'full-consumer',
        'detran_r22_161_full',
        '0',
        true,
        'fresh-1.6.1',
      ),
  ],
  [
    'full new OID cannot overflow',
    () =>
      laneFacts(
        'full-consumer',
        'detran_r22_161_full',
        '4294967296',
        true,
        'fresh-1.6.1',
      ),
  ],
  [
    'fullconsumer cannot claim original160 upgrade',
    () =>
      laneFacts(
        'full-consumer',
        'detran_r22_161_fresh',
        '16387',
        false,
        'upgrade-fresh-1.6.0',
      ),
  ],
  [
    'fullconsumer repeat cannot use package160 group',
    () =>
      laneFacts(
        'full-consumer',
        'detran_r22_161_fresh',
        '16387',
        false,
        'repeat-1.6.1',
        { mode: 'upgrade-fresh-1.6.0' },
      ),
  ],
])
  test('D10 typed-refuses crosslane ' + name, () => laneRefusal(facts()));
test('D10 lane selection follows actual storage inspection and preserves full recreation chain before admitted descendant', () => {
  const body = main(),
    inspection = body.indexOf('inspectTargetStorage('),
    selection = body.indexOf('classifyStorageExecutionLane(');
  assert(
    inspection >= 0 && selection > inspection,
    'Select actual classified state, not schema guess',
  );
  assert.match(
    source(),
    /validateFullRepeatIdentity\(\s*admission,\s*lease,\s*reviewedCandidate,?\s*\)/u,
  );
  assert.match(source(), /readChain\(lease\.fullRecreation/u);
  assert.doesNotMatch(
    source(),
    /process\.env\.\w*EXECUTION_LANE|process\.argv[^;]*package-only-g03/u,
  );
});
test('D10 actual plan filters package-only work and retains complete full consumer inventory', () => {
  const text = source(),
    at = text.indexOf('function createNodeStorageExecutionPlan'),
    plan = text.slice(at, text.indexOf('\n}\n', at) + 2);
  assert.match(plan, /package-only-g03/u);
  assert.match(plan, /executionLane/u);
  assert.match(plan, /full-consumer/u);
  assert.match(text, /role-graph-before-commit.json/u);
  assert.match(
    main(),
    /package-only-g03[\s\S]*(?:isDeepStrictEqual|role graph)/u,
    'Package lane preserves actual entry graph rather than creating writer',
  );
});

// Actual writer-footprint SQL source witnesses only; never query execution or privilege proof.
function writerFootprintQuerySource() {
  const text = source(),
    start = text.indexOf('WITH writer AS (');
  assert(start >= 0, 'Missing actual approved writer footprint query');
  const end = text.indexOf(') AS profile;', start);
  assert(end > start);
  return text.slice(start, end + 13);
}
test('D11 writer footprint query refuses other role reachability memberships and CREATE authority', () => {
  const q = writerFootprintQuerySource();
  for (const key of ['SET', 'USAGE', 'MEMBER'])
    assert.match(q, new RegExp("pg_has_role\\([\\s\\S]*?'" + key + "'", 'u'));
  assert.match(
    q,
    /pg_auth_members[\s\S]*a\.roleid=w\.oid OR a\.member=w\.oid/u,
  );
  assert.match(q, /has_database_privilege\(w\.oid,d\.oid,'CREATE'\)/u);
  assert.match(q, /has_schema_privilege\(w\.oid,n\.oid,'CREATE'\)/u);
  assert.match(q, /left\(n\.nspname,3\)<>'pg_'/u);
  assert.match(q, /writer-grant-option-or-grantor/u);
});
test('D11 writer footprint query enumerates exact declared grants and four actual owned security definer functions', () => {
  const q = writerFootprintQuerySource();
  for (const [schema, table] of [
    ['inf', 'rait_case'],
    ['inf', 'rait_document'],
    ['inf', 'rait_pool'],
    ['inf', 'rait_pool_member'],
    ['inf', 'ait_ait'],
    ['auth', 'tenants'],
    ['ops', 'parameter'],
    ['inf', 'rait_priority_assessment'],
    ['inf', 'rait_priority_basis'],
  ])
    assert(q.includes("('" + schema + "','" + table + "','SELECT')"));
  for (const table of ['rait_priority_assessment', 'rait_priority_basis'])
    assert(q.includes("('inf','" + table + "','INSERT')"));
  assert(q.includes("SELECT 'inf','rait_case','legal_priority','UPDATE'"));
  assert(q.includes("SELECT 'auth.current_tenant()','EXECUTE'"));
  for (const schema of ['inf', 'auth', 'ops'])
    assert(q.includes("('" + schema + "','USAGE')"));
  for (const signature of [
    'inf.rait_priority_mark_insert()',
    'inf.rait_priority_document_guard()',
    'inf.rait_priority_consistency()',
    'inf.rait_record_initial_priority(uuid,uuid,timestamptz,jsonb)',
  ])
    assert(q.includes(signature));
  assert.match(q, /count\(\*\) FROM owned_functions\)<>4/u);
  assert.match(q, /owned_functions WHERE NOT prosecdef/u);
  assert.match(
    q,
    /owned_functions[\s\S]*EXCEPT[\s\S]*expected_functions[\s\S]*expected_functions[\s\S]*EXCEPT[\s\S]*owned_functions/u,
  );
});
test('D11 missing consumer relation column remains absent-safe through actual OID and attnum checks', () => {
  const q = writerFootprintQuerySource();
  assert.match(
    q,
    /COALESCE\(pg_catalog\.has_column_privilege\(\s*w\.oid,pg_catalog\.to_regclass\('inf\.rait_case'\),[\s\S]*pg_catalog\.pg_attribute[\s\S]*a\.attnum>0 AND NOT a\.attisdropped[\s\S]*'UPDATE'\),false\)/u,
  );
  assert.doesNotMatch(
    q,
    /has_column_privilege\(\s*w\.oid,\s*'inf\.rait_case'/u,
  );
  for (const profile of [
    'role-absent',
    'empty-subject-footprint',
    'full-consumer-footprint',
  ])
    assert(q.includes(profile));
  for (const field of [
    'writerRoleOid',
    'subjectFootprint',
    'minimalViolations',
    'emptyViolations',
    'fullViolations',
    'directTableGrants',
    'directColumnGrants',
    'directFunctionGrants',
    'directSchemaGrants',
    'directDatabaseGrants',
    'ownedFunctions',
    'publicRelationDefaults',
  ])
    assert(q.includes("'" + field + "'"));
});

test('D11 actual target snapshot reads writer footprint on the supplied client without another transaction', () => {
  const text = source(),
    start = text.indexOf('async function readWriterFootprint(client)');
  assert(start >= 0);
  const body = text.slice(start, text.indexOf('\n}\n', start) + 2);
  assert.match(body, /client\.query\(writerFootprintSql\)/u);
  assert.doesNotMatch(body, /\b(?:BEGIN|CREATE ROLE|GRANT|REVOKE|SET ROLE)\b/u);
  const at = text.indexOf('async function readStorageSnapshot'),
    snapshot = text.slice(at, text.indexOf('\n}\n', at) + 2);
  assert.match(snapshot, /await readWriterFootprint\(client\)/u);
  assert.match(snapshot, /writerFootprint/u);
});
test('D11 package entry footprint is unchanged and full candidate is verified again before commit success', () => {
  const body = main(),
    commit = body.indexOf('commitAttempted = true');
  assert(commit > 0);
  const before = body.slice(0, commit),
    after = body.slice(commit);
  assert.match(
    before,
    /isDeepStrictEqual\(\s*beforeCommit\.writerFootprint,\s*entry\.writerFootprint\s*\)/u,
  );
  assert.match(
    before,
    /beforeCommit\.writerFootprint\.subjectFootprint\s*===\s*'full-consumer-footprint'/u,
  );
  assert.match(
    before,
    /beforeCommit\.writerFootprint\.minimalViolations\.length\s*===\s*0/u,
  );
  assert.match(
    before,
    /beforeCommit\.writerFootprint\.fullViolations\.length\s*===\s*0/u,
  );
  assert.match(after, /isDeepStrictEqual\(actual\.snapshot, beforeCommit\)/u);
  const disposition = after.indexOf("retained.write('commit-observation.json'");
  assert(disposition > 0);
  assert.match(
    after.slice(0, disposition),
    /actual\.snapshot\.writerFootprint\.subjectFootprint\s*===\s*'full-consumer-footprint'/u,
  );
});
