import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { readHistoricalPlanInput } from './stynx-storage-portable-plan-inputs.mjs';
import {
  verifyPortablePriorClosure,
  verifyPortableTargetRetention,
} from './stynx-storage-portable-plan-validation.mjs';

// Pure custody/plan boundary. No SDK import, connection, SQL execution or approval
// producer. Only the actual independently sealed g03 baseline pair is admitted.
const seal = {
  publication:
    '46815c17be9dbcd2080a3a0c08db958bd42390d8766c64ef40bebd5017074318',
  projection:
    '944f0041700de5e2c31ebf0e71b7999df999d76cc6645b3bec38ddfc0f692388',
  retention: '56e2e6438b8ef505eca99357e8e219e30ceb170f68f7b5779fff6f997c8a98ac',
  prior: '55454077278d8c60ac6abcb8b829fcc8bbcaa88efe09e1a2f0e07eb26f879f5d',
  priorRetention:
    'c597aa0ae326054a3bd9294f9e95410b9d23d2e3da19ae0238b388ba1be8a894',
  priorReview:
    '60ab16b13a57bc0253aa266a48c8aed19714e96fa6ab5f38d634caa47665e4c4',
};
const published = {
  version: '1.6.1',
  commit: '3e3da1f7ceb6dd4a7dd2f9d6e0dc704437e262a0',
  tree: 'e2ce9989249d1bc13403dc21f5a421b24178ef29',
  workflowRun: '38445937806',
};
const fixedBinding = {
  ownerRole: 'postgres',
  appRole: 'role_app_backend',
  readerRole: null,
  tenantTable: { schema: 'auth', table: 'tenants', column: 'id' },
};
const sources = [
  [
    '0001_offline_sync.sql',
    'e8c61245343dd0bb58f49e259b9384bc0fa06b81b1211b19fc6a37de275069c1',
    'b1af62852c0d75b9761396eb785757dd692b53fb56ac4d7e5eb0f1f0d4d6d84e',
  ],
  [
    '0002_durable_sync.sql',
    'bb2c7685a2092d92ecb7ce80b7a61e54714a55cbb5e1a222d0e71d3a4b2b8983',
    '0cc8708932769d9c1a6b9366e6e7e6cddd24f5f55db4d4a0d456d2a6f52e7ca3',
  ],
  [
    '0003_reservation_idempotency.sql',
    'c947e341e1617c983fc559317f32a724aeaef07094e41334e41bc517621a534f',
    'cc4bbfe6e2d12c6d95fbbee9535f8faeaec132c2e4be18c6de40ba5bd8cdb52f',
  ],
  [
    '0004_pending_state_and_conflict_actions.sql',
    '435e064cf61fe1a3b76c49cc9b495616a5125ba92b480d75807fd4a1dabba0c6',
    '8cd66230a8eaec6b305e6728628939984cfdd3274114b296218ef0c18ac5835c',
  ],
  [
    '0005_initial_queue_status.sql',
    'dc3a8ee136406c749214f29251a7314990ce7c402e5bb4120111518fd2a15c0e',
    '40492407e8d6625451c2e87dcaff0f78db41072d10c91b55d73e242d6199e87e',
  ],
  [
    '0006_nullable_active_reservations.sql',
    '942822d271a6ea5e6b82e1bea831bcbac9e8169003294c60b28d977fe6b23db5',
    '295ebfb2ea90a3738f413e896fdf9b49230746f8886bc6c8d9f0953cb39703e1',
  ],
  [
    '0007_range_administration.sql',
    '63ab4d83807c8cd7ec031085ac3344eef2ba611611b92418fdcfde4220d21836',
    '16cc19103677b364e68075810f654cb04b06f1f77d580409a4f9bdc5b0a9378c',
  ],
  [
    '0008_import_receipts.sql',
    'b700c1db62fd9a3d0e1f43000c61aa64d7b2b6d28cb288f148b73c8a3a8bbf5a',
    'a1da8787bd8489581d1d16f44e1f4072a43c3005e2cdce0d0218c09b24d35185',
  ],
  [
    '0009_numbering_reconciliations.sql',
    '7167a3d32e5048c56b453bb6cc5868a5c1c67f2aeab721a2832f13e4af1ca1fd',
    'e03be4b98bff78e229104958f1b483473794ea7007c722488911075694585de7',
  ],
].map(([name, raw, bound]) => ({
  path: `packages/offline-sync/migrations/${name}`,
  raw,
  bound,
}));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
function insist(condition, message) {
  if (!condition) throw new Error(message);
}
function unicode(value) {
  insist(typeof value === 'string', 'Expected string');
  for (let i = 0; i < value.length; i++) {
    const n = value.charCodeAt(i);
    if (n >= 0xd800 && n <= 0xdbff) {
      const low = value.charCodeAt(++i);
      insist(low >= 0xdc00 && low <= 0xdfff, 'Unpaired Unicode surrogate');
    } else insist(n < 0xdc00 || n > 0xdfff, 'Unpaired Unicode surrogate');
  }
  return value;
}
function record(value) {
  insist(
    value !== null && typeof value === 'object' && !Array.isArray(value),
    'Expected record',
  );
  insist(
    [Object.prototype, null].includes(Object.getPrototypeOf(value)),
    'Non-data record',
  );
  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (const key of Reflect.ownKeys(descriptors)) {
    insist(
      typeof key === 'string' &&
        Object.hasOwn(descriptors[key], 'value') &&
        descriptors[key].enumerable,
      'Accessor/symbol/nonenumerable refused',
    );
    unicode(key);
  }
  return value;
}
function keys(value, expected) {
  record(value);
  insist(
    isDeepStrictEqual(Object.keys(value).sort(), [...expected].sort()),
    'Missing/extra record fields',
  );
}
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object')
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
      .join(',')}}`;
  return JSON.stringify(value);
}
const digest = (value) => `sha256:${hash(canonical(value))}`;
const hex = (value) =>
  insist(
    typeof value === 'string' && /^[0-9a-f]{64}$/u.test(value),
    'Invalid raw digest',
  );
const prefixed = (value) =>
  insist(
    typeof value === 'string' && /^sha256:[0-9a-f]{64}$/u.test(value),
    'Invalid custody digest',
  );
function relative(value) {
  unicode(value);
  insist(
    value.length > 0 &&
      !/[\\:\0]/u.test(value) &&
      value.split('/').every((part) => part && part !== '.' && part !== '..'),
    'Unsafe relative path',
  );
}
function ref(value) {
  keys(value, ['path', 'sha256']);
  relative(value.path);
  prefixed(value.sha256);
}
function integer(value, min, max) {
  insist(
    Number.isSafeInteger(value) && value >= min && value <= max,
    'Invalid exact integer',
  );
}

// Compare decimal mathematical values, not the rounded Number alone. 9.0/9e0
// preserve nine; 9.0000000000000001 cannot become an apparently valid ordinal.
function decimal(raw) {
  const match = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/u.exec(raw);
  insist(match, 'Invalid decimal');
  let digits = (match[2] + (match[3] ?? '')).replace(/^0+/u, '');
  if (!digits) return '0';
  let exponent = BigInt(match[4] ?? '0') - BigInt((match[3] ?? '').length);
  const suffix = /0+$/u.exec(digits)?.[0].length ?? 0;
  if (suffix) {
    digits = digits.slice(0, -suffix);
    exponent += BigInt(suffix);
  }
  return `${match[1]}${digits}e${exponent}`;
}
function parseJson(text) {
  unicode(text);
  let at = 0;
  const space = () => {
    while (/[ \t\r\n]/u.test(text[at] ?? '') && at < text.length) at++;
  };
  function string() {
    const start = at++;
    while (at < text.length) {
      const char = text[at++];
      if (char === '\\') at++;
      else if (char === '"') return unicode(JSON.parse(text.slice(start, at)));
    }
    throw new Error('Unclosed JSON string');
  }
  function value() {
    space();
    const first = text[at];
    if (first === '"') return string();
    if (first === '{') {
      at++;
      space();
      const result = {},
        seen = new Set();
      if (text[at] === '}') {
        at++;
        return result;
      }
      while (true) {
        insist(text[at] === '"', 'JSON object key required');
        const key = string();
        insist(!seen.has(key), 'Duplicate decoded JSON key');
        seen.add(key);
        space();
        insist(text[at++] === ':', 'JSON colon required');
        Object.defineProperty(result, key, {
          value: value(),
          enumerable: true,
          writable: true,
          configurable: true,
        });
        space();
        const next = text[at++];
        if (next === '}') return result;
        insist(next === ',', 'JSON comma required');
        space();
      }
    }
    if (first === '[') {
      at++;
      space();
      const result = [];
      if (text[at] === ']') {
        at++;
        return result;
      }
      while (true) {
        result.push(value());
        space();
        const next = text[at++];
        if (next === ']') return result;
        insist(next === ',', 'JSON array comma required');
      }
    }
    for (const [literal, result] of [
      ['true', true],
      ['false', false],
      ['null', null],
    ])
      if (text.startsWith(literal, at)) {
        at += literal.length;
        return result;
      }
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/u.exec(
      text.slice(at),
    );
    insist(match, 'Invalid JSON value');
    at += match[0].length;
    const result = Number(match[0]);
    insist(
      Number.isFinite(result) &&
        (!Number.isInteger(result) || Number.isSafeInteger(result)),
      'Unsafe/nonfinite JSON number',
    );
    insist(
      decimal(match[0]) === decimal(JSON.stringify(result)),
      'JSON numeric precision loss',
    );
    return result;
  }
  const result = value();
  space();
  insist(at === text.length, 'Trailing JSON data');
  return result;
}
function subject(value) {
  keys(value, [
    'clusterSystemIdentifier',
    'databaseOid',
    'databaseName',
    'owner',
  ]);
  for (const key of ['clusterSystemIdentifier', 'databaseOid'])
    insist(
      typeof value[key] === 'string' && /^[1-9]\d*$/u.test(value[key]),
      'Subject numeric identity must be SQL text',
    );
  insist(
    typeof value.databaseName === 'string' &&
      /^[A-Za-z_][A-Za-z0-9_]*$/u.test(value.databaseName) &&
      value.owner === 'postgres',
    'Invalid subject owner/name',
  );
}
function binding(value, claimed) {
  keys(value, ['ownerRole', 'appRole', 'readerRole', 'tenantTable']);
  keys(value.tenantTable, ['schema', 'table', 'column']);
  insist(isDeepStrictEqual(value, fixedBinding), 'Binding differs');
  prefixed(claimed);
  insist(claimed === digest(value), 'Binding digest differs');
}
function publication(value) {
  keys(value, [
    'version',
    'commit',
    'tree',
    'workflowRun',
    'verification',
    'packageAdmission',
    'projection',
  ]);
  for (const key of Object.keys(published))
    insist(value[key] === published[key], 'Publication identity differs');
  for (const key of ['verification', 'packageAdmission', 'projection'])
    ref(value[key]);
  insist(
    value.verification.sha256 === `sha256:${seal.publication}` &&
      value.packageAdmission.sha256 === `sha256:${seal.retention}` &&
      value.projection.sha256 === `sha256:${seal.projection}`,
    'Publication custody identity differs',
  );
}
function timestamp(value) {
  insist(
    typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/u.test(value),
    'SQL UTC microseconds required',
  );
  const [year, month, day, hour, minute, second] = value
    .match(/\d+/gu)
    .map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  insist(
    year >= 1 &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <=
        [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][
          month - 1
        ] &&
      hour < 24 &&
      minute < 60 &&
      second < 60,
    'Invalid UTC date',
  );
}
function execution(value) {
  keys(value, ['by', 'atUtc']);
  insist(value.by === 'postgres', 'Real owner required');
  timestamp(value.atUtc);
}
function covered(value, count, projected = false) {
  insist(
    Array.isArray(value) && value.length === count,
    'Covered source cardinality differs',
  );
  value.forEach((entry, i) => {
    keys(
      entry,
      projected
        ? [
            'ordinal',
            'sourcePath',
            'rawSha256',
            'boundSqlSha256',
            'boundSqlArtifact',
          ]
        : ['ordinal', 'sourcePath', 'rawSha256'],
    );
    integer(entry.ordinal, i + 1, i + 1);
    insist(
      entry.sourcePath === sources[i].path &&
        entry.rawSha256 === sources[i].raw,
      'Covered prefix order/source differs',
    );
    if (projected) {
      insist(
        entry.boundSqlSha256 === sources[i].bound,
        'Projected bound identity differs',
      );
      ref(entry.boundSqlArtifact);
    }
  });
}
function row(value) {
  keys(value, [
    'package',
    'identity',
    'installed_by',
    'installed_at_sql',
    'installed_at_utc',
  ]);
  insist(
    value.package === '@stynx-nyx/offline-sync' &&
      value.installed_by === 'postgres',
    'Fresh row package/owner differs',
  );
  record(value.identity);
  timestamp(value.installed_at_utc);
  insist(
    typeof value.installed_at_sql === 'string' &&
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d{1,6})?\+00$/u.test(
        value.installed_at_sql,
      ),
    'SQL timestamp text required',
  );
  const sqlUtc = value.installed_at_sql.replace(' ', 'T').replace('+00', 'Z');
  const [head, fraction = ''] = sqlUtc.slice(0, -1).split('.');
  insist(
    `${head}.${fraction.padEnd(6, '0')}Z` === value.installed_at_utc,
    'SQL timestamp representations differ',
  );
}
function baselineDocument(d) {
  keys(d, [
    'formatVersion',
    'subject',
    'freshReceipt',
    'priorPackage',
    'targetPublication',
    'coveredSources',
    'projectedPrefix',
    'priorState',
    'equivalence',
    'review',
    'recordSha256',
  ]);
  insist(
    d.formatVersion === 'detran-stynx-offline-fresh-baseline/1',
    'Baseline format differs',
  );
  subject(d.subject);
  publication(d.targetPublication);
  const fresh = d.freshReceipt;
  keys(fresh, [
    'relation',
    'package',
    'row',
    'rowDigest',
    'assertion',
    'group',
  ]);
  insist(
    fresh.relation === 'integration.stynx_storage_installations' &&
      fresh.package === '@stynx-nyx/offline-sync',
    'Fresh relation/package differs',
  );
  row(fresh.row);
  insist(fresh.rowDigest === digest(fresh.row), 'Fresh row digest differs');
  ref(fresh.assertion);
  keys(fresh.group, ['outbox', 'offline']);
  for (const entry of Object.values(fresh.group)) {
    keys(entry, ['rowDigest', 'rowArtifact']);
    prefixed(entry.rowDigest);
    ref(entry.rowArtifact);
  }
  insist(
    fresh.group.offline.rowDigest === fresh.rowDigest,
    'Offline fresh group digest differs',
  );
  const prior = d.priorPackage;
  keys(prior, [
    'version',
    'sourceCommit',
    'sourceTree',
    'tarball',
    'entrypoint',
    'declaration',
    'artifact',
    'manifestDigest',
    'objectsSqlSha256',
    'roleBindingsSqlSha256',
    'runtimeClosure',
  ]);
  insist(
    prior.version === '1.6.0' &&
      prior.sourceCommit === '60e53ad791a4d031ab137a344fd994fe97bcb514' &&
      prior.sourceTree === '9249c9325558da557f3f13170941efa2d148fdf8',
    'Prior publication differs',
  );
  keys(prior.tarball, ['path', 'sha256', 'integrity', 'bytes']);
  relative(prior.tarball.path);
  prefixed(prior.tarball.sha256);
  integer(prior.tarball.bytes, 1, Number.MAX_SAFE_INTEGER);
  insist(
    typeof prior.tarball.integrity === 'string' &&
      /^sha512-[A-Za-z0-9+/]{86}==$/u.test(prior.tarball.integrity),
    'Prior SRI differs',
  );
  for (const key of ['entrypoint', 'declaration', 'artifact', 'runtimeClosure'])
    ref(prior[key]);
  prefixed(prior.manifestDigest);
  hex(prior.objectsSqlSha256);
  hex(prior.roleBindingsSqlSha256);
  covered(d.coveredSources, 8);
  const prefix = d.projectedPrefix;
  keys(prefix, [
    'meaning',
    'binding',
    'implementation',
    'migrations',
    'digest',
  ]);
  insist(
    prefix.meaning === 'not-executed-on-subject',
    'Prefix falsely claims execution',
  );
  binding(prefix.binding, digest(prefix.binding));
  keys(prefix.implementation, [
    'packageVersion',
    'entrypoint',
    'publicationDigest',
  ]);
  insist(
    prefix.implementation.packageVersion === '1.6.1' &&
      prefix.implementation.publicationDigest === digest(d.targetPublication),
    'Prefix implementation differs',
  );
  ref(prefix.implementation.entrypoint);
  covered(prefix.migrations, 8, true);
  insist(
    prefix.digest ===
      digest({ binding: prefix.binding, migrations: prefix.migrations }),
    'Projected prefix digest differs',
  );
  const state = d.priorState;
  keys(state, [
    'method',
    'record',
    'expectedCatalog',
    'actualCatalog',
    'rowInvariants',
    'verifierReports',
  ]);
  insist(state.method === 'prior-public-verifier', 'Prior method differs');
  for (const key of [
    'record',
    'expectedCatalog',
    'actualCatalog',
    'rowInvariants',
  ])
    ref(state[key]);
  insist(
    Array.isArray(state.verifierReports) && state.verifierReports.length === 2,
    'Verifier group differs',
  );
  state.verifierReports.forEach((entry, i) => {
    keys(entry, ['package', 'version', 'report']);
    insist(
      entry.package === ['@stynx-nyx/outbox', '@stynx-nyx/offline-sync'][i] &&
        entry.version === '1.6.0',
      'Prior verifier identity differs',
    );
    ref(entry.report);
  });
  const equivalence = d.equivalence;
  keys(equivalence, [
    'referenceA',
    'referenceB',
    'report',
    'rawSnapshots',
    'comparator',
  ]);
  for (const key of ['referenceA', 'referenceB']) {
    const entry = equivalence[key];
    keys(entry, [
      'subject',
      'installation',
      'priorVerifierBefore',
      'priorVerifierAfter',
    ]);
    subject(entry.subject);
    for (const field of [
      'installation',
      'priorVerifierBefore',
      'priorVerifierAfter',
    ])
      ref(entry[field]);
  }
  insist(
    equivalence.referenceA.subject.databaseName !==
      equivalence.referenceB.subject.databaseName &&
      equivalence.referenceA.subject.databaseOid !==
        equivalence.referenceB.subject.databaseOid,
    'Reference subjects must differ',
  );
  ref(equivalence.report);
  ref(equivalence.comparator);
  insist(
    Array.isArray(equivalence.rawSnapshots) &&
      equivalence.rawSnapshots.length > 0,
    'Raw snapshots required',
  );
  equivalence.rawSnapshots.forEach(ref);
  keys(d.review, ['inspector', 'independent']);
  for (const [key, actor] of [
    ['inspector', '/root/inspector_adoption_160'],
    ['independent', '/root/architect_adoption_160'],
  ]) {
    keys(d.review[key], ['actor', 'report']);
    insist(d.review[key].actor === actor, 'Independent review actor differs');
    ref(d.review[key].report);
  }
  insist(
    d.review.inspector.report.path !== d.review.independent.report.path,
    'Review reports must differ',
  );
}
function forwardDocument(d) {
  keys(d, [
    'formatVersion',
    'kind',
    'subject',
    'package',
    'baselineId',
    'targetPackageVersion',
    'targetPublicationDigest',
    'binding',
    'bindingDigest',
    'ordinal',
    'source',
    'boundSqlSha256',
    'predecessor',
    'execution',
    'evidence',
    'recordSha256',
  ]);
  insist(
    d.formatVersion === 'detran-stynx-offline-forward-receipt/1' &&
      d.kind === 'forward-migration-executed' &&
      d.package === '@stynx-nyx/offline-sync' &&
      d.targetPackageVersion === '1.6.1',
    'Forward identity differs',
  );
  subject(d.subject);
  prefixed(d.baselineId);
  prefixed(d.targetPublicationDigest);
  binding(d.binding, d.bindingDigest);
  integer(d.ordinal, 9, 9);
  keys(d.source, ['path', 'sha256']);
  insist(
    d.source.path === sources[8].path &&
      d.source.sha256 === sources[8].raw &&
      d.boundSqlSha256 === sources[8].bound,
    'Forward source/bound digest differs',
  );
  keys(d.predecessor, ['kind', 'baselineId', 'coveredPrefixLength']);
  insist(
    d.predecessor.kind === 'baseline' &&
      d.predecessor.baselineId === d.baselineId,
    'Forward predecessor differs',
  );
  integer(d.predecessor.coveredPrefixLength, 8, 8);
  execution(d.execution);
  keys(d.evidence, [
    'priorStateRecordDigest',
    'executionPlanDigest',
    'reviewedCandidateDigest',
    'boundSqlArtifact',
  ]);
  for (const key of [
    'priorStateRecordDigest',
    'executionPlanDigest',
    'reviewedCandidateDigest',
  ])
    prefixed(d.evidence[key]);
  ref(d.evidence.boundSqlArtifact);
}
function groupDocument(d) {
  keys(d, [
    'formatVersion',
    'kind',
    'mode',
    'subject',
    'targetPackageVersion',
    'targetPublication',
    'binding',
    'bindingDigest',
    'freshReceipts',
    'outbox',
    'offline',
    'admission',
    'evidence',
    'recordSha256',
  ]);
  insist(
    d.formatVersion === 'detran-stynx-storage-target-group/1' &&
      d.kind === 'target-group-admission' &&
      d.targetPackageVersion === '1.6.1' &&
      ['fresh-1.6.1', 'upgrade-fresh-1.6.0'].includes(d.mode),
    'Target group identity differs',
  );
  const fresh = d.mode === 'fresh-1.6.1';
  subject(d.subject);
  publication(d.targetPublication);
  binding(d.binding, d.bindingDigest);
  execution(d.admission);
  keys(d.freshReceipts, ['outbox', 'offline']);
  for (const [key, name] of [
    ['outbox', 'outbox'],
    ['offline', 'offline-sync'],
  ]) {
    const entry = d.freshReceipts[key];
    keys(entry, ['package', 'version', 'rowDigest', 'rowArtifact']);
    insist(
      entry.package === `@stynx-nyx/${name}` &&
        entry.version === (fresh ? '1.6.1' : '1.6.0'),
      'Fresh group receipt differs',
    );
    prefixed(entry.rowDigest);
    ref(entry.rowArtifact);
  }
  if (fresh) {
    keys(d.outbox, ['mode', 'artifact']);
    insist(d.outbox.mode === 'fresh-artifact', 'Outbox fresh branch differs');
    ref(d.outbox.artifact);
    keys(d.offline, [
      'mode',
      'artifact',
      'coveredSources',
      'migrationExecution',
    ]);
    insist(
      d.offline.mode === 'fresh-artifact' &&
        d.offline.migrationExecution === 'none',
      'Offline fresh coverage differs',
    );
    ref(d.offline.artifact);
    covered(d.offline.coveredSources, 9);
  } else {
    keys(d.outbox, ['mode', 'priorArtifact', 'targetArtifact', 'equivalence']);
    insist(
      d.outbox.mode === 'no-storage-change',
      'Outbox upgrade branch differs',
    );
    for (const key of ['priorArtifact', 'targetArtifact', 'equivalence'])
      ref(d.outbox[key]);
    keys(d.offline, [
      'mode',
      'baselineId',
      'forwardReceiptId',
      'lastOrdinal',
      'targetArtifact',
      'orderedArtifact',
    ]);
    insist(d.offline.mode === 'forward', 'Offline upgrade branch differs');
    prefixed(d.offline.baselineId);
    prefixed(d.offline.forwardReceiptId);
    integer(d.offline.lastOrdinal, 9, 9);
    ref(d.offline.targetArtifact);
    ref(d.offline.orderedArtifact);
  }
  keys(d.evidence, [
    'priorState',
    'equivalence',
    'executionPlan',
    'reviewedCandidate',
  ]);
  for (const key of ['priorState', 'equivalence']) {
    if (fresh && d.evidence[key] === null) continue;
    ref(d.evidence[key]);
  }
  ref(d.evidence.executionPlan);
  ref(d.evidence.reviewedCandidate);
}

export function parseStorageCustodyDocument(text, kind) {
  try {
    insist(
      typeof text === 'string' &&
        ['baseline', 'forward', 'group'].includes(kind),
      'Closed parser input required',
    );
    const document = parseJson(text);
    ({
      baseline: baselineDocument,
      forward: forwardDocument,
      group: groupDocument,
    })[kind](document);
    prefixed(document.recordSha256);
    const { recordSha256, ...withoutHash } = document;
    insist(
      recordSha256 === digest(withoutHash),
      'Canonical record digest differs',
    );
    return { document, canonicalJson: canonical(document), recordSha256 };
  } catch (error) {
    throw Object.assign(
      new Error(`Storage custody refused: ${error.message}`),
      { code: 'R22_STORAGE_CUSTODY_INVALID' },
    );
  }
}

function safeFile(root, relativePath) {
  relative(relativePath);
  let current = root;
  for (const part of relativePath.split('/')) {
    current = path.join(current, part);
    insist(!fs.lstatSync(current).isSymbolicLink(), 'Ref symlink refused');
  }
  insist(
    fs.statSync(current).isFile() && fs.realpathSync(current) === current,
    'Ref must be retained regular file',
  );
  return current;
}
function readRecord(root, entry) {
  const file = safeFile(root, entry.path),
    bytes = fs.readFileSync(file);
  insist(
    bytes.length === entry.bytes && hash(bytes) === entry.sha256,
    'Retained file bytes differ',
  );
  return bytes;
}
function jsonBytes(bytes) {
  const text = bytes.toString('utf8');
  insist(Buffer.from(text, 'utf8').equals(bytes), 'Invalid UTF-8 file');
  return parseJson(text);
}
function readRef(root, entry, expected) {
  ref(entry);
  insist(entry.sha256 === `sha256:${expected}`, 'Ref lacks independent seal');
  const bytes = entry.path.startsWith('scratch/r22-adoption-161/')
    ? readHistoricalPlanInput(root, entry)
    : fs.readFileSync(safeFile(root, entry.path));
  insist(hash(bytes) === expected, 'Ref bytes differ');
  return bytes;
}
function verifyPrior(root, entry) {
  const closure = jsonBytes(readRef(root, entry, seal.prior));
  verifyPortablePriorClosure(root, closure);
}

const g03Admission = {
  discovery: {
    path: 'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03/admitted-inputs.json',
    sha256:
      'sha256:9381436615594db9f059cf966203cd9ab21b40157aecf965acc263fd32ea138b',
  },
  baseline: {
    path: 'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03/baseline/baseline.json',
    sha256:
      'sha256:6133d17086981b7b037726baed0023ab74f40218a323804ffd697fea2aa83d67',
  },
  review: {
    path: 'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03/baseline-input-review/baseline-final-review.inspector.json',
    sha256:
      'sha256:28afd4cad37ca0574cc48ba302650920bd2ef192730c82fe63095271bf141388',
  },
  architect: {
    path: 'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03/baseline-input-review/ARCHITECT-FINAL-BASELINE-SEAL.json',
    sha256:
      'sha256:215da2713ad7c591ea50ffa08ee53c08d896bc50453189b6cda050a416b1ec6c',
  },
  recordSha256:
    'sha256:36a790fec9e65f1354048de94a732e334e436819c69f27ab88663b588e33f741',
};
function verifyG03Baseline(root, inputs, targetPublication, bindingDigest) {
  insist(
    isDeepStrictEqual(inputs.baseline, g03Admission.baseline) &&
      isDeepStrictEqual(inputs.baselineReview, g03Admission.review),
    'Only the independently sealed actual g03 baseline pair is admitted',
  );
  const checked = new Set(),
    active = new Set();
  const rehash = (entry) => {
    const expected = entry.sha256.slice(7);
    const simple = { path: entry.path, sha256: entry.sha256 };
    const bytes = readRef(root, simple, expected);
    if (Object.hasOwn(entry, 'bytes'))
      insist(entry.bytes === bytes.length, 'Retained ref byte count differs');
    const key = entry.path + '|' + entry.sha256;
    insist(!active.has(key), 'Input reference cycle');
    if (checked.has(key)) return bytes;
    active.add(key);
    if (entry.path.endsWith('.json')) walk(jsonBytes(bytes));
    active.delete(key);
    checked.add(key);
    return bytes;
  };
  const walk = (value) => {
    if (Array.isArray(value)) return value.forEach(walk);
    if (!value || typeof value !== 'object') return;
    const names = Object.keys(value).sort();
    if (
      (isDeepStrictEqual(names, ['path', 'sha256']) ||
        isDeepStrictEqual(names, ['bytes', 'path', 'sha256'])) &&
      typeof value.sha256 === 'string' &&
      /^sha256:[a-f0-9]{64}$/u.test(value.sha256)
    )
      rehash(value);
    else Object.values(value).forEach(walk);
  };
  const discovery = jsonBytes(rehash(g03Admission.discovery));
  keys(discovery, [
    'formatVersion',
    'subjectManifest',
    'creationReview',
    'publication',
    'projection',
    'priorRuntime',
    'baselineInputs',
  ]);
  insist(
    discovery.formatVersion === 1 && discovery.baselineInputs.length === 1,
    'Actual admission roster differs',
  );
  const selected = discovery.baselineInputs[0];
  keys(selected, ['databaseName', 'databaseOid', 'baseline', 'baselineReview']);
  const plain = (entry) => ({ path: entry.path, sha256: entry.sha256 });
  insist(
    selected.databaseName === 'detran_r22_161_g03_upgrade' &&
      selected.databaseOid === '18767' &&
      isDeepStrictEqual(plain(selected.baseline), inputs.baseline) &&
      isDeepStrictEqual(plain(selected.baselineReview), inputs.baselineReview),
    'Discovery does not bind actual pair',
  );
  for (const key of ['publication', 'projection', 'priorRuntime'])
    insist(
      isDeepStrictEqual(plain(discovery[key]), inputs[key]),
      'Discovery public input differs',
    );
  const parsed = parseStorageCustodyDocument(
    new TextDecoder('utf-8', { fatal: true }).decode(
      rehash(g03Admission.baseline),
    ),
    'baseline',
  );
  const baseline = parsed.document;
  insist(
    parsed.recordSha256 === g03Admission.recordSha256 &&
      baseline.subject.databaseOid === '18767' &&
      baseline.subject.databaseName === 'detran_r22_161_g03_upgrade' &&
      baseline.subject.clusterSystemIdentifier === '7696293464811719840' &&
      baseline.subject.owner === 'postgres',
    'Actual baseline identity differs',
  );
  insist(
    isDeepStrictEqual(baseline.targetPublication, targetPublication) &&
      digest(baseline.projectedPrefix.binding) === bindingDigest,
    'Baseline target publication/binding differs',
  );
  const review = jsonBytes(rehash(g03Admission.review));
  keys(review, [
    'formatVersion',
    'kind',
    'baselineId',
    'subjectDigest',
    'targetPublicationDigest',
    'inputReviews',
    'reviewer',
    'disposition',
    'recordSha256',
  ]);
  const { recordSha256, ...body } = review;
  insist(
    review.formatVersion === 'detran-stynx-offline-baseline-review/1' &&
      review.kind === 'baseline-final-review' &&
      review.disposition === 'accepted' &&
      isDeepStrictEqual(review.reviewer, {
        role: 'Inspector',
        session: '/root/inspector_adoption_160',
      }) &&
      recordSha256 === digest(body),
    'Independent final review schema/digest/actor differs',
  );
  insist(
    review.baselineId === parsed.recordSha256 &&
      review.subjectDigest === digest(baseline.subject) &&
      review.targetPublicationDigest === digest(targetPublication) &&
      isDeepStrictEqual(review.inputReviews, {
        inspector: baseline.review.inspector.report,
        independent: baseline.review.independent.report,
      }),
    'Final review is not linked to actual baseline',
  );
  const architect = jsonBytes(rehash(g03Admission.architect));
  insist(
    architect.role === 'Architect' &&
      architect.actor === '/root/architect_adoption_160' &&
      architect.result === 'ACCEPTED_EXACT_DISPOSABLE_BASELINE_INPUT_PAIR' &&
      architect.recordSha256 === parsed.recordSha256 &&
      isDeepStrictEqual(plain(architect.baseline), inputs.baseline) &&
      isDeepStrictEqual(plain(architect.baselineReview), inputs.baselineReview),
    'Actual Architect activation seal differs',
  );
  return { ref: { ...inputs.baseline }, recordSha256: parsed.recordSha256 };
}

export function createStorageTargetPlan(root, inputs) {
  try {
    insist(typeof root === 'string', 'Repository root required');
    keys(inputs, [
      'publication',
      'projection',
      'priorRuntime',
      'baseline',
      'baselineReview',
    ]);
    insist(
      (inputs.baseline === null) === (inputs.baselineReview === null),
      'Baseline and independent review must both be null or both actual sealed refs',
    );
    if (inputs.baseline !== null) {
      ref(inputs.baseline);
      ref(inputs.baselineReview);
      insist(
        isDeepStrictEqual(inputs.baseline, g03Admission.baseline) &&
          isDeepStrictEqual(inputs.baselineReview, g03Admission.review),
        'Only the independently sealed actual g03 baseline pair is admitted',
      );
    }
    root = fs.realpathSync(path.resolve(root));
    const proof = jsonBytes(
      readRef(root, inputs.publication, seal.publication),
    );
    const projection = jsonBytes(
      readRef(root, inputs.projection, seal.projection),
    );
    insist(
      inputs.projection.path.endsWith(
        '/projection/public-storage-projection.json',
      ),
      'Projection path differs',
    );
    // Preserve the original logical sibling identities, independent of retained physical paths.
    const admission = path.posix.dirname(
      path.posix.dirname(inputs.projection.path),
    );
    insist(
      inputs.publication.path ===
        path.posix.join(admission, 'protected-publication-verification.json'),
      'Publication sibling differs',
    );
    const retentionBytes = readHistoricalPlanInput(root, {
      path: path.posix.join(admission, 'retention-manifest.json'),
      sha256: `sha256:${seal.retention}`,
    });
    insist(
      hash(retentionBytes) === seal.retention,
      'Target package admission differs',
    );
    const retention = jsonBytes(retentionBytes);
    insist(
      proof.ok === true &&
        proof.version === published.version &&
        proof.candidate === published.commit &&
        proof.tree === published.tree &&
        String(proof.workflowRun) === published.workflowRun &&
        proof.packages.length === 44,
      'Protected publication differs',
    );
    verifyPortableTargetRetention(root, retention);
    insist(
      retention.packages.length === 27 &&
        projection.formatVersion === 1 &&
        isDeepStrictEqual(projection.binding, fixedBinding),
      'Target artifact context differs',
    );
    const artifacts = {};
    for (const name of ['outbox', 'offline']) {
      const artifact = projection[name];
      insist(
        artifact.packageVersion === '1.6.1' &&
          isDeepStrictEqual(artifact.binding, fixedBinding),
        'Public artifact differs',
      );
      const actual = {
        objectsSqlSha256: hash(artifact.objectsSql),
        roleBindingsSqlSha256: hash(artifact.roleBindingsSql),
        manifestSha256: hash(canonical(artifact.manifest)),
      };
      insist(
        isDeepStrictEqual(actual, projection.digests[name]),
        'Public artifact digest differs',
      );
      artifacts[name] = { ref: { ...inputs.projection }, ...actual };
    }
    const migrations = projection.offlineMigrations.migrations;
    insist(migrations.length === 9, 'Ordered inventory differs');
    artifacts.ordered = {
      ref: { ...inputs.projection },
      migrations: migrations.map((migration, i) => {
        insist(
          migration.source.path === sources[i].path &&
            migration.source.sha256 === sources[i].raw &&
            migration.sqlSha256 === sources[i].bound &&
            hash(migration.sql) === sources[i].bound,
          'Ordered source/bound identity differs',
        );
        return {
          ordinal: i + 1,
          sourcePath: migration.source.path,
          rawSqlSha256: migration.source.sha256,
          boundSqlSha256: migration.sqlSha256,
        };
      }),
    };
    verifyPrior(root, inputs.priorRuntime);
    const targetPublication = {
      ...published,
      verification: { ...inputs.publication },
      packageAdmission: {
        path: path.posix.join(admission, 'retention-manifest.json'),
        sha256: `sha256:${seal.retention}`,
      },
      projection: { ...inputs.projection },
    };
    const baseline =
      inputs.baseline === null
        ? null
        : verifyG03Baseline(
            root,
            inputs,
            targetPublication,
            digest(fixedBinding),
          );
    return {
      formatVersion: 'detran-stynx-storage-target-plan/1',
      targetPublication,
      targetPublicationDigest: digest(targetPublication),
      binding: structuredClone(fixedBinding),
      bindingDigest: digest(fixedBinding),
      artifacts,
      priorRuntime: { ...inputs.priorRuntime },
      baseline,
      baselineReview:
        inputs.baselineReview === null ? null : { ...inputs.baselineReview },
    };
  } catch (error) {
    throw Object.assign(
      new Error(`Storage target plan refused: ${error.message}`),
      { code: 'R22_STORAGE_TARGET_PLAN_INVALID' },
    );
  }
}
