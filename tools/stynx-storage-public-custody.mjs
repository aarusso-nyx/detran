import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';

// Consumer-owned canonical custody parser, separated from private admission.
// No SDK import, connection, private execution selector or approval producer.
const seal = {
  publication:
    '46815c17be9dbcd2080a3a0c08db958bd42390d8766c64ef40bebd5017074318',
  projection:
    '944f0041700de5e2c31ebf0e71b7999df999d76cc6645b3bec38ddfc0f692388',
  retention: '56e2e6438b8ef505eca99357e8e219e30ceb170f68f7b5779fff6f997c8a98ac',
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
const custodyRelations = [
  'integration.stynx_offline_baseline_custody',
  'integration.stynx_offline_forward_receipts',
  'integration.stynx_storage_target_admissions',
];
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

export const canonicalJson = canonical;
export const recordDigest = digest;
export const parseClosedJson = parseJson;
export const hashBytes = hash;
export function requireFact(condition, message) {
  if (!condition)
    throw Object.assign(new Error(message), {
      code: 'STYNX_PUBLIC_INSTALL_REFUSED',
    });
}

const ledger = 'integration.stynx_storage_installations';
const ledgerFunction = `${ledger}_immutable`;
const literal = (value) => "'" + value.replaceAll("'", "''") + "'";
const immutableBody =
  "\nBEGIN\n  RAISE EXCEPTION 'STYNX storage installation evidence is immutable';\nEND\n";
export const ownerAssertionSql = `DO $owner_assert$ BEGIN
  IF session_user <> 'postgres' OR current_user <> 'postgres'
    OR NOT EXISTS (SELECT FROM pg_roles WHERE rolname=current_user AND rolsuper)
    OR current_setting('session_replication_role') <> 'origin'
    OR current_setting('row_security') <> 'on' THEN
    RAISE EXCEPTION 'STYNX installation requires real postgres owner and ordinary RLS/trigger semantics';
  END IF;
  IF EXISTS (SELECT FROM pg_roles r WHERE r.rolname IN ('role_app_backend','role_auditor_min') AND (
    r.rolsuper OR r.rolbypassrls OR r.rolcanlogin OR r.rolinherit OR r.rolcreaterole OR r.rolcreatedb OR r.rolreplication
    OR EXISTS (SELECT FROM pg_roles privileged WHERE
      (privileged.rolsuper OR privileged.rolbypassrls OR privileged.rolcreaterole OR privileged.rolcreatedb OR privileged.rolreplication
       OR privileged.rolname IN ('pg_read_all_data','pg_write_all_data','pg_read_server_files','pg_write_server_files','pg_execute_server_program'))
      AND pg_has_role(r.oid,privileged.oid,'MEMBER'))
  )) THEN
    RAISE EXCEPTION 'STYNX operational role flags or reachable privileged membership are unsafe';
  END IF;
END $owner_assert$;`;

const pristineSchemasSql = `SELECT EXISTS (SELECT FROM pg_namespace n WHERE n.nspname IN ('outbox','offline') AND (
  n.nspowner <> 'postgres'::regrole
  OR EXISTS (SELECT FROM pg_depend d WHERE d.refclassid='pg_namespace'::regclass AND d.refobjid=n.oid)
  OR EXISTS (SELECT FROM pg_depend d WHERE d.classid='pg_namespace'::regclass AND d.objid=n.oid AND d.deptype='e')
  OR obj_description(n.oid,'pg_namespace') IS NOT NULL
  OR EXISTS (SELECT FROM pg_seclabel s WHERE s.classoid='pg_namespace'::regclass AND s.objoid=n.oid)
  OR EXISTS (SELECT FROM aclexplode(coalesce(n.nspacl,acldefault('n',n.nspowner))) a WHERE a.grantee<>'postgres'::regrole)
)) AS divergent`;

// These assertions run before an existing ledger is used, and again after final
// DDL20 revocations. No assertion changes the object it examines.
export const ledgerAssertionSql = `DO $ledger_assert$
DECLARE t oid := to_regclass('${ledger}'); f oid := to_regprocedure('${ledgerFunction}()');
BEGIN
  IF session_user <> 'postgres' OR current_user <> 'postgres'
     OR NOT EXISTS (SELECT FROM pg_roles WHERE rolname = current_user AND rolsuper)
     OR current_setting('session_replication_role') <> 'origin' THEN
    RAISE EXCEPTION 'STYNX installation requires real postgres owner and ordinary trigger semantics';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_namespace WHERE nspname = 'integration' AND nspowner = 'postgres'::regrole)
     OR EXISTS (SELECT FROM pg_roles WHERE rolname IN ('role_app_backend','role_auditor_min')
       AND (rolsuper OR rolbypassrls OR pg_has_role(oid, 'postgres'::regrole, 'MEMBER')
         OR has_schema_privilege(oid, 'integration', 'CREATE')))
     OR EXISTS (SELECT FROM pg_default_acl d, LATERAL aclexplode(d.defaclacl) a
       WHERE d.defaclrole = 'postgres'::regrole
         AND d.defaclnamespace IN (0, 'integration'::regnamespace)
         AND d.defaclobjtype IN ('r','f') AND a.grantee <> 'postgres'::regrole) THEN
    RAISE EXCEPTION 'STYNX ledger schema, membership or defaults are unsafe';
  END IF;
  IF t IS NULL OR f IS NULL THEN RAISE EXCEPTION 'STYNX ledger catalog is incomplete'; END IF;
  IF NOT EXISTS (SELECT FROM pg_class WHERE oid=t AND relowner='postgres'::regrole
      AND relkind='r' AND relpersistence='p' AND relrowsecurity AND relforcerowsecurity
      AND NOT relispartition AND NOT relhasrules AND reloptions IS NULL AND relreplident='d'
      AND relam=(SELECT oid FROM pg_am WHERE amname='heap') AND reltablespace=0)
     OR EXISTS (SELECT FROM pg_policy WHERE polrelid=t)
     OR EXISTS (SELECT FROM pg_inherits WHERE inhrelid=t OR inhparent=t)
     OR EXISTS (SELECT FROM pg_attribute a JOIN pg_type ty ON ty.oid=a.atttypid WHERE a.attrelid=t AND a.attnum>0 AND (
       a.attisdropped OR a.attgenerated<>'' OR a.attidentity<>'' OR a.attacl IS NOT NULL
       OR a.attcollation<>ty.typcollation OR a.attstorage<>ty.typstorage OR a.attcompression<>''
       OR a.attndims<>0 OR a.attoptions IS NOT NULL OR a.attfdwoptions IS NOT NULL
       OR a.atthasmissing OR a.attmissingval IS NOT NULL OR NOT a.attislocal OR a.attinhcount<>0))
     OR (SELECT jsonb_agg(jsonb_build_array(a.attname,format_type(a.atttypid,a.atttypmod),a.attnotnull,pg_get_expr(d.adbin,d.adrelid)) ORDER BY a.attnum)
       FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE a.attrelid=t AND a.attnum>0)
       IS DISTINCT FROM '[ ["package","text",true,null], ["identity","jsonb",true,null], ["installed_by","name",true,"CURRENT_USER"], ["installed_at","timestamp with time zone",true,"transaction_timestamp()"] ]'::jsonb
     OR (SELECT count(*) FROM pg_constraint WHERE conrelid=t AND contype<>'n') <> 3
     -- PostgreSQL 18 catalogs column NOT NULL as four additional constraints.
     -- Admit that exact representation, without accepting arbitrary extras.
     OR coalesce((SELECT jsonb_agg(jsonb_build_array(conname,conkey,pg_get_constraintdef(oid),convalidated,condeferrable,connoinherit) ORDER BY conkey[1])
       FROM pg_constraint WHERE conrelid=t AND contype='n'),'[]'::jsonb) IS DISTINCT FROM
       (CASE WHEN current_setting('server_version_num')::integer>=180000 THEN
         '[["stynx_storage_installations_package_not_null",[1],"NOT NULL package",true,false,false],
           ["stynx_storage_installations_identity_not_null",[2],"NOT NULL identity",true,false,false],
           ["stynx_storage_installations_installed_by_not_null",[3],"NOT NULL installed_by",true,false,false],
           ["stynx_storage_installations_installed_at_not_null",[4],"NOT NULL installed_at",true,false,false]]'::jsonb
       ELSE '[]'::jsonb END)
     OR EXISTS (SELECT FROM pg_constraint WHERE conrelid=t AND (NOT conislocal OR coninhcount<>0 OR conparentid<>0 OR condeferred))
     OR NOT EXISTS (SELECT FROM pg_constraint WHERE conrelid=t AND conname='stynx_storage_installations_pkey' AND contype='p' AND convalidated AND NOT condeferrable AND conkey=ARRAY[1]::smallint[])
     OR NOT EXISTS (SELECT FROM pg_constraint WHERE conrelid=t AND conname='stynx_storage_installations_identity' AND contype='c' AND convalidated AND NOT connoinherit
       AND pg_get_constraintdef(oid)='CHECK (((jsonb_typeof(identity) = ''object''::text) AND ((identity ->> ''package''::text) = package)))')
     OR NOT EXISTS (SELECT FROM pg_constraint WHERE conrelid=t AND conname='stynx_storage_installations_owner' AND contype='c' AND convalidated AND NOT connoinherit
       AND pg_get_constraintdef(oid)='CHECK ((installed_by = ''postgres''::name))')
     OR (SELECT count(*) FROM pg_index WHERE indrelid=t) <> 1
     OR NOT EXISTS (SELECT FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid WHERE i.indrelid=t
       AND i.indisprimary AND i.indisunique AND i.indisvalid AND i.indisready AND i.indislive AND i.indimmediate
       AND NOT i.indisclustered AND NOT i.indisreplident AND NOT i.indnullsnotdistinct
       AND i.indnatts=1 AND i.indnkeyatts=1 AND i.indkey='1'::int2vector AND i.indoption='0'::int2vector
       AND i.indcollation[0]=(SELECT attcollation FROM pg_attribute WHERE attrelid=t AND attnum=1)
       AND i.indclass[0]=(SELECT o.oid FROM pg_opclass o JOIN pg_am a ON a.oid=o.opcmethod
         WHERE o.opcnamespace='pg_catalog'::regnamespace AND o.opcname='text_ops' AND a.amname='btree')
       AND c.relowner='postgres'::regrole AND c.relkind='i' AND c.relpersistence='p' AND c.reloptions IS NULL
       AND c.relam=(SELECT oid FROM pg_am WHERE amname='btree') AND c.reltablespace=0
       AND i.indpred IS NULL AND i.indexprs IS NULL)
     OR EXISTS (SELECT FROM pg_class c,LATERAL aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a WHERE c.oid=t AND a.grantee<>'postgres'::regrole)
     OR EXISTS (SELECT FROM pg_roles principal JOIN pg_roles reachable
       ON principal.oid=reachable.oid OR pg_has_role(principal.oid,reachable.oid,'SET')
       WHERE NOT principal.rolsuper AND principal.oid<>'postgres'::regrole
         AND (principal.rolcanlogin OR principal.rolname IN ('role_app_backend','role_auditor_min'))
         AND (reachable.rolsuper OR reachable.rolbypassrls OR reachable.rolcreaterole
           OR reachable.rolcreatedb OR reachable.rolreplication
           OR has_table_privilege(reachable.oid,t,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
           OR has_schema_privilege(reachable.oid,'integration','CREATE'))) THEN
    RAISE EXCEPTION 'STYNX ledger definition, RLS or privileges differ';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_proc p JOIN pg_language l ON l.oid=p.prolang WHERE p.oid=f AND p.proowner='postgres'::regrole
      AND p.prorettype='trigger'::regtype AND p.pronargs=0 AND p.prokind='f' AND l.lanname='plpgsql'
      AND NOT p.proretset AND p.provariadic=0 AND p.prosupport=0 AND p.probin IS NULL
      AND NOT p.prosecdef AND NOT p.proleakproof AND NOT p.proisstrict AND p.provolatile='v' AND p.proparallel='u'
      AND p.proconfig=ARRAY['search_path=pg_catalog'] AND p.prosrc=${literal(immutableBody)})
     OR EXISTS (SELECT FROM pg_proc p,LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a WHERE p.oid=f AND a.grantee<>'postgres'::regrole)
     OR (SELECT count(*) FROM pg_proc WHERE pronamespace='integration'::regnamespace AND proname='stynx_storage_installations_immutable')<>1
     OR EXISTS (SELECT FROM pg_roles principal JOIN pg_roles reachable
       ON principal.oid=reachable.oid OR pg_has_role(principal.oid,reachable.oid,'SET')
       WHERE NOT principal.rolsuper AND principal.oid<>'postgres'::regrole
         AND (principal.rolcanlogin OR principal.rolname IN ('role_app_backend','role_auditor_min'))
         AND has_function_privilege(reachable.oid,f,'EXECUTE'))
     OR (SELECT count(*) FROM pg_trigger WHERE tgrelid=t AND NOT tgisinternal) <> 1
     OR NOT EXISTS (SELECT FROM pg_trigger WHERE tgrelid=t AND tgname='stynx_storage_installations_immutable'
       AND tgfoid=f AND tgtype=58 AND tgenabled='A' AND NOT tgisinternal AND tgconstraint=0
       AND tgqual IS NULL AND tgnargs=0 AND tgattr=''::int2vector AND tgargs=''::bytea
       AND tgparentid=0 AND tgconstrrelid=0 AND tgconstrindid=0 AND NOT tgdeferrable AND NOT tginitdeferred
       AND tgoldtable IS NULL AND tgnewtable IS NULL) THEN
    RAISE EXCEPTION 'STYNX ledger immutability guard differs';
  END IF;
  -- Only the three declared custody FKs may add parent-side RI triggers.
  -- No custody means no incoming FK/RI at all; partial custody is refused.
  IF to_regclass('integration.stynx_offline_baseline_custody') IS NULL
     AND to_regclass('integration.stynx_offline_forward_receipts') IS NULL
     AND to_regclass('integration.stynx_storage_target_admissions') IS NULL THEN
    IF EXISTS (SELECT FROM pg_constraint WHERE contype='f' AND confrelid=t)
       OR EXISTS (SELECT FROM pg_trigger WHERE tgrelid=t AND tgisinternal) THEN
      RAISE EXCEPTION 'STYNX ledger has undeclared incoming RI';
    END IF;
  ELSE
    IF to_regclass('integration.stynx_offline_baseline_custody') IS NULL
       OR to_regclass('integration.stynx_offline_forward_receipts') IS NULL
       OR to_regclass('integration.stynx_storage_target_admissions') IS NULL
       OR (SELECT count(*) FROM pg_constraint WHERE contype='f' AND confrelid=t)<>3
       OR (SELECT count(*) FROM pg_trigger WHERE tgrelid=t AND tgisinternal)<>6 THEN
      RAISE EXCEPTION 'STYNX ledger custody RI inventory differs';
    END IF;
    IF EXISTS (
      WITH expected_fk(child,name,column_name) AS (VALUES
        ('integration.stynx_offline_baseline_custody'::regclass,'stynx_offline_baseline_fresh_fk','package'),
        ('integration.stynx_storage_target_admissions'::regclass,'stynx_target_outbox_fresh_fk','outbox_package'),
        ('integration.stynx_storage_target_admissions'::regclass,'stynx_target_offline_fresh_fk','offline_package'))
      SELECT FROM expected_fk e LEFT JOIN pg_constraint c
        ON c.conrelid=e.child AND c.conname=e.name
      WHERE c.oid IS NULL OR c.contype<>'f' OR c.confrelid<>t
        OR c.conkey IS DISTINCT FROM ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid=e.child AND attname=e.column_name)]::smallint[]
        OR c.confkey IS DISTINCT FROM ARRAY[1]::smallint[]
        OR c.conindid<>(SELECT indexrelid FROM pg_index WHERE indrelid=t AND indisprimary)
        OR c.confupdtype<>'a' OR c.confdeltype<>'r' OR c.confmatchtype<>'s'
        OR NOT c.convalidated OR c.condeferrable OR c.condeferred
        OR NOT c.conislocal OR c.coninhcount<>0 OR c.conparentid<>0
    ) THEN RAISE EXCEPTION 'STYNX ledger declared FK definition differs'; END IF;
    IF EXISTS (
      WITH expected AS (
        SELECT c.oid AS constraint_id,c.conrelid AS opposite,c.conindid AS index_id,
          v.event_type,v.function_id
        FROM pg_constraint c CROSS JOIN LATERAL (VALUES
          (9,'pg_catalog."RI_FKey_restrict_del"()'::regprocedure::oid),
          (17,'pg_catalog."RI_FKey_noaction_upd"()'::regprocedure::oid)) v(event_type,function_id)
        WHERE c.contype='f' AND c.confrelid=t),
      actual AS (SELECT tgconstraint AS constraint_id,tgconstrrelid AS opposite,
        tgconstrindid AS index_id,tgtype::integer AS event_type,tgfoid AS function_id
        FROM pg_trigger WHERE tgrelid=t AND tgisinternal),
      difference AS ((SELECT * FROM expected EXCEPT ALL SELECT * FROM actual)
        UNION ALL (SELECT * FROM actual EXCEPT ALL SELECT * FROM expected))
      SELECT FROM difference
    ) OR EXISTS (SELECT FROM pg_trigger WHERE tgrelid=t AND tgisinternal AND (
      tgenabled<>'O' OR tgparentid<>0 OR tgqual IS NOT NULL OR tgnargs<>0
      OR tgattr<>''::int2vector OR tgargs<>''::bytea OR tgdeferrable OR tginitdeferred
      OR tgoldtable IS NOT NULL OR tgnewtable IS NOT NULL)) THEN
      RAISE EXCEPTION 'STYNX ledger exact parent RI multiset differs';
    END IF;
  END IF;
END $ledger_assert$;`;

export function sourceManifestSha256(manifest) {
  const ordered = (value) => {
    if (Array.isArray(value)) return value.map(ordered);
    if (value !== null && typeof value === 'object')
      return Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((key) => [key, ordered(value[key])]),
      );
    return value;
  };
  return hash(JSON.stringify(ordered(manifest)));
}

