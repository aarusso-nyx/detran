// Builtin-only documentary validation of retained portable plan bytes.
// It neither selects a current runtime nor executes any SDK/SQL/child/network.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
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
const POLICY = 'tools/stynx-storage/fixtures/ci-admission-policy.json';
export function validatePortableStoragePlanRealm(exactRoot) {
  requireThat(
    typeof exactRoot === 'string' && path.isAbsolute(exactRoot),
    'invalid-root',
  );
  const root = fs.realpathSync(path.resolve(exactRoot));
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
          requireThat(
            stat.isFile() && files.has(relative),
            'payload-inventory',
          );
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
      requireThat(
        declared.size === wrapper.packages.length,
        'payload-inventory',
      );
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
            current.manifest.path ===
              INPUT + '/' + item.root + '/package.json' &&
            current.manifest.bytes === item.manifest.bytes &&
            current.manifest.sha256 === item.manifest.sha256,
          'payload-inventory',
        );
        const packageJson = strictJson(packageBytes);
        requireThat(
          packageJson.name === item.name &&
            packageJson.version === item.version,
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
      manifest.toolchain.platform === 'darwin' &&
      manifest.toolchain.arch === 'arm64'
        ? 'darwinArm64'
        : manifest.toolchain.platform === 'linux' &&
            manifest.toolchain.arch === 'x64'
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
      manifest.toolchain.platform === toolProof.platform &&
        manifest.toolchain.arch === toolProof.arch &&
        manifest.toolchain.version === '24.20.0',
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
        loaders.version === 'v' + manifest.toolchain.version &&
        loaders.platform === manifest.toolchain.platform &&
        loaders.arch === manifest.toolchain.arch &&
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
        same(
          observation.officialToolchainProof,
          policy.toolchains[platformKey],
        ),
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
      // Documentary producer root is retained unchanged, including pure copied-root fixtures.
      // Current-runtime actual-root comparison remains in the public projector/installer.
      bound(recordedSource);
      producerExecutionIdentity = {
        kind: 'documentary-current-source-observation',
        observed: recordedSource,
        observedRepositoryRoot: manifest.repository.root,
      };
    } else {
      // This is one finite historical Darwin03 observation, never a platform fallback.
      requireThat(
        manifest.toolchain.platform === 'darwin' &&
          manifest.toolchain.arch === 'arm64' &&
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
          currentText.replace(wrapped, single) ===
            recordedBytes.toString('utf8'),
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
      observation.node.version === 'v' + manifest.toolchain.version &&
        observation.node.platform === manifest.toolchain.platform &&
        observation.node.arch === manifest.toolchain.arch &&
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
      const current = targetWrapper.packages.find(
        (p) => p.context === item.path,
      );
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
        record &&
          record.bytes === entry.bytes &&
          record.sha256 === entry.sha256,
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
      manifest,
      policy,
      targetWrapper,
      priorWrapper,
    };
  }

  return preflight();
}

