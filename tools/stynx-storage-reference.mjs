import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorageTargetPlan } from './stynx-storage-forward.mjs';
import { readHistoricalPlanInput } from './stynx-storage-portable-plan-inputs.mjs';

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const cluster = 'scratch/r22-adoption-161/db-rehearsal/cluster-02';
const generation = `${cluster}/generation-03`;
const prior = 'scratch/r22-adoption-161/prior-runtime';
const admission = 'scratch/r22-adoption-161/package-admission';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const inputs = {
  publication: {
    path: `${admission}/protected-publication-verification.json`,
    sha256:
      'sha256:46815c17be9dbcd2080a3a0c08db958bd42390d8766c64ef40bebd5017074318',
  },
  projection: {
    path: `${admission}/projection/public-storage-projection.json`,
    sha256:
      'sha256:944f0041700de5e2c31ebf0e71b7999df999d76cc6645b3bec38ddfc0f692388',
  },
  priorRuntime: {
    path: `${prior}/closure-manifest.json`,
    sha256:
      'sha256:55454077278d8c60ac6abcb8b829fcc8bbcaa88efe09e1a2f0e07eb26f879f5d',
  },
  baseline: null,
  baselineReview: null,
};
const subjects = [
  ['prior-fresh', 'ref160', '18765'],
  ['ordered-prefix', 'refprefix8', '18766'],
  ['upgrade-source', 'upgrade', '18767'],
].map(([purpose, name, oid]) => ({
  purpose,
  subject: {
    clusterSystemIdentifier: '7696293464811719840',
    databaseOid: oid,
    databaseName: `detran_r22_161_g03_${name}`,
    owner: 'postgres',
  },
  endpoint: { host: '127.0.0.1', port: 65462 },
}));
const fixture = {
  path: 'backend/app/tests/e2e/r22-sse-tenancy.support.ts',
  sha256:
    'sha256:84a21cec5e016623aacd7e3a0f7906ecacc9bf47453330bcf3fca0f4b3d3f475',
};
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
function insist(condition, message) {
  if (!condition) throw new Error(message);
}
function readSealed(root, relative, expected) {
  insist(
    typeof relative === 'string' &&
      !path.isAbsolute(relative) &&
      !relative.split('/').includes('..'),
    'Invalid retained path',
  );
  const filename = path.join(root, relative);
  let current = root;
  for (const component of relative.split('/')) {
    current = path.join(current, component);
    insist(
      !fs.lstatSync(current).isSymbolicLink(),
      'Retained input symlink refused',
    );
  }
  insist(
    fs.statSync(filename).isFile() && fs.realpathSync(filename) === filename,
    'Retained input is not a regular internal file',
  );
  const bytes = fs.readFileSync(filename);
  insist(
    sha256(bytes) === expected.replace(/^sha256:/, ''),
    `Retained input identity differs: ${relative}`,
  );
  return bytes;
}

// Pure only: private CLI and actual lease/PID/SQL readers retain readSealed.
function readPureSealed(root, relative, expected) {
  insist(
    typeof expected === 'string',
    'Historical expected hash must be a string',
  );
  // The canonical current fixture remains a strict product-file read, never historical data.
  if (!relative.startsWith('scratch/r22-adoption-161/'))
    return readSealed(root, relative, expected);
  return readHistoricalPlanInput(root, {
    path: relative,
    sha256: expected.startsWith('sha256:') ? expected : 'sha256:' + expected,
  });
}
function readRetainedRoleGraph(root, reader = readSealed) {
  const readbackRoot = `${generation}/inspector-creation-readback`;
  const manifest = JSON.parse(
    reader(
      root,
      `${readbackRoot}/READBACK-MANIFEST.json`,
      '397cad93429c63cd01527d4799aaf8b168a4670bab10e34199a6cfad0652dcae',
    ).toString('utf8'),
  );
  const matches = manifest.references.filter(
    (entry) => entry.path === 'postgres.json',
  );
  insist(
    matches.length === 1,
    'Actual g03 maintenance snapshot absent or duplicated',
  );
  const records = JSON.parse(
    reader(root, `${readbackRoot}/postgres.json`, matches[0].sha256).toString(
      'utf8',
    ),
  );
  const rows = (kind) => {
    const found = records.filter((record) => record.kind === kind);
    insist(
      found.length === 1 && Array.isArray(found[0].rows),
      'Actual g03 role snapshot kind differs',
    );
    return found[0].rows;
  };
  const pristine = records.at(-1);
  insist(
    Array.isArray(pristine.roleSettings),
    'Actual g03 role settings absent',
  );
  return {
    roles: rows('roles'),
    memberships: rows('memberships'),
    'effective-role-closure': rows('effective-role-closure'),
    roleSettings: pristine.roleSettings,
  };
}

// This factory only revalidates retained bytes. It grants no execution lease,
// captures no clock, and does not import or execute any platform package.
export function createStorageReferencePlan(root) {
  try {
    insist(
      typeof root === 'string' && root.length > 0 && path.isAbsolute(root),
      'Exact absolute repository root required',
    );
    insist(
      path.resolve(root) === root &&
        fs.realpathSync(root) === repositoryRoot &&
        root === repositoryRoot,
      'Reference repository root differs',
    );
    const priorClosure = JSON.parse(
      readPureSealed(
        root,
        inputs.priorRuntime.path,
        inputs.priorRuntime.sha256,
      ),
    );
    const priorCapture = JSON.parse(
      readPureSealed(
        root,
        prior + '/' + priorClosure.installedCapture.path,
        priorClosure.installedCapture.sha256,
      ),
    );
    const suffix = '/node_modules/.pnpm';
    insist(
      typeof priorCapture.sourceStore === 'string' &&
        priorCapture.sourceStore.endsWith(suffix) &&
        path.isAbsolute(priorCapture.sourceStore),
      'Historical prior source root differs',
    );
    const observedRoot = priorCapture.sourceStore.slice(0, -suffix.length);
    const manifest = JSON.parse(
      readPureSealed(
        root,
        `${generation}/subject-manifest.json`,
        'c95aab0e477ead92f8e2b3a0f9b966321f95abded92d090e354fe74bad9711d4',
      ).toString('utf8'),
    );
    const readbackRoot = `${generation}/inspector-creation-readback`;
    readPureSealed(
      root,
      `${readbackRoot}/INSPECTOR-CREATION-READBACK.md`,
      'd3cb05aff96cc6b2e51829744a97ef19b03d69fea6eb5fe8519c591af8ff4ad2',
    );
    const readback = JSON.parse(
      readPureSealed(
        root,
        `${readbackRoot}/INSPECTOR-CREATION-READBACK.json`,
        'd63a1cfc141185f5d1dae6e7e2bcdd4b5192f1f63bd4a9f7b24be71b541e0ce5',
      ).toString('utf8'),
    );
    const readbackManifest = JSON.parse(
      readPureSealed(
        root,
        `${readbackRoot}/READBACK-MANIFEST.json`,
        '397cad93429c63cd01527d4799aaf8b168a4670bab10e34199a6cfad0652dcae',
      ).toString('utf8'),
    );
    const returned = JSON.parse(
      readPureSealed(
        root,
        `${readbackRoot}/lease-returned-inspector.json`,
        'bdb21f5b42ad97099b27760e857d746dd80fb336e27d2372df353e27d2f891df',
      ).toString('utf8'),
    );
    for (const entry of readbackManifest.references) {
      const bytes = readPureSealed(
        root,
        entry.path === '../subject-manifest.json'
          ? `${generation}/subject-manifest.json`
          : `${readbackRoot}/${entry.path}`,
        entry.sha256,
      );
      insist(
        bytes.length === entry.bytes,
        'Generation03 readback size differs',
      );
    }
    insist(
      manifest.kind === 'actual-cluster02-generation03-creation' &&
        manifest.systemIdentifier === '7696293464811719840' &&
        manifest.identity.systemIdentifier === manifest.systemIdentifier &&
        manifest.identity.port === '65462' &&
        manifest.identity.listenAddresses === '127.0.0.1' &&
        manifest.identity.unixSockets === '' &&
        manifest.identity.serverVersionNum === '180002' &&
        manifest.identity.currentUser === 'postgres' &&
        manifest.identity.sessionUser === 'postgres' &&
        manifest.identity.readOnly === 'on' &&
        manifest.identity.dataDirectory ===
          path.join(observedRoot, cluster, 'data') &&
        manifest.dataDirectory === manifest.identity.dataDirectory &&
        manifest.postmaster.pid === 64859 &&
        manifest.postmaster.pidfileSha256 ===
          '6ddd0f8522567a1fa4ef1ad9cf7c1a0f3193dd1b5cdfc675b1c51ea43641bc7f' &&
        readback.result === 'PASS' &&
        readback.sdkExecuted === false &&
        readback.writesExecuted === false &&
        returned.status === 'RETURNED' &&
        returned.sqlConnectionsClosed === true &&
        returned.allCapturesRolledBack === true &&
        returned.writesExecuted === false &&
        returned.sdkExecuted === false,
      'Generation03 creation/readback identity differs',
    );
    readRetainedRoleGraph(root, readPureSealed);
    readPureSealed(root, fixture.path, fixture.sha256);
    for (const { subject, endpoint } of subjects) {
      const actual = manifest.subjects.find(
        (entry) => entry.databaseName === subject.databaseName,
      );
      insist(
        actual &&
          Object.entries(subject).every(
            ([key, value]) => actual[key] === value,
          ) &&
          manifest.endpoint.host === endpoint.host &&
          manifest.endpoint.port === endpoint.port &&
          readback.subjects.some(
            (entry) =>
              entry.subject === subject.databaseName &&
              entry.databaseOid === subject.databaseOid &&
              entry.identity === 'PASS' &&
              entry.fullPristineCatalog === 'PASS' &&
              entry.rolesMembershipUnchanged === 'PASS' &&
              entry.setInheritClosure === 'PASS' &&
              entry.noOtherClientSession === 'PASS',
          ),
        'Reference subject identity differs',
      );
    }
    return {
      formatVersion: 'detran-stynx-storage-reference-plan/1',
      targetPlan: createStorageTargetPlan(root, inputs),
      subjects: structuredClone(subjects),
      fixtures: {
        source: { ...fixture },
        tenantA: '00000000-0000-7000-8000-000000000101',
        tenantB: '00000000-0000-7000-8000-000000000102',
        actorA: '00000000-0000-4000-8000-000000000201',
        actorB: '00000000-0000-4000-8000-000000000202',
        restrictedLogin: 'role_r22_161_app',
        appRole: 'role_app_backend',
        readerRole: null,
        businessClock: {
          mode: 'capture-once-sql-utc',
          recordPath: `${generation}/reference-proof/business-clock.json`,
          reservationValidForMs: 86400000,
        },
      },
      operations: [...operations],
    };
  } catch (cause) {
    throw Object.assign(
      new Error(`Reference plan refused: ${cause.message}`, { cause }),
      { code: 'R22_STORAGE_REFERENCE_PLAN_INVALID' },
    );
  }
}

