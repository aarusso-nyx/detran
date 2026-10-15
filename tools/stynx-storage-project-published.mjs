// Fixed portable public storage projection over independently admitted package bytes.
// Source seals remain disabled until actual input and implementation reviews concur.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import {
  archivePayload,
  checkDownloaded,
  checkPackageDependencyMetadata,
  ArchiveValidationError,
  PackageDependencyMetadataError,
} from './stynx-storage-ci-validation.mjs';
class Refusal extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
}
function requireThat(condition, reason) {
  if (!condition) throw new Refusal(reason);
}
function check(condition) {
  requireThat(condition, 'public-api');
}
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const canonical = (value) =>
  Array.isArray(value)
    ? '[' + value.map(canonical).join(',') + ']'
    : value !== null && typeof value === 'object'
      ? '{' +
        Object.keys(value)
          .sort()
          .map((key) => JSON.stringify(key) + ':' + canonical(value[key]))
          .join(',') +
        '}'
      : JSON.stringify(value);
const equal = (a, b) => canonical(a) === canonical(b);
function closed(value, names) {
  requireThat(
    value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      equal(Object.keys(value).sort(), [...names].sort()),
    'invalid-document',
  );
}
const keys = (value, names) => closed(value, names);
const publication = {
  candidate: '3e3da1f7ceb6dd4a7dd2f9d6e0dc704437e262a0',
  tree: 'e2ce9989249d1bc13403dc21f5a421b24178ef29',
  workflowRun: '38445937806',
};
const seals = {
  protected: '46815c17be9dbcd2080a3a0c08db958bd42390d8766c64ef40bebd5017074318',
  retention: '56e2e6438b8ef505eca99357e8e219e30ceb170f68f7b5779fff6f997c8a98ac',
  closure: 'f372c94bb51ce4939b0e4d4069434b4e0e7ac68ac7136f9e648273fa4b108fde',
  packages: 'e8e592cc85e8e932c5648160da542d60272fc1410bd5e381a3be6b209430d4ef',
  graph: '716cfa56cdd8c2203edc472ea03fcc215110070a42d839b1854b66a19997e66e',
  boundary: '04da818d6fb898998dd8f6b97fab40c498a99939d82ac49c1e6efba14118ce6c',
  lock: '076090fca892c8b3235a7e0f66cc969b59b6e87fc060c5fd312e988282b80ad5',
};
const binding = {
  ownerRole: 'postgres',
  appRole: 'role_app_backend',
  readerRole: null,
  tenantTable: { schema: 'auth', table: 'tenants', column: 'id' },
};
const migrationNames = [
  '0001_offline_sync.sql',
  '0002_durable_sync.sql',
  '0003_reservation_idempotency.sql',
  '0004_pending_state_and_conflict_actions.sql',
  '0005_initial_queue_status.sql',
  '0006_nullable_active_reservations.sql',
  '0007_range_administration.sql',
  '0008_import_receipts.sql',
  '0009_numbering_reconciliations.sql',
];
const rawMigrationHashes = [
  'e8c61245343dd0bb58f49e259b9384bc0fa06b81b1211b19fc6a37de275069c1',
  'bb2c7685a2092d92ecb7ce80b7a61e54714a55cbb5e1a222d0e71d3a4b2b8983',
  'c947e341e1617c983fc559317f32a724aeaef07094e41334e41bc517621a534f',
  '435e064cf61fe1a3b76c49cc9b495616a5125ba92b480d75807fd4a1dabba0c6',
  'dc3a8ee136406c749214f29251a7314990ce7c402e5bb4120111518fd2a15c0e',
  '942822d271a6ea5e6b82e1bea831bcbac9e8169003294c60b28d977fe6b23db5',
  '63ab4d83807c8cd7ec031085ac3344eef2ba611611b92418fdcfde4220d21836',
  'b700c1db62fd9a3d0e1f43000c61aa64d7b2b6d28cb288f148b73c8a3a8bbf5a',
  '7167a3d32e5048c56b453bb6cc5868a5c1c67f2aeab721a2832f13e4af1ca1fd',
];

function unicode(value) {
  for (let i = 0; i < value.length; i++) {
    const u = value.charCodeAt(i);
    if (u >= 0xd800 && u <= 0xdbff) {
      const next = value.charCodeAt(++i);
      requireThat(next >= 0xdc00 && next <= 0xdfff, 'invalid-document');
    } else requireThat(u < 0xdc00 || u > 0xdfff, 'invalid-document');
  }
}
// Validate duplicate decoded keys and numeric precision before JSON.parse discards them.
function strictJson(bytes) {
  const text = bytes.toString('utf8');
  requireThat(Buffer.from(text, 'utf8').equals(bytes), 'invalid-document');
  let at = 0;
  const space = () => {
    while (/[ \t\r\n]/u.test(text[at] ?? 'x')) at++;
  };
  const string = () => {
    requireThat(text[at] === '"', 'invalid-document');
    const start = at++;
    while (at < text.length) {
      const c = text[at++];
      if (c === '\\') at++;
      else if (c === '"') {
        let v;
        try {
          v = JSON.parse(text.slice(start, at));
        } catch {
          throw new Refusal('invalid-document');
        }
        unicode(v);
        return v;
      }
    }
    throw new Refusal('invalid-document');
  };
  const value = () => {
    space();
    if (text[at] === '{') {
      at++;
      space();
      const keys = new Set();
      if (text[at] === '}') {
        at++;
        return;
      }
      for (;;) {
        space();
        const k = string();
        requireThat(!keys.has(k), 'invalid-document');
        keys.add(k);
        space();
        requireThat(text[at++] === ':', 'invalid-document');
        value();
        space();
        const c = text[at++];
        if (c === '}') return;
        requireThat(c === ',', 'invalid-document');
      }
    }
    if (text[at] === '[') {
      at++;
      space();
      if (text[at] === ']') {
        at++;
        return;
      }
      for (;;) {
        value();
        space();
        const c = text[at++];
        if (c === ']') return;
        requireThat(c === ',', 'invalid-document');
      }
    }
    if (text[at] === '"') {
      string();
      return;
    }
    const token =
      /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/u.exec(
        text.slice(at),
      );
    requireThat(token, 'invalid-document');
    if (/^-?\d/u.test(token[0]))
      requireThat(
        /^-?(?:0|[1-9]\d*)$/u.test(token[0]) &&
          Number.isSafeInteger(Number(token[0])),
        'invalid-document',
      );
    at += token[0].length;
  };
  value();
  space();
  requireThat(at === text.length, 'invalid-document');
  try {
    return JSON.parse(text);
  } catch {
    throw new Refusal('invalid-document');
  }
}
function safePath(root, relative, { absent = false } = {}) {
  check(
    typeof relative === 'string' &&
      relative.length &&
      !relative.includes('\\') &&
      !relative.includes('\0') &&
      !path.isAbsolute(relative) &&
      relative
        .split('/')
        .every((part) => part && part !== '.' && part !== '..'),
    'Unsafe retained path',
  );
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    if (!fs.existsSync(current)) {
      // existsSync follows links; lstat also catches dangling links.
      try {
        check(
          !fs.lstatSync(current).isSymbolicLink(),
          'Retained symlink refused',
        );
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      check(absent, `Missing retained path: ${relative}`);
      continue;
    }
    check(
      !fs.lstatSync(current).isSymbolicLink(),
      `Retained symlink refused: ${relative}`,
    );
  }
  check(current.startsWith(root + path.sep), 'Retained path escaped root');
  return current;
}
function bytesAt(root, relative) {
  const file = safePath(root, relative);
  check(
    fs.statSync(file).isFile(),
    `Regular retained file required: ${relative}`,
  );
  return fs.readFileSync(file);
}
// Draft preflight: production layout is tools/<this file>; no invocation until seals are filled.
const POLICY_SHA256 =
  '17785709f052acff861dabe70a4a0be87786e80a3d2f9d55adadf125c3f36108';
const PRODUCER_SHA256 =
  'd0a31499148a68023785ea734e2594a0794ed8f0a22d795a4f0c1ce6f32d86d0'; // Exact reviewed CURRENT formatted source; not the historical run source.
const RECORDED_PRODUCER = {
  path: 'tools/stynx-storage/retained-observations/producer-generation03-f840.mjs.raw',
  bytes: 36237,
  sha256:
    'sha256:f8404c0372b7db50b9079c5fd47551a9b73e874dfcbea3818e043015482ae865',
};
const VALIDATOR_SHA256 =
  'f6ce3043cf0627bcf40e8719970cd4b6b5e6fdfce937554eedcccdeb44d7379b';
const INPUT = 'scratch/r22-adoption-161/portable-ci/retention-03/inputs';
const EMULATED_RUNTIME_PROOF_SHA256 =
  '1ade80e87d66b36ea99148a5f640a99cc0b180eb3e8652ccb54341b73d038629';
const projectorSourceFile = fileURLToPath(import.meta.url);
const emulatedProofPath =
  'tools/stynx-storage/retained-observations/linux-emulated-projector-execution-proof.json';