export async function readStorageSnapshot(client) {
  const catalog = (
    await client.query(`SELECT jsonb_build_object('schemas',
    (SELECT coalesce(jsonb_agg(to_jsonb(n) ORDER BY n.nspname),'[]'::jsonb) FROM pg_namespace n WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'),
    'relations',(SELECT coalesce(jsonb_agg((to_jsonb(c)-'relpages'-'reltuples'-'relallvisible'-'relallfrozen'-'relfrozenxid'-'relminmxid') ORDER BY c.oid),'[]'::jsonb) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'),
    'constraints',(SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.oid),'[]'::jsonb) FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'),
    'triggers',(SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.oid),'[]'::jsonb) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'),
    'functions',(SELECT coalesce(jsonb_agg(to_jsonb(p) ORDER BY p.oid),'[]'::jsonb) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'),
    'attributes',(SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.attrelid,a.attnum),'[]'::jsonb) FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'),
    'defaults',(SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.oid),'[]'::jsonb) FROM pg_attrdef a JOIN pg_class c ON c.oid=a.adrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'),
    'indexes',(SELECT coalesce(jsonb_agg(to_jsonb(i) ORDER BY i.indexrelid),'[]'::jsonb) FROM pg_index i JOIN pg_class c ON c.oid=i.indrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'),
    'default_acl',(SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.oid),'[]'::jsonb) FROM pg_default_acl a),
    'event_triggers',(SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.oid),'[]'::jsonb) FROM pg_event_trigger t),
    'extensions',(SELECT coalesce(jsonb_agg(to_jsonb(e) ORDER BY e.oid),'[]'::jsonb) FROM pg_extension e),
    'policies',(SELECT coalesce(jsonb_agg(to_jsonb(p) ORDER BY p.oid),'[]'::jsonb) FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'))::text AS catalog`)
  ).rows[0].catalog;
  const relations = (
    await client.query(
      `SELECT n.nspname,c.relname,c.relkind FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema' AND c.relkind IN ('r','p','S') ORDER BY n.nspname,c.relname`,
    )
  ).rows;
  const records = [];
  const identifier = (value) => '"' + value.replaceAll('"', '""') + '"';
  for (const relation of relations) {
    const name =
      identifier(relation.nspname) + '.' + identifier(relation.relname);
    const rows = (
      await client.query(
        relation.relkind === 'S'
          ? `SELECT to_jsonb(s)::text AS row FROM (SELECT last_value,log_cnt,is_called FROM ${name}) s`
          : `SELECT to_jsonb(t)::text AS row FROM ${name} t`,
      )
    ).rows
      .map((row) => row.row)
      .sort();
    records.push({
      relation: relation.nspname + '.' + relation.relname,
      kind: relation.relkind,
      rows,
    });
  }
  const roleGraph = await captureRoleGraph(client);
  const writerFootprint = await readWriterFootprint(client);
  return { catalog, records, roleGraph, writerFootprint };
}
export const utcContextSql = `SET LOCAL TIME ZONE 'UTC'; SET LOCAL row_security=on; SET LOCAL search_path=pg_catalog,public; SET LOCAL standard_conforming_strings=on`;
export async function readFreshRows(client) {
  return (
    await client.query(`SELECT package,identity::text AS identity_sql_text,installed_by::text AS installed_by,
    installed_at::text AS installed_at_sql,to_char(installed_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS installed_at_utc
    FROM ${ledger} ORDER BY package`)
  ).rows.map(({ identity_sql_text, ...row }) => ({
    ...row,
    identity: JSON.parse(identity_sql_text),
  }));
}
export const custodyFinalPrivilegesSql = `REVOKE ALL ON integration.stynx_offline_baseline_custody,integration.stynx_offline_forward_receipts,integration.stynx_storage_target_admissions FROM PUBLIC,role_app_backend,role_auditor_min;
REVOKE ALL ON FUNCTION integration.stynx_offline_custody_immutable(),integration.stynx_storage_target_admissions_immutable() FROM PUBLIC,role_app_backend,role_auditor_min;`;

