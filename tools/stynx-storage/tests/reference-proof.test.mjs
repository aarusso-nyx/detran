import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { readHistoricalPlanInput } from '../../stynx-storage-portable-plan-inputs.mjs';

// Independent pure-plan sensors; NOT reference behavior or baseline admission.
const root = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const filename = path.join(root, 'tools/stynx-storage-reference.mjs');
const hash = (b) => createHash('sha256').update(b).digest('hex');
const historicalMap = JSON.parse(
  readFileSync(
    path.join(
      root,
      'tools/stynx-storage/consumer-fixtures/historical-plans/manifest.json',
    ),
  ),
);
const reference = (p) => {
  if (!p.startsWith('scratch/r22-adoption-161/'))
    return {
      path: p,
      sha256: 'sha256:' + hash(readFileSync(path.join(root, p))),
    };
  const rows = historicalMap.files.filter((entry) => entry.original.path === p);
  assert.equal(rows.length, 1, 'Exact historical input row required');
  const ref = { path: p, sha256: rows[0].original.sha256 };
  assert.equal(
    'sha256:' + hash(readHistoricalPlanInput(root, ref)),
    ref.sha256,
  );
  return ref;
};
let module;
const api = () => (module ??= import(filename));
let plan;
async function actual() {
  return (plan ??= (await api()).createStorageReferencePlan(root));
}
const operations = [
  'revalidate-subjects-and-lease',
  'capture-business-clock',
  'bootstrap-common-auth',
  'install-prior-fresh',
  'install-public-prefix-eight',
  'verify-prior-before',
  'start-real-public-contexts',
  'exercise-controlled-behavior',
  'capture-raw-and-compare',
  'verify-prior-after',
  'retain-baseline-inputs',
  'close-contexts-and-return-lease',
];

test('reference harness exposes exactly one pure public plan factory', async () => {
  assert.deepEqual(Object.keys(await api()), ['createStorageReferencePlan']);
});
test('real pure reference plan has only the five contracted fields', async () => {
  const p = await actual();
  assert.deepEqual(
    Object.keys(p).sort(),
    [
      'formatVersion',
      'targetPlan',
      'subjects',
      'fixtures',
      'operations',
    ].sort(),
  );
  assert.equal(p.formatVersion, 'detran-stynx-storage-reference-plan/1');
});
test('reference plan binds actual fresh target artifacts and refuses synthetic baseline status', async () => {
  const p = (await actual()).targetPlan;
  assert.equal(p.formatVersion, 'detran-stynx-storage-target-plan/1');
  assert.deepEqual(
    p.targetPublication.verification,
    reference(
      'scratch/r22-adoption-161/package-admission/protected-publication-verification.json',
    ),
  );
  assert.deepEqual(
    p.targetPublication.projection,
    reference(
      'scratch/r22-adoption-161/package-admission/projection/public-storage-projection.json',
    ),
  );
  assert.deepEqual(
    p.priorRuntime,
    reference('scratch/r22-adoption-161/prior-runtime/closure-manifest.json'),
  );
  assert.equal(p.baseline, null);
  assert.equal(p.baselineReview, null);
  assert.equal(p.artifacts.ordered.migrations.length, 9);
  assert.deepEqual(p.binding, {
    ownerRole: 'postgres',
    appRole: 'role_app_backend',
    readerRole: null,
    tenantTable: { schema: 'auth', table: 'tenants', column: 'id' },
  });
});
test('reference subjects are exactly the three independently observed distinct databases', async () => {
  const p = await actual();
  assert.deepEqual(
    p.subjects,
    [
      ['prior-fresh', 'g03_ref160', '18765'],
      ['ordered-prefix', 'g03_refprefix8', '18766'],
      ['upgrade-source', 'g03_upgrade', '18767'],
    ].map(([purpose, name, oid]) => ({
      purpose,
      subject: {
        clusterSystemIdentifier: '7696293464811719840',
        databaseOid: oid,
        databaseName: 'detran_r22_161_' + name,
        owner: 'postgres',
      },
      endpoint: { host: '127.0.0.1', port: 65462 },
    })),
  );
});
test('reference fixtures preserve authoritative tenant and separate audit actor identities', async () => {
  const p = await actual();
  assert.deepEqual(p.fixtures, {
    source: reference('backend/app/tests/e2e/r22-sse-tenancy.support.ts'),
    tenantA: '00000000-0000-7000-8000-000000000101',
    tenantB: '00000000-0000-7000-8000-000000000102',
    actorA: '00000000-0000-4000-8000-000000000201',
    actorB: '00000000-0000-4000-8000-000000000202',
    restrictedLogin: 'role_r22_161_app',
    appRole: 'role_app_backend',
    readerRole: null,
    businessClock: {
      mode: 'capture-once-sql-utc',
      recordPath:
        'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03/reference-proof/business-clock.json',
      reservationValidForMs: 86400000,
    },
  });
  assert.equal(
    p.fixtures.source.sha256,
    'sha256:84a21cec5e016623aacd7e3a0f7906ecacc9bf47453330bcf3fca0f4b3d3f475',
  );
});
test('reference phase order requires real verification, behavior, retention and final cleanup', async () => {
  assert.deepEqual((await actual()).operations, operations);
});
test('creating a pure plan does not capture or rewrite a business clock record', async () => {
  const p = path.join(
    root,
    'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03/reference-proof/business-clock.json',
  );
  const before = existsSync(p) ? readFileSync(p) : null;
  const a = await api();
  a.createStorageReferencePlan(root);
  assert.deepEqual(existsSync(p) ? readFileSync(p) : null, before);
});
for (const [label, value] of [
  ['undefined', undefined],
  ['null', null],
  ['number', 1],
  ['object', {}],
  ['promise', Promise.resolve(root)],
  ['empty', ''],
  ['url', 'file://' + root],
  ['unrelated-root', '/tmp'],
  ['primary-checkout', '/Volumes/Thiamat II/stech/detran'],
])
  test(`pure reference plan refuses ${label} root without caller-selected subject`, async () => {
    const a = await api();
    assert.throws(
      () => a.createStorageReferencePlan(value),
      (e) => e.code === 'R22_STORAGE_REFERENCE_PLAN_INVALID',
    );
  });
