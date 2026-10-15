// Private programmatic installed-realm guard; authority comes from the exact
// Root-bound execution record and independently reviewed immutable input corpus.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import * as nodeModule from 'node:module';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generation =
  'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03';
const descriptorPath = generation + '/installer-runtime-inputs.json';
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const violations = [],
  loaded = new Set(),
  resolved = new Set(),
  misses = [];
function isAdmittedInstallerExecutor(value) {
  return value === '/root' || value === '/root/engineer_outbox_160';
}

function fail(message) {
  violations.push(message);
  throw Error('R22_STORAGE_RUNTIME_GUARD_STOP: ' + message);
}
function clean() {
  if (violations.length)
    throw Error('R22_STORAGE_RUNTIME_GUARD_STOP: ' + violations[0]);
}
function insist(ok, message) {
  if (!ok) fail(message);
}
const plainRef = (ref) => ({ path: ref.path, sha256: ref.sha256 });
function readRef(ref) {
  insist(
    ref &&
      typeof ref.path === 'string' &&
      typeof ref.sha256 === 'string' &&
      /^sha256:[a-f0-9]{64}$/u.test(ref.sha256),
    'unsealed input',
  );
  insist(
    !/[\\:\0]/u.test(ref.path) &&
      ref.path.split('/').every((p) => p && p !== '.' && p !== '..'),
    'input path escape',
  );
  let file = root;
  for (const part of ref.path.split('/')) {
    file = path.join(file, part);
    insist(!fs.lstatSync(file).isSymbolicLink(), 'input symlink');
  }
  insist(
    fs.lstatSync(file).isFile() && fs.realpathSync(file) === file,
    'input outside root',
  );
  const bytes = fs.readFileSync(file);
  insist(
    'sha256:' + sha(bytes) === ref.sha256 &&
      (!Object.hasOwn(ref, 'bytes') || ref.bytes === bytes.length),
    'input byte drift',
  );
  return bytes;
}
const json = (bytes) =>
  JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
for (const key of ['NODE_OPTIONS', 'NODE_PATH', 'NODE_PG_FORCE_NATIVE'])
  insist(!process.env[key], 'ambient loader/native forcing');