const POLICY = 'tools/stynx-storage/fixtures/ci-admission-policy.json';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function bound(record) {
  closed(record, ['path', 'bytes', 'sha256']);
  requireThat(
    Number.isSafeInteger(record.bytes) &&
      record.bytes >= 0 &&
      /^sha256:[a-f0-9]{64}$/u.test(record.sha256),
    'invalid-document',
  );
  const bytes = bytesAt(root, record.path);
  requireThat(
    bytes.length === record.bytes && 'sha256:' + sha(bytes) === record.sha256,
    'input-identity',
  );
  return bytes;
}
function walkExact(directoryRelative, files, links = new Map()) {
  const directory = safePath(root, directoryRelative),
    seenFiles = new Set(),
    seenLinks = new Set(),
    directories = new Set([directoryRelative]);
  for (const name of [...files.keys(), ...links.keys()]) {
    requireThat(name.startsWith(directoryRelative + '/'), 'path-topology');
    let parent = path.posix.dirname(name);
    while (parent.startsWith(directoryRelative + '/')) {
      directories.add(parent);
      parent = path.posix.dirname(parent);
    }
  }
  function walk(folder) {
    for (const item of fs.readdirSync(folder, { withFileTypes: true })) {
      const full = path.join(folder, item.name),
        relative = path.relative(root, full),
        stat = fs.lstatSync(full);
      if (stat.isSymbolicLink()) {
        const link = links.get(relative);
        requireThat(
          link &&
            fs.readlinkSync(full) === link.target &&
            fs.realpathSync(full) === safePath(root, link.resolvedPath),
          'path-topology',
        );
        seenLinks.add(relative);
      } else if (stat.isDirectory()) {
        requireThat(directories.has(relative), 'payload-inventory');
        walk(full);
      } else {
        requireThat(stat.isFile() && files.has(relative), 'payload-inventory');
        bound(files.get(relative));
        seenFiles.add(relative);
      }
    }
  }
  walk(directory);
  requireThat(
    seenFiles.size === files.size && seenLinks.size === links.size,
    'payload-inventory',
  );
}
function same(left, right) {
  return canonical(left) === canonical(right);
}
function digestOf(record) {
  return record.sha256.replace(/^sha256:/u, '');
}
function preflight() {
  requireThat(
    PRODUCER_SHA256 !== null && VALIDATOR_SHA256 !== null,
    'policy-unavailable',
  );
  requireThat(
    sha(bytesAt(root, 'tools/stynx-storage-ci-inputs.mjs')) ===
      PRODUCER_SHA256 &&
      sha(bytesAt(root, 'tools/stynx-storage-ci-validation.mjs')) ===
        VALIDATOR_SHA256,
    'input-identity',
  );
  const policyBytes = bytesAt(root, POLICY);
  requireThat(sha(policyBytes) === POLICY_SHA256, 'input-identity');
  const policy = strictJson(policyBytes);
  closed(policy, [
    'formatVersion',
    'kind',
    'publication',
    'targetLock',
    'targetRetention',
    'priorObservation',
    'fixtureInventory',
    'toolchains',
    'modulePolicy',
  ]);
  requireThat(
    policy.formatVersion === 1 &&
      policy.kind === 'detran-stynx-portable-ci-policy',
    'invalid-document',
  );
  const inventory = strictJson(bound(policy.fixtureInventory));
  closed(inventory, ['formatVersion', 'kind', 'files', 'links']);
  requireThat(
    inventory.files.length === 441 && inventory.links.length === 0,
    'input-identity',
  );
  const fixtureRecords = new Map();
  for (const record of inventory.files) {
    requireThat(!fixtureRecords.has(record.path), 'input-identity');
    bound(record);
    fixtureRecords.set(record.path, record);
  }
  const fixtureFiles = new Map(fixtureRecords);
  fixtureFiles.set(POLICY, {
    path: POLICY,
    bytes: policyBytes.length,
    sha256: 'sha256:' + POLICY_SHA256,
  });
  fixtureFiles.set(policy.fixtureInventory.path, policy.fixtureInventory);
  walkExact('tools/stynx-storage/fixtures', fixtureFiles);
  // A supplied manifest is only an observed location index. Every authority comes from policy bytes.
  const manifestBytes = bytesAt(
    root,
    INPUT + '/metadata/portable-input-manifest.json',
  );
  const manifest = strictJson(manifestBytes);
  closed(manifest, [
    'formatVersion',
    'kind',
    'phase',
    'repository',
    'policy',
    'publication',
    'target',
    'prior',
    'historicalFixtures',
    'toolchain',
    'modulePolicy',
    'outputs',
    'limits',
    'recordSha256',
  ]);
  const { recordSha256, ...unsigned } = manifest;
  requireThat(
    recordSha256 === 'sha256:' + sha(canonical(unsigned)) &&
      manifest.formatVersion === 1 &&
      manifest.kind === 'detran-stynx-portable-ci-inputs' &&
      manifest.phase === 'RETENTION_READY_FOR_GRAPH_REVIEW',
    'invalid-document',
  );
  closed(manifest.repository, ['root', 'head', 'lock']);
  requireThat(
    typeof manifest.repository.root === 'string' &&
      manifest.repository.root.length > 0 &&
      path.isAbsolute(manifest.repository.root) &&
      /^[a-f0-9]{40}$/u.test(manifest.repository.head) &&
      same(manifest.repository.lock, policy.targetLock) &&
      same(manifest.publication, policy.publication) &&
      same(manifest.modulePolicy, policy.modulePolicy),
    'input-identity',
  );
  bound(policy.targetLock);
  requireThat(
    manifest.policy.path === POLICY &&
      manifest.policy.bytes === policyBytes.length &&
      manifest.policy.sha256 === 'sha256:' + POLICY_SHA256,
    'input-identity',
  );
  closed(manifest.limits, [
    'sdkExecuted',
    'databaseAccessed',
    'ciAcceptance',
    'providerAdmission',
    'approvedTrustAdmission',
  ]);
  requireThat(
    Object.values(manifest.limits).every((v) => v === false),
    'invalid-document',
  );
  closed(manifest.historicalFixtures, ['inventory', 'files', 'links']);
  requireThat(
    same(manifest.historicalFixtures.inventory, policy.fixtureInventory) &&
      manifest.historicalFixtures.links.length === 0 &&
      manifest.historicalFixtures.files.length === 441,
    'input-identity',
  );
  const historical = new Map();
  for (const record of manifest.historicalFixtures.files) {
    requireThat(
      record.path.startsWith(INPUT + '/historical/'),
      'path-topology',
    );
    const logical = record.path.slice((INPUT + '/historical/').length),
      original = fixtureRecords.get(logical);
    requireThat(
      original &&
        record.bytes === original.bytes &&
        record.sha256 === original.sha256 &&
        !historical.has(logical),
      'input-identity',
    );
    bound(record);
    historical.set(logical, record);
  }
  function retained(reference) {
    const actual = historical.get(reference.path);
    requireThat(
      actual &&
        actual.bytes === reference.bytes &&
        actual.sha256 === reference.sha256,
      'input-identity',
    );
    return bound(actual);
  }
  const targetWrapper = strictJson(retained(policy.targetRetention));
  const priorWrapper = strictJson(retained(policy.priorObservation));
  const modulePolicy = strictJson(retained(policy.modulePolicy));
  const proof = strictJson(retained(policy.publication));
  requireThat(
    proof.ok === true &&
      proof.version === '1.6.1' &&
      proof.candidate === publication.candidate &&
      proof.tree === publication.tree &&
      proof.workflowRun === publication.workflowRun &&
      proof.packages.length === 44,
    'input-identity',
  );
  const roster = new Map(proof.packages.map((p) => [p.name, p]));
  requireThat(roster.size === 44, 'input-identity');
  const expectedFiles = new Map(),
    expectedLinks = new Map();
  function expectFile(relative, bytes, hash) {
    safePath(root, INPUT + '/' + relative);
    requireThat(
      !expectedFiles.has(INPUT + '/' + relative),
      'payload-inventory',
    );
    expectedFiles.set(INPUT + '/' + relative, {
      path: INPUT + '/' + relative,
      bytes,
      sha256: hash,
    });
  }
  function checkRealm(realm, wrapper) {
    closed(realm, ['version', 'retention', 'packages', 'files', 'links']);
    requireThat(
      realm.version === wrapper.release &&
        realm.packages.length === wrapper.packages.length &&
        same(
          realm.retention,
          realm === manifest.target
            ? policy.targetRetention
            : policy.priorObservation,
        ),
      'input-identity',
    );
    const realmName = realm === manifest.target ? 'target' : 'prior';
    const payloadInventory = strictJson(retained(wrapper.regularInventory));
    const payloads = new Map();
    for (const entry of payloadInventory) {
      const key = entry.context + '\0' + entry.path;
      requireThat(!payloads.has(key), 'payload-inventory');
      payloads.set(key, entry);
    }
    requireThat(
      payloads.size === (realmName === 'target' ? 30091 : 21618),
      'payload-inventory',
    );
    const declared = new Map(realm.packages.map((p) => [p.context, p]));
    requireThat(declared.size === wrapper.packages.length, 'payload-inventory');
    let payloadCount = 0;
    const seenArchives = new Set();
    for (const item of wrapper.packages) {
      const current = declared.get(item.context);
      requireThat(current, 'payload-inventory');
      closed(current, [
        'name',
        'version',
        'context',
        'registry',
        'archive',
        'manifest',
        'root',
      ]);
      requireThat(
        current.name === item.name &&
          current.version === item.version &&
          current.root === INPUT + '/' + item.root &&
          same(current.registry, historical.get(item.registryVersion.path)),
        'input-identity',
      );
      requireThat(
        current.archive.path === INPUT + '/' + item.archive.destination &&
          current.archive.bytes === item.archive.bytes &&
          current.archive.sha256 === item.archive.sha256,
        'archive-integrity',
      );
      const archive = bound(current.archive);
      checkDownloaded(archive, item.archive);
      const members = archivePayload(archive);
      if (!seenArchives.has(item.archive.destination)) {
        expectFile(
          item.archive.destination,
          item.archive.bytes,
          item.archive.sha256,
        );
        seenArchives.add(item.archive.destination);
      }
      const metadata = strictJson(retained(item.registryVersion));
      requireThat(
        metadata.versionRecord.name === item.name &&
          metadata.versionRecord.version === item.version &&
          metadata.versionRecord.dist.integrity === item.archive.integrity &&
          metadata.versionRecord.dist.tarball === item.archive.url,
        'input-identity',
      );
      if (realmName === 'target' && item.name.startsWith('@stynx-nyx/')) {
        const protectedItem = roster.get(item.name);
        requireThat(
          protectedItem &&
            item.version === '1.6.1' &&
            protectedItem.tarballSha256 === digestOf(item.archive) &&
            protectedItem.bytes === item.archive.bytes &&
            protectedItem.integrity === item.archive.integrity &&
            createHash('sha1').update(archive).digest('hex') ===
              protectedItem.shasum,
          'archive-integrity',
        );
      }
      for (const [member, value] of members) {
        const record = payloads.get(item.context + '\0' + member);
        requireThat(
          record &&
            value.bytes.length === record.bytes &&
            'sha256:' + sha(value.bytes) === record.sha256,
          'payload-inventory',
        );
        expectFile(item.root + '/' + member, record.bytes, record.sha256);
        payloadCount++;
      }
      const expectedCount = payloadInventory.filter(
        (p) => p.context === item.context,
      ).length;
      requireThat(members.size === expectedCount, 'payload-inventory');
      const packageBytes = members.get('package.json')?.bytes;
      requireThat(
        packageBytes &&
          packageBytes.length === item.manifest.bytes &&
          'sha256:' + sha(packageBytes) === item.manifest.sha256 &&
          current.manifest.path === INPUT + '/' + item.root + '/package.json' &&
          current.manifest.bytes === item.manifest.bytes &&
          current.manifest.sha256 === item.manifest.sha256,
        'payload-inventory',
      );
      const packageJson = strictJson(packageBytes);
      requireThat(
        packageJson.name === item.name && packageJson.version === item.version,
        'input-identity',
      );
      checkPackageDependencyMetadata(packageJson, metadata.versionRecord);
    }
    requireThat(
      payloadCount === payloads.size &&
        seenArchives.size === (realmName === 'target' ? 210 : 176),
      'payload-inventory',
    );
    const prefix =
      'tools/stynx-storage/fixtures/' +
      (realmName === 'target' ? 'publication-161' : 'prior-observation') +
      '/historical/scratch/r22-adoption-161/' +
      (realmName === 'target'
        ? 'package-admission/runtime/'
        : 'prior-runtime/');
    function copiedInput(file) {
      requireThat(
        file.path.startsWith(prefix) && file.path.endsWith('.raw'),
        'path-topology',
      );
      retained(file);
      expectFile(
        (realmName === 'target' ? 'target/runtime/' : 'prior/') +
          file.path.slice(prefix.length, -4),
        file.bytes,
        file.sha256,
      );
    }
    for (const file of wrapper.inputFiles) copiedInput(file);
    for (const generated of wrapper.generatedFiles) {
      requireThat(
        generated.disposition === 'nonexecuted-installer-bin-shim',
        'payload-inventory',
      );
      const context = wrapper.packages.find(
        (p) => p.context === generated.origin.context,
      );
      requireThat(context, 'payload-inventory');
      const origin = expectedFiles.get(
        INPUT + '/' + context.root + '/' + generated.origin.member,
      );
      requireThat(
        origin && origin.sha256 === generated.origin.sha256,
        'payload-inventory',
      );
      copiedInput(generated.file);
    }
    for (const link of wrapper.links) {
      requireThat(
        !expectedLinks.has(INPUT + '/' + link.path) &&
          path.posix.normalize(
            path.posix.join(path.posix.dirname(link.path), link.target),
          ) === link.resolvedPath,
        'path-topology',
      );
      expectedLinks.set(INPUT + '/' + link.path, {
        path: INPUT + '/' + link.path,
        target: link.target,
        resolvedPath: INPUT + '/' + link.resolvedPath,
      });
    }
    const expectedRealm = [...expectedFiles.values()]
      .filter((p) => p.path.startsWith(INPUT + '/' + realmName + '/'))
      .sort((a, b) => (a.path < b.path ? -1 : 1));
    requireThat(
      same(realm.files, expectedRealm) &&
        same(
          realm.links,
          [...expectedLinks.values()]
            .filter((p) => p.path.startsWith(INPUT + '/' + realmName + '/'))
            .sort((a, b) => (a.path < b.path ? -1 : 1)),
        ),
      'payload-inventory',
    );
    for (const file of realm.files) bound(file);
    const seenFiles = new Set(),
      seenLinks = new Set();
    function walk(directory) {
      for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
        const full = path.join(directory, item.name),
          relative = path.relative(root, full),
          stat = fs.lstatSync(full);
        if (stat.isSymbolicLink()) {
          const record = expectedLinks.get(relative);
          requireThat(
            record &&
              fs.readlinkSync(full) === record.target &&
              fs.realpathSync(full) === safePath(root, record.resolvedPath),
            'path-topology',
          );
          seenLinks.add(relative);
        } else if (stat.isDirectory()) walk(full);
        else {
          requireThat(
            stat.isFile() && expectedFiles.has(relative),
            'payload-inventory',
          );
          bound(expectedFiles.get(relative));
          seenFiles.add(relative);
        }
      }
    }
    walk(safePath(root, INPUT + '/' + realmName));
    requireThat(
      seenFiles.size === realm.files.length &&
        seenLinks.size === realm.links.length,
      'payload-inventory',
    );
  }
  checkRealm(manifest.target, targetWrapper);
  checkRealm(manifest.prior, priorWrapper);
  const platformKey =
    process.platform === 'darwin' && process.arch === 'arm64'
      ? 'darwinArm64'
      : process.platform === 'linux' && process.arch === 'x64'
        ? 'linuxX64'
        : null;
  requireThat(platformKey, 'toolchain-identity');
  const toolProof = strictJson(retained(policy.toolchains[platformKey]));
  closed(manifest.toolchain, [
    'platform',
    'arch',
    'version',
    'executable',
    'archive',
    'officialSums',
    'loaderInventory',
  ]);
  requireThat(
    process.version === 'v24.20.0' &&
      manifest.toolchain.platform === process.platform &&
      manifest.toolchain.arch === process.arch &&
      manifest.toolchain.version === '24.20.0' &&
      'sha256:' + sha(fs.readFileSync(process.execPath)) ===
        toolProof.executable.sha256,
    'toolchain-identity',
  );
  for (const key of ['archive', 'officialSums']) {
    const actual = manifest.toolchain[key],
      expected = toolProof[key];
    requireThat(
      actual.path === INPUT + '/' + expected.destination &&
        actual.bytes === expected.bytes &&
        actual.sha256 === expected.sha256,
      'toolchain-identity',
    );
    checkDownloaded(bound(actual), expected);
  }
  requireThat(
    manifest.toolchain.executable.path ===
      INPUT + '/' + toolProof.executable.destination &&
      manifest.toolchain.executable.bytes === toolProof.executable.bytes &&
      manifest.toolchain.executable.sha256 === toolProof.executable.sha256,
    'toolchain-identity',
  );
  bound(manifest.toolchain.executable);
  const loaders = strictJson(bound(manifest.toolchain.loaderInventory));
  closed(loaders, [
    'kind',
    'version',
    'platform',
    'arch',
    'executable',
    'files',
    'sdkExecuted',
  ]);
  requireThat(
    loaders.kind ===
      'actual-official-node-embedded-loader-source-observation' &&
      loaders.version === process.version &&
      loaders.platform === process.platform &&
      loaders.arch === process.arch &&
      loaders.sdkExecuted === false &&
      same(loaders.executable, manifest.toolchain.executable) &&
      loaders.files.length === 3,
    'toolchain-identity',
  );
  for (let i = 0; i < 3; i++) {
    const actual = loaders.files[i],
      expected = toolProof.loaders[i];
    requireThat(
      actual.path === INPUT + '/' + expected.destination &&
        actual.bytes === expected.bytes &&
        actual.sha256 === expected.sha256,
      'toolchain-identity',
    );
    bound(actual);
  }
  requireThat(
    manifest.outputs.length === 2 &&
      manifest.outputs[0].path ===
        INPUT + '/metadata/retention-execution-observation.json' &&
      manifest.toolchain.loaderInventory.path ===
        INPUT + '/toolchain/loader-inventory.json' &&
      same(manifest.outputs[1], manifest.toolchain.loaderInventory),
    'input-identity',
  );
  const observation = strictJson(bound(manifest.outputs[0]));
  closed(observation, [
    'kind',
    'pid',
    'sources',
    'node',
    'officialToolchainProof',
    'embeddedLoaderChild',
    'sdkExecuted',
    'databaseAccessed',
    'ciAcceptance',
  ]);
  requireThat(
    observation.kind ===
      'actual-portable-retention-control-plane-observation' &&
      observation.sdkExecuted === false &&
      observation.databaseAccessed === false &&
      observation.ciAcceptance === false &&
      same(observation.officialToolchainProof, policy.toolchains[platformKey]),
    'input-identity',
  );
  requireThat(
    observation.sources.length === 2 &&
      observation.sources.some(
        (p) =>
          p.path === 'tools/stynx-storage-ci-validation.mjs' &&
          p.sha256 === 'sha256:' + VALIDATOR_SHA256,
      ),
    'input-identity',
  );
  const recordedSource = observation.sources.find(
    (p) => p.path === 'tools/stynx-storage-ci-inputs.mjs',
  );
  requireThat(recordedSource, 'input-identity');
  let producerExecutionIdentity;
  if (recordedSource.sha256 === 'sha256:' + PRODUCER_SHA256) {
    // A new clean-root execution, including Linux, must actually name the current source.
    requireThat(manifest.repository.root === root, 'input-identity');
    bound(recordedSource);
    producerExecutionIdentity = {
      kind: 'current-source-actual-execution',
      observed: recordedSource,
    };
  } else {
    // This is one finite historical Darwin03 observation, never a platform fallback.
    requireThat(
      process.platform === 'darwin' &&
        process.arch === 'arm64' &&
        recordedSource.bytes === RECORDED_PRODUCER.bytes &&
        recordedSource.sha256 === RECORDED_PRODUCER.sha256 &&
        manifestBytes.length === 17247133 &&
        sha(manifestBytes) ===
          '1429a543a35d9feafdea222680c9420856de59f9d13d175bc063a4b40275424d' &&
        same(manifest.outputs[0], {
          path: INPUT + '/metadata/retention-execution-observation.json',
          bytes: 1115,
          sha256:
            'sha256:0be1b1377b933255cd93c582185c4c28a45a49b2c0ec1c0627ca08e485cf42b2',
        }),
      'input-identity',
    );
    const recordedBytes = bound(RECORDED_PRODUCER),
      currentBytes = bytesAt(root, 'tools/stynx-storage-ci-inputs.mjs');
    const single = "const POLICY_SHA256 = '" + POLICY_SHA256 + "';";
    const wrapped = "const POLICY_SHA256 =\n  '" + POLICY_SHA256 + "';";
    const currentText = currentBytes.toString('utf8');
    requireThat(
      currentText.split(wrapped).length === 2 &&
        currentText.replace(wrapped, single) === recordedBytes.toString('utf8'),
      'input-identity',
    );
    producerExecutionIdentity = {
      kind: 'historical-darwin03-execution-current-formatting-separate',
      observed: recordedSource,
      observedRepositoryRoot: manifest.repository.root,
      retainedSource: RECORDED_PRODUCER,
      currentSource: {
        path: 'tools/stynx-storage-ci-inputs.mjs',
        bytes: currentBytes.length,
        sha256: 'sha256:' + PRODUCER_SHA256,
      },
      difference: 'exact reviewed constant line wrapping only',
    };
  }
  for (const source of observation.sources)
    if (source.path !== 'tools/stynx-storage-ci-inputs.mjs') bound(source);
  requireThat(
    observation.node.version === process.version &&
      observation.node.platform === process.platform &&
      observation.node.arch === process.arch &&
      observation.node.executableSha256 === toolProof.executable.sha256 &&
      observation.embeddedLoaderChild.exitCode === 0 &&
      observation.embeddedLoaderChild.signal === null,
    'toolchain-identity',
  );
  const exactOutputFiles = new Map();
  for (const file of [
    ...manifest.target.files,
    ...manifest.prior.files,
    ...manifest.historicalFixtures.files,
    ...manifest.outputs,
    manifest.toolchain.executable,
    manifest.toolchain.archive,
    manifest.toolchain.officialSums,
    ...loaders.files,
    {
      path: INPUT + '/metadata/portable-input-manifest.json',
      bytes: manifestBytes.length,
      sha256: 'sha256:' + sha(manifestBytes),
    },
  ]) {
    requireThat(
      !exactOutputFiles.has(file.path) ||
        same(exactOutputFiles.get(file.path), file),
      'payload-inventory',
    );
    exactOutputFiles.set(file.path, file);
  }
  const exactOutputLinks = new Map();
  for (const link of [...manifest.target.links, ...manifest.prior.links]) {
    requireThat(!exactOutputLinks.has(link.path), 'path-topology');
    exactOutputLinks.set(link.path, link);
  }
  requireThat(
    exactOutputFiles.size === 52557 && exactOutputLinks.size === 464,
    'payload-inventory',
  );
  walkExact(INPUT, exactOutputFiles, exactOutputLinks);
  const originals = new Map(
    targetWrapper.originalEvidence.map((p) => [digestOf(p), p]),
  );
  function original(hash) {
    const reference = originals.get(hash);
    requireThat(reference, 'input-identity');
    return strictJson(retained(reference));
  }
  const closure = original(seals.closure),
    packageIndex = original(seals.packages),
    graph = original(seals.graph),
    boundary = original(seals.boundary);
  requireThat(
    same(closure.publication, publication) &&
      closure.admissionInputs.retentionManifest.sha256 === seals.retention &&
      closure.admissionInputs.protectedVerification.sha256 ===
        seals.protected &&
      closure.packages.sha256 === seals.packages &&
      closure.graph.sha256 === seals.graph &&
      closure.boundaryReview.sha256 === seals.boundary &&
      packageIndex.packages.length === 211 &&
      graph.files.length === 1874 &&
      graph.edges.length === 5138 &&
      boundary.sites.length === 15,
    'module-boundary',
  );
  requireThat(
    digestOf(modulePolicy.graph) === seals.graph &&
      digestOf(modulePolicy.sourceInventory) === seals.packages &&
      digestOf(modulePolicy.boundaryDisposition) === seals.boundary &&
      digestOf(modulePolicy.loaderRules) ===
        'fee708d8829ea1e7bfb742ad20c5e46339db48a4539654882b9272343e320d50',
    'module-boundary',
  );
  const runtime = safePath(root, INPUT + '/target/runtime'),
    allowed = {},
    nearestPackages = {},
    allPackageFiles = new Map();
  for (const item of packageIndex.packages) {
    const current = targetWrapper.packages.find((p) => p.context === item.path);
    requireThat(
      current &&
        current.name === item.name &&
        current.version === item.version &&
        current.archive.sha256 === 'sha256:' + item.archive.sha256 &&
        current.archive.integrity === item.integrity &&
        current.archive.url === item.resolved,
      'module-boundary',
    );
    for (const entry of item.files) {
      const bytes = bytesAt(runtime, entry.path);
      requireThat(
        bytes.length === entry.bytes &&
          sha(bytes) === entry.sha256 &&
          !allPackageFiles.has(entry.path),
        'module-boundary',
      );
      allPackageFiles.set(entry.path, entry);
    }
  }
  requireThat(allPackageFiles.size === 30091, 'module-boundary');
  for (const entry of graph.files) {
    const record = allPackageFiles.get(entry.path);
    requireThat(
      record && record.bytes === entry.bytes && record.sha256 === entry.sha256,
      'module-boundary',
    );
    allowed[entry.path] = { bytes: entry.bytes, sha256: entry.sha256 };
    if (entry.path.endsWith('.js')) {
      let directory = path.posix.dirname(entry.path);
      while (
        directory !== '.' &&
        path.posix.basename(directory) !== 'node_modules'
      ) {
        const p = directory + '/package.json',
          record = allPackageFiles.get(p);
        if (record) {
          nearestPackages[entry.path] = { path: p, sha256: record.sha256 };
          break;
        }
        directory = path.posix.dirname(directory);
      }
    }
  }
  const localRequire = createRequire(path.join(runtime, 'package.json'));
  requireThat(
    modulePolicy.seedRequests.length === 2 &&
      same(
        modulePolicy.seedRequests.map((p) => ({
          name: p.specifier,
          path: p.to,
        })),
        closure.loader.roots
          .map((p) => ({ name: p.name, path: p.path }))
          .sort((a, b) => (a.name < b.name ? -1 : 1)),
      ),
    'module-boundary',
  );
  for (const entry of closure.loader.roots)
    requireThat(
      fs.realpathSync(localRequire.resolve(entry.name)) ===
        safePath(runtime, entry.path) &&
        allowed[entry.path]?.sha256 === entry.sha256,
      'module-boundary',
    );
  const originalBytes = retained(
    originals.get(
      '944f0041700de5e2c31ebf0e71b7999df999d76cc6645b3bec38ddfc0f692388',
    ),
  );
  return {
    runtime,
    closure,
    allowed,
    nearestPackages,
    edges: graph.edges,
    builtins: [
      ...new Set(
        graph.edges
          .filter((p) => p.builtin)
          .map((p) => p.specifier.replace(/^node:/u, '')),
      ),
    ].sort(),
    executable: safePath(root, manifest.toolchain.executable.path),
    executableSha256: digestOf(manifest.toolchain.executable),
    manifestRef: {
      path: INPUT + '/metadata/portable-input-manifest.json',
      bytes: manifestBytes.length,
      sha256: 'sha256:' + sha(manifestBytes),
    },
    toolchain: manifest.toolchain,
    producerExecutionIdentity,
    originalBytes,
  };
}

