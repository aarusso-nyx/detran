import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  constants,
  cpSync,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  statSync,
  chmodSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test, { after } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readHistoricalPlanInput } from '../../stynx-storage-portable-plan-inputs.mjs';

// Inspector B8: all manufactured custody documents below are parser fixtures,
// NOT_ADMISSION. No receipt, reviewer approval, SQL execution or SDK is fabricated.
const repo = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const modulePath = path.join(repo, 'tools/stynx-storage-forward.mjs');
const ddlPath = path.join(
  repo,
  'backend/database/ddl/19-stynx-offline-custody.sql',
);
const projectionPath =
  'scratch/r22-adoption-161/package-admission/projection/public-storage-projection.json';
const publicationPath =
  'scratch/r22-adoption-161/package-admission/protected-publication-verification.json';
const priorPath =
  'scratch/r22-adoption-161/prior-runtime/closure-manifest.json';
const retentionPath =
  'scratch/r22-adoption-161/package-admission/retention-manifest.json';
const historicalMap = JSON.parse(
  readFileSync(
    path.join(
      repo,
      'tools/stynx-storage/consumer-fixtures/historical-plans/manifest.json',
    ),
  ),
);
const producerInput =
  'scratch/r22-adoption-161/portable-ci/retention-03/inputs';
function historicalRow(name) {
  const rows = historicalMap.files.filter(
    (entry) => entry.original.path === name,
  );
  assert.equal(rows.length, 1, 'Exact historical input row required');
  return rows[0];
}
const historicalPhysical = (root, name) =>
  path.join(root, historicalRow(name).retained.path);
const bytes = (name) =>
  name.startsWith('scratch/r22-adoption-161/')
    ? readHistoricalPlanInput(repo, {
        path: name,
        sha256: historicalRow(name).original.sha256,
      })
    : readFileSync(path.join(repo, name));