insist(
  !process.execArgv.some((a) => /(?:require|import|loader|inspect)/u.test(a)),
  'ambient preload',
);
const activation = json(
  readRef({
    path: generation + '/installer-execution-activation.json',
    sha256: process.env.DETRAN_STYNX_STORAGE_EXECUTION_SHA,
  }),
);
insist(
  activation.formatVersion === 1 &&
    activation.kind === 'reviewed-stynx-storage-execution-activation' &&
    activation.status === 'ACTIVE',
  'external authority unavailable',
);
insist(
  activation.admittedInputs.path === generation + '/admitted-inputs.json' &&
    activation.admittedInputs.sha256 ===
      'sha256:9381436615594db9f059cf966203cd9ab21b40157aecf965acc263fd32ea138b',
  'actual discovery differs',
);
readRef(activation.admittedInputs);
readRef(activation.source);
const candidate = json(readRef(activation.reviewedCandidate));
insist(
  candidate.formatVersion === 1 &&
    candidate.kind === 'reviewed-stynx-storage-candidate' &&
    Array.isArray(candidate.inputs),
  'candidate inventory unavailable',
);
const own = candidate.inputs.filter(
  (r) => r.path === 'tools/stynx-storage-runtime-guard.mjs',
);
insist(
  own.length === 1 &&
    own[0].sha256 ===
      'sha256:' + sha(fs.readFileSync(fileURLToPath(import.meta.url))),
  'guard source not reviewed',
);
readRef(own[0]);
const descriptorRefs = candidate.inputs.filter(
  (r) => r.path === descriptorPath,
);
insist(descriptorRefs.length === 1, 'fixed realm descriptor not reviewed');
const config = json(readRef(descriptorRefs[0]));
insist(
  config.formatVersion === 1 &&
    config.kind === 'detran-stynx-installed-runtime-custody',
  'descriptor shape differs',
);
const capture = json(
  readRef({
    path: 'scratch/r22-adoption-161/workspace-runtime-final/installed-capture.json',
    sha256:
      'sha256:d237d2e33c48d0b5572517d6730ef29be37dd209c9516cebcdcd5d6da34d5e5a',
  }),
);
const graph = json(
  readRef({
    path: 'scratch/r22-adoption-161/workspace-runtime-final/static-module-graph.json',
    sha256:
      'sha256:b8ac160ee31817ab6315541eec4c91a610640c1025bce6d5dbbca87b9cfb63bf',
  }),
);
insist(
  capture.contextCount === 241 &&
    graph.files.length === 3018 &&
    Object.keys(config.sdk).length === 3018 &&
    isDeepStrictEqual(graph.edges, config.edges),
  'actual realm/graph identity differs',
);
insist(
  config.captureIdentity.sha256 ===
    'd237d2e33c48d0b5572517d6730ef29be37dd209c9516cebcdcd5d6da34d5e5a' &&
    config.graphIdentity.sha256 ===
      'b8ac160ee31817ab6315541eec4c91a610640c1025bce6d5dbbca87b9cfb63bf',
  'realm provenance differs',
);
insist(
  fs.realpathSync(process.execPath) === config.node.realpath &&
    sha(fs.readFileSync(process.execPath)) === config.node.sha256 &&
    config.node.version === 'v24.20.0',
  'official Node differs',
);
const lease = json(readRef(activation.lease));
insist(
  lease.status === 'ACTIVE' &&
    ((lease.executionLane === 'package-only-g03' &&
      process.env.DB_NAME === 'detran_r22_161_g03_upgrade' &&
      lease.full === false) ||
      (lease.executionLane === 'full-consumer' &&
        (process.env.DB_NAME === 'detran_r22_161_fresh' ||
          process.env.DB_NAME === 'detran_r22_161_full'))) &&
    lease.issuer === '/root' &&
    lease.holder === 'Engineer' &&
    isAdmittedInstallerExecutor(lease.grantee) &&
    isDeepStrictEqual(lease.endpoint, { host: '127.0.0.1', port: 65462 }),
  'actual installer lease differs',
);
const roster = new Set([
  'detran_r22_161_g03_upgrade',
  'detran_r22_161_fresh',
  'detran_r22_161_negative',
  'detran_r22_161_full',
]);
insist(
  roster.has(process.env.DB_NAME) &&
    lease.subjects.some(
      (s) =>
        s.databaseName === process.env.DB_NAME &&
        s.owner === 'postgres' &&
        s.clusterSystemIdentifier === '7696293464811719840',
    ),
  'unleased target database',
);
const sdk = new Map(
  Object.entries(config.sdk).map(([p, record]) => [path.join(root, p), record]),
);
for (const record of graph.files)
  insist(
    isDeepStrictEqual(config.sdk[record.path], {
      bytes: record.bytes,
      sha256: record.sha256,
    }),
    'graph file record differs',
  );