function baselineColumns(document) {
  return {
    baseline_id: document.recordSha256,
    package: '@stynx-nyx/offline-sync',
    prior_package_version: '1.6.0',
    target_package_version: '1.6.1',
    subject_digest: recordDigest(document.subject),
    fresh_receipt_digest: document.freshReceipt.rowDigest,
    target_publication_digest: recordDigest(document.targetPublication),
    binding_digest: recordDigest(document.projectedPrefix.binding),
    covered_prefix_length: 8,
    last_covered_source: document.coveredSources[7].sourcePath,
    projected_prefix_digest: document.projectedPrefix.digest,
  };
}
function forwardColumns(document) {
  return {
    receipt_id: document.recordSha256,
    baseline_id: document.baselineId,
    package: document.package,
    target_package_version: document.targetPackageVersion,
    target_publication_digest: document.targetPublicationDigest,
    binding_digest: document.bindingDigest,
    ordinal: document.ordinal,
    source_path: document.source.path,
    raw_source_digest: 'sha256:' + document.source.sha256,
    bound_sql_digest: 'sha256:' + document.boundSqlSha256,
    predecessor_baseline_id: document.predecessor.baselineId,
    predecessor_receipt_id: null,
    predecessor_ordinal: 8,
  };
}
export function groupColumns(document) {
  return {
    admission_id: document.recordSha256,
    mode: document.mode,
    target_package_version: '1.6.1',
    fresh_package_version: document.mode === 'fresh-1.6.1' ? '1.6.1' : '1.6.0',
    subject_digest: recordDigest(document.subject),
    target_publication_digest: recordDigest(document.targetPublication),
    binding_digest: document.bindingDigest,
    outbox_package: '@stynx-nyx/outbox',
    offline_package: '@stynx-nyx/offline-sync',
    outbox_fresh_receipt_digest: document.freshReceipts.outbox.rowDigest,
    offline_fresh_receipt_digest: document.freshReceipts.offline.rowDigest,
    offline_baseline_id:
      document.mode === 'fresh-1.6.1' ? null : document.offline.baselineId,
    offline_forward_receipt_id:
      document.mode === 'fresh-1.6.1'
        ? null
        : document.offline.forwardReceiptId,
    offline_last_ordinal: document.mode === 'fresh-1.6.1' ? null : 9,
  };
}
export function custodyProjection(kind) {
  const by = kind === 'forward' ? 'executed' : 'admitted';
  return `(to_jsonb(t)-'document'-'${by}_at'-'${by}_by')::text AS columns,
    document::text AS document_text,${by}_by::text AS by,${by}_at::text AS at_sql,
    to_char(${by}_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS at_utc`;
}
function decodeCustodyRow(kind, row) {
  const parsed = parseStorageCustodyDocument(row.document_text, kind);
  const document = parsed.document;
  const expected = {
    baseline: baselineColumns,
    forward: forwardColumns,
    group: groupColumns,
  }[kind](document);
  requireFact(
    isDeepStrictEqual(JSON.parse(row.columns), expected),
    'total custody column/document equality differs: ' + kind,
  );
  requireFact(
    row.by === 'postgres' &&
      /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d(?:\.\d{1,6})?\+00$/u.test(row.at_sql),
    'custody actual actor/time invalid',
  );
  const normalized = row.at_sql.replace(' ', 'T').slice(0, -3).split('.');
  requireFact(
    normalized[0] + '.' + (normalized[1] ?? '').padEnd(6, '0') + 'Z' ===
      row.at_utc,
    'custody SQL time representations differ',
  );
  if (kind !== 'baseline')
    requireFact(
      document[kind === 'forward' ? 'execution' : 'admission'].by === row.by &&
        document[kind === 'forward' ? 'execution' : 'admission'].atUtc ===
          row.at_utc,
      'custody document/SQL actor/time differs',
    );
  return { document, by: row.by, atSql: row.at_sql, atUtc: row.at_utc };
}
export async function custodyRows(client, kind) {
  const relation = {
    baseline: custodyRelations[0],
    forward: custodyRelations[1],
    group: custodyRelations[2],
  }[kind];
  const result = await client.query(
    `SELECT ${custodyProjection(kind)} FROM ${relation} t`,
  );
  return result.rows.map((row) => decodeCustodyRow(kind, row));
}
export async function assertPristineTarget(client) {
  const row = await client
    .query(
      `SELECT
    (SELECT count(*)::integer FROM pg_namespace WHERE left(nspname,3)<>'pg_' AND nspname<>'information_schema' AND (nspname<>'public' OR pg_get_userbyid(nspowner)<>'pg_database_owner' OR nspacl::text IS DISTINCT FROM '{pg_database_owner=UC/pg_database_owner,=U/pg_database_owner}' OR obj_description(oid,'pg_namespace') IS DISTINCT FROM 'standard public schema')) AS schemas,
    (SELECT count(*)::integer FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema') AS relations,
    (SELECT count(*)::integer FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema') AS functions,
    (SELECT count(*)::integer FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema') AS types,
    (SELECT count(*)::integer FROM pg_event_trigger) AS event_triggers,
    (SELECT count(*)::integer FROM pg_publication) AS publications,
    (SELECT count(*)::integer FROM pg_subscription) AS subscriptions,
    (SELECT count(*)::integer FROM pg_foreign_server) AS foreign_servers,
    (SELECT count(*)::integer FROM pg_foreign_data_wrapper) AS foreign_wrappers,
    (SELECT count(*)::integer FROM pg_extension WHERE extname<>'plpgsql') AS extensions,
    (SELECT count(*)::integer FROM pg_default_acl) AS default_acl,
    (SELECT count(*)::integer FROM pg_db_role_setting WHERE setdatabase=(SELECT oid FROM pg_database WHERE datname=current_database())) AS database_role_settings,
    (SELECT count(*)::integer FROM pg_seclabel) AS labels`,
    )
    .then((result) => result.rows[0]);
  requireFact(
    Object.values(row).every((value) => value === 0),
    'fresh target contains unreceipted user objects, rolesettings or extensions',
  );
}