async function referenceChild(config) {
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
  const retain = (name, value) => {
    if (!/^[a-z0-9-]+[.]json$/u.test(name))
      fail('invalid retained output name');
    const output = path.join(config.output, name);
    writeObservation(output, JSON.stringify(value, null, 2) + '\n', {
      flag: 'wx',
      mode: 0o600,
    });
  };
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

  const contexts = [],
    clients = [],
    queryLog = [],
    phases = [],
    cleanup = [];
  const ensure = (condition, message) => {
    if (!condition) fail(message);
  };
  const canonical = (value) =>
    Array.isArray(value)
      ? value.map(canonical)
      : value && typeof value === 'object'
        ? Object.fromEntries(
            Object.keys(value)
              .sort()
              .map((key) => [key, canonical(value[key])]),
          )
        : value;
  const equal = (a, b, message) =>
    ensure(
      JSON.stringify(canonical(a)) === JSON.stringify(canonical(b)),
      message,
    );
  const phase = (name, detail) => {
    assertClean();
    phases.push({ name, detail });
    retain(
      `phase-${String(phases.length).padStart(2, '0')}-${name}.json`,
      detail,
    );
  };
  const closeContext = async (context, stage) => {
    try {
      await context.close();
      const index = contexts.indexOf(context);
      if (index >= 0) contexts.splice(index, 1);
    } catch (error) {
      cleanup.push({ kind: 'context-close', stage, message: error.message });
      throw error;
    }
  };
  let maintenance;
  let roleGraphWitnessReady = false;
  let captureRoleGraph;
  let assertUnchangedRoleGraph;
  try {
    const requireRuntime = module.createRequire(anchor);
    const publicLoad = (name) => {
      const seed = config.roots.find((r) => r.name === name);
      ensure(seed, 'Unknown public seed');
      return requireRuntime(path.join(root, seed.path));
    };
    const outbox = publicLoad('@stynx-nyx/outbox');
    const offline = publicLoad('@stynx-nyx/offline-sync');
    const data = publicLoad('@stynx-nyx/data');
    const nest = publicLoad('@nestjs/core');
    const common = publicLoad('@nestjs/common');
    const pg = publicLoad('pg');
    assertClean();
    // Observation preserves the public pg return/callback contract. The one
    // exact startup guard additionally gets two SELECT-only SQL UTC/session
    // witnesses on that same client, inside its existing READ ONLY transaction.
    const query = pg.Client.prototype.query;
    const startupWitnessSql = `SELECT current_database() AS database,current_user::text AS acting,session_user::text AS login,
      current_setting('transaction_read_only') AS readonly,current_setting('row_security') AS rls,
      current_setting('session_replication_role') AS replication,pg_backend_pid() AS pid,
      to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS utc`;
    pg.Client.prototype.query = function (...args) {
      const value = args[0];
      const entry = {
        ordinal: queryLog.length,
        text: typeof value === 'string' ? value : value?.text,
        values:
          args[1] instanceof Function ? undefined : (args[1] ?? value?.values),
      };
      queryLog.push(entry);
      const completed = (result) => {
        const record = (r) => ({
          command: r.command,
          rowCount: r.rowCount,
          rows: r.rows,
        });
        entry.result = Array.isArray(result)
          ? result.map(record)
          : record(result);
        return result;
      };
      const rejected = (error) => {
        entry.error = {
          code: error.code ?? null,
          name: error.name,
          message: error.message,
        };
        throw error;
      };
      const guard =
        typeof entry.text === 'string' &&
        entry.text
          .trimStart()
          .startsWith(
            'select c.relname as relation, o.rolname::text as owner,',
          ) &&
        entry.text.includes("n.nspname = 'outbox'");
      if (guard) {
        ensure(
          !args.some((arg) => typeof arg === 'function'),
          'Selected startup guard unexpectedly uses callback protocol',
        );
        const session = async () =>
          (await query.call(this, startupWitnessSql)).rows[0];
        return (async () => {
          try {
            entry.startupGuard = {
              sourceSql: startupWitnessSql,
              before: await session(),
            };
            const result = completed(await query.apply(this, args));
            entry.startupGuard.after = await session();
            const { before, after } = entry.startupGuard;
            for (const actual of [before, after])
              ensure(
                config.plan.subjects.some(
                  (s) => s.subject.databaseName === actual.database,
                ) &&
                  actual.acting === 'postgres' &&
                  actual.login === 'postgres' &&
                  actual.readonly === 'on' &&
                  actual.rls === 'on' &&
                  actual.replication === 'origin' &&
                  /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d[.]\d{6}Z$/u.test(actual.utc),
                'Actual Outbox startup guard session is not owner READ ONLY',
              );
            ensure(
              before.pid === after.pid &&
                before.database === after.database &&
                before.utc <= after.utc,
              'Outbox startup SQL brackets differ',
            );
            ensure(
              entry.values?.[0] === 'role_app_backend' &&
                result.rows.length > 0 &&
                result.rows.every(
                  (r) =>
                    r.owner === 'postgres' &&
                    r.owns === false &&
                    r.member === false,
                ),
              'Actual Outbox startup ownership result differs',
            );
            equal(
              result.rows.map((r) => r.relation).sort(),
              [...entry.values[1]].sort(),
              'Actual Outbox startup checked relation inventory differs',
            );
            return result;
          } catch (error) {
            return rejected(error);
          }
        })();
      }
      const callbackIndex = args.findLastIndex(
        (arg) => typeof arg === 'function',
      );
      if (callbackIndex >= 0) {
        const callback = args[callbackIndex];
        args[callbackIndex] = (error, result) => {
          if (error)
            entry.error = {
              code: error.code ?? null,
              name: error.name,
              message: error.message,
            };
          else completed(result);
          callback(error, result);
        };
        return query.apply(this, args);
      }
      try {
        const result = query.apply(this, args);
        return result?.then ? result.then(completed, rejected) : result;
      } catch (error) {
        return rejected(error);
      }
    };
    const connect = async (database, user = 'postgres') => {
      ensure(
        database === 'postgres' ||
          config.plan.subjects.some((s) => s.subject.databaseName === database),
        'Unleased database name',
      );
      ensure(
        ['postgres', 'role_r22_161_app'].includes(user),
        'Unadmitted connection identity',
      );
      const client = new pg.Client({
        host: '127.0.0.1',
        port: 65462,
        database,
        user,
        password: '',
        ssl: false,
        application_name: 'r22-stynx-reference',
        connectionTimeoutMillis: 5000,
      });
      clients.push(client);
      await client.connect();
      return client;
    };
    const readOnly = async (client, fn) => {
      await client.query('BEGIN READ ONLY');
      try {
        await client.query(
          "SET LOCAL row_security=on; SET LOCAL search_path=pg_catalog; SET LOCAL timezone='UTC'",
        );
        const result = await fn();
        await client.query('ROLLBACK');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    };
    captureRoleGraph = async function captureRoleGraph(client) {
      return readOnly(
        client,
        async () =>
          (
            await client.query(`SELECT jsonb_build_object(
        'roles',(SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY rolname),'[]') FROM
          (SELECT oid::text,rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconnlimit,rolvaliduntil::text FROM pg_roles) a),
        'memberships',(SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY roleid,member),'[]') FROM pg_auth_members a),
        'effective-role-closure',(SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY principal,reachable),'[]') FROM
          (SELECT p.rolname AS principal,r.rolname AS reachable,pg_has_role(p.oid,r.oid,'SET') AS can_set,
           pg_has_role(p.oid,r.oid,'USAGE') AS inherits,pg_has_role(p.oid,r.oid,'MEMBER') AS member,
           r.rolsuper,r.rolbypassrls,r.rolcreaterole,r.rolcreatedb,r.rolreplication,
           has_database_privilege(r.oid,current_database(),'CREATE') AS database_create,
           has_schema_privilege(r.oid,'public','CREATE') AS public_create
           FROM pg_roles p CROSS JOIN pg_roles r WHERE p.rolname IN ('role_app_backend','role_auditor_min','role_r22_161_app') AND
           (p.oid=r.oid OR pg_has_role(p.oid,r.oid,'SET') OR pg_has_role(p.oid,r.oid,'USAGE') OR pg_has_role(p.oid,r.oid,'MEMBER'))) a),
        'roleSettings',(SELECT coalesce(jsonb_agg(to_jsonb(s) ORDER BY setdatabase,setrole),'[]') FROM pg_db_role_setting s
          WHERE setdatabase=0 OR setdatabase=(SELECT oid FROM pg_database WHERE datname=current_database()))
        ) AS graph`)
          ).rows[0].graph,
      );
    };
    assertUnchangedRoleGraph = function assertUnchangedRoleGraph(
      actual,
      expected,
    ) {
      equal(actual, expected, 'Complete existing g03 role graph differs');
      ensure(
        actual['effective-role-closure'].length === 4 &&
          actual['effective-role-closure'].every(
            (row) =>
              !row.rolsuper &&
              !row.rolbypassrls &&
              !row.rolcreaterole &&
              !row.rolcreatedb &&
              !row.rolreplication &&
              !row.database_create &&
              !row.public_create &&
              (row.principal === row.reachable ||
                (row.principal === 'role_r22_161_app' &&
                  row.reachable === 'role_app_backend')),
          ),
        'Existing principal role capability closure is unsafe',
      );
    };
    const identity = async (client, subject) =>
      readOnly(client, async () => {
        const row = (
          await client.query(`SELECT current_database() AS "databaseName", d.oid::text AS "databaseOid", pg_get_userbyid(d.datdba) AS owner,
       (pg_control_system()).system_identifier::text AS "clusterSystemIdentifier", current_user::text AS "currentUser", session_user::text AS "sessionUser",
       current_setting('data_directory') AS "dataDirectory", current_setting('port') AS port,
       current_setting('unix_socket_directories') AS sockets, current_setting('listen_addresses') AS addresses,
       current_setting('server_version_num') AS version, current_setting('transaction_read_only') AS readonly
       FROM pg_database d WHERE d.datname=current_database()`)
        ).rows[0];
        for (const [key, value] of Object.entries(subject))
          ensure(row[key] === value, `Actual subject differs: ${key}`);
        ensure(
          row.currentUser === 'postgres' &&
            row.sessionUser === 'postgres' &&
            row.port === '65462' &&
            row.sockets === '' &&
            row.addresses === '127.0.0.1' &&
            row.version === '180002' &&
            row.readonly === 'on' &&
            row.dataDirectory === config.dataDirectory,
          'Actual cluster/session differs',
        );
        return row;
      });
    const binding = config.plan.targetPlan.binding;
    const rendered = {
      outbox: outbox.renderOutboxStorage(binding),
      offline: offline.renderOfflineStorage(binding),
    };
    const identities = {};
    for (const [name, artifact] of Object.entries(rendered)) {
      ensure(
        artifact.packageVersion === '1.6.0',
        'Prior public renderer version differs',
      );
      const packageName =
        '@stynx-nyx/' + (name === 'offline' ? 'offline-sync' : name);
      const filename =
        name === 'offline' ? '19-stynx-offline.sql' : '19-stynx-outbox.sql';
      const sql = `-- Generated by tools/generate-stynx-storage.mjs from installed ${packageName}@1.6.0.\n-- D-160: additive storage only; no legacy transfer or audit rewrite.\n${artifact.objectsSql}\n${artifact.roleBindingsSql}`;
      const rootEntry = config.roots.find((r) => r.name === packageName);
      const metadata = {
        package: packageName,
        packageVersion: artifact.packageVersion,
        contractVersion: artifact.contractVersion,
        entrypointSha256: config.allowed[rootEntry.path].sha256,
        binding: artifact.binding,
        target: 'backend/database/ddl/' + filename,
        sha256: hash(sql),
        objectsSha256: hash(artifact.objectsSql),
        roleBindingsSha256: hash(artifact.roleBindingsSql),
        manifest: artifact.manifest,
      };
      identities[packageName] = {
        ...metadata,
        sourceManifestSha256: hash(
          JSON.stringify(canonical(artifact.manifest)),
        ),
      };
      const historical = config.originalIdentities.find(
        (r) => r.package === packageName,
      );
      ensure(historical, 'Historical identity comparator absent');
      equal(
        identities[packageName],
        JSON.parse(historical.identity_sql_text),
        'Actual prior rendered identity differs from immutable original identity',
      );
    }
    maintenance = await connect('postgres');
    await readOnly(maintenance, async () => {
      const actual = (
        await maintenance.query(
          "SELECT (pg_control_system()).system_identifier::text AS sysid,current_user::text AS acting,session_user::text AS login,current_setting('data_directory') AS datadir,pg_read_file('postmaster.pid') AS pidfile",
        )
      ).rows[0];
      ensure(
        actual.sysid === '7696293464811719840' &&
          actual.acting === 'postgres' &&
          actual.login === 'postgres' &&
          actual.datadir === config.dataDirectory &&
          hash(actual.pidfile) === config.postmasterPidfileSha256 &&
          actual.pidfile.split('\n')[0] === '64859',
        'Maintenance identity differs',
      );
    });
    await maintenance.query('SELECT pg_advisory_lock(7007,1600)');
    roleGraphWitnessReady = true;
    const roleGraphBefore = await captureRoleGraph(maintenance);
    retain('role-graph-before.json', roleGraphBefore);
    assertUnchangedRoleGraph(roleGraphBefore, config.expectedRoleGraph);
    const references = [];
    const pristineSql = `SELECT jsonb_build_object(
      'schemas',(SELECT coalesce(jsonb_agg(jsonb_build_object('name',nspname,'owner',pg_get_userbyid(nspowner),'acl',nspacl::text) ORDER BY nspname COLLATE "C"),'[]') FROM pg_namespace WHERE nspname !~ '^pg_' AND nspname <> 'information_schema'),
      'relations',(SELECT coalesce(jsonb_agg(jsonb_build_object('schema',n.nspname,'name',c.relname,'kind',c.relkind,'owner',pg_get_userbyid(c.relowner)) ORDER BY n.nspname COLLATE "C",c.relname COLLATE "C"),'[]') FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'),
      'functions',(SELECT coalesce(jsonb_agg(jsonb_build_object('schema',n.nspname,'name',p.proname,'arguments',pg_get_function_identity_arguments(p.oid),'owner',pg_get_userbyid(p.proowner)) ORDER BY n.nspname COLLATE "C",p.proname COLLATE "C",p.oid),'[]') FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'),
      'types',(SELECT coalesce(jsonb_agg(jsonb_build_object('schema',n.nspname,'name',t.typname,'kind',t.typtype) ORDER BY n.nspname COLLATE "C",t.typname COLLATE "C"),'[]') FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'),
      'eventTriggers',(SELECT coalesce(jsonb_agg(jsonb_build_object('name',evtname,'event',evtevent,'enabled',evtenabled,'owner',pg_get_userbyid(evtowner)) ORDER BY evtname COLLATE "C"),'[]') FROM pg_event_trigger),
      'extensions',(SELECT coalesce(jsonb_agg(extname ORDER BY extname COLLATE "C"),'[]') FROM pg_extension),
      'defaults',(SELECT coalesce(jsonb_agg(to_jsonb(d) ORDER BY oid),'[]') FROM pg_default_acl d),
      'roleSettings',(SELECT coalesce(jsonb_agg(to_jsonb(s) ORDER BY setdatabase,setrole),'[]') FROM pg_db_role_setting s WHERE setdatabase=0 OR setdatabase=(SELECT oid FROM pg_database WHERE datname=current_database())),
      'foreignWrappers',(SELECT coalesce(jsonb_agg(fdwname ORDER BY fdwname COLLATE "C"),'[]') FROM pg_foreign_data_wrapper),
      'foreignServers',(SELECT coalesce(jsonb_agg(srvname ORDER BY srvname COLLATE "C"),'[]') FROM pg_foreign_server),
      'publications',(SELECT coalesce(jsonb_agg(pubname ORDER BY pubname COLLATE "C"),'[]') FROM pg_publication),
      'subscriptions',(SELECT coalesce(jsonb_agg(subname ORDER BY subname COLLATE "C"),'[]') FROM pg_subscription)
      ) AS pristine`;
    const expectedPristine = {
      schemas: [
        {
          name: 'public',
          owner: 'pg_database_owner',
          acl: '{pg_database_owner=UC/pg_database_owner,=U/pg_database_owner}',
        },
      ],
      relations: [],
      functions: [],
      types: [],
      eventTriggers: [],
      extensions: ['plpgsql'],
      defaults: [],
      roleSettings: [],
      foreignWrappers: [],
      foreignServers: [],
      publications: [],
      subscriptions: [],
    };
    for (const entry of config.plan.subjects) {
      const client = await connect(entry.subject.databaseName);
      const actual = await identity(client, entry.subject);
      const pristine = await readOnly(
        client,
        async () => (await client.query(pristineSql)).rows[0].pristine,
      );
      equal(pristine, expectedPristine, 'Reference subject is not pristine');
      references.push({ ...entry, client, actual, pristine });
    }
    phase('revalidate-subjects-and-lease', {
      lease: config.lease,
      subjects: references.map(({ actual, pristine }) => ({
        actual,
        pristine,
      })),
      pristineSql,
    });
    const clockQuery = `WITH c AS MATERIALIZED (SELECT clock_timestamp() AS t)
      SELECT to_char(t AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS now,
       to_char((t+interval '24 hours') AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "validUntil",
       current_database() AS database,current_user::text AS acting,session_user::text AS login FROM c`;
    const clock = await readOnly(
      references[0].client,
      async () => (await references[0].client.query(clockQuery)).rows[0],
    );
    ensure(
      /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{6}Z$/u.test(clock.now) &&
        clock.acting === 'postgres' &&
        clock.login === 'postgres',
      'SQL business clock differs',
    );
    retain('business-clock.json', {
      mode: 'capture-once-sql-utc',
      sourceSql: clockQuery,
      sourceSubject: references[0].subject,
      ...clock,
      reservationValidForMs: 86400000,
      purpose: 'TEST_ONLY business fixture; never storage admission time',
    });
    phase('capture-business-clock', clock);
    const bootstrapSql = `CREATE SCHEMA auth AUTHORIZATION postgres; CREATE SCHEMA integration AUTHORIZATION postgres;
      REVOKE ALL ON SCHEMA auth,integration FROM PUBLIC;
      CREATE TABLE auth.tenants(id uuid PRIMARY KEY,slug text UNIQUE NOT NULL,name text NOT NULL);
      INSERT INTO auth.tenants VALUES ('00000000-0000-7000-8000-000000000101','rr','DETRAN RR'),('00000000-0000-7000-8000-000000000102','sp','DETRAN SP');
      CREATE FUNCTION auth.current_tenant() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('app.tenant_id',true),'')::uuid $$;
      GRANT USAGE ON SCHEMA auth TO role_app_backend;
      GRANT SELECT ON auth.tenants TO role_app_backend;
      CREATE TABLE integration.test_effects(tenant_id uuid NOT NULL,logical_key text NOT NULL,actor_id uuid NOT NULL,business_agent text NOT NULL,body jsonb NOT NULL,PRIMARY KEY(tenant_id,logical_key));
      ALTER TABLE integration.test_effects ENABLE ROW LEVEL SECURITY; ALTER TABLE integration.test_effects FORCE ROW LEVEL SECURITY;
      CREATE POLICY test_effect_tenant ON integration.test_effects TO role_app_backend USING(tenant_id=nullif(current_setting('app.tenant_id',true),'')::uuid) WITH CHECK(tenant_id=nullif(current_setting('app.tenant_id',true),'')::uuid AND actor_id=nullif(current_setting('app.actor_id',true),'')::uuid);
      GRANT USAGE ON SCHEMA integration TO role_app_backend; GRANT SELECT,INSERT ON integration.test_effects TO role_app_backend;`;
    for (const ref of references) {
      await ref.client.query('BEGIN');
      try {
        await ref.client.query(bootstrapSql);
        await ref.client.query('COMMIT');
      } catch (error) {
        await ref.client.query('ROLLBACK');
        throw error;
      }
    }
    phase('bootstrap-common-auth', {
      roleGraph: config.expectedRoleGraph,
      clusterRoleWrites: false,
      bootstrapSql,
      fixtures: config.plan.fixtures,
    });
    const installed = [];
    for (const ref of references.filter(
      (r) => r.purpose !== 'ordered-prefix',
    )) {
      await ref.client.query('BEGIN');
      try {
        await ref.client.query('SELECT pg_advisory_xact_lock(7007,1)');
        await ref.client.query('SET LOCAL search_path=pg_catalog,public');
        await ref.client.query(config.ledgerSql);
        for (const artifact of Object.values(rendered)) {
          await ref.client.query(artifact.objectsSql);
          await ref.client.query(artifact.roleBindingsSql);
        }
        await ref.client.query(
          'SET LOCAL row_security=on; SET LOCAL search_path=pg_catalog',
        );
        for (const [name, value] of Object.entries(identities))
          await ref.client.query(
            'INSERT INTO integration.stynx_storage_installations(package,identity) VALUES($1,$2::jsonb)',
            [name, JSON.stringify(value)],
          );
        const rows = (
          await ref.client.query(
            'SELECT package,identity::text AS identity_sql_text,installed_by::text,to_char(installed_at AT TIME ZONE \'UTC\',\'YYYY-MM-DD"T"HH24:MI:SS.US"Z"\') AS installed_at_utc FROM integration.stynx_storage_installations ORDER BY package COLLATE "C"',
          )
        ).rows;
        retain(`${ref.purpose}-fresh-rows-candidate.json`, { rows });
        await ref.client.query('COMMIT');
        installed.push({ subject: ref.subject, rows });
      } catch (error) {
        await ref.client.query('ROLLBACK');
        throw error;
      }
    }
    phase('install-prior-fresh', { identities, installed, rendered });
    const prefix = references.find((r) => r.purpose === 'ordered-prefix');
    await prefix.client.query('BEGIN');
    try {
      await prefix.client.query('SELECT pg_advisory_xact_lock(7007,1)');
      await prefix.client.query('SET LOCAL search_path=pg_catalog,public');
      await prefix.client.query(rendered.outbox.objectsSql);
      await prefix.client.query(rendered.outbox.roleBindingsSql);
      for (const migration of config.ordered.slice(0, 8))
        await prefix.client.query(migration.sql);
      await prefix.client.query(rendered.offline.roleBindingsSql);
      await prefix.client.query(
        'SET LOCAL row_security=on; SET LOCAL search_path=pg_catalog',
      );
      await prefix.client.query('COMMIT');
    } catch (error) {
      await prefix.client.query('ROLLBACK');
      throw error;
    }
    phase('install-public-prefix-eight', {
      subject: prefix.subject,
      sources: config.ordered
        .slice(0, 8)
        .map(({ sql, ...entry }) => ({ ...entry, sqlSha256: hash(sql) })),
      fakeReceipts: false,
    });
    const verifyStorage = async (ref) =>
      readOnly(ref.client, async () => {
        const reports = {
          outbox: await outbox.verifyOutboxStorage(ref.client, binding),
          offline: await offline.verifyOfflineStorage(ref.client, binding),
        };
        for (const report of Object.values(reports)) {
          ensure(
            report.supported === true,
            'Prior public verifier is unsupported',
          );
          ensure(
            report.checks.every((c) => c.status === 'pass'),
            'Prior public verifier has FAIL/UNKNOWN',
          );
        }
        return { subject: ref.subject, reports };
      });
    phase(
      'verify-prior-before',
      await Promise.all(references.map(verifyStorage)),
    );
    const fresh = async (ref) =>
      readOnly(
        ref.client,
        async () =>
          (
            await ref.client.query(
              'SELECT clock_timestamp() < $1::timestamptz AS valid',
              [clock.validUntil],
            )
          ).rows[0].valid,
      );
    const appRecords = [];
    for (const ref of references) {
      ensure(await fresh(ref), 'Captured business clock is stale');
      let database, service, outboxService;
      const knownConflicts = new Map();
      const options = {
        mountControllers: false,
        now: () => clock.now,
        initialQueueStatus: 'pending',
        reservationTtlMs: 86400000,
        policyResolver: {
          resolve: async () => ({
            reservationTtlMs: 86400000,
            concurrencyWindowMinutes: 1,
            maxBatchItems: 10,
            concurrencyApplication: 'defer',
          }),
        },
        agentResolver: { resolve: async () => 'reference-business-agent' },
        payloadHashPort: {
          hash: async (item) =>
            offline.canonicalOfflineSyncPayloadHash(item.payloadJson),
        },
        itemApplier: {
          apply: async (trx, item, context) => {
            await trx.query(
              'INSERT INTO integration.test_effects(tenant_id,logical_key,actor_id,business_agent,body) VALUES($1::uuid,$2,$3::uuid,$4,$5::jsonb)',
              [
                context.tenantId,
                item.idempotencyKey,
                context.actorId,
                context.agentId,
                JSON.stringify(item.payloadJson),
              ],
            );
            if (item.payloadJson.mode === 'transient')
              throw Object.assign(
                new Error('Controlled reference transient failure'),
                {
                  code: 'REFERENCE_TRANSIENT_FAILURE',
                },
              );
            if (item.payloadJson.mode === 'fail')
              throw new offline.OfflineSyncError(
                'REFERENCE_DOMAIN_FAILURE',
                409,
                'Controlled reference domain refusal',
              );
            return {
              serverEntityId: 'server:' + item.localEntityId,
              consumerAttributes: {
                fixture: 'reference',
                auditActor: context.actorId,
                businessAgent: context.agentId,
              },
            };
          },
        },
        preApplyDetector: {
          detect: async (_trx, item) =>
            item.payloadJson.mode === 'defer'
              ? {
                  suspected: true,
                  pairs: [
                    {
                      firstItemId: item.queueItemId,
                      secondItemId: 'queue-applied',
                    },
                  ],
                }
              : { suspected: false, pairs: [] },
        },
        conflictResolver: {
          allowedActions: async () => [
            'manual_review',
            'retry_after_correction',
            'reject',
          ],
          resolve: async (_trx, id, action, context) => {
            const conflict = knownConflicts.get(id);
            ensure(
              conflict && conflict.tenantId === context.tenantId,
              'Resolver requires original public conflict facts',
            );
            return {
              ...conflict,
              status: action === 'manual_review' ? 'open' : 'resolved',
              resolution: action,
              consumerAttributes: { fixture: 'reference-resolution' },
            };
          },
        },
        eventPort: {
          appendInTransaction: async (trx, event) => {
            ensure(outboxService, 'Real outbox provider unavailable');
            await outboxService.appendInTransaction(trx, event);
          },
          appendManyInTransaction: async (trx, events) => {
            ensure(outboxService, 'Real outbox provider unavailable');
            await outboxService.appendManyInTransaction(trx, events);
          },
        },
      };
      const connection = (user, role) => ({
        connectionString: `postgresql://${user}@127.0.0.1:65462/${ref.subject.databaseName}?${role ? 'options=-c%20role%3Drole_app_backend' : ''}`,
        max: 2,
        ssl: false,
        applicationName: `r22-reference-${ref.purpose}-${role ?? 'owner'}`,
      });
      class ReferenceModule {}
      common.Module({
        imports: [
          data.StynxDataModule.forRoot({
            appRoleName: 'role_app_backend',
            migrations: { enabled: false },
            retry: { attempts: 1, jitterMs: [0, 0] },
            connections: {
              owner: connection('postgres'),
              app: connection('role_r22_161_app', 'app'),
              reader: connection('role_r22_161_app', 'reader'),
            },
          }),
          offline.StynxOfflineSyncModule.forRoot(options),
          outbox.StynxOutboxModule.forRoot({
            storageMode: 'consumer-owned',
            dispatchableEntities: {},
            destinations: [],
          }),
        ],
      })(ReferenceModule);
      const startupStart = queryLog.length;
      const context = await nest.NestFactory.createApplicationContext(
        ReferenceModule,
        { logger: false, abortOnError: false },
      );
      contexts.push(context);
      const startupEnd = queryLog.length;
      const startup = queryLog.slice(startupStart, startupEnd);
      ensure(
        startup.filter((entry) => entry.startupGuard).length === 1,
        'Expected exactly one actual public Outbox startup guard per context',
      );
      database = context.get(data.Database);
      service = context.get(offline.OfflineSyncService);
      outboxService = context.get(outbox.OutboxService);
      const a = config.plan.fixtures;
      const request = (tenantId, actorId, fn) =>
        database.withRequestContext({ tenantId, actorId }, fn);
      const sqlIdentity = await request(a.tenantA, a.actorA, () =>
        database.tx(
          async (trx) =>
            (
              await trx.query(
                "SELECT current_database() AS database,current_user::text AS acting,session_user::text AS login,current_setting('app.tenant_id') AS tenant,current_setting('app.actor_id') AS actor,current_setting('row_security') AS rls",
              )
            ).rows[0],
        ),
      );
      ensure(
        sqlIdentity.database === ref.subject.databaseName &&
          sqlIdentity.acting === 'role_app_backend' &&
          sqlIdentity.login === 'role_r22_161_app' &&
          sqlIdentity.tenant === a.tenantA &&
          sqlIdentity.actor === a.actorA &&
          sqlIdentity.rls === 'on',
        'Actual restricted request identity differs',
      );
      appRecords.push({
        ref,
        context,
        database,
        service,
        outboxService,
        request,
        knownConflicts,
        startup,
        sqlIdentity,
      });
    }
    phase(
      'start-real-public-contexts',
      appRecords.map(({ ref, startup, sqlIdentity }) => ({
        subject: ref.subject,
        startup,
        sqlIdentity,
        outboxStartup:
          'public onModuleInit administrative owner READ ONLY role/ownership guard; no owner request',
      })),
    );
    const results = [];
    for (const app of appRecords) {
      const { ref, database, service, outboxService, request, knownConflicts } =
        app;
      const { tenantA, tenantB, actorA, actorB } = config.plan.fixtures;
      const inA = (fn) => request(tenantA, actorA, fn),
        inB = (fn) => request(tenantB, actorB, fn);
      const witnesses = [];
      const witness = (name, value) => {
        witnesses.push({ name, value });
        return value;
      };
      const refusal = async (name, fn, code) => {
        try {
          await fn();
          fail(`Expected refusal absent: ${name}`);
        } catch (error) {
          assertClean();
          if (code)
            ensure(
              error.code === code,
              `Wrong typed refusal: ${name} (${String(error.code)})`,
            );
          return witness(name, {
            code: error.code ?? null,
            name: error.name,
            message: error.message,
          });
        }
      };
      await refusal(
        'no-context-denial',
        () => service.listNumberingRanges(),
        'OFFLINE_SYNC_UNAUTHENTICATED',
      );
      const rangeInput = {
        orgUnitId: 'reference-org',
        entityType: 'reference-document',
        series: 'REF',
        startNumber: 1,
        endNumber: 100,
        idempotencyKey: 'range-primary',
        consumerAttributes: {
          purpose: 'TEST_ONLY',
          unicode: 'ação',
          nested: { approved: false },
        },
      };
      const range = witness(
        'create-range',
        await inA(() => service.createNumberingRange(rangeInput)),
      );
      equal(
        await inA(() => service.createNumberingRange(rangeInput)),
        range,
        'Keyed range replay differs',
      );
      equal(
        await inA(() => service.getNumberingRange(range.id)),
        range,
        'Get range differs',
      );
      witness('range-list-a', await inA(() => service.listNumberingRanges()));
      equal(
        (await inB(() => service.listNumberingRanges())).items,
        [],
        'Tenant B sees A range',
      );
      await refusal(
        'foreign-range',
        () => inB(() => service.getNumberingRange(range.id)),
        'OFFLINE_SYNC_RANGE_NOT_FOUND',
      );
      const reserve = {
        orgUnitId: 'reference-org',
        entityType: 'reference-document',
        deviceId: 'reference-device',
        shiftId: null,
        requestedSize: 4,
        rangeId: range.id,
        series: 'REF',
        validUntil: clock.validUntil,
        idempotencyKey: 'reservation-primary',
      };
      ensure(await fresh(ref), 'Captured reservation clock is stale');
      witness('reservation-original-input', reserve);
      const reservation = witness(
        'reserve-null-shift',
        await inA(() => service.reserveDurableNumbering(reserve)),
      );
      equal(
        await inA(() => service.reserveDurableNumbering(reserve)),
        reservation,
        'Reservation replay differs',
      );
      equal(
        await inA(() => service.replayDurableNumberingReservation(reserve)),
        reservation,
        'Explicit reservation replay differs',
      );
      await refusal(
        'reservation-key-mismatch',
        () =>
          inA(() =>
            service.reserveDurableNumbering({ ...reserve, requestedSize: 3 }),
          ),
        'OFFLINE_SYNC_RESERVATION_IDEMPOTENCY_CONFLICT',
      );
      await refusal(
        'active-null-scope-guard',
        () =>
          inA(() =>
            service.reserveDurableNumbering({
              ...reserve,
              idempotencyKey: 'another-active-key',
            }),
          ),
        'OFFLINE_SYNC_ACTIVE_RESERVATION',
      );
      witness(
        'consumption-before',
        await inA(() =>
          service.getNumberingConsumption(reservation.reservationId),
        ),
      );
      const submit = (name, mode, keyed = true) => {
        const payloadJson = { mode, logical: name };
        const input = {
          orgUnitId: 'reference-org',
          deviceId: 'reference-device',
          deviceBatchId: 'batch-' + name,
          batchSequence: null,
          items: [
            {
              queueItemId: 'queue-' + name,
              entityType: 'reference-document',
              localEntityId: 'local-' + name,
              ...(keyed ? { idempotencyKey: 'item-' + name } : {}),
              payloadHash: offline.canonicalOfflineSyncPayloadHash(payloadJson),
              payloadJson,
              createdLocallyAt: clock.now,
            },
          ],
        };
        const transport = {
          transportIdempotencyKey: 'transport-' + name,
          method: 'POST',
          path: '/reference/offline/batches',
          requestBody: input,
        };
        return {
          input,
          transport,
          execute: () => inA(() => service.submitSyncBatch(input, transport)),
        };
      };
      const applied = submit('applied', 'apply');
      witness('applied-submit', await applied.execute());
      const originalReceipt = witness(
        'applied-receipt',
        await inA(() => service.getSyncItemReceipt('item-applied')),
      );
      ensure(
        originalReceipt.status === 'applied' &&
          originalReceipt.stynx?.attempts === 1 &&
          originalReceipt.stynx?.serverEntityId === 'server:local-applied' &&
          originalReceipt.stynx?.appliedAt === clock.now,
        'Applied receipt facts differ',
      );
      const sequenceSnapshot = () =>
        readOnly(
          ref.client,
          async () =>
            (
              await ref.client.query(
                'SELECT last_value::text AS last_value,is_called FROM outbox.event_order_seq',
              )
            ).rows[0],
        );
      const replaySequenceBefore = await sequenceSnapshot();
      witness('applied-replay', await applied.execute());
      const replaySequenceAfter = await sequenceSnapshot();
      witness('applied-replay-sequence-state', {
        before: replaySequenceBefore,
        after: replaySequenceAfter,
      });
      equal(
        replaySequenceBefore,
        replaySequenceAfter,
        'Applied replay changed sequence state',
      );
      equal(
        await inA(() => service.getSyncItemReceipt('item-applied')),
        originalReceipt,
        'Replay rewrote original application context/attempts',
      );
      await refusal(
        'foreign-item-receipt',
        () => inB(() => service.getSyncItemReceipt('item-applied')),
        'OFFLINE_SYNC_QUEUE_ITEM_NOT_FOUND',
      );
      const integrity = submit('bare-hash', 'apply');
      integrity.input.items[0].payloadHash =
        integrity.input.items[0].payloadHash.slice('sha256:'.length);
      const integritySequenceBefore = await sequenceSnapshot();
      const integrityResult = witness(
        'bare-hash-integrity-submit',
        await integrity.execute(),
      );
      ensure(
        integrityResult.items[0].status === 'rejected' &&
          integrityResult.items[0].errorCode === 'OFFLINE_SYNC_ITEM_INTEGRITY',
        'Bare hash was not rejected as item integrity',
      );
      await refusal(
        'bare-hash-no-canonical-receipt',
        () => inA(() => service.getSyncItemReceipt('item-bare-hash')),
        'OFFLINE_SYNC_QUEUE_ITEM_NOT_FOUND',
      );
      const integritySequenceAfter = await sequenceSnapshot();
      witness('bare-hash-sequence-state', {
        before: integritySequenceBefore,
        after: integritySequenceAfter,
      });
      equal(
        integritySequenceBefore,
        integritySequenceAfter,
        'Integrity refusal changed sequence state',
      );
      const unkeyed = submit('unkeyed', 'apply', false);
      witness('unkeyed-received-submit', await unkeyed.execute());
      const unkeyedReceipt = witness(
        'unkeyed-received-batch',
        await inA(() =>
          service.getSyncBatchReceipt('reference-device', 'batch-unkeyed'),
        ),
      );
      ensure(
        unkeyedReceipt.items.length === 1 &&
          unkeyedReceipt.items[0].status === 'received' &&
          unkeyedReceipt.items[0].errorCode ===
            'OFFLINE_SYNC_LEGACY_ITEM_NOT_APPLIED',
        'Unkeyed legacy receipt facts differ',
      );
      const pending = submit('pending', 'transient');
      const pendingSequenceBefore = await sequenceSnapshot();
      witness('pending-submit', await pending.execute());
      const captured = witness(
        'pending-batch',
        await inA(() =>
          service.getSyncBatchReceipt('reference-device', 'batch-pending'),
        ),
      );
      ensure(
        captured.items.length === 1 &&
          captured.items[0].status === 'pending' &&
          captured.status === 'open' &&
          captured.responseStatus === null &&
          captured.responseBodyBytes === null,
        'Initial pending state was not captured',
      );
      const pendingReceipt = witness(
        'pending-receipt',
        await inA(() => service.getSyncItemReceipt('item-pending')),
      );
      ensure(
        pendingReceipt.status === 'pending' &&
          pendingReceipt.errorCode === 'REFERENCE_TRANSIENT_FAILURE' &&
          pendingReceipt.stynx?.retryable === true &&
          pendingReceipt.stynx?.attempts === 1 &&
          pendingReceipt.stynx?.appliedAt === undefined &&
          pendingReceipt.stynx?.serverEntityId === undefined,
        'Initial pending retryable receipt facts differ',
      );
      const pendingSequenceAfter = await sequenceSnapshot();
      witness('pending-item-rollback-sequence-state', {
        before: pendingSequenceBefore,
        after: pendingSequenceAfter,
      });
      equal(
        pendingSequenceBefore,
        pendingSequenceAfter,
        'Pending retryable rollback changed sequence state',
      );
      const pendingEffects = await inA(() =>
        database.tx(
          async (trx) =>
            (
              await trx.query(
                'SELECT logical_key FROM integration.test_effects WHERE logical_key=$1',
                ['item-pending'],
              )
            ).rows,
        ),
      );
      equal(pendingEffects, [], 'Pending retryable effect was committed');
      witness('pending-effect-rollback', pendingEffects);
      const failed = submit('failed', 'fail');
      const failedSequenceBefore = await sequenceSnapshot();
      witness('failed-submit', await failed.execute());
      const failedSequenceAfter = await sequenceSnapshot();
      witness('failed-item-rollback-sequence-state', {
        before: failedSequenceBefore,
        after: failedSequenceAfter,
      });
      equal(
        failedSequenceBefore,
        failedSequenceAfter,
        'Failed item rollback changed sequence state',
      );
      const failedReceipt = witness(
        'failed-receipt',
        await inA(() => service.getSyncItemReceipt('item-failed')),
      );
      ensure(
        failedReceipt.status === 'rejected' &&
          failedReceipt.errorCode === 'REFERENCE_DOMAIN_FAILURE',
        'Failed item refusal record differs',
      );
      const effects = await inA(() =>
        database.tx(
          async (trx) =>
            (
              await trx.query(
                'SELECT * FROM integration.test_effects ORDER BY logical_key COLLATE "C"',
              )
            ).rows,
        ),
      );
      ensure(
        effects.length === 1 &&
          effects[0].actor_id === actorA &&
          effects[0].business_agent === 'reference-business-agent' &&
          effects[0].actor_id !== effects[0].business_agent,
        'Failed effect rollback or audit/business identity differs',
      );
      const deferred = submit('deferred', 'defer');
      witness('deferred-submit', await deferred.execute());
      const conflicts = witness(
        'conflict-list',
        await inA(() =>
          service.listSyncConflicts({ queueItemId: 'queue-deferred' }),
        ),
      );
      ensure(
        conflicts.items.length === 1 && conflicts.items[0].status === 'open',
        'Actual CTG9 submit did not create the expected open conflict',
      );
      const conflict = conflicts.items[0];
      knownConflicts.set(conflict.conflictId, conflict);
      await refusal(
        'ctg9-open-conflict-typed-refusal',
        () =>
          inA(() =>
            service.openConflict('queue-deferred', {
              conflictType: 'reference',
              description: 'E6-only API cannot open a CTG9 conflict',
            }),
          ),
        'OFFLINE_SYNC_QUEUE_ITEM_NOT_FOUND',
      );
      const manual = witness(
        'manual-review',
        await inA(() =>
          service.resolveConflict(conflict.conflictId, {
            resolution: 'manual_review',
            description: 'TEST_ONLY manual review',
            userRef: 'reference-supervisor',
          }),
        ),
      );
      ensure(manual.status === 'open', 'Manual review closed a conflict');
      const manualActions = witness(
        'manual-action-history',
        await inA(() =>
          service.listSyncConflictActions({ conflictId: conflict.conflictId }),
        ),
      );
      ensure(
        manualActions.items.length === 1 &&
          manualActions.items[0].action === 'manual_review' &&
          manualActions.items[0].resultingStatus === 'open' &&
          manualActions.items[0].actorId === actorA,
        'Manual action history facts differ',
      );
      witness(
        'retry-after-correction',
        await inA(() =>
          service.resolveConflict(conflict.conflictId, {
            resolution: 'retry_after_correction',
            description: 'TEST_ONLY correction requested',
            userRef: 'reference-supervisor',
          }),
        ),
      );
      ensure(
        (await inA(() => service.getSyncItemReceipt('item-deferred')))
          .status === 'pending',
        'Correction retry did not return to pending',
      );
      const finalActions = witness(
        'final-action-history',
        await inA(() =>
          service.listSyncConflictActions({ conflictId: conflict.conflictId }),
        ),
      );
      ensure(
        finalActions.items.length === 2 &&
          finalActions.items.every(
            (action) =>
              action.actorId === actorA &&
              action.userRef === 'reference-supervisor',
          ) &&
          finalActions.items.some(
            (action) =>
              action.action === 'manual_review' &&
              action.resultingStatus === 'open',
          ) &&
          finalActions.items.some(
            (action) =>
              action.action === 'retry_after_correction' &&
              action.resultingStatus === 'resolved',
          ),
        'Final action history facts differ',
      );
      witness('batch-list', await inA(() => service.listSyncBatchReceipts()));
      witness('item-list', await inA(() => service.listSyncItemReceipts()));
      witness('queue-list', await inA(() => service.listSyncQueueItems()));
      witness('outbox-events', await inA(() => outboxService.listEvents()));
      equal(
        (await inB(() => outboxService.listEvents())).items,
        [],
        'Tenant B sees A outbox events',
      );
      const cancelled = witness(
        'cancel-reservation',
        await inA(() =>
          service.cancelDurableNumberingReservation(reservation.reservationId, {
            reason: 'TEST_ONLY cancellation',
          }),
        ),
      );
      ensure(
        cancelled.status === 'cancelled',
        'Reservation cancellation differs',
      );
      const second = witness(
        'reserve-after-cancellation',
        await inA(() =>
          service.reserveDurableNumbering({
            ...reserve,
            idempotencyKey: 'reservation-second',
          }),
        ),
      );
      const blocked = witness(
        'block-reservation',
        await inA(() =>
          service.blockNumberingReservation(second.reservationId, {
            reason: 'TEST_ONLY block',
          }),
        ),
      );
      ensure(blocked.status === 'blocked', 'Block transition differs');
      await refusal(
        'blocked-reservation-cannot-close',
        () =>
          inA(() =>
            service.closeNumberingReservation(second.reservationId, {
              reason: 'TEST_ONLY invalid blocked close',
            }),
          ),
        'OFFLINE_SYNC_RESERVATION_STATE',
      );
      const closeInput = {
        ...reserve,
        deviceId: 'reference-close-device',
        idempotencyKey: 'reservation-close',
      };
      witness('close-reservation-original-input', closeInput);
      const closing = witness(
        'reserve-distinct-device-for-close',
        await inA(() => service.reserveDurableNumbering(closeInput)),
      );
      ensure(
        closing.deviceId === 'reference-close-device' &&
          closing.shiftId === null &&
          closing.status === 'reserved',
        'Distinct close reservation scope differs',
      );
      const closed = witness(
        'close-reservation',
        await inA(() =>
          service.closeNumberingReservation(closing.reservationId, {
            reason: 'TEST_ONLY close',
          }),
        ),
      );
      ensure(closed.status === 'consumed', 'Close transition differs');
      const reconciled = witness(
        'reconcile-reservation',
        await inA(() =>
          service.reconcileNumberingReservation(closing.reservationId, {
            claimedNumbers: [],
            userRef: 'reference-supervisor',
          }),
        ),
      );
      ensure(
        reconciled.status === 'consumed' &&
          reconciled.missingOnServer.length === 0 &&
          reconciled.unexpectedOnServer.length === 0 &&
          reconciled.consumption.every((entry) => entry.status === 'expired'),
        'Closed reservation reconciliation facts differ',
      );
      witness(
        'cancel-range',
        await inA(() =>
          service.cancelNumberingRange(range.id, {
            reason: 'TEST_ONLY range cancellation',
          }),
        ),
      );
      const importWitnesses = await readOnly(ref.client, async () => {
        const row = (
          await ref.client.query(
            "SELECT (SELECT count(*)::int FROM offline.sync_import_receipts) AS count,pg_get_userbyid(c.relowner) AS owner,c.relrowsecurity AS rls,c.relforcerowsecurity AS forced,has_table_privilege('role_app_backend',c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') AS app_access FROM pg_class c WHERE c.oid='offline.sync_import_receipts'::regclass",
          )
        ).rows[0];
        ensure(
          row.count === 0 &&
            row.owner === 'postgres' &&
            row.rls &&
            row.forced &&
            !row.app_access,
          'Import receipt owner-only/empty boundary differs',
        );
        return row;
      });
      witness('import-receipt-boundary', {
        ...importWitnesses,
        proofScope:
          'Empty table, owner, ACL and FORCE RLS observed; immutable row-trigger catalog checked by the real public verifier. No executed row-mutation or successful import claim.',
      });
      witness('effects', effects);
      results.push({ subject: ref.subject, witnesses });
    }
    const roleGraphAfterCases = await captureRoleGraph(maintenance);
    retain('role-graph-after-cases.json', roleGraphAfterCases);
    assertUnchangedRoleGraph(roleGraphAfterCases, config.expectedRoleGraph);
    phase('exercise-controlled-behavior', results);
    const capture = async (ref) =>
      readOnly(ref.client, async () => {
        const catalogs = {
          outbox: await data.collectStorageCatalog(ref.client, 'outbox'),
          offline: await data.collectStorageCatalog(ref.client, 'offline'),
        };
        const tables = {},
          sequences = {};
        for (const [schema, entries] of Object.entries(catalogs)) {
          for (const entry of entries.filter((e) => e.kind === 'relation')) {
            ensure(
              /^[a-z_][a-z_0-9]*$/u.test(entry.name),
              'Unexpected catalog relation name',
            );
            const name = schema + '.' + entry.name;
            if (entry.value.kind === 'r') {
              const rows = (
                await ref.client.query(
                  `SELECT row_to_json(t)::text AS raw FROM ${name} t ORDER BY row_to_json(t)::text COLLATE "C"`,
                )
              ).rows;
              tables[name] = rows.map(({ raw }) => ({
                raw,
                value: JSON.parse(raw),
              }));
            } else if (entry.value.kind === 'S')
              sequences[name] = (
                await ref.client.query(
                  `SELECT last_value::text,is_called FROM ${name}`,
                )
              ).rows[0];
            else fail('Unadmitted relation kind in reference snapshot');
          }
        }
        const finishedAt = (
          await ref.client.query(
            `SELECT to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS time`,
          )
        ).rows[0].time;
        return {
          subject: ref.subject,
          catalogs,
          tables,
          sequences,
          finishedAt,
        };
      });
    const snapshots = await Promise.all(references.map(capture));
    retain('raw-package-snapshots.json', snapshots);
    const keys = {
      'offline.numbering_ranges': [
        'tenant_id',
        'org_unit_id',
        'entity_type',
        'series',
      ],
      'offline.numbering_reservations': ['tenant_id', 'idempotency_key'],
      'offline.numbering_reservation_scopes': [
        'tenant_id',
        'device_id',
        'shift_scope',
      ],
      'offline.numbering_consumption': [
        'tenant_id',
        'reservation_id',
        'number',
      ],
      'offline.sync_queue_items': ['tenant_id', 'id'],
      'offline.sync_batches': ['tenant_id', 'device_id', 'device_batch_id'],
      'offline.sync_batch_transport_keys': [
        'tenant_id',
        'device_id',
        'device_batch_id',
        'transport_key',
      ],
      'offline.sync_conflicts': [
        'tenant_id',
        'sync_queue_item_id',
        'conflict_type',
      ],
      'offline.sync_conflict_evidence': ['tenant_id', 'conflict_id'],
      'offline.sync_conflict_actions': ['tenant_id', 'conflict_id', 'action'],
      'offline.sync_item_receipts': ['tenant_id', 'idempotency_key'],
      'offline.sync_item_attempts': [
        'tenant_id',
        'device_id',
        'device_batch_id',
        'queue_item_id',
      ],
      'outbox.events': ['tenant_id', 'idempotency_key'],
      'outbox.tenant_clock': ['tenant_id'],
      'outbox.legacy_ownership': ['id'],
    };
    const generated = {
      'offline.numbering_ranges': ['id'],
      'offline.numbering_reservations': ['id'],
      'offline.numbering_reservation_scopes': ['generation'],
      'offline.sync_batches': ['lease_token'],
      'offline.sync_conflicts': ['id'],
      'offline.sync_conflict_actions': ['id'],
      'outbox.events': ['id'],
    };
    const comparisons = [];
    for (const right of snapshots.slice(1)) {
      const left = snapshots[0],
        mappings = new Map(),
        reverse = new Map(),
        exceptions = [];
      const translate = (value) =>
        typeof value === 'string' && mappings.has(value)
          ? mappings.get(value)
          : value;
      const pairRows = (table) => {
        const a = left.tables[table],
          b = right.tables[table];
        ensure(
          a && b && a.length === b.length,
          `Snapshot row count differs: ${table}`,
        );
        if (!a.length) return [];
        ensure(keys[table], `Undeclared nonempty package table: ${table}`);
        const key = (row) =>
          JSON.stringify(keys[table].map((field) => translate(row[field])));
        const byKey = new Map(b.map(({ value }) => [key(value), value]));
        ensure(
          byKey.size === b.length,
          `Nonunique declared logical key: ${table}`,
        );
        return a.map(({ value }) => {
          const other = byKey.get(key(value));
          ensure(other, `Logical row absent: ${table}`);
          return [value, other];
        });
      };
      // Establish the predeclared bijections before examining any reference in
      // JSON contexts, receipts, wire-response JSON or related table columns.
      for (const table of Object.keys(generated)) {
        for (const [a, b] of pairRows(table))
          for (const field of generated[table]) {
            if (a[field] === null || b[field] === null) {
              ensure(a[field] === b[field], 'Generated NULL identity differs');
              continue;
            }
            ensure(
              typeof a[field] === 'string' &&
                typeof b[field] === 'string' &&
                !mappings.has(a[field]) &&
                !reverse.has(b[field]),
              'Generated identity is not bijective',
            );
            mappings.set(a[field], b[field]);
            reverse.set(b[field], a[field]);
          }
      }
      const micros = (value) => {
        const match =
          typeof value === 'string' &&
          /^(\d{4})-(\d\d)-(\d\d)[T ](\d\d):(\d\d):(\d\d)(?:[.](\d{1,6}))?(?:Z|[+]00(?::?00)?)$/u.exec(
            value,
          );
        ensure(match, 'Timestamp is not a retained UTC value');
        return (
          BigInt(
            Date.UTC(
              +match[1],
              +match[2] - 1,
              +match[3],
              +match[4],
              +match[5],
              +match[6],
            ),
          ) *
            1000n +
          BigInt((match[7] ?? '').padEnd(6, '0'))
        );
      };
      // Only exact canonical columns and the explicitly declared public DTO
      // paths may have SQL-clock variation. Consumer JSON remains ordinary
      // exact data, even when a key happens to be named createdAt/updated_at.
      const timestampPaths = new Set(
        Object.entries(rendered).flatMap(([kind, artifact]) =>
          artifact.manifest.catalog
            .filter(
              (entry) =>
                entry.kind === 'column' && entry.value.type === 'timestamptz',
            )
            .map(
              (entry) =>
                (kind === 'offline' ? 'offline' : 'outbox') + '.' + entry.name,
            ),
        ),
      );
      for (const field of ['createdAt', 'updatedAt', 'cancelledAt'])
        timestampPaths.add(
          'offline.numbering_ranges.creation_receipt.' + field,
        );
      const publicTimestampPaths = [
        /^public[.](?:create-range|cancel-range)[.](?:createdAt|updatedAt|cancelledAt)$/u,
        /^public[.]range-list-a[.]items[.]\d+[.](?:createdAt|updatedAt|cancelledAt)$/u,
        /^public[.](?:manual-action-history|final-action-history)[.]items[.]\d+[.]createdAt$/u,
        /^public[.]conflict-list[.]items[.]\d+[.](?:createdAt|resolvedAt)$/u,
        /^public[.]outbox-events[.]items[.]\d+[.]createdAt$/u,
        /^public[.]outbox-events[.]nextCursor[.]createdAt$/u,
        /^public[.](?:batch-list|item-list)[.]items[.]\d+[.](?:createdAt|receivedAt)$/u,
      ];
      const compare = (a, b, address) => {
        if (a === b) return;
        if (typeof a === 'string' && mappings.has(a)) {
          ensure(
            mappings.get(a) === b,
            `Identity reference differs: ${address}`,
          );
          return;
        }
        const field = address.split('.').at(-1);
        if (
          (timestampPaths.has(address) ||
            publicTimestampPaths.some((pattern) => pattern.test(address))) &&
          typeof a === 'string' &&
          typeof b === 'string'
        ) {
          const x = micros(a),
            y = micros(b),
            business = micros(clock.now),
            until = micros(clock.validUntil);
          if (
            x === business ||
            y === business ||
            field === 'valid_until' ||
            field === 'validUntil'
          )
            ensure(
              x === y &&
                (field.startsWith('valid') ? x === until : x === business),
              `Injected timestamp differs: ${address}`,
            );
          else
            ensure(
              x >= business &&
                x <= micros(left.finishedAt) &&
                y >= business &&
                y <= micros(right.finishedAt),
              `SQL timestamp causality differs: ${address}`,
            );
          exceptions.push({
            address,
            left: a,
            right: b,
            rule: 'Explicit UTC SQL field with retained raw values and per-subject causal interval; injected business fields compare exactly',
          });
          return;
        }
        if (
          address.endsWith('.response_body_bytes') &&
          typeof a === 'string' &&
          typeof b === 'string'
        ) {
          ensure(
            a.startsWith('\\x') && b.startsWith('\\x'),
            'Wire bytea representation differs',
          );
          compare(
            JSON.parse(Buffer.from(a.slice(2), 'hex').toString('utf8')),
            JSON.parse(Buffer.from(b.slice(2), 'hex').toString('utf8')),
            address + '.decodedOriginalResponse',
          );
          return;
        }
        if (address === 'outbox.tenant_clock.last_ms') {
          ensure(
            /^\d+$/u.test(String(a)) && /^\d+$/u.test(String(b)),
            'Outbox clock is invalid',
          );
          ensure(
            BigInt(a) * 1000n >= micros(clock.now) - 999n &&
              BigInt(a) * 1000n <= micros(left.finishedAt) &&
              BigInt(b) * 1000n >= micros(clock.now) - 999n &&
              BigInt(b) * 1000n <= micros(right.finishedAt),
            'Outbox clock causality differs',
          );
          exceptions.push({
            address,
            left: a,
            right: b,
            rule: 'Actual millisecond tenant event clock within each subject interval',
          });
          return;
        }
        if (
          address === 'offline.numbering_reservations.idempotency_fingerprint'
        ) {
          ensure(
            typeof a === 'string' &&
              typeof b === 'string' &&
              /^sha256:[a-f0-9]{64}$/u.test(a) &&
              /^sha256:[a-f0-9]{64}$/u.test(b),
            'Reservation fingerprint is not a SHA256 identity',
          );
          exceptions.push({
            address,
            left: a,
            right: b,
            rule: 'Actual public keyed replay and mismatched-request refusals passed in both subjects; request differs only by the separately declared range UUID bijection',
          });
          return;
        }
        if (Array.isArray(a) || Array.isArray(b)) {
          ensure(
            Array.isArray(a) && Array.isArray(b) && a.length === b.length,
            `Array differs: ${address}`,
          );
          a.forEach((v, i) => compare(v, b[i], address + '.' + i));
          return;
        }
        if (a && b && typeof a === 'object' && typeof b === 'object') {
          equal(
            Object.keys(a).sort(),
            Object.keys(b).sort(),
            `Unknown/different fields: ${address}`,
          );
          for (const key of Object.keys(a))
            compare(a[key], b[key], address + '.' + key);
          return;
        }
        fail(`Unexplained field difference: ${address}`);
      };
      equal(
        Object.keys(left.tables).sort(),
        Object.keys(right.tables).sort(),
        'Package table inventory differs',
      );
      for (const table of Object.keys(left.tables))
        for (const [a, b] of pairRows(table)) {
          const schema = table.split('.')[0],
            name = table.split('.')[1];
          const expected = left.catalogs[schema]
            .filter((e) => e.kind === 'column' && e.name.startsWith(name + '.'))
            .map((e) => e.name.slice(name.length + 1))
            .sort();
          equal(
            Object.keys(a).sort(),
            expected,
            'Raw row has an unlisted catalog column',
          );
          equal(
            Object.keys(b).sort(),
            expected,
            'Raw row has an unlisted catalog column',
          );
          compare(a, b, table);
        }
      // These two sequences start fresh and the declared operations perform the
      // same successful appends; retain and compare their exact state as well.
      equal(
        left.sequences,
        right.sequences,
        'Reference sequence history differs',
      );
      const publicLeft = JSON.parse(JSON.stringify(results[0].witnesses));
      const publicRight = JSON.parse(
        JSON.stringify(results[snapshots.indexOf(right)].witnesses),
      );
      equal(
        publicLeft.map((entry) => entry.name),
        publicRight.map((entry) => entry.name),
        'Public witness inventory/order differs',
      );
      publicLeft.forEach((entry, index) =>
        compare(entry.value, publicRight[index].value, 'public.' + entry.name),
      );
      comparisons.push({
        left: left.subject,
        right: right.subject,
        bijections: [...mappings].map(([a, b]) => ({ left: a, right: b })),
        causalFieldPairs: exceptions,
        status: 'equal-under-declared-bijections-and-causal-fields',
      });
    }
    phase('capture-raw-and-compare', {
      snapshots,
      comparisons,
      logicalKeys: keys,
      generatedIdentityFields: generated,
      rawValuesRetained: true,
    });
    phase(
      'verify-prior-after',
      await Promise.all(references.map(verifyStorage)),
    );
    const upgrade = references.find((r) => r.purpose === 'upgrade-source');
    const originalFreshRows = await readOnly(
      upgrade.client,
      async () =>
        (
          await upgrade.client.query(
            'SELECT package::text,identity::text AS identity_sql_text,installed_by::text,to_char(installed_at AT TIME ZONE \'UTC\',\'YYYY-MM-DD"T"HH24:MI:SS.US"Z"\') AS installed_at_utc FROM integration.stynx_storage_installations ORDER BY package COLLATE "C"',
          )
        ).rows,
    );
    phase('retain-baseline-inputs', {
      kind: 'actual-reference-inputs-awaiting-independent-baseline-review',
      subject: upgrade.subject,
      originalFreshRows,
      comparisons,
      approval: null,
      baselineAdmission: null,
    });
    for (const context of [...contexts].reverse())
      await closeContext(context, 'normal');
    const orphanSessions = await readOnly(
      maintenance,
      async () =>
        (
          await maintenance.query(
            "SELECT datname,usename,application_name,state FROM pg_stat_activity WHERE application_name LIKE 'r22-reference-%' AND pid <> pg_backend_pid()",
          )
        ).rows,
    );
    ensure(
      orphanSessions.length === 0,
      'Reference context left orphan pool sessions',
    );
    const roleGraphBeforeReturn = await captureRoleGraph(maintenance);
    retain('role-graph-before-return.json', roleGraphBeforeReturn);
    assertUnchangedRoleGraph(roleGraphBeforeReturn, config.expectedRoleGraph);
    phase('close-contexts-and-return-lease', {
      closedContexts: appRecords.length,
      orphanSessions,
      leaseDisposition:
        'Execution complete; root must independently read back and return the lease',
    });
    for (const file of Object.keys(requireRuntime.cache)) verify(file);
    assertClean();
    writeObservation(
      1,
      JSON.stringify({
        phases: phases.map(({ name }) => name),
        observation: {
          loaded: [...loaded].sort(),
          resolved: [...resolved].sort(),
          optionalMisses: [...new Set(optionalMisses)].sort(),
        },
      }),
    );
  } finally {
    for (const context of [...contexts].reverse()) {
      try {
        await closeContext(context, 'finally');
      } catch {
        /* Retained above; keep attempting every still-open context. */
      }
    }
    if (maintenance) {
      if (roleGraphWitnessReady) {
        try {
          const actual = await captureRoleGraph(maintenance);
          retain('role-graph-finally.json', actual);
          assertUnchangedRoleGraph(actual, config.expectedRoleGraph);
        } catch (error) {
          cleanup.push({ kind: 'role-graph-finally', message: error.message });
        }
      }
      try {
        await maintenance.query('SELECT pg_advisory_unlock(7007,1600)');
      } catch (error) {
        cleanup.push({ kind: 'maintenance-unlock', message: error.message });
      }
    }
    for (const client of clients.reverse()) {
      try {
        await client.end();
      } catch (error) {
        cleanup.push({ kind: 'client-end', message: error.message });
      }
    }
    try {
      retain('query-observation.json', queryLog);
      retain('cleanup-observation.json', {
        errors: cleanup,
        stillOpenContexts: contexts.length,
      });
    } finally {
      hooks.deregister();
    }
    ensure(
      cleanup.length === 0,
      'Reference cleanup failed; actual state requires root readback',
    );
  }
}

// The next reviewed activation must bind the actual reference lease. Null is
// deliberate: creation evidence and the returned custody-probe lease are not
// authority to execute the reference harness.
const referenceLeaseSha256 =
  '828167a76c5110df24a376df8954e3a2b68fc70b152291c4dd6a3ec53c56477b';
async function main() {
  insist(
    process.argv.length === 3,
    'Usage: node tools/stynx-storage-reference.mjs <repository-root>',
  );
  const plan = createStorageReferencePlan(process.argv[2]);
  insist(
    referenceLeaseSha256 !== null,
    'Actual root-issued reference SQL lease is not activated',
  );
  const root = process.argv[2];
  insist(
    process.execArgv.length === 0,
    'Runtime preload/loader arguments refused',
  );
  for (const name of Object.keys(process.env))
    insist(
      !(
        /^(?:NODE_OPTIONS|NODE_PATH|NODE_PG_FORCE_NATIVE|DYLD_.*|LD_PRELOAD|LD_LIBRARY_PATH)$/u.test(
          name,
        ) && process.env[name]
      ),
      'Ambient loader/native state refused',
    );
  const lease = JSON.parse(
    readSealed(
      root,
      `${generation}/reference-proof/lease-issued.json`,
      referenceLeaseSha256,
    ).toString('utf8'),
  );
  insist(
    lease.status === 'ACTIVE' &&
      lease.kind === 'R0022-161-CLUSTER02-G03-REFERENCE' &&
      lease.holder === 'Engineer' &&
      lease.endpoint.host === '127.0.0.1' &&
      lease.endpoint.port === 65462 &&
      lease.clusterSystemIdentifier === '7696293464811719840' &&
      lease.postmaster.pid === 64859 &&
      lease.postmaster.pidfileSha256 ===
        '6ddd0f8522567a1fa4ef1ad9cf7c1a0f3193dd1b5cdfc675b1c51ea43641bc7f' &&
      JSON.stringify(lease.subjects) ===
        JSON.stringify(plan.subjects.map((s) => s.subject)),
    'Reference lease identity, subjects or holder differ',
  );
  const closure = JSON.parse(
    readSealed(
      root,
      inputs.priorRuntime.path,
      inputs.priorRuntime.sha256,
    ).toString('utf8'),
  );
  const capture = JSON.parse(
    readSealed(
      root,
      `${prior}/${closure.installedCapture.path}`,
      closure.installedCapture.sha256,
    ).toString('utf8'),
  );
  const graph = JSON.parse(
    readSealed(
      root,
      `${prior}/${closure.staticGraph.path}`,
      closure.staticGraph.sha256,
    ).toString('utf8'),
  );
  const runtime = path.join(root, prior, 'runtime');
  const allowed = Object.fromEntries(
    capture.files
      .filter((f) => f.path.startsWith('runtime/'))
      .map((f) => [
        f.path.slice('runtime/'.length),
        { bytes: f.bytes, sha256: f.sha256 },
      ]),
  );
  const names = [
    '@stynx-nyx/outbox',
    '@stynx-nyx/offline-sync',
    '@stynx-nyx/data',
    '@nestjs/core',
    '@nestjs/common',
    'pg',
  ];
  const roots = names.map((name) => {
    const packages = capture.packages.filter((p) => p.name === name);
    insist(packages.length === 1, `Public seed is not unique: ${name}`);
    const pkg = packages[0],
      manifest = path.join(root, prior, pkg.root, 'package.json');
    const resolved = fs.realpathSync(createRequire(manifest).resolve(name)),
      relative = path.relative(runtime, resolved);
    insist(
      allowed[relative] &&
        graph.files.some(
          (f) => f.path === relative && f.sha256 === allowed[relative].sha256,
        ),
      'Public seed is outside sealed graph',
    );
    return { name, path: relative };
  });
  const nearestPackages = {};
  for (const file of Object.keys(allowed)) {
    let directory = path.dirname(file);
    while (directory !== '.') {
      const candidate = directory + '/package.json';
      if (allowed[candidate]) {
        nearestPackages[file] = {
          path: candidate,
          sha256: allowed[candidate].sha256,
        };
        break;
      }
      directory = path.dirname(directory);
    }
  }
  const output = path.join(root, generation, 'reference-proof');
  fs.mkdirSync(output, { recursive: true, mode: 0o700 });
  let current = root;
  for (const part of path.relative(root, output).split(path.sep)) {
    current = path.join(current, part);
    insist(
      fs.lstatSync(current).isDirectory() &&
        !fs.lstatSync(current).isSymbolicLink(),
      'Output directory escape refused',
    );
  }
  insist(
    !fs.existsSync(path.join(output, 'business-clock.json')),
    'Reference business clock already exists; no implicit rerun/rewrite',
  );
  const projection = JSON.parse(
    readSealed(root, inputs.projection.path, inputs.projection.sha256).toString(
      'utf8',
    ),
  );
  const original = JSON.parse(
    readSealed(
      root,
      'scratch/r22-adoption-160/baseline-preparation/fresh-receipts-sql-text.json',
      '6060e641fca1061247867865422547d2c698ac797071d386d75fa869205ebc74',
    ).toString('utf8'),
  );
  const ledgerSql = readSealed(
    root,
    'backend/database/ddl/19-stynx-storage-ledger.sql',
    '01303a5c66172f47721ca51f08d8c1c178685a76766785cd1c0fd028c5930b3a',
  ).toString('utf8');
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
  insist(optionalMisses.length === 2, 'Exact optional Nest misses differ');
  insist(
    sha256(fs.readFileSync(path.join(root, cluster, 'data/postmaster.pid'))) ===
      '6ddd0f8522567a1fa4ef1ad9cf7c1a0f3193dd1b5cdfc675b1c51ea43641bc7f',
    'Generation03 postmaster pidfile differs',
  );
  const config = {
    expectedRoleGraph: readRetainedRoleGraph(root),
    postmasterPidfileSha256:
      '6ddd0f8522567a1fa4ef1ad9cf7c1a0f3193dd1b5cdfc675b1c51ea43641bc7f',
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
    plan,
    lease,
    output,
    dataDirectory: path.join(root, cluster, 'data'),
    originalIdentities: original.rows,
    ordered: projection.offlineMigrations.migrations,
    ledgerSql,
  };
  const executable = closure.node.realpath;
  insist(
    fs.realpathSync(executable) === executable &&
      sha256(fs.readFileSync(executable)) === closure.node.sha256,
    'Retained Node executable differs',
  );
  const environment = {
    LANG: 'C.UTF-8',
    LC_ALL: 'C.UTF-8',
    TZ: 'UTC',
    PGCLIENTENCODING: 'UTF8',
    PGPASSFILE: path.join(root, cluster, 'inspector-empty-password-file'),
  };
  const stdout = fs.openSync(
      path.join(output, 'harness.stdout.log'),
      'wx',
      0o600,
    ),
    stderr = fs.openSync(path.join(output, 'harness.stderr.log'), 'wx', 0o600);
  let child;
  try {
    child = spawn(executable, ['--input-type=module', '-'], {
      cwd: runtime,
      env: environment,
      stdio: ['pipe', stdout, stderr],
      shell: false,
    });
    const completion = new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', (code, signal) => resolve({ code, signal }));
    });
    const stop = () => child.kill('SIGTERM');
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
    try {
      child.stdin.end(
        `await (${referenceChild.toString()})(${JSON.stringify(config)});`,
      );
      const result = await completion;
      insist(
        result.code === 0 && !result.signal,
        'Reference child STOP; preserve raw logs and actual state for independent readback',
      );
    } finally {
      process.removeListener('SIGINT', stop);
      process.removeListener('SIGTERM', stop);
    }
  } finally {
    fs.closeSync(stdout);
    fs.closeSync(stderr);
  }
  // Rehash the admitted package/runtime corpus again after the selected methods.
  createStorageReferencePlan(root);
  process.stdout.write(
    'Reference execution retained; independent readback and baseline review remain required.\n',
  );
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    process.stderr.write(`R22_STORAGE_REFERENCE_REFUSED: ${error.message}\n`);
    process.exitCode = 1;
  });
}