function verify(file, record = sdk.get(file)) {
  insist(
    file.startsWith(root + path.sep) &&
      record &&
      fs.realpathSync(file) === file &&
      fs.lstatSync(file).isFile(),
    'unknown/outside module',
  );
  const bytes = fs.readFileSync(file);
  insist(
    bytes.length === record.bytes && sha(bytes) === record.sha256,
    'module bytes differ before evaluation',
  );
  return bytes;
}
function verifyPackageTopology() {
  const expectedFiles = new Set(
    capture.files
      .filter((record) => record.path.startsWith('runtime/'))
      .map((record) => record.observedSource),
  );
  const expectedLinks = new Set(
    capture.links.map((record) => record.observedSource),
  );
  const actualFiles = new Set(),
    actualLinks = new Set();
  const walk = (directory) => {
    insist(
      fs.realpathSync(directory) === directory,
      'package directory escape',
    );
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      const stat = fs.lstatSync(file);
      if (stat.isSymbolicLink()) {
        actualLinks.add(file);
        insist(expectedLinks.has(file), 'extra package link');
      } else if (stat.isDirectory()) walk(file);
      else {
        insist(
          stat.isFile() && expectedFiles.has(file),
          'extra/nonregular package entry',
        );
        actualFiles.add(file);
      }
    }
  };
  for (const pkg of capture.packages) {
    insist(pkg.observedRoot.startsWith(root + path.sep), 'package root escape');
    walk(pkg.observedRoot);
  }
  const packageFiles = [...expectedFiles].filter((file) =>
    capture.packages.some((pkg) =>
      file.startsWith(pkg.observedRoot + path.sep),
    ),
  );
  insist(
    actualFiles.size === packageFiles.length &&
      packageFiles.every((file) => actualFiles.has(file)),
    'package filesystem coverage differs',
  );
  for (const file of expectedLinks)
    if (
      capture.packages.some((pkg) =>
        file.startsWith(pkg.observedRoot + path.sep),
      )
    )
      insist(actualLinks.has(file), 'missing package link');
}
function rehash() {
  clean();
  verifyPackageTopology();
  for (const file of capture.files) {
    insist(
      file.observedSource.startsWith(root + path.sep),
      'capture source escape',
    );
    verify(file.observedSource, file);
  }
  for (const link of capture.links) {
    insist(
      link.observedSource.startsWith(root + path.sep) &&
        fs.lstatSync(link.observedSource).isSymbolicLink() &&
        fs.readlinkSync(link.observedSource) === link.observedLiteral,
      'installed topology drift',
    );
    const resolved = fs.realpathSync(link.observedSource);
    insist(
      resolved === path.join(root, link.resolved.replace(/^runtime\//u, '')),
      'installed link target changed',
    );
  }
  for (const [file, record] of sdk) verify(file, record);
  for (const [file, record] of Object.entries(config.packageManifests))
    verify(file, record);
}
rehash();
const anchors = new Map([
  [path.join(root, 'backend/app/package.json'), 'app'],
  [path.join(root, 'package.json'), 'root'],
]);
const requests = [
  ['app', '@stynx-nyx/outbox'],
  ['app', '@stynx-nyx/offline-sync'],
  ['root', 'pg'],
];
const seeds = new Map();
for (const [anchor, name] of requests) {
  const file = [...anchors].find(([, label]) => label === anchor)[0];
  const resolved = fs.realpathSync(
    nodeModule.createRequire(file).resolve(name),
  );
  verify(resolved);
  seeds.set(anchor + '|' + name, resolved);
}
const edges = new Map();
for (const edge of config.edges) {
  const key = JSON.stringify([path.join(root, edge.from), edge.specifier]);
  if (!edges.has(key)) edges.set(key, new Set());
  edges
    .get(key)
    .add(
      edge.builtin
        ? 'node:' + edge.specifier.replace(/^node:/u, '')
        : path.join(root, edge.to),
    );
}
const optional = new Set();
insist(
  config.optional.length === 3 &&
    isDeepStrictEqual(
      config.optional.map((e) => e.specifier).sort(),
      [
        '@nestjs/websockets/socket-module',
        '@nestjs/microservices/microservices-module',
        '@nestjs/swagger',
      ].sort(),
    ),
  'three optional sites differ',
);
for (const edge of config.optional) {
  verify(path.join(root, edge.from));
  insist(
    edge.specifier === '@nestjs/swagger'
      ? edge.from.endsWith(
          '/@nestjs/terminus/dist/health-check/health-check.decorator.js',
        )
      : edge.from.endsWith('/@nestjs/core/nest-application.js'),
    'optional source site differs',
  );
  optional.add(JSON.stringify([path.join(root, edge.from), edge.specifier]));
}
const nearest = (file) => {
  let dir = path.dirname(file);
  while (dir.startsWith(root + '/node_modules/')) {
    const name = path.join(dir, 'package.json');
    if (config.packageManifests[name]) {
      const record = config.packageManifests[name];
      return { path: name, record, manifest: json(verify(name, record)) };
    }
    if (path.basename(dir) === 'node_modules') break;
    dir = path.dirname(dir);
  }
  return null;
};
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

const builtinRequire = nodeModule.createRequire(import.meta.url);
const childProcess = builtinRequire('node:child_process'),
  net = builtinRequire('node:net'),
  tls = builtinRequire('node:tls'),
  http = builtinRequire('node:http'),
  https = builtinRequire('node:https'),
  dns = builtinRequire('node:dns'),
  dgram = builtinRequire('node:dgram'),
  vm = builtinRequire('node:vm'),
  workers = builtinRequire('node:worker_threads');
const originalSpawn = childProcess.spawn;
const deny = (name) =>
  function () {
    return fail('forbidden effect ' + name);
  };
for (const [object, names, label] of [
  [tls, ['connect', 'createServer'], 'tls'],
  [http, ['request', 'get', 'createServer'], 'http'],
  [https, ['request', 'get', 'createServer'], 'https'],
  [dns, ['lookup', 'resolve', 'resolve4', 'resolve6', 'promises'], 'dns'],
  [dgram, ['createSocket'], 'dgram'],
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
for (const name of ['lookup', 'resolve', 'resolve4', 'resolve6'])
  if (typeof dns.promises?.[name] === 'function')
    dns.promises[name] = deny('dns.promises.' + name);
const originalConnect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  clean();
  const values = Array.isArray(args[0]) ? args[0] : args;
  const first = values[0],
    port = typeof first === 'object' ? first.port : first,
    host = typeof first === 'object' ? first.host : values[1];
  insist(
    String(port) === '65462' &&
      host === '127.0.0.1' &&
      !(typeof first === 'object' && (first.path || first.lookup)),
    'network outside leased PostgreSQL TCP',
  );
  return originalConnect.apply(this, args);
};
for (const name of [
  'spawnSync',
  'exec',
  'execSync',
  'execFile',
  'execFileSync',
  'fork',
])
  childProcess[name] = deny('child_process.' + name);
childProcess.spawn = function (executable, args, options) {
  clean();
  insist(
    executable === config.node.realpath &&
      Array.isArray(args) &&
      args.length === 3 &&
      args[0] === path.join(root, 'tools/stynx-storage-prior-verifier.mjs') &&
      args[1] === root &&
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u.test(
        args[2],
      ) &&
      options?.shell === false &&
      options.cwd === root,
    'nonfixed child process',
  );
  const allowedEnv = [
    'LANG',
    'LC_ALL',
    'TZ',
    'PGCLIENTENCODING',
    'PGPASSFILE',
    'DETRAN_STYNX_PRIOR_VERIFIER_REQUEST_SHA',
    'DETRAN_STYNX_STORAGE_EXECUTION_SHA',
  ];
  insist(
    isDeepStrictEqual(Object.keys(options.env).sort(), allowedEnv.sort()) &&
      options.env.DETRAN_STYNX_STORAGE_EXECUTION_SHA ===
        process.env.DETRAN_STYNX_STORAGE_EXECUTION_SHA,
    'child environment escape',
  );
  const source = candidate.inputs.filter(
    (r) => r.path === 'tools/stynx-storage-prior-verifier.mjs',
  );
  insist(source.length === 1, 'child source not reviewed');
  readRef(source[0]);
  const request = json(
    readRef({
      path:
        generation +
        '/installer-custody/detran_r22_161_g03_upgrade/attempt-' +
        args[2] +
        '/prior-verifier-request.json',
      sha256: options.env.DETRAN_STYNX_PRIOR_VERIFIER_REQUEST_SHA,
    }),
  );
  insist(
    request.attemptId === args[2] &&
      request.phase === 'prior160-before-upgrade' &&
      request.subject.databaseOid === '18767',
    'child request differs',
  );
  return originalSpawn.call(this, executable, args, options);
};
globalThis.fetch = deny('fetch');
if (globalThis.WebSocket) globalThis.WebSocket = deny('WebSocket');
nodeModule.syncBuiltinESMExports();
const hooks = nodeModule.registerHooks({
  resolve(specifier, context, next) {
    clean();
    const parent = context.parentURL?.startsWith('file:')
      ? fileURLToPath(context.parentURL)
      : null;
    const anchor = anchors.get(parent);
    const expected = anchor
      ? seeds.has(anchor + '|' + specifier)
        ? new Set([seeds.get(anchor + '|' + specifier)])
        : null
      : edges.get(JSON.stringify([parent, specifier]));
    const miss = optional.has(JSON.stringify([parent, specifier]));
    if (parent && sdk.has(parent)) verify(parent);
    insist(expected || miss, 'unknown module edge');
    let result;
    try {
      result = next(specifier, context);
    } catch (error) {
      if (
        miss &&
        ['MODULE_NOT_FOUND', 'ERR_MODULE_NOT_FOUND'].includes(error.code)
      ) {
        misses.push({ parent, specifier, code: error.code });
        throw error;
      }
      return fail('unknown missing/dynamic module');
    }
    insist(!miss, 'unexpected optional resolution');
    if (result.url.startsWith('node:'))
      insist(expected.has(result.url), 'builtin edge mismatch');
    else {
      insist(result.url.startsWith('file:'), 'nonfile module');
      const file = fileURLToPath(result.url);
      verify(file);
      insist(expected.has(file), 'module edge target mismatch');
      resolved.add(file);
    }
    return result;
  },
  load(address, context, next) {
    clean();
    if (address.startsWith('node:')) return next(address, context);
    insist(address.startsWith('file:'), 'nonfile evaluation');
    const file = fileURLToPath(address);
    const raw = verify(file);
    const result = next(address, context);
    let sourceHash = sha(raw);
    if (result.source !== undefined && result.source !== null) {
      const bytes =
        typeof result.source === 'string'
          ? Buffer.from(result.source)
          : Buffer.from(
              result.source.buffer ?? result.source,
              result.source.byteOffset ?? 0,
              result.source.byteLength,
            );
      sourceHash = sha(bytes);
      insist(sourceHash === sdk.get(file).sha256, 'transformed SDK source');
    }
    if (!['commonjs', 'module', 'json'].includes(result.format)) {
      const pkg = nearest(file);
      insist(
        isCanonicalUnspecifiedCjsFormat(
          {
            relativePath: path.relative(root, file),
            expectedSha256: sdk.get(file).sha256,
            actualSha256: sourceHash,
            nearestPackageJsonPath: pkg
              ? path.relative(root, pkg.path)
              : undefined,
            nearestPackageJsonSha256: pkg?.record.sha256,
          },
          pkg
            ? {
                relativePath: path.relative(root, pkg.path),
                actualSha256: pkg.record.sha256,
                manifest: pkg.manifest,
              }
            : null,
          context,
          result,
        ),
        'unknown module format',
      );
    }
    loaded.add(file);
    return result;
  },
});
const originalLoad = nodeModule.Module._load;
nodeModule.Module._load = function (request, parent, isMain) {
  const anchor = anchors.get(parent?.filename);
  const result = originalLoad.call(this, request, parent, isMain);
  if (!anchor) return result;
  const allowed = {
    '@stynx-nyx/outbox': ['renderOutboxStorage', 'verifyOutboxStorage'],
    '@stynx-nyx/offline-sync': [
      'renderOfflineStorage',
      'renderOfflineStorageMigrations',
      'verifyOfflineStorage',
    ],
    pg: ['Client'],
  }[request];
  insist(allowed, 'nonpublic seed');
  return new Proxy(result, {
    get(target, key, receiver) {
      insist(
        typeof key === 'string' && allowed.includes(key),
        'unselected public SDK API',
      );
      const value = Reflect.get(target, key, receiver);
      if (request !== 'pg') return value;
      return new Proxy(value, {
        construct(ctor, args, newTarget) {
          const c = args[0];
          insist(
            c &&
              c.host === '127.0.0.1' &&
              c.port === 65462 &&
              c.user === 'postgres' &&
              c.ssl === false &&
              (c.database === 'postgres' ||
                (roster.has(c.database) && c.database === process.env.DB_NAME)),
            'unleased PostgreSQL config',
          );
          return Reflect.construct(ctor, args, newTarget);
        },
      });
    },
  });
};
const status = Object.freeze({
  clean,
  rehash,
  observation: () => ({
    loaded: [...loaded].sort(),
    resolved: [...resolved].sort(),
    misses: [...misses],
    violations: [...violations],
  }),
  finish() {
    clean();
    for (const file of loaded) verify(file);
    nodeModule.Module._load = originalLoad;
    hooks.deregister();
    return this.observation();
  },
});
Object.defineProperty(
  globalThis,
  Symbol.for('detran.stynx.storage.runtime.guard'),
  { value: status, writable: false, configurable: false },
);
