// Private selected-method child. No exported execution/configuration API.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { createStorageTargetPlan } from './stynx-storage-forward.mjs';
const admissionSeal = {
  admittedInputs: {
    path: 'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03/admitted-inputs.json',
    sha256:
      'sha256:9381436615594db9f059cf966203cd9ab21b40157aecf965acc263fd32ea138b',
  },
};
const generation =
  'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03';
const prior = 'scratch/r22-adoption-161/prior-runtime';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
function isAdmittedInstallerExecutor(value) {
  return value === '/root' || value === '/root/engineer_outbox_160';
}

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}
function readRef(root, ref) {
  ensure(
    ref &&
      typeof ref.path === 'string' &&
      typeof ref.sha256 === 'string' &&
      /^sha256:[a-f0-9]{64}$/u.test(ref.sha256),
    'Unsealed input',
  );
  ensure(
    !/[\\:\0]/u.test(ref.path) &&
      ref.path.split('/').every((p) => p && p !== '.' && p !== '..'),
    'Input path refused',
  );
  let file = root;
  for (const part of ref.path.split('/')) {
    file = path.join(file, part);
    ensure(!fs.lstatSync(file).isSymbolicLink(), 'Input link refused');
  }
  ensure(
    fs.lstatSync(file).isFile() && fs.realpathSync(file) === file,
    'Input must be internal regular file',
  );
  const bytes = fs.readFileSync(file);
  ensure('sha256:' + hash(bytes) === ref.sha256, 'Input byte identity differs');
  if (Object.hasOwn(ref, 'bytes'))
    ensure(
      Number.isSafeInteger(ref.bytes) && ref.bytes === bytes.length,
      'Input byte count differs',
    );
  return bytes;
}
const plainRef = (value) => ({ path: value.path, sha256: value.sha256 });
function readJson(root, ref) {
  return JSON.parse(
    new TextDecoder('utf-8', { fatal: true }).decode(readRef(root, ref)),
  );
}
function closed(value, keys) {
  ensure(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      isDeepStrictEqual(Object.keys(value).sort(), keys.sort()),
    'Closed request fields differ',
  );
}
function prepare() {
  const actualRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
  );
  ensure(process.argv.length === 4, 'Two internal arguments required');
  const [root, attemptId] = process.argv.slice(2);
  ensure(
    root === actualRoot && fs.realpathSync(root) === root,
    'Exact repository root required',
  );
  ensure(
    typeof attemptId === 'string' &&
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u.test(
        attemptId,
      ),
    'Actual lowercase v4 attempt UUID required',
  );
  ensure(admissionSeal !== null, 'Actual input/lease/source admission is held');
  for (const key of ['NODE_OPTIONS', 'NODE_PATH', 'NODE_PG_FORCE_NATIVE'])
    ensure(!process.env[key], 'Ambient loader/native state refused');
  ensure(process.execArgv.length === 0, 'Preload/loader flags refused');
  const directory =
    generation +
    '/installer-custody/detran_r22_161_g03_upgrade/attempt-' +
    attemptId;
  const requestRef = {
    path: directory + '/prior-verifier-request.json',
    sha256: process.env.DETRAN_STYNX_PRIOR_VERIFIER_REQUEST_SHA,
  };
  const request = readJson(root, requestRef);
  closed(request, [
    'formatVersion',
    'kind',
    'phase',
    'attemptId',
    'activation',
    'admittedInputs',
    'subject',
    'endpoint',
    'output',
  ]);
  ensure(
    request.formatVersion === 1 &&
      request.kind === 'prior-public-verifier-request' &&
      request.phase === 'prior160-before-upgrade' &&
      request.attemptId === attemptId,
    'Request operation differs',
  );
  const subject = {
    clusterSystemIdentifier: '7696293464811719840',
    databaseOid: '18767',
    databaseName: 'detran_r22_161_g03_upgrade',
    owner: 'postgres',
  };
  ensure(
    isDeepStrictEqual(request.subject, subject) &&
      isDeepStrictEqual(request.endpoint, { host: '127.0.0.1', port: 65462 }) &&
      request.output === directory + '/prior-verifier-report.json',
    'Request subject/endpoint/output differs',
  );
  ensure(
    request.activation.path ===
      generation + '/installer-execution-activation.json' &&
      request.activation.sha256 ===
        process.env.DETRAN_STYNX_STORAGE_EXECUTION_SHA,
    'Fixed activation differs',
  );
  const activation = readJson(root, request.activation);
  closed(activation, [
    'formatVersion',
    'kind',
    'status',
    'source',
    'admittedInputs',
    'reviewedCandidate',
    'lease',
  ]);
  ensure(
    activation.formatVersion === 1 &&
      activation.kind === 'reviewed-stynx-storage-execution-activation' &&
      activation.status === 'ACTIVE',
    'Execution activation unavailable',
  );
  ensure(
    isDeepStrictEqual(
      plainRef(activation.admittedInputs),
      request.admittedInputs,
    ) &&
      isDeepStrictEqual(
        plainRef(activation.admittedInputs),
        plainRef(admissionSeal.admittedInputs),
      ),
    'Consumer-sealed input/lease refs differ',
  );
  ensure(
    activation.source.path === 'tools/stynx-storage-install.mjs',
    'Parent source differs',
  );
  readRef(root, activation.source);
  const candidate = readJson(root, activation.reviewedCandidate);
  closed(candidate, [
    'formatVersion',
    'kind',
    'sourceBeforeLease',
    'inputs',
    'reviews',
  ]);
  ensure(
    candidate.formatVersion === 1 &&
      candidate.kind === 'reviewed-stynx-storage-candidate' &&
      Array.isArray(candidate.inputs),
    'Actual reviewed candidate schema differs',
  );
  const own = candidate.inputs.filter(
    (ref) => ref.path === 'tools/stynx-storage-prior-verifier.mjs',
  );
  ensure(
    own.length === 1 &&
      own[0].sha256 ===
        'sha256:' + hash(fs.readFileSync(fileURLToPath(import.meta.url))),
    'Actual child source not in reviewed inventory',
  );
  readRef(root, own[0]);
  for (const [key, actor] of [
    ['inspector', '/root/inspector_adoption_160'],
    ['independent', '/root/architect_adoption_160'],
  ]) {
    ensure(
      candidate.reviews[key].actor === actor,
      'Actual candidate review actor differs',
    );
    readRef(root, candidate.reviews[key].report);
  }
  const lease = readJson(root, activation.lease);
  ensure(
    lease.status === 'ACTIVE' &&
      lease.executionLane === 'package-only-g03' &&
      lease.full === false &&
      lease.issuer === '/root' &&
      lease.holder === 'Engineer' &&
      isAdmittedInstallerExecutor(lease.grantee) &&
      lease.subjects.some((s) => isDeepStrictEqual(s, subject)) &&
      isDeepStrictEqual(lease.endpoint, request.endpoint),
    'Actual exclusive lease differs',
  );
  ensure(
    request.admittedInputs.path === generation + '/admitted-inputs.json',
    'Fixed discovery differs',
  );
  const inputs = readJson(root, request.admittedInputs);
  closed(inputs, [
    'formatVersion',
    'subjectManifest',
    'creationReview',
    'publication',
    'projection',
    'priorRuntime',
    'baselineInputs',
  ]);
  ensure(
    inputs.formatVersion === 1 &&
      inputs.baselineInputs.length === 1 &&
      inputs.baselineInputs[0].databaseName === subject.databaseName &&
      inputs.baselineInputs[0].databaseOid === subject.databaseOid,
    'Actual baseline roster differs',
  );
  const baseline = inputs.baselineInputs[0];
  createStorageTargetPlan(root, {
    publication: plainRef(inputs.publication),
    projection: plainRef(inputs.projection),
    priorRuntime: plainRef(inputs.priorRuntime),
    baseline: plainRef(baseline.baseline),
    baselineReview: plainRef(baseline.baselineReview),
  });
  const manifest = readJson(root, inputs.subjectManifest);
  readRef(root, inputs.creationReview);
  ensure(
    manifest.subjects.some((s) => isDeepStrictEqual(s, subject)) &&
      manifest.systemIdentifier === subject.clusterSystemIdentifier &&
      isDeepStrictEqual(manifest.endpoint, request.endpoint),
    'Creation identity differs',
  );
  const closure = readJson(root, {
    path: 'scratch/r22-adoption-161/prior-runtime/closure-manifest.json',
    sha256:
      'sha256:55454077278d8c60ac6abcb8b829fcc8bbcaa88efe09e1a2f0e07eb26f879f5d',
  });
  ensure(
    fs.realpathSync(process.execPath) === closure.node.realpath &&
      hash(fs.readFileSync(process.execPath)) === closure.node.sha256,
    'Actual retained Node differs',
  );
  const capture = readJson(root, {
    path: prior + '/' + closure.installedCapture.path,
    sha256: 'sha256:' + closure.installedCapture.sha256,
  });
  const graph = readJson(root, {
    path: prior + '/' + closure.staticGraph.path,
    sha256: 'sha256:' + closure.staticGraph.sha256,
  });
  const runtime = path.join(root, prior, 'runtime');
  const allowed = Object.fromEntries(
    capture.files
      .filter((f) => f.path.startsWith('runtime/'))
      .map((f) => [f.path.slice(8), { sha256: f.sha256, bytes: f.bytes }]),
  );
  const roots = ['@stynx-nyx/outbox', '@stynx-nyx/offline-sync', 'pg'].map(
    (name) => {
      const packages = capture.packages.filter((p) => p.name === name);
      ensure(packages.length === 1, 'Unique public prior seed required');
      const packageFile = path.join(
        root,
        prior,
        packages[0].root,
        'package.json',
      );
      const resolved = fs.realpathSync(
        createRequire(packageFile).resolve(name),
      );
      const relative = path.relative(runtime, resolved);
      ensure(
        allowed[relative] &&
          graph.files.some(
            (f) => f.path === relative && f.sha256 === allowed[relative].sha256,
          ),
        'Public seed outside sealed graph',
      );
      return { name, path: relative };
    },
  );
  const nearestPackages = {};
  for (const file of Object.keys(allowed)) {
    let dir = path.dirname(file);
    while (dir !== '.') {
      const p = dir + '/package.json';
      if (allowed[p]) {
        nearestPackages[file] = { path: p, sha256: allowed[p].sha256 };
        break;
      }
      dir = path.dirname(dir);
    }
  }
  const optionalMisses = graph.unresolved
    .filter(
      (m) =>
        m.from.endsWith('/@nestjs/core/nest-application.js') &&
        [
          '@nestjs/websockets/socket-module',
          '@nestjs/microservices/microservices-module',
        ].includes(m.specifier),
    )
    .map((m) => m.from + '|' + m.specifier);
  ensure(optionalMisses.length === 2, 'Exact optional miss inventory differs');
  let current = root;
  for (const part of directory.split('/')) {
    current = path.join(current, part);
    ensure(
      fs.lstatSync(current).isDirectory() &&
        !fs.lstatSync(current).isSymbolicLink(),
      'Output directory escape',
    );
  }
  const output = path.join(root, request.output);
  ensure(!fs.existsSync(output), 'Output already exists');
  return {
    runtime,
    allowed,
    edges: graph.edges,
    nearestPackages,
    roots,
    optionalMisses,
    builtins: [
      ...new Set(
        graph.edges
          .filter((e) => e.builtin)
          .map((e) => e.specifier.replace(/^node:/u, '')),
      ),
    ],
    subject,
    manifest,
    requestRef,
    output,
    binding: {
      ownerRole: 'postgres',
      appRole: 'role_app_backend',
      readerRole: null,
      tenantTable: { schema: 'auth', table: 'tenants', column: 'id' },
    },
  };
}
async function runPriorVerifier(config) {
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
  for (const entry of config.roots)
    admit('__anchor__', path.join(root, entry.path), entry.path);
  const knownMisses = new Set(config.optionalMisses);
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
    ['node:net', ['createServer']],
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
    if (name === 'node:net') {
      const original = object.Socket.prototype.connect;
      object.Socket.prototype.connect = function (...args) {
        const first = Array.isArray(args[0]) ? args[0] : args;
        const options = first[0];
        const port = typeof options === 'object' ? options.port : options;
        const host = typeof options === 'object' ? options.host : first[1];
        if (
          String(port) !== '65462' ||
          host !== '127.0.0.1' ||
          (typeof options === 'object' && (options.path || options.lookup))
        )
          return fail('network endpoint outside leased PostgreSQL TCP');
        return original.apply(this, args);
      };
    }
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

  const requirePrior = module.createRequire(anchor);
  let client = null,
    began = false,
    rolledBack = false,
    clientsClosed = false;
  const report = {
    disposition: 'failed-read-only',
    subject: config.subject,
    request: config.requestRef,
    identity: null,
    reports: [],
    loaded: [],
    resolved: [],
    optionalMisses,
    rolledBack: false,
    clientsClosed: false,
    cleanupErrors: [],
    error: null,
  };
  const cleanupErrors = [];
  let interrupted = null;
  function checkInterrupted() {
    ensure(!interrupted, 'Prior verifier interrupted: ' + interrupted);
  }
  const closeOnSignal = (signal) => {
    interrupted = signal;
    if (client)
      void client.end().catch((error) => cleanupErrors.push(error.message));
  };
  const signalHandlers = [];
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    const handler = () => closeOnSignal(signal);
    signalHandlers.push([signal, handler]);
    process.on(signal, handler);
  }
  try {
    const pgRoot = config.roots.find((r) => r.name === 'pg');
    const { Client } = requirePrior(path.join(root, pgRoot.path));
    const outbox = requirePrior(
      path.join(
        root,
        config.roots.find((r) => r.name === '@stynx-nyx/outbox').path,
      ),
    );
    const offline = requirePrior(
      path.join(
        root,
        config.roots.find((r) => r.name === '@stynx-nyx/offline-sync').path,
      ),
    );
    await new Promise((resolve) => setImmediate(resolve));
    checkInterrupted();
    assertClean();
    client = new Client({
      host: '127.0.0.1',
      port: 65462,
      user: 'postgres',
      database: 'detran_r22_161_g03_upgrade',
      password: '',
      ssl: false,
      client_encoding: 'UTF8',
      options: '-c row_security=on -c search_path=pg_catalog,public',
      application_name: 'r22-stynx-prior-readonly-verifier',
      connectionTimeoutMillis: 5000,
    });
    checkInterrupted();
    await client.connect();
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    began = true;
    await client.query(
      "SET LOCAL TIME ZONE 'UTC'; SET LOCAL row_security=on; SET LOCAL search_path=pg_catalog,public",
    );
    const identity = (
      await client.query(
        `SELECT (SELECT system_identifier::text FROM pg_control_system()) AS "clusterSystemIdentifier",d.oid::text AS "databaseOid",d.datname AS "databaseName",pg_get_userbyid(d.datdba) AS owner,current_user AS acting,session_user AS login,current_setting('transaction_read_only') AS readonly,current_setting('row_security') AS rls,current_setting('session_replication_role') AS replication,current_setting('data_directory') AS datadir,current_setting('port') AS port,current_setting('unix_socket_directories') AS sockets,current_setting('listen_addresses') AS addresses,pg_read_file('postmaster.pid') AS pidfile,to_char(transaction_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "atUtc" FROM pg_database d WHERE datname=current_database()`,
      )
    ).rows[0];
    ensure(
      isDeepStrictEqual(
        Object.fromEntries(
          Object.keys(config.subject).map((k) => [k, identity[k]]),
        ),
        config.subject,
      ),
      'Actual prior subject differs',
    );
    ensure(
      identity.acting === 'postgres' &&
        identity.login === 'postgres' &&
        identity.readonly === 'on' &&
        identity.rls === 'on' &&
        identity.replication === 'origin' &&
        identity.datadir === config.manifest.dataDirectory &&
        identity.port === '65462' &&
        identity.sockets === '' &&
        identity.addresses === '127.0.0.1' &&
        hash(identity.pidfile) === config.manifest.postmaster.pidfileSha256,
      'Actual prior role/cluster/process context differs',
    );
    report.identity = identity;
    checkInterrupted();
    report.reports.push(
      await outbox.verifyOutboxStorage(client, config.binding),
    );
    checkInterrupted();
    report.reports.push(
      await offline.verifyOfflineStorage(client, config.binding),
    );
    ensure(
      report.reports.every(
        (r) =>
          r.supported === true &&
          r.packageVersion === '1.6.0' &&
          Array.isArray(r.checks) &&
          r.checks.every((c) => c.status === 'pass'),
      ),
      'Prior public verifier unsupported/FAIL/UNKNOWN',
    );
    // Complete raw checks include the actual catalog values. No extra data seed/collector.
    assertClean();
    for (const file of loaded) verify(path.join(root, file));
    for (const file of Object.keys(requirePrior.cache)) verify(file);
    await client.query('ROLLBACK');
    began = false;
    rolledBack = true;
    await client.end();
    client = null;
    clientsClosed = true;
    checkInterrupted();
    report.disposition = 'verified-read-only';
  } catch (error) {
    report.error = {
      name: error.name,
      message: error.message,
      code: typeof error.code === 'string' ? error.code : null,
    };
  } finally {
    if (client) {
      if (began)
        try {
          await client.query('ROLLBACK');
          rolledBack = true;
        } catch (error) {
          cleanupErrors.push(error.message);
        }
      try {
        await client.end();
        client = null;
        clientsClosed = true;
      } catch (error) {
        cleanupErrors.push(error.message);
      }
    }
    for (const [signal, handler] of signalHandlers)
      process.removeListener(signal, handler);
    hooks.deregister();
  }
  report.loaded = [...loaded].sort();
  report.resolved = [...resolved].sort();
  report.rolledBack = rolledBack;
  report.clientsClosed = clientsClosed;
  report.cleanupErrors = cleanupErrors;
  report.interrupted = interrupted;
  report.violations = [...violations];
  if (
    interrupted ||
    violations.length ||
    !clientsClosed ||
    !rolledBack ||
    cleanupErrors.length ||
    report.error
  )
    report.disposition = 'failed-read-only';
  // Scoped trusted imports/selected read-only methods, not hostile-code OS confinement.
  const bytes = JSON.stringify(report) + '\n';
  writeObservation(config.output, bytes, { flag: 'wx', mode: 0o600 });
  const fd = fs.openSync(config.output, 'r');
  try {
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  const parent = fs.openSync(path.dirname(config.output), 'r');
  try {
    fs.fsyncSync(parent);
  } finally {
    fs.closeSync(parent);
  }
  ensure(
    report.disposition === 'verified-read-only',
    'Prior verifier failed; raw reports/cleanup retained',
  );
}
try {
  await runPriorVerifier(prepare());
} catch {
  process.stderr.write(
    'R22_PRIOR_VERIFIER_REFUSED: fixed prior verification refused; preserve retained evidence.\n',
  );
  process.exitCode = 1;
}
