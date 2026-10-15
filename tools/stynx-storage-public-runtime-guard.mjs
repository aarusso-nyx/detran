// Private public-storage installed-realm guard. Its descriptor is a reviewed
// release input; this module cannot turn a locally produced draft into one.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import * as modules from 'node:module';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

// Guard-internal metadata reads retain their original APIs before SDK effects
// are wrapped. An SDK ancestor frame cannot turn a guard validation into SDK IO.
const privateOpen = fs.openSync.bind(fs),
  privateStat = fs.fstatSync.bind(fs),
  privateRead = fs.readSync.bind(fs),
  privateClose = fs.closeSync.bind(fs);
function privateReadFile(file, encoding) {
  const descriptor = privateOpen(file, 'r');
  try {
    const size = privateStat(descriptor).size;
    if (!Number.isSafeInteger(size) || size < 0)
      throw new Error('invalid private source size');
    const bytes = Buffer.alloc(size);
    let offset = 0;
    while (offset < size) {
      const count = privateRead(
        descriptor,
        bytes,
        offset,
        size - offset,
        offset,
      );
      if (count <= 0) throw new Error('short private source read');
      offset += count;
    }
    return encoding === 'utf8' ? bytes.toString('utf8') : bytes;
  } finally {
    privateClose(descriptor);
  }
}
const baseFs = Object.freeze({
  readFileSync: privateReadFile,
  lstatSync: fs.lstatSync.bind(fs),
  realpathSync: fs.realpathSync.bind(fs),
  existsSync: fs.existsSync.bind(fs),
});

const descriptorPath =
  'tools/stynx-storage/consumer-fixtures/public-installed-runtime/descriptor.json';
const digest = (bytes) =>
  'sha256:' + createHash('sha256').update(bytes).digest('hex');
const violations = [];
const loaded = new Set();
const resolved = new Set();
const misses = [];
function fail(message) {
  violations.push(message);
  throw Object.assign(new Error('STYNX_PUBLIC_INSTALL_REFUSED: ' + message), {
    code: 'STYNX_PUBLIC_INSTALL_REFUSED',
  });
}
function insist(value, message) {
  if (!value) fail(message);
}
function healthy() {
  insist(violations.length === 0, 'runtime was poisoned: ' + violations[0]);
}
function closed(value, keys) {
  insist(
    value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      [Object.prototype, null].includes(Object.getPrototypeOf(value)),
    'record shape',
  );
  const own = Reflect.ownKeys(value);
  insist(
    own.every((key) => typeof key === 'string') &&
      isDeepStrictEqual(own.sort(), [...keys].sort()) &&
      Object.values(Object.getOwnPropertyDescriptors(value)).every(
        (part) => Object.hasOwn(part, 'value') && part.enumerable,
      ),
    'record keys/accessors',
  );
}
function member(value) {
  insist(
    typeof value === 'string' &&
      value !== '' &&
      !/[\\:\0]/u.test(value) &&
      value
        .split('/')
        .every((part) => part !== '' && part !== '.' && part !== '..'),
    'member path escape',
  );
  return value;
}
function regular(root, relative) {
  member(relative);
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    insist(!baseFs.lstatSync(current).isSymbolicLink(), 'source link');
  }
  insist(baseFs.lstatSync(current).isFile(), 'source is not regular');
  return current;
}
function reference(root, ref) {
  closed(ref, ['path', 'bytes', 'sha256']);
  insist(
    Number.isSafeInteger(ref.bytes) &&
      ref.bytes >= 0 &&
      /^sha256:[a-f0-9]{64}$/u.test(ref.sha256),
    'invalid reference',
  );
  const bytes = baseFs.readFileSync(regular(root, ref.path));
  insist(
    bytes.length === ref.bytes && digest(bytes) === ref.sha256,
    'reference drift',
  );
  return bytes;
}
const json = (bytes) =>
  JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
function unique(items, key) {
  insist(
    new Set(items.map(key)).size === items.length,
    'duplicate descriptor row',
  );
}
const logicalKey = (value) => JSON.stringify([value.packageId, value.member]);
const edgeKey = (value, specifier) =>
  JSON.stringify([value.packageId, value.member, specifier]);