const hash = (b) => createHash('sha256').update(b).digest('hex');
const canonical = (v) =>
  Array.isArray(v)
    ? `[${v.map(canonical).join(',')}]`
    : v !== null && typeof v === 'object'
      ? `{${Object.keys(v)
          .sort()
          .map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`)
          .join(',')}}`
      : JSON.stringify(v);
const digest = (v) => `sha256:${hash(canonical(v))}`;
const ref = (name) => ({ path: name, sha256: `sha256:${hash(bytes(name))}` });
const fixtureRef = (name) => ({
  path: `fixtures/NOT_ADMISSION/${name}`,
  sha256: `sha256:${hash(`NOT_ADMISSION fixture ${name}`)}`,
});
const projection = JSON.parse(bytes(projectionPath));
const binding = structuredClone(projection.binding);
const targetPublication = {
  version: '1.6.1',
  commit: '3e3da1f7ceb6dd4a7dd2f9d6e0dc704437e262a0',
  tree: 'e2ce9989249d1bc13403dc21f5a421b24178ef29',
  workflowRun: '38445937806',
  verification: ref(publicationPath),
  packageAdmission: ref(retentionPath),
  projection: ref(projectionPath),
};
const subject = {
  clusterSystemIdentifier: '7696248909089426150',
  databaseOid: '16386',
  databaseName: 'detran_r22_161_upgrade',
  owner: 'postgres',
};
const fixtureBaselineId = `sha256:${hash('NOT_ADMISSION baseline fixture')}`;
const timestamp = '2026-10-13T00:00:00.123456Z'; // Schema fixture, never an observed transaction fact.
const sources = (n) =>
  projection.offlineMigrations.migrations.slice(0, n).map((m, i) => ({
    ordinal: i + 1,
    sourcePath: m.source.path,
    rawSha256: m.source.sha256,
  }));
function sign(d) {
  delete d.recordSha256;
  d.recordSha256 = digest(d);
  return d;
}
function forward() {
  const m = projection.offlineMigrations.migrations[8];
  return sign({
    formatVersion: 'detran-stynx-offline-forward-receipt/1',
    kind: 'forward-migration-executed',
    subject: structuredClone(subject),
    package: '@stynx-nyx/offline-sync',
    baselineId: fixtureBaselineId,
    targetPackageVersion: '1.6.1',
    targetPublicationDigest: digest(targetPublication),
    binding: structuredClone(binding),
    bindingDigest: digest(binding),
    ordinal: 9,
    source: structuredClone(m.source),
    boundSqlSha256: m.sqlSha256,
    predecessor: {
      kind: 'baseline',
      baselineId: fixtureBaselineId,
      coveredPrefixLength: 8,
    },
    execution: { by: 'postgres', atUtc: timestamp },
    evidence: {
      priorStateRecordDigest: fixtureRef('prior-state.json').sha256,
      executionPlanDigest: fixtureRef('plan.json').sha256,
      reviewedCandidateDigest: fixtureRef('candidate.json').sha256,
      boundSqlArtifact: fixtureRef('suffix9.sql'),
    },
  });
}
function group(mode = 'fresh-1.6.1') {
  const fresh = mode === 'fresh-1.6.1';
  const receipt = forward();
  return sign({
    formatVersion: 'detran-stynx-storage-target-group/1',
    kind: 'target-group-admission',
    mode,
    subject: structuredClone(subject),
    targetPackageVersion: '1.6.1',
    targetPublication: structuredClone(targetPublication),
    binding: structuredClone(binding),
    bindingDigest: digest(binding),
    freshReceipts: Object.fromEntries(
      ['outbox', 'offline'].map((n) => [
        n,
        {
          package: `@stynx-nyx/${n === 'offline' ? 'offline-sync' : n}`,
          version: fresh ? '1.6.1' : '1.6.0',
          rowDigest: fixtureRef(`${n}-row.json`).sha256,
          rowArtifact: fixtureRef(`${n}-row.json`),
        },
      ]),
    ),
    outbox: fresh
      ? { mode: 'fresh-artifact', artifact: ref(projectionPath) }
      : {
          mode: 'no-storage-change',
          priorArtifact: fixtureRef('outbox-prior.json'),
          targetArtifact: ref(projectionPath),
          equivalence: fixtureRef('outbox-equivalence.json'),
        },
    offline: fresh
      ? {
          mode: 'fresh-artifact',
          artifact: ref(projectionPath),
          coveredSources: sources(9),
          migrationExecution: 'none',
        }
      : {
          mode: 'forward',
          baselineId: fixtureBaselineId,
          forwardReceiptId: receipt.recordSha256,
          lastOrdinal: 9,
          targetArtifact: ref(projectionPath),
          orderedArtifact: ref(projectionPath),
        },
    admission: { by: 'postgres', atUtc: timestamp },
    evidence: {
      priorState: fresh ? null : fixtureRef('prior-state.json'),
      equivalence: fresh ? null : fixtureRef('equivalence.json'),
      executionPlan: fixtureRef('plan.json'),
      reviewedCandidate: fixtureRef('candidate.json'),
    },
  });
}
function baseline() {
  const row = {
    package: '@stynx-nyx/offline-sync',
    identity: {
      fixture: 'NOT_ADMISSION',
      fraction: 1.1,
      metadata: { '\uE000': 'BMP', '\u{10000}': 'astral' },
      ordered: [2, 1],
      recordSha256: 'opaque nested hash must remain',
    },
    installed_by: 'postgres',
    installed_at_sql: '2026-10-13 00:00:00.123456+00',
    installed_at_utc: timestamp,
  };
  const migrations = projection.offlineMigrations.migrations
    .slice(0, 8)
    .map((m, i) => ({
      ordinal: i + 1,
      sourcePath: m.source.path,
      rawSha256: m.source.sha256,
      boundSqlSha256: m.sqlSha256,
      boundSqlArtifact: fixtureRef(`prefix-${i + 1}.sql`),
    }));
  const prefix = {
    meaning: 'not-executed-on-subject',
    binding: structuredClone(binding),
    implementation: {
      packageVersion: '1.6.1',
      entrypoint: fixtureRef('offline-target-public-index.js'),
      publicationDigest: digest(targetPublication),
    },
    migrations,
    digest: digest({ binding, migrations }),
  };
  const reference = (name) => ({
    subject: {
      ...subject,
      databaseName: name,
      databaseOid: name.endsWith('ref160') ? '16384' : '16385',
    },
    installation: fixtureRef(`${name}-installation.json`),
    priorVerifierBefore: fixtureRef(`${name}-before.json`),
    priorVerifierAfter: fixtureRef(`${name}-after.json`),
  });
  return sign({
    formatVersion: 'detran-stynx-offline-fresh-baseline/1',
    subject: structuredClone(subject),
    freshReceipt: {
      relation: 'integration.stynx_storage_installations',
      package: '@stynx-nyx/offline-sync',
      row,
      rowDigest: digest(row),
      assertion: fixtureRef('fresh-row-assertion.json'),
      group: {
        outbox: {
          rowDigest: fixtureRef('outbox-row.json').sha256,
          rowArtifact: fixtureRef('outbox-row.json'),
        },
        offline: {
          rowDigest: digest(row),
          rowArtifact: fixtureRef('offline-row.json'),
        },
      },
    },
    priorPackage: {
      version: '1.6.0',
      sourceCommit: '60e53ad791a4d031ab137a344fd994fe97bcb514',
      sourceTree: '9249c9325558da557f3f13170941efa2d148fdf8',
      tarball: {
        path: 'fixtures/NOT_ADMISSION/offline160.tgz',
        sha256: fixtureRef('offline160.tgz').sha256,
        integrity: `sha512-${Buffer.alloc(64).toString('base64')}`,
        bytes: 100,
      },
      entrypoint: fixtureRef('offline-prior-public-index.js'),
      declaration: fixtureRef('offline-prior-public-index.d.ts'),
      artifact: fixtureRef('offline-prior-artifact.json'),
      manifestDigest: fixtureRef('prior-manifest.json').sha256,
      objectsSqlSha256: hash('NOT_ADMISSION objects'),
      roleBindingsSqlSha256: hash('NOT_ADMISSION bindings'),
      runtimeClosure: ref(priorPath),
    },
    targetPublication: structuredClone(targetPublication),
    coveredSources: sources(8),
    projectedPrefix: prefix,
    priorState: {
      method: 'prior-public-verifier',
      record: fixtureRef('prior-state.json'),
      expectedCatalog: fixtureRef('expected-catalog.json'),
      actualCatalog: fixtureRef('actual-catalog.json'),
      rowInvariants: fixtureRef('row-invariants.json'),
      verifierReports: ['outbox', 'offline-sync'].map((n) => ({
        package: `@stynx-nyx/${n}`,
        version: '1.6.0',
        report: fixtureRef(`${n}-verifier.json`),
      })),
    },
    equivalence: {
      referenceA: reference('detran_r22_161_ref160'),
      referenceB: reference('detran_r22_161_refprefix8'),
      report: fixtureRef('equivalence.json'),
      rawSnapshots: [fixtureRef('raw-A.json'), fixtureRef('raw-B.json')],
      comparator: fixtureRef('comparator.json'),
    },
    review: {
      inspector: {
        actor: '/root/inspector_adoption_160',
        report: fixtureRef('input-inspector-review.json'),
      },
      independent: {
        actor: '/root/architect_adoption_160',
        report: fixtureRef('input-architect-review.json'),
      },
    },
  });
}
let apiPromise;
const api = () => (apiPromise ??= import(pathToFileURL(modulePath).href));
async function parse(d, kind) {
  const a = await api();
  return a.parseStorageCustodyDocument(
    typeof d === 'string' ? d : JSON.stringify(d),
    kind,
  );
}
async function valid(d, kind) {
  const actual = await parse(d, kind);
  assert.deepEqual(
    Object.keys(actual).sort(),
    ['document', 'canonicalJson', 'recordSha256'].sort(),
  );
  assert.deepEqual(actual.document, d);
  assert.equal(actual.canonicalJson, canonical(d));
  assert.equal(actual.recordSha256, d.recordSha256);
}
async function invalid(d, kind) {
  const a = await api();
  await assert.rejects(
    () =>
      Promise.resolve().then(() =>
        a.parseStorageCustodyDocument(
          typeof d === 'string' ? d : JSON.stringify(d),
          kind,
        ),
      ),
    (e) => e?.code === 'R22_STORAGE_CUSTODY_INVALID',
  );
}
const planInputs = () => ({
  publication: ref(publicationPath),
  projection: ref(projectionPath),
  priorRuntime: ref(priorPath),
  baseline: null,
  baselineReview: null,
});
async function invalidPlan(inputs, root = repo) {
  const a = await api();
  await assert.rejects(
    () => Promise.resolve().then(() => a.createStorageTargetPlan(root, inputs)),
    (e) => e?.code === 'R22_STORAGE_TARGET_PLAN_INVALID',
  );
}

test('public pure module exposes exactly the two B8 functions', async () => {
  const a = await api();
  assert.deepEqual(Object.keys(a).sort(), [
    'createStorageTargetPlan',
    'parseStorageCustodyDocument',
  ]);
});
for (const [kind, make] of [
  ['forward', forward],
  ['baseline', baseline],
  ['group', group],
])
  test(`NOT_ADMISSION ${kind} parser fixture validates canonical/hash only`, () =>
    valid(make(), kind));
test('NOT_ADMISSION upgraded group uses typed baseline/head9 branch', () =>
  valid(group('upgrade-fresh-1.6.0'), 'group'));
test('opaque identity preserves UTF16 key ordering, fractional JSON, arrays and nested hash', async () => {
  const d = baseline();
  const a = await parse(d, 'baseline');
  assert.equal(a.document.freshReceipt.row.identity.fraction, 1.1);
  assert.deepEqual(a.document.freshReceipt.row.identity.ordered, [2, 1]);
  assert.equal(
    a.document.freshReceipt.row.identity.recordSha256,
    'opaque nested hash must remain',
  );
  assert.ok(a.canonicalJson.indexOf('"𐀀"') < a.canonicalJson.indexOf('""'));
  assert.equal(a.recordSha256, d.recordSha256);
});
for (const lexeme of ['9.0', '9e0'])
  test(`exact custody integer spelling ${lexeme} canonicalizes to9`, async () => {
    const d = forward();
    await validTextNumber(d, lexeme);
  });
async function validTextNumber(d, lexeme) {
  const text = JSON.stringify(d).replace('"ordinal":9', `"ordinal":${lexeme}`);
  const a = await parse(text, 'forward');
  assert.equal(a.document.ordinal, 9);
  assert.equal(a.canonicalJson, canonical(d));
  assert.equal(a.recordSha256, d.recordSha256);
}
for (const lexeme of ['9.0000000000000001', '9007199254740993', '1e999'])
  test(`lexical integer loss/overflow ${lexeme} refuses before canonical rounding`, () =>
    invalid(
      JSON.stringify(forward()).replace('"ordinal":9', `"ordinal":${lexeme}`),
      'forward',
    ));
for (const [name, mutate] of [
  [
    'missing root field',
    (d) => {
      delete d.execution;
    },
  ],
  [
    'unknown root field',
    (d) => {
      d.unapproved = true;
    },
  ],
  [
    'nested extra field',
    (d) => {
      d.execution.clock = 'client';
    },
  ],
  [
    'wrong owner',
    (d) => {
      d.subject.owner = 'role_app_backend';
    },
  ],
  [
    'numeric database OID',
    (d) => {
      d.subject.databaseOid = 16386;
    },
  ],
  [
    'wrong package',
    (d) => {
      d.package = '@stynx-nyx/outbox';
    },
  ],
  [
    'wrong version',
    (d) => {
      d.targetPackageVersion = '1.6.2';
    },
  ],
  [
    'binding drift',
    (d) => {
      d.binding.tenantTable.table = 'other';
      d.bindingDigest = digest(d.binding);
    },
  ],
  [
    'binding digest mismatch',
    (d) => {
      d.bindingDigest = fixtureRef('wrong-binding').sha256;
    },
  ],
  [
    'unknown ordinal10',
    (d) => {
      d.ordinal = 10;
      d.predecessor = {
        kind: 'forward',
        receiptId: fixtureRef('previous').sha256,
        ordinal: 9,
      };
    },
  ],
  [
    'fractional ordinal',
    (d) => {
      d.ordinal = 9.1;
    },
  ],
  [
    'unknown source',
    (d) => {
      d.source.path = 'packages/offline-sync/migrations/0010_unknown.sql';
    },
  ],
  [
    'typed NULL predecessor',
    (d) => {
      d.predecessor.baselineId = null;
    },
  ],
  [
    'wrong baseline predecessor',
    (d) => {
      d.predecessor.baselineId = fixtureRef('wrong-baseline').sha256;
    },
  ],
  [
    'gap predecessor',
    (d) => {
      d.predecessor.coveredPrefixLength = 7;
    },
  ],
  [
    'wrong predecessor branch',
    (d) => {
      d.predecessor = {
        kind: 'forward',
        receiptId: fixtureRef('previous').sha256,
        ordinal: 8,
      };
    },
  ],
  [
    'missing six-digit timestamp',
    (d) => {
      d.execution.atUtc = '2026-10-13T00:00:00Z';
    },
  ],
  [
    'nonpostgres execution actor',
    (d) => {
      d.execution.by = 'app';
    },
  ],
  [
    'raw hash prefix confusion',
    (d) => {
      d.source.sha256 = `sha256:${d.source.sha256}`;
    },
  ],
  [
    'absolute evidence ref',
    (d) => {
      d.evidence.boundSqlArtifact.path = '/tmp/suffix.sql';
    },
  ],
  [
    'traversal evidence ref',
    (d) => {
      d.evidence.boundSqlArtifact.path = '../suffix.sql';
    },
  ],
  [
    'URL evidence ref',
    (d) => {
      d.evidence.boundSqlArtifact.path = 'https://example.invalid/suffix.sql';
    },
  ],
])
  test(`NOT_ADMISSION forward refuses ${name}`, () => {
    const d = forward();
    mutate(d);
    return invalid(sign(d), 'forward');
  });
test('wrong root hash refuses without repairing', () => {
  const d = forward();
  d.recordSha256 = fixtureRef('wrong-root').sha256;
  return invalid(d, 'forward');
});
test('nested escape-equivalent duplicate refuses even when last value restores digest', () =>
  invalid(
    JSON.stringify(forward()).replace(
      '"owner":"postgres"',
      '"owner":"other","own\\u0065r":"postgres"',
    ),
    'forward',
  ));
test('duplicate root hash key refuses', () => {
  const d = forward();
  return invalid(
    JSON.stringify(d).replace(
      `"recordSha256":"${d.recordSha256}"`,
      `"recordSha256":"${d.recordSha256}","recordSha256":"${d.recordSha256}"`,
    ),
    'forward',
  );
});
test('decoded unpaired Unicode refuses even with freshly computed fixture hash', () => {
  const d = baseline();
  d.freshReceipt.row.identity.invalid = '\ud800';
  d.freshReceipt.rowDigest = digest(d.freshReceipt.row);
  return invalid(sign(d), 'baseline');
});
test('opaque identity unsafe integer refuses', () => {
  const d = baseline();
  d.freshReceipt.row.identity.unsafe = 9007199254740992;
  d.freshReceipt.rowDigest = digest(d.freshReceipt.row);
  return invalid(sign(d), 'baseline');
});
test('opaque identity lexical decimal precision loss refuses', () => {
  const d = baseline();
  return invalid(
    JSON.stringify(d).replace(
      '"fraction":1.1',
      '"fraction":1.1000000000000001',
    ),
    'baseline',
  );
});
test('array reorder changes canonical identity rather than being normalized away', async () => {
  const d = baseline();
  d.freshReceipt.row.identity.ordered.reverse();
  await invalid(d, 'baseline');
  d.freshReceipt.rowDigest = digest(d.freshReceipt.row);
  d.freshReceipt.group.offline.rowDigest = d.freshReceipt.rowDigest;
  await valid(sign(d), 'baseline');
});
for (const [name, mutate] of [
  [
    'prefix missing source',
    (d) => {
      d.coveredSources.pop();
    },
  ],
  [
    'prefix reordered sources',
    (d) => {
      d.coveredSources.reverse();
    },
  ],
  [
    'projected prefix digest mismatch',
    (d) => {
      d.projectedPrefix.digest = fixtureRef('wrong-prefix').sha256;
    },
  ],
  [
    'row digest mismatch',
    (d) => {
      d.freshReceipt.rowDigest = fixtureRef('wrong-row').sha256;
    },
  ],
  [
    'missing installed timestamp precision',
    (d) => {
      d.freshReceipt.row.installed_at_utc = '2026-10-13T00:00:00Z';
      d.freshReceipt.rowDigest = digest(d.freshReceipt.row);
    },
  ],
  [
    'self reviewer producer',
    (d) => {
      d.review.inspector.actor = '/root';
    },
  ],
])
  test(`NOT_ADMISSION baseline refuses ${name}`, () => {
    const d = baseline();
    mutate(d);
    return invalid(sign(d), 'baseline');
  });
for (const [name, mutate] of [
  [
    'fresh with baseline/head fields',
    (d) => {
      d.offline.baselineId = fixtureBaselineId;
    },
  ],
  [
    'fresh claiming per-file execution',
    (d) => {
      d.offline.migrationExecution = '1-9-executed';
    },
  ],
  [
    'fresh receipt version mismatch',
    (d) => {
      d.freshReceipts.outbox.version = '1.6.0';
    },
  ],
  [
    'upgrade NULL baseline',
    (d) => {
      d.offline.baselineId = null;
    },
  ],
  [
    'upgrade NULL head',
    (d) => {
      d.offline.forwardReceiptId = null;
    },
  ],
  [
    'upgrade ordinal10',
    (d) => {
      d.offline.lastOrdinal = 10;
    },
  ],
  [
    'upgrade NULL prior evidence',
    (d) => {
      d.evidence.priorState = null;
    },
  ],
  [
    'wrong publication with same version',
    (d) => {
      d.targetPublication.commit = '0'.repeat(40);
    },
  ],
])
  test(`NOT_ADMISSION group refuses ${name}`, () => {
    const d = group(
      name.startsWith('upgrade') ? 'upgrade-fresh-1.6.0' : 'fresh-1.6.1',
    );
    mutate(d);
    return invalid(sign(d), 'group');
  });
for (const [name, value] of [
  ['nonstring', {}],
  ['empty', ''],
  ['trailing data', JSON.stringify(forward()) + ' null'],
  ['invalid kind', null],
])
  test(`parser refuses ${name}`, async () => {
    const a = await api();
    if (name === 'invalid kind')
      await assert.rejects(
        () =>
          Promise.resolve().then(() =>
            a.parseStorageCustodyDocument(
              JSON.stringify(forward()),
              'arbitrary',
            ),
          ),
        (e) => e?.code === 'R22_STORAGE_CUSTODY_INVALID',
      );
    else
      await assert.rejects(
        () =>
          Promise.resolve().then(() =>
            a.parseStorageCustodyDocument(value, 'forward'),
          ),
        (e) => e?.code === 'R22_STORAGE_CUSTODY_INVALID',
      );
  });
test('parser does not invoke coercion on a nonstring caller', async () => {
  const a = await api();
  let invoked = false;
  const value = {
    toString() {
      invoked = true;
      throw Error('coercion');
    },
  };
  await assert.rejects(
    () =>
      Promise.resolve().then(() =>
        a.parseStorageCustodyDocument(value, 'forward'),
      ),
    (e) => e?.code === 'R22_STORAGE_CUSTODY_INVALID',
  );
  assert.equal(invoked, false);
});

test('actual retained fresh plan binds publication/projection/prior refs without DB admission', async () => {
  const a = await api();
  const d = await a.createStorageTargetPlan(repo, planInputs());
  assert.deepEqual(
    Object.keys(d).sort(),
    [
      'formatVersion',
      'targetPublication',
      'targetPublicationDigest',
      'binding',
      'bindingDigest',
      'artifacts',
      'priorRuntime',
      'baseline',
      'baselineReview',
    ].sort(),
  );
  assert.equal(d.formatVersion, 'detran-stynx-storage-target-plan/1');
  assert.deepEqual(d.targetPublication, targetPublication);
  assert.equal(d.targetPublicationDigest, digest(targetPublication));
  assert.deepEqual(d.binding, binding);
  assert.equal(d.bindingDigest, digest(binding));
  assert.deepEqual(d.priorRuntime, ref(priorPath));
  assert.equal(d.baseline, null);
  assert.equal(d.baselineReview, null);
  for (const n of ['outbox', 'offline'])
    assert.deepEqual(d.artifacts[n], {
      ref: ref(projectionPath),
      ...projection.digests[n],
    });
  assert.deepEqual(d.artifacts.ordered, {
    ref: ref(projectionPath),
    migrations: projection.digests.offlineMigrations.map((m, i) => ({
      ordinal: i + 1,
      ...m,
    })),
  });
});

// d7fc actual disposable-subject input pair. This is a reviewed plan, never an executed suffix receipt.
const g03BaselinePath =
  'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03/baseline/baseline.json';
const g03ReviewPath =
  'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03/baseline-input-review/baseline-final-review.inspector.json';
function g03Inputs() {
  return {
    ...planInputs(),
    baseline: ref(g03BaselinePath),
    baselineReview: ref(g03ReviewPath),
  };
}
test('g03 admitted real baseline and independent final review enter the pure target plan without changing original receipts', async () => {
  assert.equal(
    hash(bytes(g03BaselinePath)),
    '6133d17086981b7b037726baed0023ab74f40218a323804ffd697fea2aa83d67',
  );
  assert.equal(
    hash(bytes(g03ReviewPath)),
    '28afd4cad37ca0574cc48ba302650920bd2ef192730c82fe63095271bf141388',
  );
  const a = await api(),
    inputs = g03Inputs();
  const plan = await a.createStorageTargetPlan(repo, inputs);
  assert.deepEqual(plan.baseline, {
    ref: inputs.baseline,
    recordSha256:
      'sha256:36a790fec9e65f1354048de94a732e334e436819c69f27ab88663b588e33f741',
  });
  assert.deepEqual(plan.baselineReview, inputs.baselineReview);
  assert.deepEqual(plan.targetPublication, targetPublication);
  assert.equal(plan.artifacts.ordered.migrations.length, 9);
  const original = JSON.parse(bytes(g03BaselinePath));
  assert.equal(original.subject.databaseOid, '18767');
  assert.equal(original.freshReceipt.row.identity.packageVersion, '1.6.0');
  assert.equal(original.projectedPrefix.meaning, 'not-executed-on-subject');
  assert.equal(original.coveredSources.length, 8);
  assert.equal(hash(bytes(g03BaselinePath)), inputs.baseline.sha256.slice(7));
});
for (const [name, mutate] of [
  [
    'wrong baseline digest',
    (x) => {
      x.baseline.sha256 = fixtureRef('wrong-baseline').sha256;
    },
  ],
  [
    'wrong final review digest',
    (x) => {
      x.baselineReview.sha256 = fixtureRef('wrong-review').sha256;
    },
  ],
  [
    'swapped baseline and review',
    (x) => {
      [x.baseline, x.baselineReview] = [x.baselineReview, x.baseline];
    },
  ],
  [
    'real baseline without final review',
    (x) => {
      x.baselineReview = null;
    },
  ],
  [
    'real final review without baseline',
    (x) => {
      x.baseline = null;
    },
  ],
  [
    'supporting audit substituted for closed final review',
    (x) => {
      x.baselineReview = ref(
        'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03/baseline-input-review/INSPECTOR-FINAL-BASELINE-REVIEW.json',
      );
    },
  ],
  [
    'old initial baseline instead of sealed final bytes',
    (x) => {
      x.baseline = ref(
        'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03/baseline/initial-adeb2250/baseline.json',
      );
    },
  ],
])
  test(`g03 admitted pure plan refuses ${name}`, () => {
    const inputs = g03Inputs();
    mutate(inputs);
    return invalidPlan(inputs);
  });
for (const [name, mutate] of [
  [
    'caller mode selector',
    (x) => {
      x.mode = 'upgrade';
    },
  ],
  [
    'caller approval boolean',
    (x) => {
      x.approved = true;
    },
  ],
  [
    'missing projection',
    (x) => {
      delete x.projection;
    },
  ],
  [
    'wrong publication hash',
    (x) => {
      x.publication.sha256 = fixtureRef('wrong').sha256;
    },
  ],
  [
    'wrong projection hash',
    (x) => {
      x.projection.sha256 = fixtureRef('wrong').sha256;
    },
  ],
  [
    'wrong prior closure hash',
    (x) => {
      x.priorRuntime.sha256 = fixtureRef('wrong').sha256;
    },
  ],
  [
    'absolute path',
    (x) => {
      x.publication.path = '/tmp/verification.json';
    },
  ],
  [
    'URL path',
    (x) => {
      x.publication.path = 'https://example.invalid/verification.json';
    },
  ],
  [
    'path traversal',
    (x) => {
      x.publication.path = '../verification.json';
    },
  ],
  [
    'missing artifact',
    (x) => {
      x.publication.path = 'fixtures/NOT_ADMISSION/absent.json';
    },
  ],
  [
    'baseline without review',
    (x) => {
      x.baseline = fixtureRef('baseline.json');
    },
  ],
  [
    'review without baseline',
    (x) => {
      x.baselineReview = fixtureRef('review.json');
    },
  ],
  [
    'manufactured fixture approval refs',
    (x) => {
      x.baseline = fixtureRef('baseline.json');
      x.baselineReview = fixtureRef('review.json');
    },
  ],
])
  test(`actual-root target plan refuses ${name}`, () => {
    const x = planInputs();
    mutate(x);
    return invalidPlan(x);
  });

function ddl() {
  assert.ok(existsSync(ddlPath), 'Prospective schema RED: custody DDL absent');
  return readFileSync(ddlPath, 'utf8');
}
const tables = [
  'stynx_offline_baseline_custody',
  'stynx_offline_forward_receipts',
  'stynx_storage_target_admissions',
];
function table(name) {
  const sql = ddl();
  const start = sql.search(
    new RegExp(`CREATE\\s+TABLE\\s+integration\\.${name}\\s*\\(`, 'iu'),
  );
  assert.ok(start >= 0, `Exact custody table ${name}`);
  let i = sql.indexOf('(', start),
    depth = 0,
    quoted = false;
  for (let j = i; j < sql.length; j++) {
    const c = sql[j];
    if (c === "'") {
      if (quoted && sql[j + 1] === "'") {
        j++;
        continue;
      }
      quoted = !quoted;
    }
    if (!quoted) {
      if (c === '(') depth++;
      if (c === ')' && --depth === 0) return sql.slice(i + 1, j);
    }
  }
  assert.fail('Unclosed table definition');
}
for (const name of tables)
  test(`candidate DDL declares ${name} with owner/RLS/FORCE and no policies`, () => {
    table(name);
    const sql = ddl();
    for (const clause of [
      'OWNER TO postgres',
      'ENABLE ROW LEVEL SECURITY',
      'FORCE ROW LEVEL SECURITY',
    ])
      assert.match(
        sql,
        new RegExp(
          `ALTER\\s+TABLE\\s+integration\\.${name}\\s+${clause}\\s*;`,
          'iu',
        ),
      );
    assert.doesNotMatch(sql, /CREATE\s+POLICY/iu);
  });
test('candidate schema preserves explicit typed NULL predecessor branches and fork guards', () => {
  const sql = table('stynx_offline_forward_receipts');
  for (const clause of [
    'predecessor_baseline_id IS NOT NULL',
    'predecessor_receipt_id IS NULL',
    'predecessor_baseline_id IS NULL',
    'predecessor_receipt_id IS NOT NULL',
    'predecessor_ordinal = ordinal - 1',
  ])
    assert.ok(sql.includes(clause), clause);
  assert.match(
    sql,
    /FOREIGN KEY\s*\(predecessor_baseline_id,\s*package,\s*binding_digest,\s*predecessor_ordinal\)/u,
  );
  assert.match(
    sql,
    /FOREIGN KEY\s*\(predecessor_receipt_id,\s*baseline_id,\s*package,\s*binding_digest,\s*predecessor_ordinal\)/u,
  );
  for (const name of [
    'stynx_offline_forward_baseline_successor_uq',
    'stynx_offline_forward_receipt_successor_uq',
  ])
    assert.match(
      ddl(),
      new RegExp(`CREATE\\s+UNIQUE\\s+INDEX\\s+${name}`, 'iu'),
    );
});
test('candidate target schema distinguishes fresh NULL branch from exact upgraded head9', () => {
  const sql = table('stynx_storage_target_admissions');
  for (const name of [
    'offline_baseline_id',
    'offline_forward_receipt_id',
    'offline_last_ordinal',
  ]) {
    assert.ok(sql.includes(`${name} IS NULL`));
    assert.ok(sql.includes(`${name} IS NOT NULL`));
  }
  assert.match(sql, /offline_last_ordinal\s*=\s*9/u);
  for (const name of [
    'stynx_target_outbox_fresh_fk',
    'stynx_target_offline_fresh_fk',
    'stynx_target_baseline_fk',
    'stynx_target_head_fk',
  ])
    assert.ok(sql.includes(name));
});
test('candidate custody defaults preserve actual SQL actor/time and finite timestamps', () => {
  for (const name of tables) {
    const sql = table(name);
    assert.match(sql, /DEFAULT\s+CURRENT_USER/iu);
    assert.match(sql, /DEFAULT\s+transaction_timestamp\(\)/iu);
    assert.match(sql, /isfinite\((?:admitted_at|executed_at)\)/u);
    assert.match(
      sql,
      /CHECK\s*\((?:admitted_by|executed_by)\s*=\s*'postgres'::name\)/u,
    );
  }
});
test('candidate immutable guards are statement UPDATE/DELETE/TRUNCATE and ALWAYS', () => {
  const sql = ddl();
  for (const [name, trigger] of [
    ['stynx_offline_baseline_custody', 'stynx_offline_baseline_immutable'],
    ['stynx_offline_forward_receipts', 'stynx_offline_forward_immutable'],
    [
      'stynx_storage_target_admissions',
      'stynx_storage_target_admissions_immutable',
    ],
  ]) {
    assert.match(
      sql,
      new RegExp(
        `CREATE\\s+TRIGGER\\s+${trigger}\\s+BEFORE\\s+UPDATE\\s+OR\\s+DELETE\\s+OR\\s+TRUNCATE\\s+ON\\s+integration\\.${name}\\s+FOR\\s+EACH\\s+STATEMENT`,
        'iu',
      ),
    );
    assert.match(
      sql,
      new RegExp(
        `ALTER\\s+TABLE\\s+integration\\.${name}\\s+ENABLE\\s+ALWAYS\\s+TRIGGER\\s+${trigger}`,
        'iu',
      ),
    );
  }
  assert.doesNotMatch(
    sql,
    /SECURITY\s+DEFINER|DISABLE\s+TRIGGER|CREATE\s+RULE/iu,
  );
  assert.match(sql, /SET\s+search_path\s*=\s*pg_catalog/iu);
});
test('candidate ACLs explicitly revoke public/app/auditor table and function access', () => {
  const sql = ddl();
  assert.match(
    sql,
    /REVOKE\s+ALL\s+ON\s+(?:TABLE\s+)?integration\.stynx_offline_baseline_custody[\s\S]*?FROM\s+PUBLIC,\s*role_app_backend,\s*role_auditor_min/iu,
  );
  assert.match(
    sql,
    /REVOKE\s+ALL\s+ON\s+FUNCTION\s+integration\.stynx_offline_custody_immutable\(\)/iu,
  );
  assert.match(
    sql,
    /REVOKE\s+ALL\s+ON\s+(?:TABLE\s+)?integration\.stynx_storage_target_admissions/iu,
  );
  assert.match(
    sql,
    /REVOKE\s+ALL\s+ON\s+FUNCTION\s+integration\.stynx_storage_target_admissions_immutable\(\)/iu,
  );
});
test('candidate catalogue assertions inspect PG18 NOT NULL/unknown object/ACL/guard surfaces', () => {
  const sql = ddl();
  for (const token of [
    'pg_attribute',
    'pg_constraint',
    'pg_index',
    'pg_trigger',
    'pg_policy',
    'pg_class',
    'pg_proc',
    'pg_namespace',
    'pg_default_acl',
    'server_version_num',
    'convalidated',
    'conislocal',
    'coninhcount',
    'conparentid',
    'attnotnull',
    'tgenabled',
    'prosecdef',
    'proconfig',
  ])
    assert.match(sql, new RegExp(`\\b${token}\\b`, 'u'));
  assert.match(sql, /180000/u);
  assert.match(sql, /RAISE\s+EXCEPTION/iu);
});

// Prospective F1 source witnesses after the preserved 94-case checkpoint.
// These inspect candidate SQL; no PostgreSQL tamper/enforcement proof is claimed.
test('catalogue comparison preserves whitespace inside CHECK literals', () => {
  const original = "CHECK (package = '@stynx-nyx/offline-sync')";
  const tampered = "CHECK (package = '@stynx-nyx/offline- sync')";
  assert.notEqual(original, tampered);
  assert.equal(original.replace(/\s/gu, ''), tampered.replace(/\s/gu, ''));
  assert.doesNotMatch(
    ddl(),
    /regexp_replace\s*\(\s*pg_get_constraintdef\s*\([^)]*\)\s*,\s*'\[\[:space:\]\]'/iu,
    'Global whitespace removal erases the changed SQL literal',
  );
});
test('schema CREATE denial includes NOLOGIN parents reachable through SET ROLE', () => {
  const sql = ddl();
  const start = sql.indexOf('IF NOT EXISTS (SELECT FROM pg_namespace');
  const end = sql.indexOf(
    "RAISE EXCEPTION 'STYNX custody schema/defaults/reachable roles differ'",
    start,
  );
  assert.ok(start >= 0 && end > start, 'Complete schema privilege assertion');
  const guard = sql.slice(start, end);
  assert.match(guard, /NOT\s+r\.rolsuper/iu);
  assert.match(
    guard,
    /has_schema_privilege\s*\(r\.oid,\s*'integration',\s*'CREATE'\)/iu,
  );
  assert.doesNotMatch(
    guard,
    /r\.rolcanlogin|r\.rolname\s+IN/iu,
    'Conservative all-nonsuper-role check cannot filter out a NOLOGIN SET ROLE parent',
  );
});
test('RI guards bind every FK child and parent event to its exact function and identities', () => {
  const sql = ddl();
  // Independent PostgreSQL event masks: ROW|INSERT=5, ROW|UPDATE=17,
  // ROW|DELETE=9. Self-referencing FKs still need all four distinct tuples.
  for (const [relation, opposite, mask, fn] of [
    ['conrelid', 'confrelid', 5, 'RI_FKey_check_ins'],
    ['conrelid', 'confrelid', 17, 'RI_FKey_check_upd'],
    ['confrelid', 'conrelid', 9, 'RI_FKey_restrict_del'],
    ['confrelid', 'conrelid', 17, 'RI_FKey_noaction_upd'],
  ])
    assert.match(
      sql,
      new RegExp(
        `\\(c\\.${relation},\\s*c\\.${opposite},\\s*${mask},\\s*'(?:pg_catalog\\.\")?${fn}`,
        'u',
      ),
      `Exact per-FK tuple ${relation}/${opposite}/${mask}/${fn}`,
    );
  assert.match(sql, /t\.tgconstrindid/u);
  assert.match(sql, /c\.conindid/u);
  assert.match(sql, /t\.tgconstraint\s*=\s*c\.oid/u);
  assert.match(sql, /t\.tgconstrrelid/u);
  assert.match(sql, /t\.tgtype/u);
  assert.ok(
    [...sql.matchAll(/EXCEPT\s+ALL/giu)].length >= 2,
    'Bidirectional exact multiset comparison rejects duplicate/missing/swapped RI rows',
  );
});
test('effective custody access includes each principal SET ROLE closure and privileged parents', () => {
  const sql = ddl();
  assert.match(
    sql,
    /pg_has_role\s*\(principal\.oid,\s*reachable\.oid,\s*'SET'\)/iu,
    'NOINHERIT does not remove SET ROLE authority to a NOLOGIN or intrinsic parent',
  );
  assert.match(sql, /reachable\.oid\s*=\s*principal\.oid/iu);
  assert.match(sql, /has_table_privilege\s*\(reachable\.oid,\s*table_oid,/iu);
  assert.match(
    sql,
    /has_function_privilege\s*\(reachable\.oid,\s*function_oid,\s*'EXECUTE'\)/iu,
  );
  for (const capability of [
    'rolsuper',
    'rolbypassrls',
    'rolcreaterole',
    'rolcreatedb',
    'rolreplication',
  ])
    assert.match(sql, new RegExp(`reachable\\.${capability}\\b`, 'u'));
});

// Independent declared column inventories; static source evidence, not SQL enforcement.
function clauses(body) {
  const parts = [];
  let start = 0,
    depth = 0,
    quoted = false;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === "'") {
      if (quoted && body[i + 1] === "'") {
        i++;
        continue;
      }
      quoted = !quoted;
    }
    if (!quoted) {
      if (c === '(') depth++;
      else if (c === ')') depth--;
      else if (c === ',' && depth === 0) {
        parts.push(body.slice(start, i).trim());
        start = i + 1;
      }
    }
  }
  parts.push(body.slice(start).trim());
  return parts;
}
const columnInventory = {
  stynx_offline_baseline_custody: {
    baseline_id: 'text',
    package: 'text',
    prior_package_version: 'text',
    target_package_version: 'text',
    subject_digest: 'text',
    fresh_receipt_digest: 'text',
    target_publication_digest: 'text',
    binding_digest: 'text',
    covered_prefix_length: 'integer',
    last_covered_source: 'text',
    projected_prefix_digest: 'text',
    document: 'jsonb',
    admitted_by: 'name',
    admitted_at: 'timestamptz',
  },
  stynx_offline_forward_receipts: {
    receipt_id: 'text',
    baseline_id: 'text',
    package: 'text',
    target_package_version: 'text',
    target_publication_digest: 'text',
    binding_digest: 'text',
    ordinal: 'integer',
    source_path: 'text',
    raw_source_digest: 'text',
    bound_sql_digest: 'text',
    predecessor_baseline_id: 'text',
    predecessor_receipt_id: 'text',
    predecessor_ordinal: 'integer',
    document: 'jsonb',
    executed_by: 'name',
    executed_at: 'timestamptz',
  },
  stynx_storage_target_admissions: {
    admission_id: 'text',
    mode: 'text',
    target_package_version: 'text',
    fresh_package_version: 'text',
    subject_digest: 'text',
    target_publication_digest: 'text',
    binding_digest: 'text',
    outbox_package: 'text',
    offline_package: 'text',
    outbox_fresh_receipt_digest: 'text',
    offline_fresh_receipt_digest: 'text',
    offline_baseline_id: 'text',
    offline_forward_receipt_id: 'text',
    offline_last_ordinal: 'integer',
    document: 'jsonb',
    admitted_by: 'name',
    admitted_at: 'timestamptz',
  },
};
for (const name of tables)
  test(`candidate ${name} has exactly declared columns/types/default/nullability`, () => {
    const fields = clauses(table(name)).filter(
      (x) =>
        !/^(?:CONSTRAINT|PRIMARY\s+KEY|UNIQUE|CHECK|FOREIGN\s+KEY)\b/iu.test(x),
    );
    const records = fields.map((x) => {
      const m = /^([a-z_]+)\s+([a-z]+)/iu.exec(x);
      assert.ok(m, 'Recognizable exact column declaration');
      return { name: m[1], type: m[2].toLowerCase(), sql: x };
    });
    assert.equal(new Set(records.map((x) => x.name)).size, records.length);
    assert.deepEqual(
      Object.fromEntries(records.map((x) => [x.name, x.type])),
      columnInventory[name],
    );
    const nullable =
      name === 'stynx_offline_forward_receipts'
        ? ['predecessor_baseline_id', 'predecessor_receipt_id']
        : name === 'stynx_storage_target_admissions'
          ? [
              'offline_baseline_id',
              'offline_forward_receipt_id',
              'offline_last_ordinal',
            ]
          : [];
    for (const r of records) {
      if (nullable.includes(r.name))
        assert.doesNotMatch(r.sql, /NOT\s+NULL|PRIMARY\s+KEY/iu);
      else assert.match(r.sql, /NOT\s+NULL|PRIMARY\s+KEY/iu);
      if (
        !['admitted_by', 'admitted_at', 'executed_by', 'executed_at'].includes(
          r.name,
        )
      )
        assert.doesNotMatch(r.sql, /\bDEFAULT\b/iu);
      assert.doesNotMatch(r.sql, /\bGENERATED\b|\bIDENTITY\b/iu);
    }
  });