export const ledgerFinalPrivilegesSql = `REVOKE ALL ON TABLE ${ledger} FROM PUBLIC, role_app_backend, role_auditor_min;`;

export async function captureRoleGraph(client) {
  return (
    await client.query(`SELECT jsonb_build_object(
    'roles',(SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY rolname),'[]') FROM (SELECT oid::text,rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconnlimit,rolvaliduntil::text FROM pg_roles) r),
    'memberships',(SELECT coalesce(jsonb_agg(to_jsonb(m) ORDER BY roleid,member),'[]') FROM pg_auth_members m),
    'settings',(SELECT coalesce(jsonb_agg(to_jsonb(s) ORDER BY setdatabase,setrole),'[]') FROM pg_db_role_setting s),
    'reachability',(SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY principal,reachable),'[]') FROM
      (SELECT p.rolname principal,r.rolname reachable,pg_has_role(p.oid,r.oid,'SET') can_set,pg_has_role(p.oid,r.oid,'USAGE') inherits,pg_has_role(p.oid,r.oid,'MEMBER') member
       FROM pg_roles p CROSS JOIN pg_roles r WHERE p.rolcanlogin OR p.rolname IN ('role_app_backend','role_auditor_min','role_rait_priority_writer')) c)) graph`)
  ).rows[0].graph;
}