function currentToolchain(root, records) {
  insist(records.length === 2, 'platform proof count');
  const proof = records.map((ref) => json(reference(root, ref)));
  unique(proof, (item) => item.platform + '/' + item.arch);
  const selected = proof.find(
    (item) => item.platform === process.platform && item.arch === process.arch,
  );
  insist(selected && selected.version === '24.20.0', 'official Node profile');
  insist(
    digest(baseFs.readFileSync(process.execPath)) ===
      selected.executable.sha256,
    'official Node executable bytes',
  );
  for (const record of selected.loaders) {
    const source = process.binding('natives')[record.id];
    insist(
      typeof source === 'string' &&
        Buffer.byteLength(source) === record.bytes &&
        digest(Buffer.from(source)) === record.sha256,
      'official embedded loader differs',
    );
  }
}
function pnpmDirectory(snapshotId) {
  let name = snapshotId.startsWith('file:')
    ? snapshotId.replace(/^file:/u, 'file+')
    : snapshotId.replace(/^\//u, '');
  name = name.replace(/[\\/:*?"<>|]/gu, '+');
  if (name.includes('('))
    name = name.replace(/\)$/u, '').replace(/\)\(|[()]/gu, '_');
  if (
    name.length > 120 ||
    (name !== name.toLowerCase() && !snapshotId.startsWith('file:'))
  ) {
    const raw = createHash('md5').update(name).digest();
    let bits = 0,
      value = 0,
      encoded = '';
    const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
    for (const octet of raw) {
      value = (value << 8) | octet;
      bits += 8;
      while (bits >= 5) {
        encoded += alphabet[(value >>> (bits -= 5)) & 31];
      }
    }
    if (bits > 0) encoded += alphabet[(value << (5 - bits)) & 31];
    name = name.slice(0, 93) + '_' + encoded;
  }
  return name;
}
function admittedSettings(settings) {
  insist(
    settings &&
      typeof settings.host === 'string' &&
      Number.isSafeInteger(settings.port) &&
      settings.port > 0 &&
      settings.port <= 65535 &&
      settings.user === 'postgres' &&
      settings.ssl === false,
    'configured PostgreSQL endpoint',
  );
}

export function installPublicStorageRuntimeGuard(root, release, settings) {
  try {
    insist(baseFs.realpathSync(root) === root, 'consumer root identity');
    admittedSettings(settings);
    insist(
      !['NODE_OPTIONS', 'NODE_PATH', 'NODE_PG_FORCE_NATIVE'].some(
        (key) => process.env[key],
      ) &&
        !process.execArgv.some((arg) =>
          /(?:require|import|loader|inspect)/u.test(arg),
        ),
      'ambient loader/native override',
    );
    const admission = release.inputs.filter(
      (ref) => ref.path === descriptorPath,
    );
    insist(admission.length === 1, 'reviewed descriptor absent');
    const descriptor = json(reference(root, admission[0]));
    closed(descriptor, [
      'formatVersion',
      'kind',
      'lock',
      'sources',
      'packages',
      'files',
      'edges',
      'seeds',
      'optionalMisses',
      'toolchain',
      'reviews',
    ]);
    insist(
      descriptor.formatVersion === 1 &&
        descriptor.kind === 'reviewed-public-storage-installed-runtime',
      'descriptor kind',
    );
    for (const name of [
      'sources',
      'packages',
      'files',
      'edges',
      'seeds',
      'optionalMisses',
      'toolchain',
    ])
      insist(Array.isArray(descriptor[name]), 'descriptor array ' + name);
    const sourceRefs = [
      descriptor.lock,
      ...descriptor.sources,
      ...descriptor.toolchain,
    ];
    unique(sourceRefs, (ref) => ref.path);
    insist(
      isDeepStrictEqual(
        descriptor.sources.map((ref) => ref.path),
        [...descriptor.sources.map((ref) => ref.path)].sort(),
      ) &&
        isDeepStrictEqual(
          descriptor.toolchain.map((ref) => ref.path),
          [...descriptor.toolchain.map((ref) => ref.path)].sort(),
        ),
      'descriptor source order',
    );
    for (const ref of sourceRefs) {
      insist(
        release.inputs.some((item) => isDeepStrictEqual(item, ref)),
        'descriptor source outside release',
      );
      reference(root, ref);
    }
    closed(descriptor.reviews, ['inspector', 'independent']);
    const reviewers = ['inspector', 'independent'].map((role) => {
      const review = descriptor.reviews[role];
      closed(review, ['actor', 'report']);
      insist(
        typeof review.actor === 'string' && review.actor !== '',
        'review actor',
      );
      insist(
        release.inputs.some((ref) => isDeepStrictEqual(ref, review.report)) ||
          Object.values(release.reviews).some((item) =>
            isDeepStrictEqual(item.report, review.report),
          ),
        'descriptor review outside release',
      );
      reference(root, review.report);
      return review.actor;
    });
    insist(reviewers[0] !== reviewers[1], 'reviewers not distinct');
    const lockBytes = reference(root, descriptor.lock);
    const lock = lockBytes.toString('utf8');
    const snapshotStart = lock.indexOf('\nsnapshots:\n');
    insist(snapshotStart > 0, 'frozen lock snapshot section');
    const snapshots = lock.slice(snapshotStart + 12);
    currentToolchain(root, descriptor.toolchain);
    function checkLayout() {
      const modulesYaml = baseFs.readFileSync(
        regular(root, 'node_modules/.modules.yaml'),
        'utf8',
      );
      insist(
        /^packageManager: pnpm@9\.15\.0$/mu.test(modulesYaml) &&
          /^virtualStoreDir: \.pnpm$/mu.test(modulesYaml) &&
          /^virtualStoreDirMaxLength: 120$/mu.test(modulesYaml),
        'current pnpm layout settings',
      );
    }
    checkLayout();
    const provenanceRef = descriptor.sources.find((ref) =>
      ref.path.endsWith('/workspace-package-provenance.json.raw'),
    );
    insist(provenanceRef, 'tar provenance source');
    const provenance = json(reference(root, provenanceRef));
    const proven = new Map();
    for (const item of provenance.packages) {
      const key = JSON.stringify([item.name, item.version]);
      const prior = proven.get(key);
      insist(
        !prior || prior.archive.integrity === item.archive.integrity,
        'archive contexts disagree',
      );
      proven.set(key, item);
    }
    const roots = new Map(),
      packages = new Map();
    unique(descriptor.packages, (item) => item.id);
    for (const item of descriptor.packages) {
      closed(item, ['id', 'name', 'version', 'integrity', 'manifestSha256']);
      insist(
        typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          typeof item.version === 'string' &&
          /^sha512-[A-Za-z0-9+/]+=*$/u.test(item.integrity) &&
          /^sha256:[a-f0-9]{64}$/u.test(item.manifestSha256),
        'package row',
      );
      const quoted = "\n  '" + item.id.replaceAll("'", "''") + "':";
      insist(
        snapshots.includes(quoted) ||
          snapshots.includes('\n  ' + item.id + ':'),
        'missing frozen peer snapshot',
      );
      const provenanceRow = proven.get(
        JSON.stringify([item.name, item.version]),
      );
      insist(
        provenanceRow &&
          provenanceRow.name === item.name &&
          provenanceRow.version === item.version &&
          provenanceRow.archive.integrity === item.integrity &&
          provenanceRow.lockResolution.integrity === item.integrity,
        'published archive identity',
      );
      const physical = path.join(
        root,
        'node_modules/.pnpm',
        pnpmDirectory(item.id),
        'node_modules',
        item.name,
      );
      insist(
        baseFs.lstatSync(physical).isDirectory() &&
          baseFs.realpathSync(physical) === physical &&
          digest(baseFs.readFileSync(regular(physical, 'package.json'))) ===
            item.manifestSha256,
        'actual package context/manifest',
      );
      roots.set(item.id, physical);
      packages.set(physical, item.id);
    }
    unique([...roots.values()], (item) => item);
    const files = new Map(),
      physicalFiles = new Map();
    unique(descriptor.files, logicalKey);
    for (const item of descriptor.files) {
      closed(item, [
        'packageId',
        'member',
        'bytes',
        'sha256',
        'nearestManifest',
      ]);
      insist(
        roots.has(item.packageId) &&
          Number.isSafeInteger(item.bytes) &&
          item.bytes >= 0 &&
          /^sha256:[a-f0-9]{64}$/u.test(item.sha256),
        'file row',
      );
      const packageRoot = roots.get(item.packageId);
      const filename = regular(packageRoot, member(item.member));
      const raw = baseFs.readFileSync(filename);
      insist(
        raw.length === item.bytes && digest(raw) === item.sha256,
        'installed file bytes',
      );
      closed(item.nearestManifest, ['member', 'bytes', 'sha256']);
      const nearest = item.nearestManifest,
        manifest = regular(packageRoot, member(nearest.member)),
        manifestBytes = baseFs.readFileSync(manifest);
      insist(
        manifestBytes.length === nearest.bytes &&
          digest(manifestBytes) === nearest.sha256 &&
          JSON.parse(manifestBytes.toString('utf8')).name ===
            (nearest.member === 'package.json'
              ? descriptor.packages.find((p) => p.id === item.packageId).name
              : JSON.parse(manifestBytes.toString('utf8')).name),
        'nearest package manifest',
      );
      let expectedNearest = path.dirname(filename);
      while (expectedNearest.startsWith(packageRoot)) {
        if (baseFs.existsSync(path.join(expectedNearest, 'package.json')))
          break;
        expectedNearest = path.dirname(expectedNearest);
      }
      insist(
        manifest === path.join(expectedNearest, 'package.json'),
        'nearest manifest identity',
      );
      const key = logicalKey(item);
      files.set(key, item);
      physicalFiles.set(filename, item);
    }
    function fileFor(logical) {
      closed(logical, ['packageId', 'member']);
      const record = files.get(logicalKey(logical));
      insist(record, 'unknown logical file');
      return regular(roots.get(logical.packageId), logical.member);
    }
    const edges = new Map();
    unique(descriptor.edges, (item) => edgeKey(item.from, item.specifier));
    for (const item of descriptor.edges) {
      closed(item, ['from', 'specifier', 'to']);
      insist(typeof item.specifier === 'string', 'edge request');
      const from = fileFor(item.from);
      let target;
      if (Object.hasOwn(item.to, 'builtin')) {
        closed(item.to, ['builtin']);
        insist(
          modules.isBuiltin(item.specifier) &&
            item.to.builtin === item.specifier.replace(/^node:/u, ''),
          'builtin identity',
        );
        target = 'node:' + item.to.builtin;
      } else target = fileFor(item.to);
      const actual = modules.createRequire(from).resolve(item.specifier);
      const resolvedTarget = modules.isBuiltin(actual)
        ? 'node:' + actual.replace(/^node:/u, '')
        : baseFs.realpathSync(actual);
      insist(resolvedTarget === target, 'current selected resolution');
      edges.set(edgeKey(item.from, item.specifier), target);
    }
    const seeds = new Map();
    unique(
      descriptor.seeds,
      (item) => item.fromManifest + '|' + item.specifier,
    );
    insist(
      descriptor.seeds.length === 3 &&
        isDeepStrictEqual(
          descriptor.seeds.map((item) => item.specifier).sort(),
          ['@stynx-nyx/offline-sync', '@stynx-nyx/outbox', 'pg'],
        ),
      'public roots',
    );
    for (const seed of descriptor.seeds) {
      closed(seed, ['specifier', 'fromManifest', 'target']);
      insist(
        seed.fromManifest ===
          (seed.specifier === 'pg'
            ? 'package.json'
            : 'backend/app/package.json'),
        'consumer seed',
      );
      const anchor = regular(root, seed.fromManifest),
        target = fileFor(seed.target);
      insist(
        baseFs.realpathSync(
          modules.createRequire(anchor).resolve(seed.specifier),
        ) === target,
        'actual consumer seed resolution',
      );
      seeds.set(anchor + '|' + seed.specifier, target);
    }
    const optional = new Map();
    unique(descriptor.optionalMisses, (item) =>
      edgeKey(item.from, item.specifier),
    );
    for (const item of descriptor.optionalMisses) {
      closed(item, ['from', 'specifier', 'disposition']);
      const from = fileFor(item.from);
      insist(
        ['selected-caught', 'not-selected-refuse-if-requested'].includes(
          item.disposition,
        ),
        'optional disposition',
      );
      optional.set(from + '|' + item.specifier, item.disposition);
    }
    function verify(filename) {
      const item = physicalFiles.get(filename);
      insist(item, 'unknown installed module');
      const packageRoot = roots.get(item.packageId),
        packageRow = descriptor.packages.find(
          (row) => row.id === item.packageId,
        );
      insist(
        baseFs.lstatSync(packageRoot).isDirectory() &&
          baseFs.realpathSync(packageRoot) === packageRoot &&
          digest(baseFs.readFileSync(regular(packageRoot, 'package.json'))) ===
            packageRow.manifestSha256,
        'package root/identity drift',
      );
      const nearest = item.nearestManifest,
        nearestBytes = baseFs.readFileSync(
          regular(packageRoot, nearest.member),
        );
      insist(
        nearestBytes.length === nearest.bytes &&
          digest(nearestBytes) === nearest.sha256,
        'nearest manifest drift',
      );
      const raw = baseFs.readFileSync(regular(packageRoot, item.member));
      insist(
        raw.length === item.bytes && digest(raw) === item.sha256,
        'module byte drift',
      );
      return raw;
    }
    for (const cached of Object.keys(modules.Module._cache))
      insist(!physicalFiles.has(cached), 'SDK module cached before guard');
    const rootAnchors = new Map(
      descriptor.seeds.map((seed) => [
        path.join(root, seed.fromManifest),
        true,
      ]),
    );
    const requireOriginal = modules.Module._load;
    const requireBuiltin = modules.createRequire(import.meta.url);
    const child = requireBuiltin('node:child_process'),
      net = requireBuiltin('node:net'),
      tls = requireBuiltin('node:tls'),
      http = requireBuiltin('node:http'),
      https = requireBuiltin('node:https'),
      dns = requireBuiltin('node:dns'),
      dgram = requireBuiltin('node:dgram'),
      workers = requireBuiltin('node:worker_threads'),
      vm = requireBuiltin('node:vm');
    const deny = (name) =>
      function deniedEffect() {
        fail('forbidden effect ' + name);
      };
    for (const [object, names, label] of [
      [
        child,
        [
          'spawn',
          'spawnSync',
          'exec',
          'execSync',
          'execFile',
          'execFileSync',
          'fork',
        ],
        'child',
      ],
      [tls, ['connect', 'createServer'], 'tls'],
      [http, ['request', 'get', 'createServer'], 'http'],
      [https, ['request', 'get', 'createServer'], 'https'],
      [dgram, ['createSocket'], 'udp'],
      [net, ['createServer'], 'net'],
      [workers, ['Worker'], 'worker'],
      [
        vm,
        [
          'Script',
          'createContext',
          'runInContext',
          'runInNewContext',
          'runInThisContext',
          'compileFunction',
          'SourceTextModule',
          'SyntheticModule',
        ],
        'vm',
      ],
    ])
      for (const name of names)
        if (typeof object[name] === 'function')
          object[name] = deny(label + '.' + name);
    for (const name of [
      'resolve',
      'resolve4',
      'resolve6',
      'resolveAny',
      'resolveCname',
      'resolveMx',
      'resolveTxt',
      'resolveSrv',
      'resolveNs',
      'resolvePtr',
      'resolveNaptr',
      'resolveSoa',
      'reverse',
    ])
      if (typeof dns[name] === 'function') dns[name] = deny('dns.' + name);
    if (typeof dns.Resolver === 'function') dns.Resolver = deny('dns.Resolver');
    if (typeof dns.promises?.Resolver === 'function')
      dns.promises.Resolver = deny('dns.promises.Resolver');
    const lookupOriginal = dns.lookup;
    dns.lookup = function (host, ...args) {
      healthy();
      insist(host === settings.host, 'DNS outside configured PostgreSQL host');
      return lookupOriginal.call(this, host, ...args);
    };
    for (const name of [
      'resolve',
      'resolve4',
      'resolve6',
      'resolveAny',
      'resolveCname',
      'resolveMx',
      'resolveTxt',
      'resolveSrv',
      'resolveNs',
      'resolvePtr',
      'resolveNaptr',
      'resolveSoa',
      'reverse',
    ])
      if (typeof dns.promises?.[name] === 'function')
        dns.promises[name] = deny('dns.promises.' + name);
    if (typeof dns.promises?.lookup === 'function') {
      const promiseLookup = dns.promises.lookup;
      dns.promises.lookup = function (host, ...args) {
        healthy();
        insist(host === settings.host, 'DNS promise outside PostgreSQL host');
        return promiseLookup.call(this, host, ...args);
      };
    }
    const connectOriginal = net.Socket.prototype.connect;
    net.Socket.prototype.connect = function (...args) {
      healthy();
      const values = Array.isArray(args[0]) ? args[0] : args,
        first = values[0],
        port = typeof first === 'object' ? first.port : first,
        host = typeof first === 'object' ? first.host : values[1];
      insist(
        String(port) === String(settings.port) &&
          host === settings.host &&
          !(typeof first === 'object' && (first.path || first.lookup)),
        'network outside configured PostgreSQL endpoint',
      );
      return connectOriginal.apply(this, args);
    };
    globalThis.fetch = deny('fetch');
    if (globalThis.WebSocket) globalThis.WebSocket = deny('WebSocket');
    process.dlopen = deny('native addon');
    const readFiles = new Set(physicalFiles.keys());
    for (const item of descriptor.files)
      readFiles.add(
        path.join(roots.get(item.packageId), item.nearestManifest.member),
      );
    const fromSelectedSdk = () => {
      const stack = new Error().stack ?? '';
      return [...physicalFiles.keys()].some((filename) =>
        stack.includes(filename + ':'),
      );
    };
    const admittedRead = (file) => {
      let filename;
      try {
        filename = file instanceof URL ? fileURLToPath(file) : file;
      } catch {
        return false;
      }
      return typeof filename === 'string' && readFiles.has(filename);
    };
    const readonlyFlag = (flag) =>
      flag === 'r' || flag === 'rs' || flag === fs.constants.O_RDONLY;
    const custodyRoot = path.join(
      root,
      'backend/database/.stynx-install-custody',
    );
    const custodyFds = new Set();
    const sdkReadFds = new Set();
    const ownedCustodyPath = (file) =>
      typeof file === 'string' &&
      (file === custodyRoot || file.startsWith(custodyRoot + path.sep));
    const permittedConsumerMutation = (name, first, second) => {
      if (name.startsWith('symlink')) return false;
      if (
        [
          'renameSync',
          'rename',
          'copyFileSync',
          'copyFile',
          'linkSync',
          'link',
          'cpSync',
          'cp',
        ].includes(name)
      )
        return ownedCustodyPath(first) && ownedCustodyPath(second);
      return typeof first === 'number'
        ? custodyFds.has(first)
        : ownedCustodyPath(first);
    };
    for (const name of ['readFileSync', 'statSync', 'lstatSync']) {
      const original = fs[name];
      fs[name] = function (file, ...args) {
        if (fromSelectedSdk()) {
          healthy();
          insist(admittedRead(file), 'SDK filesystem read ' + name);
        }
        return original.call(this, file, ...args);
      };
    }
    for (const name of ['readFile', 'stat', 'lstat']) {
      const original = fs[name];
      fs[name] = function (file, ...args) {
        if (fromSelectedSdk()) {
          healthy();
          insist(admittedRead(file), 'SDK filesystem read ' + name);
        }
        return original.call(this, file, ...args);
      };
      const promise = fs.promises[name];
      fs.promises[name] = async function (file, ...args) {
        if (fromSelectedSdk()) {
          healthy();
          insist(admittedRead(file), 'SDK filesystem read ' + name);
        }
        return promise.call(this, file, ...args);
      };
    }
    for (const name of [
      'createReadStream',
      'accessSync',
      'access',
      'readdirSync',
      'readdir',
      'readlinkSync',
      'readlink',
      'existsSync',
    ]) {
      const original = fs[name];
      fs[name] = function (file, ...args) {
        if (fromSelectedSdk()) {
          healthy();
          insist(admittedRead(file), 'SDK filesystem read ' + name);
        }
        return original.call(this, file, ...args);
      };
    }
    for (const name of ['access', 'readdir', 'readlink']) {
      const original = fs.promises[name];
      fs.promises[name] = async function (file, ...args) {
        if (fromSelectedSdk()) {
          healthy();
          insist(admittedRead(file), 'SDK filesystem read ' + name);
        }
        return original.call(this, file, ...args);
      };
    }
    for (const name of [
      'writeFileSync',
      'appendFileSync',
      'renameSync',
      'copyFileSync',
      'mkdirSync',
      'rmSync',
      'unlinkSync',
      'createWriteStream',
      'writeSync',
      'writevSync',
      'ftruncateSync',
      'truncateSync',
      'chmodSync',
      'chownSync',
      'lchmodSync',
      'lchownSync',
      'fchmodSync',
      'fchownSync',
      'utimesSync',
      'futimesSync',
      'linkSync',
      'symlinkSync',
      'cpSync',
      'mkdtempSync',
    ]) {
      const original = fs[name];
      fs[name] = function (...args) {
        if (fromSelectedSdk()) {
          healthy();
          fail('SDK filesystem write ' + name);
        }
        insist(
          permittedConsumerMutation(name, args[0], args[1]),
          'consumer write outside owned custody ' + name,
        );
        return original.apply(this, args);
      };
    }
    const openSync = fs.openSync;
    fs.openSync = function (file, flag, ...args) {
      if (fromSelectedSdk()) {
        healthy();
        insist(readonlyFlag(flag) && admittedRead(file), 'SDK filesystem open');
      } else if (!readonlyFlag(flag))
        insist(ownedCustodyPath(file), 'consumer open outside owned custody');
      const descriptor = openSync.call(this, file, flag, ...args);
      if (!readonlyFlag(flag)) custodyFds.add(descriptor);
      else if (fromSelectedSdk()) sdkReadFds.add(descriptor);
      return descriptor;
    };
    const closeSync = fs.closeSync;
    fs.closeSync = function (descriptor, ...args) {
      custodyFds.delete(descriptor);
      sdkReadFds.delete(descriptor);
      return closeSync.call(this, descriptor, ...args);
    };
    for (const name of ['readSync', 'readvSync', 'read', 'readv']) {
      if (typeof fs[name] !== 'function') continue;
      const original = fs[name];
      fs[name] = function (descriptor, ...args) {
        if (fromSelectedSdk()) {
          healthy();
          insist(sdkReadFds.has(descriptor), 'SDK unadmitted read descriptor');
        }
        return original.call(this, descriptor, ...args);
      };
    }
    const openCallback = fs.open;
    fs.open = function (file, flag, ...args) {
      const sdk = fromSelectedSdk();
      if (sdk) {
        healthy();
        insist(readonlyFlag(flag) && admittedRead(file), 'SDK filesystem open');
      } else insist(readonlyFlag(flag), 'consumer callback write open');
      if (!sdk) return openCallback.call(this, file, flag, ...args);
      const callback = args.at(-1);
      insist(typeof callback === 'function', 'SDK callback open shape');
      return openCallback.call(
        this,
        file,
        flag,
        ...args.slice(0, -1),
        (error, descriptor) => {
          if (!error) sdkReadFds.add(descriptor);
          callback(error, descriptor);
        },
      );
    };
    const openPromise = fs.promises.open;
    fs.promises.open = async function (file, flag, ...args) {
      const sdk = fromSelectedSdk();
      if (sdk) {
        healthy();
        insist(readonlyFlag(flag) && admittedRead(file), 'SDK filesystem open');
      } else insist(readonlyFlag(flag), 'consumer promise write open');
      const handle = await openPromise.call(this, file, flag, ...args);
      if (sdk) sdkReadFds.add(handle.fd);
      return handle;
    };
    for (const name of [
      'writeFile',
      'appendFile',
      'rename',
      'copyFile',
      'mkdir',
      'rm',
      'unlink',
      'write',
      'writev',
      'ftruncate',
      'truncate',
      'chmod',
      'chown',
      'lchmod',
      'lchown',
      'fchmod',
      'fchown',
      'utimes',
      'futimes',
      'link',
      'symlink',
      'cp',
      'mkdtemp',
    ]) {
      if (typeof fs[name] !== 'function') continue;
      const original = fs[name];
      fs[name] = function (...args) {
        if (fromSelectedSdk()) {
          healthy();
          fail('SDK filesystem write ' + name);
        }
        insist(
          permittedConsumerMutation(name, args[0], args[1]),
          'consumer write outside owned custody ' + name,
        );
        return original.apply(this, args);
      };
    }
    for (const name of [
      'writeFile',
      'appendFile',
      'rename',
      'copyFile',
      'mkdir',
      'rm',
      'unlink',
      'truncate',
      'chmod',
      'chown',
      'lchmod',
      'lchown',
      'utimes',
      'link',
      'symlink',
      'cp',
      'mkdtemp',
    ]) {
      if (typeof fs.promises[name] !== 'function') continue;
      const original = fs.promises[name];
      fs.promises[name] = async function (...args) {
        if (fromSelectedSdk()) {
          healthy();
          fail('SDK filesystem write ' + name);
        }
        insist(
          permittedConsumerMutation(name, args[0], args[1]),
          'consumer write outside owned custody ' + name,
        );
        return original.apply(this, args);
      };
    }
    modules.syncBuiltinESMExports();
    const hooks = modules.registerHooks({
      resolve(specifier, context, next) {
        healthy();
        const parent = context.parentURL?.startsWith('file:')
          ? fileURLToPath(context.parentURL)
          : null;
        if (parent && physicalFiles.has(parent)) verify(parent);
        let expected =
          parent && rootAnchors.has(parent)
            ? seeds.get(parent + '|' + specifier)
            : null;
        const from = parent && physicalFiles.get(parent);
        if (from) expected = edges.get(edgeKey(from, specifier));
        const miss = parent && optional.get(parent + '|' + specifier);
        insist(expected || miss, 'unknown module edge');
        let result;
        try {
          result = next(specifier, context);
        } catch (error) {
          if (
            miss === 'selected-caught' &&
            ['MODULE_NOT_FOUND', 'ERR_MODULE_NOT_FOUND'].includes(error.code)
          ) {
            misses.push({ parent, specifier, code: error.code });
            throw error;
          }
          return fail('unexpected module resolution failure');
        }
        insist(!miss, 'optional module unexpectedly resolved');
        const actual = result.url.startsWith('node:')
          ? result.url
          : result.url.startsWith('file:')
            ? fileURLToPath(result.url)
            : fail('nonfile module');
        insist(actual === expected, 'module edge destination');
        if (!result.url.startsWith('node:')) {
          verify(actual);
          resolved.add(actual);
        }
        return result;
      },
      load(address, context, next) {
        healthy();
        if (address.startsWith('node:')) return next(address, context);
        insist(address.startsWith('file:'), 'nonfile load');
        const filename = fileURLToPath(address);
        const raw = verify(filename);
        const result = next(address, context);
        if (result.source !== undefined && result.source !== null) {
          const source =
            typeof result.source === 'string'
              ? Buffer.from(result.source)
              : Buffer.from(result.source);
          insist(digest(source) === digest(raw), 'transformed module source');
        }
        const record = physicalFiles.get(filename);
        const manifest = JSON.parse(
          baseFs.readFileSync(
            path.join(
              roots.get(record.packageId),
              record.nearestManifest.member,
            ),
            'utf8',
          ),
        );
        insist(
          ['commonjs', 'module', 'json'].includes(result.format) ||
            (result.format === undefined &&
              context.format === undefined &&
              Array.isArray(context.conditions) &&
              context.conditions.includes('require') &&
              !context.conditions.includes('import') &&
              filename.endsWith('.js') &&
              !Object.hasOwn(manifest, 'type')),
          'unknown module format',
        );
        loaded.add(filename);
        return result;
      },
    });
    modules.Module._load = function (request, parent, isMain) {
      healthy();
      const allowed = {
        '@stynx-nyx/outbox': ['renderOutboxStorage', 'verifyOutboxStorage'],
        '@stynx-nyx/offline-sync': [
          'renderOfflineStorage',
          'renderOfflineStorageMigrations',
          'verifyOfflineStorage',
        ],
        pg: ['Client'],
      }[request];
      if (rootAnchors.has(parent?.filename))
        insist(allowed, 'nonpublic seed request');
      const result = requireOriginal.call(this, request, parent, isMain);
      if (!rootAnchors.has(parent?.filename)) return result;
      return new Proxy(result, {
        get(target, key, receiver) {
          insist(
            typeof key === 'string' && allowed.includes(key),
            'nonpublic SDK method',
          );
          const value = Reflect.get(target, key, receiver);
          if (request !== 'pg') return value;
          return new Proxy(value, {
            construct(ctor, args, newTarget) {
              const configuration = args[0];
              insist(
                configuration &&
                  configuration.host === settings.host &&
                  configuration.port === settings.port &&
                  configuration.user === settings.user &&
                  configuration.ssl === false &&
                  ['postgres', settings.database].includes(
                    configuration.database,
                  ),
                'unapproved PostgreSQL client',
              );
              return Reflect.construct(ctor, args, newTarget);
            },
          });
        },
      });
    };
    function rehash() {
      healthy();
      checkLayout();
      reference(root, admission[0]);
      for (const ref of sourceRefs) reference(root, ref);
      for (const item of descriptor.files)
        verify(fileFor({ packageId: item.packageId, member: item.member }));
      for (const file of loaded) verify(file);
    }
    const status = Object.freeze({
      assertHealthy: healthy,
      rehash,
      observation() {
        return {
          loaded: [...loaded].sort().map((file) => path.relative(root, file)),
          resolved: [...resolved]
            .sort()
            .map((file) => path.relative(root, file)),
          misses: [...misses],
          violations: [...violations],
        };
      },
      finish() {
        rehash();
        modules.Module._load = requireOriginal;
        hooks.deregister();
        return this.observation();
      },
    });
    return status;
  } catch (error) {
    if (error?.code === 'STYNX_PUBLIC_INSTALL_REFUSED') throw error;
    return fail('guard setup: ' + String(error?.message ?? error));
  }
}