for (const name of [
  'stynx_offline_custody_immutable',
  'stynx_storage_target_admissions_immutable',
])
  test(`candidate ${name} body is only unconditional RAISE with invoker/searchpath guard`, () => {
    const sql = ddl();
    const re = new RegExp(
      `CREATE\\s+(?:OR\\s+REPLACE\\s+)?FUNCTION\\s+integration\\.${name}\\(\\)\\s+RETURNS\\s+trigger([\\s\\S]*?)AS\\s+(\\$[a-zA-Z0-9_]*\\$)([\\s\\S]*?)\\2`,
      'iu',
    );
    const m = re.exec(sql);
    assert.ok(m, 'Named trigger function and complete dollar body');
    assert.match(m[1], /LANGUAGE\s+plpgsql/iu);
    assert.match(m[1], /SET\s+search_path\s*=\s*pg_catalog/iu);
    assert.doesNotMatch(m[1], /SECURITY\s+DEFINER/iu);
    assert.match(
      m[3].trim(),
      /^BEGIN\s+RAISE\s+EXCEPTION\s+'(?:[^']|'')+';\s+END;?$/iu,
    );
  });

// Real retained copies test whole-file/link revalidation without SDK or SQL.
let copiedRoot;
after(() => {
  if (copiedRoot) rmSync(copiedRoot, { recursive: true, force: true });
});
async function copiedFixture(action) {
  await api(); // Preserve missing-program RED before expensive real-artifact copy.
  if (!copiedRoot) {
    copiedRoot = mkdtempSync(
      path.join(os.tmpdir(), 'detran-forward-admission-'),
    );
    for (const name of [
      'tools/stynx-storage/fixtures',
      'tools/stynx-storage/consumer-fixtures/historical-plans',
      ...new Set(
        Object.values(historicalMap.reviews).map((review) =>
          path.dirname(review.report.path),
        ),
      ),
      'tools/stynx-storage-ci-inputs.mjs',
      'tools/stynx-storage-ci-validation.mjs',
      'pnpm-lock.yaml',
      'tools/stynx-storage/retained-observations/producer-generation03-f840.mjs.raw',
      producerInput,
    ]) {
      mkdirSync(path.dirname(path.join(copiedRoot, name)), { recursive: true });
      cpSync(path.join(repo, name), path.join(copiedRoot, name), {
        recursive: true,
        mode: constants.COPYFILE_FICLONE,
        verbatimSymlinks: true,
      });
    }
  }
  return action(copiedRoot);
}
test('real copied fresh-plan inputs remain valid without original absolute runtime fallback', () =>
  copiedFixture(async (root) => {
    const a = await api();
    const d = await a.createStorageTargetPlan(root, planInputs());
    assert.equal(d.targetPublicationDigest, digest(targetPublication));
    assert.equal(d.baseline, null);
    assert.deepEqual(d.priorRuntime, ref(priorPath));
  }));