async function observeChild(config) {
  function isCanonicalUnspecifiedCjsFormat(
    file,
    nearestPackage,
    context,
    result,
  ) {
    if (!file || !nearestPackage || !context || !result) return false;
    const normalized = (value) =>
      typeof value === 'string' &&
      !value.includes('\\') &&
      value.split('/').every((part) => part && part !== '.' && part !== '..');
    const digest = (value) =>
      typeof value === 'string' && /^[a-f0-9]{64}$/u.test(value);
    if (
      !normalized(file.relativePath) ||
      !file.relativePath.endsWith('.js') ||
      !normalized(file.nearestPackageJsonPath) ||
      !file.nearestPackageJsonPath.endsWith('/package.json') ||
      file.nearestPackageJsonPath !== nearestPackage.relativePath ||
      !file.relativePath.startsWith(
        file.nearestPackageJsonPath.slice(0, -'package.json'.length),
      ) ||
      !digest(file.expectedSha256) ||
      !digest(file.actualSha256) ||
      file.expectedSha256 !== file.actualSha256 ||
      !digest(file.nearestPackageJsonSha256) ||
      !digest(nearestPackage.actualSha256) ||
      file.nearestPackageJsonSha256 !== nearestPackage.actualSha256 ||
      !nearestPackage.manifest ||
      typeof nearestPackage.manifest !== 'object' ||
      Array.isArray(nearestPackage.manifest) ||
      Object.hasOwn(nearestPackage.manifest, 'type') ||
      context.format !== undefined ||
      result.format !== undefined ||
      !Array.isArray(context.conditions) ||
      !context.conditions.every((condition) => typeof condition === 'string') ||
      !context.conditions.includes('require') ||
      context.conditions.includes('import')
    )
      return false;
    return true;
  }
  const fs = await import('node:fs');
  const path = await import('node:path');
  const crypto = await import('node:crypto');
  const module = await import('node:module');
  const url = await import('node:url');
  const root = config.runtime;
  const hash = (bytes) =>
    crypto.createHash('sha256').update(bytes).digest('hex');
  const violations = [],
    loaded = new Set(),
    resolved = new Set(),
    optionalMisses = [];
  const fail = (boundary) => {
    violations.push(boundary);
    throw new Error(`Observation STOP: ${boundary}`);
  };
  const assertClean = () => {
    if (violations.length)
      throw new Error(`Observation STOP: ${violations[0]}`);
  };
  const allowedBuiltins = new Set(config.builtins);
  const anchor = path.join(root, 'package.json');
  const admittedEdges = new Map();
  const admit = (parent, specifier, target) => {
    const key = JSON.stringify([parent, specifier]);
    if (!admittedEdges.has(key)) admittedEdges.set(key, new Set());
    admittedEdges.get(key).add(target);
  };
  for (const edge of config.edges)
    admit(
      edge.from,
      edge.specifier,
      edge.builtin ? `node:${edge.specifier.replace(/^node:/u, '')}` : edge.to,
    );
  for (const entry of config.roots) admit('__anchor__', entry.name, entry.path);
  const knownMisses = new Set([
    'node_modules/@nestjs/core/nest-application.js|@nestjs/websockets/socket-module',
    'node_modules/@nestjs/core/nest-application.js|@nestjs/microservices/microservices-module',
  ]);
  const verify = (file) => {
    const relative = path.relative(root, file);
    if (
      !file.startsWith(root + path.sep) ||
      relative.startsWith('..') ||
      !config.allowed[relative]
    )
      fail('unknown/outside module file');
    let current = root;
    for (const part of relative.split(path.sep)) {
      current = path.join(current, part);
      if (fs.lstatSync(current).isSymbolicLink()) fail('module symlink');
    }
    const bytes = fs.readFileSync(file),
      record = config.allowed[relative];
    if (
      fs.realpathSync(file) !== file ||
      bytes.length !== record.bytes ||
      hash(bytes) !== record.sha256
    )
      fail('module bytes differ before evaluation');
    return relative;
  };
  // Importing a module is distinct from permission to start an effect. Every
  // denied attempt leaves a flag even when a library catches the exception.
  const deny = (name) =>
    function (..._args) {
      return fail(`prohibited ${name}`);
    };
  const writeObservation = fs.writeFileSync;
  for (const [name, methods] of [
    [
      'node:child_process',
      [
        'spawn',
        'spawnSync',
        'exec',
        'execSync',
        'execFile',
        'execFileSync',
        'fork',
      ],
    ],
    ['node:net', ['connect', 'createConnection', 'createServer']],
    ['node:tls', ['connect', 'createServer']],
    ['node:http', ['request', 'get', 'createServer']],
    ['node:https', ['request', 'get', 'createServer']],
    ['node:dgram', ['createSocket']],
    ['node:dns', ['lookup', 'resolve', 'resolve4', 'resolve6']],
    ['node:worker_threads', ['Worker']],
  ]) {
    const object = module.createRequire(anchor)(name);
    for (const method of methods)
      if (typeof object[method] === 'function')
        object[method] = deny(`${name}.${method}`);
    if (name === 'node:net')
      object.Socket.prototype.connect = deny('net.Socket.connect');
  }
  const fsObject = module.createRequire(anchor)('node:fs');
  for (const method of [
    'writeFile',
    'writeFileSync',
    'appendFile',
    'appendFileSync',
    'rm',
    'rmSync',
    'rmdir',
    'rmdirSync',
    'unlink',
    'unlinkSync',
    'rename',
    'renameSync',
    'mkdir',
    'mkdirSync',
    'truncate',
    'truncateSync',
    'copyFile',
    'copyFileSync',
    'cp',
    'cpSync',
    'chmod',
    'chmodSync',
    'chown',
    'chownSync',
    'link',
    'linkSync',
    'symlink',
    'symlinkSync',
    'createWriteStream',
    'watch',
    'watchFile',
  ])
    if (typeof fsObject[method] === 'function')
      fsObject[method] = deny(`fs.${method}`);
  for (const method of [
    'writeFile',
    'appendFile',
    'rm',
    'rmdir',
    'unlink',
    'rename',
    'mkdir',
    'truncate',
    'copyFile',
    'cp',
    'chmod',
    'chown',
    'link',
    'symlink',
  ])
    if (typeof fsObject.promises[method] === 'function')
      fsObject.promises[method] = deny(`fs.promises.${method}`);
  globalThis.fetch = deny('fetch');
  if (globalThis.WebSocket) globalThis.WebSocket = deny('WebSocket');
  module.syncBuiltinESMExports();
  const hooks = module.registerHooks({
    resolve(specifier, context, nextResolve) {
      const parent = context.parentURL?.startsWith('file:')
        ? url.fileURLToPath(context.parentURL)
        : null;
      const parentKey =
        parent === anchor ? '__anchor__' : parent ? verify(parent) : null;
      const key = `${parentKey}|${specifier}`;
      const expected = admittedEdges.get(
        JSON.stringify([parentKey, specifier]),
      );
      const optionalMiss = knownMisses.has(key);
      if (!expected && !optionalMiss) fail('unadmitted module edge');
      const builtin = specifier.replace(/^node:/u, '');
      if (module.isBuiltin(specifier) && !allowedBuiltins.has(builtin))
        fail('unadmitted builtin');
      let result;
      try {
        result = nextResolve(specifier, context);
      } catch (error) {
        if (
          optionalMiss &&
          ['MODULE_NOT_FOUND', 'ERR_MODULE_NOT_FOUND'].includes(error.code)
        ) {
          optionalMisses.push(key);
          throw error;
        }
        fail('unadmitted missing/dynamic module request');
      }
      if (optionalMiss) fail('unexpected optional module resolution');
      if (result.url.startsWith('node:')) {
        if (
          !allowedBuiltins.has(result.url.slice(5)) ||
          !expected.has(result.url)
        )
          fail('unadmitted builtin resolution');
      } else {
        if (!result.url.startsWith('file:')) fail('non-file module resolution');
        const relative = verify(url.fileURLToPath(result.url));
        if (!expected.has(relative)) fail('module edge target differs');
        resolved.add(relative);
      }
      return result;
    },
    load(address, context, nextLoad) {
      if (address.startsWith('node:')) {
        if (!allowedBuiltins.has(address.slice(5)))
          fail('unadmitted builtin load');
        return nextLoad(address, context);
      }
      if (!address.startsWith('file:')) fail('non-file module load');
      const file = url.fileURLToPath(address),
        relative = verify(file);
      const result = nextLoad(address, context);
      let actualSha256 = hash(fs.readFileSync(file));
      if (result.source !== undefined && result.source !== null) {
        const bytes =
          typeof result.source === 'string'
            ? Buffer.from(result.source)
            : Buffer.from(
                result.source.buffer ?? result.source,
                result.source.byteOffset ?? 0,
                result.source.byteLength,
              );
        actualSha256 = hash(bytes);
        if (actualSha256 !== config.allowed[relative].sha256)
          fail('transformed module source');
      }
      if (!['commonjs', 'module', 'json'].includes(result.format)) {
        const nearest = config.nearestPackages[relative];
        let nearestPackage = null;
        if (nearest) {
          const packageFile = path.join(root, nearest.path);
          let current = root;
          for (const part of nearest.path.split('/')) {
            current = path.join(current, part);
            if (fs.lstatSync(current).isSymbolicLink())
              fail('nearest package symlink');
          }
          const packageBytes = fs.readFileSync(packageFile);
          if (
            fs.realpathSync(packageFile) !== packageFile ||
            hash(packageBytes) !== nearest.sha256
          )
            fail('nearest package bytes differ');
          let manifest;
          try {
            manifest = JSON.parse(packageBytes.toString('utf8'));
          } catch {
            fail('nearest package manifest malformed');
          }
          nearestPackage = {
            relativePath: nearest.path,
            actualSha256: hash(packageBytes),
            manifest,
          };
        }
        if (
          !isCanonicalUnspecifiedCjsFormat(
            {
              relativePath: relative,
              expectedSha256: config.allowed[relative].sha256,
              actualSha256,
              nearestPackageJsonPath: nearest?.path,
              nearestPackageJsonSha256: nearest?.sha256,
            },
            nearestPackage,
            context,
            result,
          )
        )
          fail(
            `unadmitted module format: ${relative} (${String(result.format)})`,
          );
      }
      loaded.add(relative);
      return result;
    },
  });
  try {
    const requireRuntime = module.createRequire(anchor);
    const outbox = requireRuntime('@stynx-nyx/outbox');
    assertClean();
    const offline = requireRuntime('@stynx-nyx/offline-sync');
    assertClean();
    for (const [api, name] of [
      [outbox, 'renderOutboxStorage'],
      [offline, 'renderOfflineStorage'],
      [offline, 'renderOfflineStorageMigrations'],
    ])
      if (typeof api[name] !== 'function') fail('missing public renderer');
    const render = () => ({
      outbox: outbox.renderOutboxStorage(config.binding),
      offline: offline.renderOfflineStorage(config.binding),
      offlineMigrations: offline.renderOfflineStorageMigrations(config.binding),
    });
    const result = render();
    assertClean();
    if (JSON.stringify(render()) !== JSON.stringify(result))
      fail('nondeterministic public renderers');
    assertClean();
    for (const file of Object.keys(requireRuntime.cache)) verify(file);
    for (const relative of new Set([...loaded, ...resolved]))
      verify(path.join(root, relative));
    assertClean();
    writeObservation(
      1,
      JSON.stringify({
        result,
        observation: {
          loaded: [...loaded].sort(),
          resolved: [...resolved].sort(),
          optionalMisses: [...new Set(optionalMisses)].sort(),
        },
      }),
    );
  } finally {
    hooks.deregister();
  }
}