const writerFootprintSql = `WITH writer AS (
  SELECT oid FROM pg_catalog.pg_roles WHERE rolname='role_rait_priority_writer'
), expected_tables(schema_name,table_name,privilege_type) AS (VALUES
  ('inf','rait_case','SELECT'),('inf','rait_document','SELECT'),
  ('inf','rait_pool','SELECT'),('inf','rait_pool_member','SELECT'),
  ('inf','ait_ait','SELECT'),('auth','tenants','SELECT'),('ops','parameter','SELECT'),
  ('inf','rait_priority_assessment','SELECT'),('inf','rait_priority_assessment','INSERT'),
  ('inf','rait_priority_basis','SELECT'),('inf','rait_priority_basis','INSERT')
), expected_functions(signature) AS (VALUES
  ('inf.rait_priority_mark_insert()'),('inf.rait_priority_document_guard()'),
  ('inf.rait_priority_consistency()'),
  ('inf.rait_record_initial_priority(uuid,uuid,timestamptz,jsonb)')
), table_grants AS (
  SELECT n.nspname AS schema_name,c.relname AS table_name,a.privilege_type,a.is_grantable,
    pg_catalog.pg_get_userbyid(a.grantor) AS grantor
  FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
  CROSS JOIN writer w CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) a
  WHERE a.grantee=w.oid AND c.relowner<>w.oid
), column_grants AS (
  SELECT n.nspname AS schema_name,c.relname AS table_name,t.attname AS column_name,
    a.privilege_type,a.is_grantable,pg_catalog.pg_get_userbyid(a.grantor) AS grantor
  FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
  JOIN pg_catalog.pg_attribute t ON t.attrelid=c.oid AND t.attnum>0 AND NOT t.attisdropped
  CROSS JOIN writer w CROSS JOIN LATERAL pg_catalog.aclexplode(t.attacl) a
  WHERE a.grantee=w.oid
), function_grants AS (
  SELECT p.oid::pg_catalog.regprocedure::text AS signature,a.privilege_type,a.is_grantable,
    pg_catalog.pg_get_userbyid(a.grantor) AS grantor
  FROM pg_catalog.pg_proc p CROSS JOIN writer w
  CROSS JOIN LATERAL pg_catalog.aclexplode(p.proacl) a
  WHERE a.grantee=w.oid AND p.proowner<>w.oid
), schema_grants AS (
  SELECT n.nspname AS schema_name,a.privilege_type,a.is_grantable,
    pg_catalog.pg_get_userbyid(a.grantor) AS grantor
  FROM pg_catalog.pg_namespace n CROSS JOIN writer w
  CROSS JOIN LATERAL pg_catalog.aclexplode(n.nspacl) a WHERE a.grantee=w.oid
), database_grants AS (
  SELECT d.datname AS database_name,a.privilege_type,a.is_grantable,
    pg_catalog.pg_get_userbyid(a.grantor) AS grantor
  FROM pg_catalog.pg_database d CROSS JOIN writer w
  CROSS JOIN LATERAL pg_catalog.aclexplode(d.datacl) a WHERE a.grantee=w.oid AND d.datname=pg_catalog.current_database()
), owned_functions AS (
  SELECT p.oid::pg_catalog.regprocedure::text AS signature,p.oid::text AS oid,
    p.prosecdef,p.proconfig
  FROM pg_catalog.pg_proc p JOIN writer w ON p.proowner=w.oid
), expected_table_rows AS (
  SELECT e.* FROM expected_tables e
), expected_schema_rows(schema_name,privilege_type) AS (VALUES
  ('inf','USAGE'),('auth','USAGE'),('ops','USAGE')
), minimal_issues(reason) AS (
  SELECT 'writer-has-other-role-reachability' WHERE EXISTS (
    SELECT FROM writer w JOIN pg_catalog.pg_roles r ON r.oid<>w.oid
    WHERE pg_catalog.pg_has_role(w.oid,r.oid,'SET') OR pg_catalog.pg_has_role(w.oid,r.oid,'USAGE') OR pg_catalog.pg_has_role(w.oid,r.oid,'MEMBER'))
  UNION ALL SELECT 'writer-membership' WHERE EXISTS (
    SELECT FROM pg_catalog.pg_auth_members a CROSS JOIN writer w WHERE a.roleid=w.oid OR a.member=w.oid)
  UNION ALL SELECT 'writer-database-create' WHERE EXISTS (
    SELECT FROM pg_catalog.pg_database d CROSS JOIN writer w WHERE pg_catalog.has_database_privilege(w.oid,d.oid,'CREATE'))
  UNION ALL SELECT 'writer-user-schema-create' WHERE EXISTS (
    SELECT FROM pg_catalog.pg_namespace n CROSS JOIN writer w
    WHERE pg_catalog.left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema' AND pg_catalog.has_schema_privilege(w.oid,n.oid,'CREATE'))
  UNION ALL SELECT 'writer-owns-persistent-relation-or-schema' WHERE EXISTS (
    SELECT FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace JOIN writer w ON c.relowner=w.oid
    WHERE pg_catalog.left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'
    UNION ALL SELECT FROM pg_catalog.pg_namespace n JOIN writer w ON n.nspowner=w.oid
    WHERE pg_catalog.left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema')
  UNION ALL SELECT 'writer-grant-option-or-grantor' WHERE EXISTS (
    SELECT FROM table_grants WHERE is_grantable OR grantor<>'postgres'
    UNION ALL SELECT FROM column_grants WHERE is_grantable OR grantor<>'postgres'
    UNION ALL SELECT FROM function_grants WHERE is_grantable OR grantor<>'postgres'
    UNION ALL SELECT FROM schema_grants WHERE is_grantable OR grantor<>'postgres'
    UNION ALL SELECT FROM database_grants WHERE is_grantable OR grantor<>'postgres')
  UNION ALL SELECT 'writer-database-acl' WHERE EXISTS (
    SELECT FROM database_grants WHERE privilege_type<>'TEMPORARY' OR database_name<>pg_catalog.current_database())
), full_only_issues(reason) AS (
  SELECT 'writer-table-grants' WHERE EXISTS (
    (SELECT schema_name,table_name,privilege_type FROM table_grants EXCEPT SELECT * FROM expected_table_rows)
    UNION ALL (SELECT * FROM expected_table_rows EXCEPT SELECT schema_name,table_name,privilege_type FROM table_grants))
  UNION ALL SELECT 'writer-column-grants' WHERE EXISTS (
    (SELECT schema_name,table_name,column_name,privilege_type FROM column_grants EXCEPT SELECT 'inf','rait_case','legal_priority','UPDATE')
    UNION ALL (SELECT 'inf','rait_case','legal_priority','UPDATE' EXCEPT SELECT schema_name,table_name,column_name,privilege_type FROM column_grants))
  UNION ALL SELECT 'writer-function-grants' WHERE EXISTS (
    (SELECT signature,privilege_type FROM function_grants EXCEPT SELECT 'auth.current_tenant()','EXECUTE')
    UNION ALL (SELECT 'auth.current_tenant()','EXECUTE' EXCEPT SELECT signature,privilege_type FROM function_grants))
  UNION ALL SELECT 'writer-schema-grants' WHERE EXISTS (
    (SELECT schema_name,privilege_type FROM schema_grants EXCEPT SELECT * FROM expected_schema_rows)
    UNION ALL (SELECT * FROM expected_schema_rows EXCEPT SELECT schema_name,privilege_type FROM schema_grants))
  UNION ALL SELECT 'writer-current-subject-temporary' WHERE EXISTS(SELECT FROM writer)
    AND (NOT EXISTS(SELECT FROM database_grants WHERE database_name=pg_catalog.current_database() AND privilege_type='TEMPORARY')
      OR NOT pg_catalog.has_database_privilege((SELECT oid FROM writer),pg_catalog.current_database(),'TEMPORARY'))
  UNION ALL SELECT 'writer-owned-functions' WHERE EXISTS (
    (SELECT signature FROM owned_functions EXCEPT SELECT pg_catalog.to_regprocedure(signature)::text FROM expected_functions)
    UNION ALL (SELECT pg_catalog.to_regprocedure(signature)::text FROM expected_functions EXCEPT SELECT signature FROM owned_functions))
    OR (SELECT count(*) FROM owned_functions)<>4
    OR EXISTS(SELECT FROM owned_functions WHERE NOT prosecdef)
  UNION ALL SELECT 'writer-declared-effective-rights' WHERE EXISTS (
    SELECT FROM expected_tables e CROSS JOIN writer w
    WHERE pg_catalog.to_regclass(pg_catalog.format('%I.%I',e.schema_name,e.table_name)) IS NULL
      OR NOT pg_catalog.has_table_privilege(w.oid,pg_catalog.to_regclass(pg_catalog.format('%I.%I',e.schema_name,e.table_name)),e.privilege_type))
    OR EXISTS(SELECT FROM writer w WHERE NOT COALESCE(pg_catalog.has_column_privilege(
      w.oid,pg_catalog.to_regclass('inf.rait_case'),
      (SELECT a.attnum FROM pg_catalog.pg_attribute a WHERE a.attrelid=pg_catalog.to_regclass('inf.rait_case') AND a.attname='legal_priority' AND a.attnum>0 AND NOT a.attisdropped),
      'UPDATE'),false))

), empty_only_issues(reason) AS (
  SELECT 'writer-current-subject-nonempty-footprint' WHERE EXISTS(SELECT FROM table_grants)
    OR EXISTS(SELECT FROM column_grants) OR EXISTS(SELECT FROM function_grants)
    OR EXISTS(SELECT FROM schema_grants) OR EXISTS(SELECT FROM owned_functions)
    OR EXISTS(SELECT FROM database_grants WHERE database_name=pg_catalog.current_database())
), public_relation_defaults AS (
  -- These PUBLIC rights are independent of the new role. Record separately;
  -- never substitute them for any declared writer grant or allow CREATE.
  SELECT c.oid::text AS oid,n.nspname,c.relname,a.privilege_type,a.is_grantable,
    EXISTS(SELECT FROM pg_catalog.pg_depend d WHERE d.classid='pg_catalog.pg_class'::pg_catalog.regclass AND d.objid=c.oid AND d.deptype='e') AS extension_owned
  FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
  CROSS JOIN LATERAL pg_catalog.aclexplode(COALESCE(c.relacl,pg_catalog.acldefault('r',c.relowner))) a
  WHERE a.grantee=0 AND pg_catalog.left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'
)
SELECT pg_catalog.jsonb_build_object(
  'writerRoleOid',(SELECT oid::text FROM writer),
  'subjectFootprint',CASE WHEN NOT EXISTS(SELECT FROM writer) THEN 'role-absent'
    WHEN NOT EXISTS(SELECT FROM minimal_issues) AND NOT EXISTS(SELECT FROM empty_only_issues) THEN 'empty-subject-footprint'
    WHEN NOT EXISTS(SELECT FROM minimal_issues) AND NOT EXISTS(SELECT FROM full_only_issues) THEN 'full-consumer-footprint'
    ELSE 'invalid' END,
  'minimalViolations',CASE WHEN EXISTS(SELECT FROM writer) THEN (SELECT COALESCE(pg_catalog.jsonb_agg(reason ORDER BY reason),'[]'::jsonb) FROM minimal_issues) ELSE '[]'::jsonb END,
  'emptyViolations',CASE WHEN EXISTS(SELECT FROM writer) THEN (SELECT COALESCE(pg_catalog.jsonb_agg(reason ORDER BY reason),'[]'::jsonb) FROM (SELECT * FROM minimal_issues UNION ALL SELECT * FROM empty_only_issues) a) ELSE '[]'::jsonb END,
  'fullViolations',CASE WHEN EXISTS(SELECT FROM writer) THEN (SELECT COALESCE(pg_catalog.jsonb_agg(reason ORDER BY reason),'[]'::jsonb) FROM (SELECT * FROM minimal_issues UNION ALL SELECT * FROM full_only_issues) a) ELSE '[]'::jsonb END,
  'directTableGrants',(SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) ORDER BY schema_name,table_name,privilege_type),'[]'::jsonb) FROM table_grants a),
  'directColumnGrants',(SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) ORDER BY schema_name,table_name,column_name,privilege_type),'[]'::jsonb) FROM column_grants a),
  'directFunctionGrants',(SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) ORDER BY signature,privilege_type),'[]'::jsonb) FROM function_grants a),
  'directSchemaGrants',(SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) ORDER BY schema_name,privilege_type),'[]'::jsonb) FROM schema_grants a),
  'directDatabaseGrants',(SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) ORDER BY database_name,privilege_type),'[]'::jsonb) FROM database_grants a),
  'ownedFunctions',(SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) ORDER BY signature),'[]'::jsonb) FROM owned_functions a),
  'publicRelationDefaults',(SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) ORDER BY nspname,relname,privilege_type),'[]'::jsonb) FROM public_relation_defaults a)
) AS profile;`;
export async function readWriterFootprint(client) {
  return (await client.query(writerFootprintSql)).rows[0].profile;
}