test('copied prior regular payload drift refuses full-current-byte revalidation', () =>
  copiedFixture(async (root) => {
    const cap = JSON.parse(
      bytes('scratch/r22-adoption-161/prior-runtime/installed-capture.json'),
    );
    const entry = cap.files.find((f) => f.path.endsWith('/outbox.service.js'));
    assert.ok(entry);
    const file = path.join(root, producerInput, 'prior', entry.path);
    const original = readFileSync(file),
      mode = statSync(file).mode;
    try {
      chmodSync(file, mode | 0o200);
      writeFileSync(
        file,
        Buffer.concat([original, Buffer.from('\n// NOT_ADMISSION drift\n')]),
      );
      await invalidPlan(planInputs(), root);
    } finally {
      writeFileSync(file, original);
      chmodSync(file, mode);
    }
  }));
test('copied prior archive drift refuses metadata/archive hash custody', () =>
  copiedFixture(async (root) => {
    const p = JSON.parse(
      bytes('scratch/r22-adoption-161/prior-runtime/package-provenance.json'),
    ).packages.find((x) => x.name === '@stynx-nyx/offline-sync');
    const file = path.join(root, producerInput, 'prior', p.archive.path);
    const original = readFileSync(file);
    try {
      writeFileSync(
        file,
        Buffer.concat([original, Buffer.from('NOT_ADMISSION')]),
      );
      await invalidPlan(planInputs(), root);
    } finally {
      writeFileSync(file, original);
    }
  }));