let attemptDirectory = null;
function writeAttempt(name, bytes) {
  requireThat(
    attemptDirectory !== null &&
      [
        'child-stdout.raw',
        'child-stderr.raw',
        'child-process-result.json',
        'disposition.json',
      ].includes(name),
    'unexpected-effect',
  );
  const full = safePath(
    root,
    path.relative(root, path.join(attemptDirectory, name)),
    { absent: true },
  );
  const fd = fs.openSync(full, 'wx');
  try {
    fs.writeFileSync(fd, bytes);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  return {
    path: path.relative(root, full),
    bytes: bytes.length,
    sha256: 'sha256:' + sha(bytes),
  };
}
function retainChildProcess(child) {
  const stdout = child.stdout ?? Buffer.alloc(0),
    stderr = child.stderr ?? Buffer.alloc(0);
  requireThat(
    Buffer.isBuffer(stdout) && Buffer.isBuffer(stderr),
    'invalid-document',
  );
  const stdoutRef = writeAttempt('child-stdout.raw', stdout),
    stderrRef = writeAttempt('child-stderr.raw', stderr);
  const result = {
    pid: child.pid ?? null,
    exitCode: child.status,
    signal: child.signal,
    error: child.error
      ? {
          name: child.error.name,
          code: child.error.code ?? null,
          message: child.error.message,
        }
      : null,
    stdoutBytes: stdout.length,
    stderrBytes: stderr.length,
    maxBufferBytes: 64 * 1024 * 1024,
    timeoutMs: 60000,
    captureMayBeIncomplete: Boolean(child.error),
  };
  const processRef = writeAttempt(
    'child-process-result.json',
    Buffer.from(JSON.stringify(result, null, 2) + '\n'),
  );
  return { stdout: stdoutRef, stderr: stderrRef, processResult: processRef };
}
function selectProjectionRuntimeProfile(root, runtimeInputs) {
  if (!Object.hasOwn(process.env, 'DETRAN_STYNX_PROJECTOR_EXECUTION_SHA'))
    return {
      profile: 'ordinary-empty',
      proofReference: null,
      actualProcess: null,
    };
  const submitted = process.env.DETRAN_STYNX_PROJECTOR_EXECUTION_SHA;
  requireThat(
    typeof EMULATED_RUNTIME_PROOF_SHA256 === 'string' &&
      /^[a-f0-9]{64}$/u.test(EMULATED_RUNTIME_PROOF_SHA256) &&
      submitted === EMULATED_RUNTIME_PROOF_SHA256,
    'public-api',
  );
  const proofBytes = bytesAt(root, emulatedProofPath);
  requireThat(sha(proofBytes) === EMULATED_RUNTIME_PROOF_SHA256, 'public-api');
  const proof = strictJson(proofBytes);
  keys(proof, [
    'formatVersion',
    'kind',
    'issuer',
    'role',
    'status',
    'maximumInvocations',
    'sourceBeforeProof',
    'probeEvidence',
    'container',
    'processExpected',
    'invocation',
    'limits',
  ]);
  requireThat(
    proof.formatVersion === 1 &&
      proof.kind === 'reviewed-emulated-projector-runtime-proof' &&
      proof.issuer === '/root' &&
      proof.role === 'Engineer' &&
      proof.status === 'ADMITTED_ONE_EMULATED_PROJECTION' &&
      proof.maximumInvocations === 1,
    'public-api',
  );
  const disabledSource = bound(proof.sourceBeforeProof);
  requireThat(
    proof.sourceBeforeProof.path ===
      'tools/stynx-storage/retained-observations/projector-emulated-disabled-source.mjs.raw',
    'public-api',
  );
  const sourceBytes = fs.readFileSync(projectorSourceFile);
  const declaration =
    /const EMULATED_RUNTIME_PROOF_SHA256 =\s*'[a-f0-9]{64}';/gu;
  const sourceText = sourceBytes.toString('utf8');
  requireThat([...sourceText.matchAll(declaration)].length === 1, 'public-api');
  requireThat(
    Buffer.from(
      sourceText.replace(
        declaration,
        'const EMULATED_RUNTIME_PROOF_SHA256 = null;',
      ),
    ).equals(disabledSource),
    'public-api',
  );
  requireThat(
    Array.isArray(proof.probeEvidence) && proof.probeEvidence.length === 5,
    'public-api',
  );
  const names = [
    'diagnosis.json.raw',
    'stderr.log.raw',
    'invocation.json.raw',
    'node.json.raw',
    'container-inspect.json.raw',
  ];
  const probes = proof.probeEvidence.map((ref, i) => {
    requireThat(
      ref.path ===
        'tools/stynx-storage/retained-observations/linux-emulated-probe/' +
          names[i],
      'public-api',
    );
    return bound(ref);
  });
  const diagnosis = strictJson(probes[0]),
    priorInvocation = strictJson(probes[2]),
    nodeObservation = strictJson(probes[3]);
  requireThat(
    diagnosis.kind === 'actual-builtin-only-QEMU-scheduler-trace-diagnosis' &&
      diagnosis.guestErrno === 38 &&
      diagnosis.EPERMObservedForScheduler === false &&
      diagnosis.sdkPackagesTestsSqlNetworkExecuted === false &&
      diagnosis.rawTrace.sha256 === proof.probeEvidence[1].sha256 &&
      diagnosis.invocation.sha256 === proof.probeEvidence[2].sha256 &&
      diagnosis.nodeObservation.sha256 === proof.probeEvidence[3].sha256 &&
      priorInvocation.cliExit === 0 &&
      priorInvocation.containerExit === 0 &&
      priorInvocation.sdkPackageImportsSqlExecuted === false,
    'public-api',
  );
  keys(proof.container, [
    'id',
    'imageId',
    'imageDigest',
    'inspect',
    'hostname',
    'hostArchitecture',
    'guestArchitecture',
  ]);
  const container = proof.container;
  requireThat(
    /^[a-f0-9]{64}$/u.test(container.id) &&
      container.imageId ===
        'sha256:570db3b6276873f9cd226ce399a53f04e8191b69906e0df694cedaa25bc1e3cb' &&
      container.imageDigest ===
        'postgres@sha256:d32327f755bcd7d850eddf4880835c93d2294a2de1989e7123f5866ff0072f96' &&
      container.hostArchitecture === 'aarch64' &&
      container.guestArchitecture === 'x86_64' &&
      container.hostname === container.id.slice(0, 12),
    'public-api',
  );
  requireThat(
    container.inspect.path ===
      'tools/stynx-storage/retained-observations/linux-emulated-projector-container-inspect.json.raw',
    'public-api',
  );
  const inspected = strictJson(bound(container.inspect));
  requireThat(Array.isArray(inspected) && inspected.length === 1, 'public-api');
  const context = inspected[0],
    hc = context.HostConfig;
  requireThat(
    context.Id === container.id &&
      context.Image === container.imageId &&
      context.Config.Hostname === container.hostname &&
      context.Config.User === '999:999' &&
      context.Config.Image === container.imageDigest &&
      equal(Object.keys(context.Config.Volumes ?? {}), [
        '/var/lib/postgresql',
      ]) &&
      context.Path === '/bin/sleep' &&
      equal(context.Args, ['infinity']) &&
      context.State.Running === true &&
      hc.NetworkMode === 'none' &&
      hc.ReadonlyRootfs === true &&
      hc.Privileged === false &&
      equal(hc.CapDrop, ['ALL']) &&
      (hc.CapAdd === null || equal(hc.CapAdd, [])) &&
      equal(hc.SecurityOpt, ['no-new-privileges']) &&
      (hc.PortBindings === null || equal(hc.PortBindings, {})) &&
      hc.PublishAllPorts === false,
    'public-api',
  );
  const mounts = context.Mounts;
  requireThat(Array.isArray(mounts) && mounts.length === 5, 'public-api');
  const mountByTarget = new Map(mounts.map((m) => [m.Destination, m]));
  requireThat(mountByTarget.size === 5, 'public-api');
  const inputPath = path.join(root, INPUT),
    outputPath = path.dirname(inputPath);
  const sourceMount = mountByTarget.get(root),
    inputMount = mountByTarget.get(inputPath),
    nodeMount = mountByTarget.get('/node'),
    outputMount = mountByTarget.get(outputPath),
    pgDataMount = mountByTarget.get('/var/lib/postgresql');
  requireThat(
    sourceMount?.Type === 'volume' &&
      sourceMount.Name === 'detran-r22-161-projector-source01' &&
      sourceMount.RW === false &&
      inputMount?.Type === 'bind' &&
      inputMount.RW === false &&
      nodeMount?.Type === 'bind' &&
      nodeMount.RW === false &&
      outputMount?.Type === 'volume' &&
      outputMount.Name === 'detran-r22-161-projector-output01' &&
      outputMount.RW === true &&
      pgDataMount?.Type === 'volume' &&
      pgDataMount.Name === 'detran-r22-161-projector-pgdata01' &&
      pgDataMount.RW === false,
    'public-api',
  );
  keys(proof.processExpected, [
    'repositoryRoot',
    'hostname',
    'executablePath',
    'nodeVersion',
    'nodeSha256',
    'platform',
    'arch',
    'uid',
    'gid',
    'loaders',
  ]);
  const expected = proof.processExpected,
    loaderNames = [
      'internal/modules/cjs/loader',
      'internal/modules/customization_hooks',
      'internal/modules/helpers',
    ];
  keys(expected.loaders, loaderNames);
  const officialNodeSha =
    '89af8424dd53e560b1933f87ba650d8bf57c83ca5a04600eefb31f416aabbae7';
  requireThat(
    expected.repositoryRoot === root &&
      root === '/repo' &&
      expected.hostname === container.hostname &&
      expected.executablePath === '/node' &&
      expected.nodeVersion === 'v24.20.0' &&
      expected.nodeSha256 === officialNodeSha &&
      expected.platform === 'linux' &&
      expected.arch === 'x64' &&
      expected.uid === 999 &&
      expected.gid === 999 &&
      equal(expected.loaders, diagnosis.sourceProof.embeddedSources),
    'public-api',
  );
  requireThat(
    process.platform === expected.platform &&
      process.arch === expected.arch &&
      process.version === expected.nodeVersion &&
      fs.realpathSync(process.execPath) === expected.executablePath &&
      sha(fs.readFileSync(process.execPath)) === expected.nodeSha256 &&
      process.getuid() === expected.uid &&
      process.getgid() === expected.gid &&
      os.hostname() === expected.hostname &&
      fs.readFileSync('/etc/hostname', 'utf8') === expected.hostname + '\n',
    'public-api',
  );
  const status = fs.readFileSync('/proc/self/status', 'utf8'),
    statusKeys = {
      CapInh: '0000000000000000',
      CapPrm: '0000000000000000',
      CapEff: '0000000000000000',
      CapBnd: '0000000000000000',
      CapAmb: '0000000000000000',
      NoNewPrivs: '1',
      Seccomp: '2',
    };
  for (const [key, value] of Object.entries(statusKeys)) {
    const rows = status
      .split('\n')
      .filter((line) => line.startsWith(key + ':'));
    requireThat(
      rows.length === 1 && rows[0].slice(key.length + 1).trim() === value,
      'public-api',
    );
  }
  const nativeSources = process.binding('natives'),
    actualLoaders = {};
  for (const name of loaderNames) {
    requireThat(typeof nativeSources[name] === 'string', 'public-api');
    actualLoaders[name] = sha(Buffer.from(nativeSources[name]));
  }
  requireThat(equal(actualLoaders, expected.loaders), 'public-api');
  requireThat(
    nodeObservation.version === expected.nodeVersion ||
      nodeObservation.nodeVersion === expected.nodeVersion,
    'public-api',
  );
  keys(proof.invocation, [
    'argvTemplate',
    'workingDirectory',
    'environmentTemplate',
    'createRecord',
  ]);
  requireThat(
    equal(proof.invocation.argvTemplate, [
      '/node',
      '/repo/tools/stynx-storage-project-published.mjs',
      '/repo',
    ]) &&
      proof.invocation.workingDirectory === root &&
      equal(proof.invocation.environmentTemplate, {
        LANG: 'C',
        LC_ALL: 'C',
        TZ: 'UTC',
        DETRAN_STYNX_PROJECTOR_EXECUTION_SHA: '<sha256-of-this-record>',
      }),
    'public-api',
  );
  requireThat(
    proof.invocation.createRecord.path ===
      'tools/stynx-storage/retained-observations/linux-emulated-projector-create-record.json.raw',
    'public-api',
  );
  bound(proof.invocation.createRecord);
  requireThat(
    equal(process.argv, proof.invocation.argvTemplate) &&
      process.cwd() === root &&
      process.execArgv.length === 0 &&
      process.env.LANG === 'C' &&
      process.env.LC_ALL === 'C' &&
      process.env.TZ === 'UTC',
    'public-api',
  );
  keys(proof.limits, [
    'nativeCiAcceptance',
    'productionAdmission',
    'sdkExecutedInProbe',
    'sqlAccess',
    'capabilityOrSeccompChange',
  ]);
  requireThat(
    Object.values(proof.limits).every((value) => value === false),
    'public-api',
  );
  requireThat(
    runtimeInputs.executableSha256 === expected.nodeSha256 &&
      runtimeInputs.toolchain.platform === expected.platform &&
      runtimeInputs.toolchain.arch === expected.arch,
    'public-api',
  );
  return {
    profile: 'reviewed-emulated-linux-node24',
    proofReference: {
      path: emulatedProofPath,
      bytes: proofBytes.length,
      sha256: 'sha256:' + sha(proofBytes),
    },
    actualProcess: {
      pid: process.pid,
      hostname: os.hostname(),
      uid: process.getuid(),
      gid: process.getgid(),
      executablePath: fs.realpathSync(process.execPath),
      nodeSha256: expected.nodeSha256,
      loaders: actualLoaders,
      capabilities: statusKeys,
      containerId: container.id,
      nativeCiAcceptance: false,
    },
  };
}
function classifyProjectionChildStderr(stderr, runtimeProfile) {
  requireThat(
    Buffer.isBuffer(stderr) &&
      stderr.length <= 64 * 1024 * 1024 &&
      (runtimeProfile === 'ordinary-empty' ||
        runtimeProfile === 'reviewed-emulated-linux-node24'),
    'public-api',
  );
  if (stderr.length === 0) return { kind: 'empty', diagnosticLines: 0 };
  requireThat(
    runtimeProfile === 'reviewed-emulated-linux-node24',
    'public-api',
  );
  const literal = Buffer.from(
    '[mutex.cc : 955] RAW: pthread_getschedparam failed: 1\n',
    'utf8',
  );
  requireThat(stderr.length % literal.length === 0, 'public-api');
  const diagnosticLines = stderr.length / literal.length;
  requireThat(
    Number.isSafeInteger(diagnosticLines) && diagnosticLines > 0,
    'public-api',
  );
  for (let offset = 0; offset < stderr.length; offset += literal.length)
    requireThat(
      stderr.subarray(offset, offset + literal.length).equals(literal),
      'public-api',
    );
  return { kind: 'emulated-node-scheduler-diagnostic', diagnosticLines };
}
function projection(root, runtimeInputs) {
  const runtimeAuthority = selectProjectionRuntimeProfile(root, runtimeInputs);
  const executable = runtimeInputs.executable;
  check(
    sha(fs.readFileSync(executable)) === runtimeInputs.executableSha256,
    'Child executable changed',
  );
  const config = {
    runtime: runtimeInputs.runtime,
    allowed: runtimeInputs.allowed,
    builtins: runtimeInputs.builtins,
    edges: runtimeInputs.edges,
    nearestPackages: runtimeInputs.nearestPackages,
    roots: runtimeInputs.closure.loader.roots.map(({ name, path }) => ({
      name,
      path,
    })),
    binding,
  };
  const child = spawnSync(executable, ['--input-type=module', '-'], {
    cwd: runtimeInputs.runtime,
    env: { LANG: 'C', LC_ALL: 'C', TZ: 'UTC' },
    input: `await (${observeChild.toString()})(${JSON.stringify(config)});\n`,
    timeout: 60000,
    maxBuffer: 64 * 1024 * 1024,
  });
  const childEvidence = retainChildProcess(child);
  check(
    !child.error && child.status === 0 && child.signal === null,
    `Fixed observation child refused: ${child.error?.code ?? child.stderr.slice(0, 1200)}`,
  );
  const stderrClassification = classifyProjectionChildStderr(
    child.stderr,
    runtimeAuthority.profile,
  );
  if (runtimeAuthority.proofReference) bound(runtimeAuthority.proofReference);
  const observed = strictJson(Buffer.from(child.stdout), 'Fixed child output');
  keys(observed, ['result', 'observation'], 'Fixed child result');
  keys(
    observed.result,
    ['outbox', 'offline', 'offlineMigrations'],
    'Public result set',
  );
  const { outbox, offline, offlineMigrations } = observed.result;
  for (const artifact of [outbox, offline]) {
    keys(
      artifact,
      [
        'contractVersion',
        'packageVersion',
        'binding',
        'objectsSql',
        'roleBindingsSql',
        'manifest',
      ],
      'Public fresh artifact',
    );
    check(
      artifact.packageVersion === '1.6.1' &&
        artifact.contractVersion === '1.0.0' &&
        equal(artifact.binding, binding) &&
        typeof artifact.objectsSql === 'string' &&
        typeof artifact.roleBindingsSql === 'string',
      'Public artifact binding/version differs',
    );
  }
  keys(
    offlineMigrations,
    ['contractVersion', 'packageVersion', 'binding', 'migrations'],
    'Public ordered artifact',
  );
  check(
    offlineMigrations.packageVersion === '1.6.1' &&
      offlineMigrations.contractVersion === '1.0.0' &&
      equal(offlineMigrations.binding, binding) &&
      offlineMigrations.migrations.length === 9,
    'Public migration inventory differs',
  );
  const migrationDigests = offlineMigrations.migrations.map(
    (migration, index) => {
      keys(migration, ['source', 'sql', 'sqlSha256'], 'Public migration');
      keys(migration.source, ['path', 'sha256'], 'Public migration source');
      const filename = migrationNames[index],
        expectedPath = `packages/offline-sync/migrations/${filename}`;
      const raw = bytesAt(
        root,
        `${INPUT}/target/runtime/node_modules/@stynx-nyx/offline-sync/migrations/${filename}`,
      );
      check(
        migration.source.path === expectedPath &&
          migration.source.sha256 === rawMigrationHashes[index] &&
          sha(raw) === rawMigrationHashes[index] &&
          typeof migration.sql === 'string' &&
          sha(migration.sql) === migration.sqlSha256,
        'Raw/bound migration provenance differs',
      );
      return {
        sourcePath: expectedPath,
        rawSqlSha256: sha(raw),
        boundSqlSha256: sha(migration.sql),
      };
    },
  );
  const artifactDigests = (artifact) => ({
    objectsSqlSha256: sha(artifact.objectsSql),
    roleBindingsSqlSha256: sha(artifact.roleBindingsSql),
    manifestSha256: sha(canonical(artifact.manifest)),
  });
  return {
    document: {
      formatVersion: 1,
      publication: {
        ...publication,
        protectedVerification: {
          path: 'protected-publication-verification.json',
          sha256: seals.protected,
        },
      },
      binding,
      inputs: {
        retentionManifestSha256: seals.retention,
        runtimeClosureManifestSha256: seals.closure,
      },
      outbox,
      offline,
      offlineMigrations,
      digests: {
        outbox: artifactDigests(outbox),
        offline: artifactDigests(offline),
        offlineMigrations: migrationDigests,
      },
    },
    observation: {
      ...observed.observation,
      childPid: child.pid,
      childExit: child.status,
      childSignal: child.signal,
      childEvidence,
      stderrClassification,
      runtimeAuthority,
    },
  };
}

try {
  requireThat(
    process.argv.length === 3 &&
      process.argv[2] === root &&
      fs.realpathSync(root) === root,
    'invalid-cli',
  );
  requireThat(
    process.execArgv.length === 0 &&
      ['NODE_OPTIONS', 'NODE_PATH', 'NODE_PG_FORCE_NATIVE'].every(
        (key) => !Object.hasOwn(process.env, key),
      ),
    'ambient-loader',
  );
  for (const [name, value] of Object.entries(process.env))
    if (
      value &&
      /^(?:DYLD_.*|LD_.*|ESBUILD_BINARY_PATH|ROLLDOWN_.*)$/u.test(name)
    )
      throw new Refusal('ambient-loader');
  const directory = safePath(
    root,
    'scratch/r22-adoption-161/portable-ci/retention-03/projection',
    { absent: true },
  );
  requireThat(!fs.existsSync(directory), 'output-exists');
  const inputs = preflight();
  // The fixed attempt is exclusive and retained even if the SDK child refuses.
  fs.mkdirSync(directory);
  attemptDirectory = path.join(directory, 'attempt-01');
  fs.mkdirSync(attemptDirectory);
  const result = projection(root, inputs);
  const documentBytes = Buffer.from(
    JSON.stringify(result.document, null, 2) + '\n',
  );
  requireThat(
    documentBytes.equals(inputs.originalBytes),
    'projection-mismatch',
  );
  const after = preflight();
  requireThat(equal(after.manifestRef, inputs.manifestRef), 'input-identity');
  const observation = {
    kind: 'actual-portable-public-storage-projection',
    actualRepositoryRoot: root,
    producerManifest: inputs.manifestRef,
    producerExecutionIdentity: inputs.producerExecutionIdentity,
    policy: { path: POLICY, sha256: 'sha256:' + POLICY_SHA256 },
    sources: {
      producerSha256: 'sha256:' + PRODUCER_SHA256,
      validatorSha256: 'sha256:' + VALIDATOR_SHA256,
      projectorSha256:
        'sha256:' + sha(fs.readFileSync(fileURLToPath(import.meta.url))),
    },
    actualNode: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      executablePath: process.execPath,
      executableSha256: 'sha256:' + sha(fs.readFileSync(process.execPath)),
    },
    toolchain: inputs.toolchain,
    child: result.observation,
    beforeAfterAdmission: 'exact policy/payload/graph/topology rehashed',
    sdkExecuted: true,
    databaseAccessed: false,
    ciAcceptance: false,
    providerAdmission: false,
    approvedTrustAdmission: false,
  };
  for (const reference of Object.values(result.observation.childEvidence))
    bound(reference);
  function write(name, bytes) {
    const full = path.join(directory, name);
    const fd = fs.openSync(full, 'wx');
    try {
      fs.writeFileSync(fd, bytes);
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    return {
      path: path.relative(root, full),
      bytes: bytes.length,
      sha256: 'sha256:' + sha(bytes),
    };
  }
  const projectionRef = write('public-storage-projection.json', documentBytes),
    observationRef = write(
      'import-observation.json',
      Buffer.from(JSON.stringify(observation, null, 2) + '\n'),
    );
  process.stdout.write(
    JSON.stringify({
      status: 'PUBLIC_STORAGE_PROJECTION_VERIFIED',
      projection: projectionRef,
      observation: observationRef,
    }) + '\n',
  );
} catch (error) {
  const reasons = new Set([
    'invalid-cli',
    'ambient-loader',
    'policy-unavailable',
    'invalid-document',
    'input-identity',
    'archive-integrity',
    'payload-inventory',
    'path-topology',
    'toolchain-identity',
    'module-boundary',
    'public-api',
    'projection-mismatch',
    'output-exists',
    'unavailable-input',
    'unexpected-effect',
  ]);
  const reason =
    (error instanceof Refusal ||
      error instanceof ArchiveValidationError ||
      error instanceof PackageDependencyMetadataError) &&
    reasons.has(error.reason)
      ? error.reason
      : 'unavailable-input';
  if (attemptDirectory !== null) {
    try {
      writeAttempt(
        'disposition.json',
        Buffer.from(
          JSON.stringify(
            {
              status: 'STOP',
              reason,
              sdkAcceptance: false,
              automaticRerun: false,
            },
            null,
            2,
          ) + '\n',
        ),
      );
    } catch {
      /* Preserve first available raw attempt bytes; typed CLI refusal remains. */
    }
  }
  process.stderr.write('R22_PUBLISHED_PROJECTION_REFUSED:' + reason + '\n');
  process.exitCode = 1;
}