test('pure root rejection does not invoke caller coercion or accessors', async () => {
  const a = await api();
  let touched = 0;
  const value = Object.defineProperty({}, Symbol.toPrimitive, {
    get() {
      touched++;
      throw Error('Caller getter must not run');
    },
  });
  assert.throws(
    () => a.createStorageReferencePlan(value),
    (e) => e.code === 'R22_STORAGE_REFERENCE_PLAN_INVALID',
  );
  assert.equal(touched, 0);
});

// Source-only generation/refusal witnesses; no SDK calls or invented accepted baseline.
test('fixed reference generation refuses coincident old cluster01 subject identity', async () => {
  const p = await actual();
  for (const x of p.subjects) {
    assert.notEqual(x.subject.clusterSystemIdentifier, '7696248909089426150');
    assert.notEqual(x.endpoint.port, 65461);
  }
});
test('reference program binds only actual03 manifest and independent creation readback', () => {
  const s = readFileSync(filename, 'utf8');
  assert.match(s, /cluster-02/u);
  assert.doesNotMatch(s, /const cluster = ['"][^'"]*cluster-01['"]/u);
  for (const hash of [
    'c95aab0e477ead92f8e2b3a0f9b966321f95abded92d090e354fe74bad9711d4',
    'd3cb05aff96cc6b2e51829744a97ef19b03d69fea6eb5fe8519c591af8ff4ad2',
    'd63a1cfc141185f5d1dae6e7e2bcdd4b5192f1f63bd4a9f7b24be71b541e0ce5',
  ])
    assert.ok(s.includes(hash));
});
test('both submitted hash and verification callback use the actual public canonical hash function', () => {
  const s = readFileSync(filename, 'utf8');
  assert.equal(
    (s.match(/offline\.canonicalOfflineSyncPayloadHash\(/gu) || []).length,
    2,
  );
  assert.doesNotMatch(s, /payloadHash:\s*hash\(JSON\.stringify/u);
});
test('reference fingerprint comparator retains the real prefixed identity rather than accepting bare hex', () => {
  const s = readFileSync(filename, 'utf8');
  assert.ok(s.includes('^sha256:[a-f0-9]{64}$'));
  assert.doesNotMatch(
    s,
    /idempotency_fingerprint[\s\S]{0,400}\^\[a-f0-9\]\{64\}\$/u,
  );
});

test('g03 subject identity refuses the original failed02 names and OIDs even on the same cluster', async () => {
  const p = await actual();
  for (const x of p.subjects) {
    assert.match(x.subject.databaseName, /^detran_r22_161_g03_/u);
    assert.ok(!['16384', '16385', '16386'].includes(x.subject.databaseOid));
  }
});
test('g03 reference source never creates or alters cluster roles or grants membership', () => {
  const s = readFileSync(filename, 'utf8');
  assert.doesNotMatch(s, /\b(?:CREATE|ALTER)\s+ROLE\b/iu);
  assert.doesNotMatch(s, /GRANT\s+role_app_backend\s+TO\s+role_r22_161_app/iu);
});
test('g03 complete role and membership graph is compared with retained actual snapshot before writes and after cases', () => {
  const s = readFileSync(filename, 'utf8');
  assert.ok(s.includes('pg_roles'));
  assert.ok(s.includes('pg_auth_members'));
  assert.match(s, /captureRoleGraph/u);
  assert.match(s, /assertUnchangedRoleGraph/u);
  assert.ok(
    (s.match(/assertUnchangedRoleGraph\(/gu) || []).length >= 3,
    'definition and both before/after call sites',
  );
  assert.ok(s.includes('effective-role-closure'));
});