test('copied prior extra runtime file refuses closed actual inventory', () =>
  copiedFixture(async (root) => {
    const file = path.join(
      root,
      producerInput + '/prior/runtime/NOT_ADMISSION-extra.txt',
    );
    try {
      writeFileSync(file, 'fixture');
      await invalidPlan(planInputs(), root);
    } finally {
      rmSync(file, { force: true });
    }
  }));
test('copied prior unexpected external link refuses even to unchanged real bytes', () =>
  copiedFixture(async (root) => {
    const file = path.join(
      root,
      producerInput + '/prior/runtime/NOT_ADMISSION-extra-link',
    );
    try {
      symlinkSync(historicalPhysical(repo, priorPath), file);
      await invalidPlan(planInputs(), root);
    } finally {
      rmSync(file, { force: true });
    }
  }));
test('copied independent prior retention review drift refuses pinned provenance', () =>
  copiedFixture(async (root) => {
    const file = historicalPhysical(
      root,
      'scratch/r22-adoption-161/prior-runtime/INSPECTOR-PRIOR-RUNTIME-REVIEW.md',
    );
    const original = readFileSync(file);
    try {
      writeFileSync(
        file,
        Buffer.concat([
          original,
          Buffer.from('\nNOT_ADMISSION alteredreview\n'),
        ]),
      );
      await invalidPlan(planInputs(), root);
    } finally {
      writeFileSync(file, original);
    }
  }));
test('copied malformed UTF8 publication file refuses ingress before admission', () =>
  copiedFixture(async (root) => {
    const file = historicalPhysical(root, publicationPath);
    const original = readFileSync(file);
    try {
      const malformed = Buffer.from([0xff, 0x7b, 0x7d]);
      writeFileSync(file, malformed);
      const x = planInputs();
      x.publication.sha256 = `sha256:${hash(malformed)}`;
      await invalidPlan(x, root);
    } finally {
      writeFileSync(file, original);
    }
  }));