// These are internal consumer data checks. Factory input refs were already sealed.
function retainedDocument(root, ref) {
  closed(ref, ['path', 'bytes', 'sha256']);
  const data = bytesAt(root, ref.path);
  requireThat(
    data.length === ref.bytes && 'sha256:' + sha(data) === ref.sha256,
    'input-identity',
  );
  return strictJson(data);
}
function originalByHash(root, wrapper, hash) {
  const rows = wrapper.originalEvidence.filter(
    (ref) => ref.sha256 === 'sha256:' + hash,
  );
  requireThat(rows.length === 1, 'input-identity');
  return retainedDocument(root, rows[0]);
}
export function verifyPortablePriorClosure(root, originalClosure) {
  const state = validatePortableStoragePlanRealm(root);
  const admitted = originalByHash(
    root,
    state.priorWrapper,
    '55454077278d8c60ac6abcb8b829fcc8bbcaa88efe09e1a2f0e07eb26f879f5d',
  );
  requireThat(
    equal(originalClosure, admitted) && admitted.sourceVersion === '1.6.0',
    'input-identity',
  );
  const capture = originalByHash(
    root,
    state.priorWrapper,
    admitted.installedCapture.sha256,
  );
  const provenance = originalByHash(
    root,
    state.priorWrapper,
    admitted.packageProvenance.sha256,
  );
  const graph = originalByHash(
    root,
    state.priorWrapper,
    admitted.staticGraph.sha256,
  );
  requireThat(
    capture.files.length === 21624 &&
      capture.links.length === 455 &&
      capture.packageCount === 176 &&
      graph.files.length === 2435 &&
      provenance.packages.length === 176,
    'payload-inventory',
  );
  const files = new Map(
    state.manifest.prior.files.map((file) => [file.path, file]),
  );
  const matched = new Set();
  for (const file of [...capture.files, admitted.priorPublishedRootCustody]) {
    const logical = INPUT + '/prior/' + file.path;
    const actual = files.get(logical);
    requireThat(
      actual &&
        actual.bytes === file.bytes &&
        actual.sha256 === 'sha256:' + file.sha256 &&
        !matched.has(logical),
      'payload-inventory',
    );
    matched.add(logical);
  }
  requireThat(matched.size === 21625, 'payload-inventory');
  const links = new Map(
    state.manifest.prior.links.map((link) => [link.path, link]),
  );
  for (const link of capture.links) {
    const actual = links.get(INPUT + '/prior/' + link.path);
    requireThat(
      actual &&
        actual.target === link.literal &&
        actual.resolvedPath === INPUT + '/prior/' + link.resolved,
      'path-topology',
    );
  }
  for (const file of graph.files) {
    const actual = files.get(INPUT + '/prior/runtime/' + file.path);
    requireThat(
      actual &&
        actual.bytes === file.bytes &&
        actual.sha256 === 'sha256:' + file.sha256,
      'module-boundary',
    );
  }
  const contexts = new Map(
    state.manifest.prior.packages.map((pkg) => [pkg.context, pkg]),
  );
  let matchedContexts = 0;
  for (const pkg of provenance.packages) {
    for (const context of pkg.contexts) {
      const actual = contexts.get(context);
      requireThat(
        actual &&
          actual.name === pkg.name &&
          actual.version === pkg.version &&
          actual.archive.bytes === pkg.archive.bytes &&
          actual.archive.sha256 === 'sha256:' + pkg.archive.sha256,
        'archive-integrity',
      );
      const registry = retainedDocument(root, actual.registry);
      requireThat(
        registry.sourceObservation.sourcePath ===
          'scratch/r22-adoption-161/prior-runtime/' + pkg.registry.path &&
          registry.sourceObservation.sourceBytes === pkg.registry.bytes &&
          registry.sourceObservation.sourceSha256 ===
            'sha256:' + pkg.registry.sha256 &&
          registry.sourceObservation.observedAt === null &&
          registry.versionRecord.dist.integrity === pkg.archive.integrity &&
          registry.versionRecord.dist.shasum === pkg.archive.shasum,
        'input-identity',
      );
      matchedContexts++;
    }
  }
  requireThat(matchedContexts === 176, 'payload-inventory');
}
export function verifyPortableTargetRetention(root, originalRetention) {
  const state = validatePortableStoragePlanRealm(root);
  const admitted = originalByHash(root, state.targetWrapper, seals.retention);
  requireThat(
    equal(originalRetention, admitted) && admitted.packages.length === 27,
    'input-identity',
  );
  const files = new Map(
    state.manifest.target.files.map((file) => [file.path, file]),
  );
  let total = 0;
  for (const pkg of admitted.packages) {
    const rows = state.manifest.target.packages.filter(
      (item) => item.name === pkg.name && item.version === pkg.version,
    );
    requireThat(rows.length === 1, 'payload-inventory');
    const actual = rows[0];
    requireThat(
      actual.archive.bytes === pkg.archive.bytes &&
        actual.archive.sha256 === 'sha256:' + pkg.archive.sha256,
      'archive-integrity',
    );
    const registry = retainedDocument(root, actual.registry);
    requireThat(
      registry.sourceObservation.sourcePath ===
        'scratch/r22-adoption-161/package-admission/' +
          pkg.registryMetadata.path &&
        registry.sourceObservation.sourceBytes === pkg.registryMetadata.bytes &&
        registry.sourceObservation.sourceSha256 ===
          'sha256:' + pkg.registryMetadata.sha256 &&
        registry.sourceObservation.observedAt ===
          pkg.registryMetadata.observedAt &&
        registry.versionRecord.dist.integrity === pkg.dist.integrity &&
        registry.versionRecord.dist.shasum === pkg.dist.shasum,
      'input-identity',
    );
    for (const file of pkg.extraction.regularFiles) {
      requireThat(file.path.startsWith('package/'), 'path-topology');
      const record = files.get(
        actual.root + '/' + file.path.slice('package/'.length),
      );
      requireThat(
        record &&
          record.bytes === file.bytes &&
          record.sha256 === 'sha256:' + file.sha256,
        'payload-inventory',
      );
      total++;
    }
  }
  requireThat(total === 4926, 'payload-inventory');
}
