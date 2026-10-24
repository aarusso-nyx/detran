import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  lstatSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
  mkdirSync,
  watch,
  readdirSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import net from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { aliases } from '../../security/invariants/workspace.config.mjs';
import { runGitFileBacked } from '../git-output.mjs';

const root = realpathSync(fileURLToPath(new URL('../../../', import.meta.url)));
const requireRoot = createRequire(path.join(root, 'package.json'));
const requireApp = createRequire(path.join(root, 'backend/app/package.json'));
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const vitestManifest = realpathSync(requireRoot.resolve('vitest/package.json'));
const viteManifest = realpathSync(
  createRequire(vitestManifest).resolve('vite/package.json'),
);
const tsManifest = realpathSync(requireRoot.resolve('typescript/package.json'));
const identity = (file) => ({
  path: file,
  version: JSON.parse(readFileSync(file)).version,
  sha256: sha(readFileSync(file)),
});
const origins = {
  vitest: identity(vitestManifest),
  vite: identity(viteManifest),
  typescript: identity(tsManifest),
};
const { createServer } = await import(
  pathToFileURL(path.join(path.dirname(viteManifest), 'dist/node/index.js'))
);
requireApp('reflect-metadata');
const { RequestContext } = requireApp('@stynx-nyx/core');
const capture =
  process.env.DETRAN_PORTAL_METADATA_TEST_OUTPUT ??
  mkdtempSync(path.join(tmpdir(), 'detran-portal-metadata-'));
assert.ok(path.isAbsolute(capture));
mkdirSync(capture, { recursive: true });
const output = realpathSync(capture);
assert.ok(path.relative(root, output).startsWith(`..${path.sep}`));
function runGit(argv) {
  const result = runGitFileBacked(argv, { cwd: root });
  assert.equal(result.status, 0, result.stderr?.toString());
  return result.stdout;
}
function sourceSnapshot() {
  const names = runGit([
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
    '-z',
  ])
    .toString()
    .split('\0')
    .filter(Boolean);
  return Object.fromEntries(
    names.sort().map((name) => {
      const file = path.join(root, name);
      let stat;
      try {
        stat = lstatSync(file);
      } catch (error) {
        if (error.code === 'ENOENT') return [name, { kind: 'missing' }];
        throw error;
      }
      return [
        name,
        {
          kind: stat.isSymbolicLink() ? 'symlink' : 'file',
          mode: stat.mode & 0o7777,
          sha256: sha(
            stat.isSymbolicLink()
              ? Buffer.from(readFileSyncLink(file))
              : readFileSync(file),
          ),
        },
      ];
    }),
  );
}
function readFileSyncLink(file) {
  // Link targets are observations, never followed as source-file bytes.
  return requireRoot('node:fs').readlinkSync(file);
}

function ignoredCacheSnapshot(directory) {
  try {
    const stat = lstatSync(directory);
    assert.ok(stat.isDirectory() && !stat.isSymbolicLink());
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  return Object.fromEntries(
    readdirSync(directory)
      .sort()
      .map((name) => {
        const file = path.join(directory, name),
          stat = lstatSync(file);
        assert.ok(
          stat.isFile() && !stat.isSymbolicLink(),
          'Unexpected non-file ignored config cache',
        );
        return [
          name,
          { mode: stat.mode & 0o7777, sha256: sha(readFileSync(file)) },
        ];
      }),
  );
}

function observeCompilationStages(
  server,
  tracked,
  allowMissingMetadata = false,
) {
  const records = [];
  for (const name of ['detran-ordinary-nest-metadata', 'vite:esbuild']) {
    const plugin = server.config.plugins.find((item) => item.name === name);
    if (
      !plugin &&
      allowMissingMetadata &&
      name === 'detran-ordinary-nest-metadata'
    )
      continue;
    assert.ok(plugin);
    const hook = plugin.transform;
    const original = typeof hook === 'function' ? hook : hook.handler;
    const wrapper = async function (...args) {
      const [input, id] = args;
      const result = await original.apply(this, args);
      if (tracked.includes(id)) {
        const code = typeof result === 'string' ? result : result?.code;
        records.push({
          plugin: name,
          path: path.relative(root, id),
          inputSHA256: sha(input),
          resultNull: result == null,
          outputSHA256: code === undefined ? null : sha(code),
        });
      }
      // Observation only: return the identical original object/string/null.
      return result;
    };
    plugin.transform =
      typeof hook === 'function' ? wrapper : { ...hook, handler: wrapper };
  }
  return records;
}
function closedSecondTransformSelectors(server, targets) {
  const exclude = server.config.esbuild.exclude;
  assert.ok(Array.isArray(exclude));
  assert.equal(exclude.length, targets.length + 1);
  assert.ok(
    exclude.every((value) => value instanceof RegExp && value.flags === ''),
  );
  assert.equal(
    exclude[0].source,
    /\.js$/.source,
    'Preserve the original ordinary .js exclusion',
  );
  const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.deepEqual(
    exclude
      .slice(1)
      .map((value) => value.source)
      .sort(),
    targets.map((file) => new RegExp('^' + escape(file) + '$').source).sort(),
  );
  for (const file of targets) {
    assert.equal(exclude.slice(1).filter((rule) => rule.test(file)).length, 1);
    for (const other of [
      path.basename(file),
      path.join(tmpdir(), path.basename(file)),
      file + '.extra',
      file + '?query',
      file.replace('/src/', '/tests/'),
    ]) {
      assert.ok(
        exclude.slice(1).every((rule) => !rule.test(other)),
        'No basename, external, query or sibling widening',
      );
    }
  }
  return exclude.map((value) => value.source);
}
function assertClosedCompilationStages(records, targets, nonTarget) {
  for (const file of targets) {
    const relative = path.relative(root, file);
    const first = records.filter(
      (item) =>
        item.path === relative &&
        item.plugin === 'detran-ordinary-nest-metadata',
    );
    const second = records.filter(
      (item) => item.path === relative && item.plugin === 'vite:esbuild',
    );
    assert.ok(
      first.length > 0 && second.length > 0,
      'Both real pipeline stages must be observed: ' + relative,
    );
    assert.ok(first.every((item) => !item.resultNull && item.outputSHA256));
    assert.ok(second.every((item) => item.resultNull));
    for (const item of second)
      assert.ok(
        first.some((prior) => prior.outputSHA256 === item.inputSHA256),
        'Second stage receives actual helper output byte-identically',
      );
  }
  const retained = records.filter(
    (item) =>
      item.path === path.relative(root, nonTarget) &&
      item.plugin === 'vite:esbuild',
  );
  assert.ok(
    retained.length > 0 &&
      retained.some((item) => !item.resultNull && item.outputSHA256),
    'A real non-target TS source must retain ordinary esbuild compilation',
  );
}

async function settleRequestsBundleCache(directory, before) {
  const deadline = Date.now() + 2000;
  const observations = [];
  while (true) {
    const current = ignoredCacheSnapshot(directory);
    observations.push({
      elapsedBudgetMs: 2000 - Math.max(0, deadline - Date.now()),
      entries: current === null ? null : Object.keys(current),
    });
    for (const [name, value] of Object.entries(before ?? {}))
      assert.deepEqual(
        current?.[name],
        value,
        'Preserve preexisting bundle cache bytes/modes',
      );
    const added = Object.keys(current ?? {}).filter(
      (name) => !Object.hasOwn(before ?? {}, name),
    );
    assert.ok(
      added.every((name) =>
        /^vitest\.config\.ts\.timestamp-\d+-[a-f0-9]+\.mjs$/.test(name),
      ),
      'Only default bundler-owned config temporary files allowed',
    );
    if (added.length === 0)
      return {
        observations,
        createdEmptyDirectory: before === null && current !== null,
        final: current,
        transientBytesNotClaimed: true,
      };
    assert.ok(
      Date.now() < deadline,
      'Bundler cache residual did not settle within2s; no manual cleanup',
    );
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}
const routes = [
  {
    label: 'Portal native',
    key: 'invariant-native',
    config: 'tools/security/invariants/portal.config.mjs',
    native: true,
  },
  {
    label: 'Requests default-bundle',
    key: 'requests-default-bundle',
    config: 'backend/domains/portal/requests/vitest.config.ts',
    native: false,
  },
];
for (const route of routes) {
  test(`${route.label} config preserves real implicit and explicit constructor identities through Vite7 without listeners`, async (t) => {
    const caseOutput = path.join(output, route.key);
    mkdirSync(caseOutput, { recursive: true });
    const configFile = path.join(root, route.config);
    const before = sourceSnapshot();
    writeFileSync(
      path.join(caseOutput, 'source-before.json'),
      JSON.stringify(before, null, 2) + '\n',
    );
    const cache = realpathSync(
      mkdtempSync(path.join(tmpdir(), 'detran-portal-transform-')),
    );
    const packageBundleCache = path.join(
      root,
      'backend/domains/portal/requests/node_modules/.vite-temp',
    );
    const packageCacheBefore = ignoredCacheSnapshot(packageBundleCache);
    const adjacent = [];
    const watcher = watch(path.dirname(configFile), (_, filename) => {
      if (filename?.includes('.timestamp-')) adjacent.push(filename);
    });
    const originalListen = net.Server.prototype.listen;
    const originalConnect = net.Socket.prototype.connect;
    let connectAttempts = 0;
    let listenAttempts = 0,
      server,
      observed = {
        origins,
        route: route.key,
        loaderOverrideOmitted: !route.native,
        status: 'FAIL',
      };
    net.Server.prototype.listen = function () {
      listenAttempts++;
      throw new Error('PORTAL_METADATA_NET_LISTEN_REFUSED');
    };
    net.Socket.prototype.connect = function () {
      connectAttempts++;
      throw new Error('PORTAL_METADATA_NET_CONNECT_REFUSED');
    };
    try {
      const targets = [
        'backend/domains/portal/requests/src/handwritten/requests.service.ts',
        'backend/domains/portal/requests/src/handwritten/idempotency.service.ts',
        'backend/domains/portal/requests/src/handwritten/delegation/delegation.service.ts',
        'backend/domains/portal/identity/src/handwritten/identity.service.ts',
        'backend/domains/portal/identity/src/handwritten/clock.ts',
      ].map((name) => path.join(root, name));
      const nonTarget = path.join(
        root,
        'backend/domains/portal/requests/src/handwritten/protocol.ts',
      );
      const support = path.join(
        root,
        'backend/domains/portal/requests/tests/support/nest-construct.ts',
      );
      const spec = path.join(
        root,
        'backend/domains/portal/requests/tests/integration/portal-requests.integration.spec.ts',
      );
      const options = {
        root: path.join(root, 'backend/domains/portal/requests'),
        configFile,
        cacheDir: cache,
        server: { middlewareMode: true, watch: null, ws: false },
        appType: 'custom',
      };
      if (route.native) options.configLoader = 'native';
      server = await createServer(options);
      const stages = observeCompilationStages(
        server,
        [...targets, nonTarget, support, spec],
        !route.native,
      );
      observed.compilationStages = stages;
      assert.equal(origins.vitest.version, '4.1.11');
      assert.equal(origins.vite.version, '7.3.6');
      assert.equal(origins.typescript.version, '6.0.3');
      assert.equal(
        server.config.root,
        path.join(root, 'backend/domains/portal/requests'),
      );
      if (route.native) {
        assert.equal(server.config.test.name, 'detran-invariant-portal');
        assert.deepEqual(server.config.test.include, [
          'tests/integration/portal-requests.integration.spec.ts',
        ]);
        assert.equal(server.config.test.environment, 'node');
        assert.equal(server.config.test.globals, true);
        assert.equal(server.config.test.fileParallelism, false);
        assert.equal(server.config.test.passWithNoTests, false);
        assert.equal(server.config.test.testTimeout, 30000);
        for (const [find, replacement] of Object.entries(aliases))
          assert.equal(
            server.config.resolve.alias.find((x) => x.find === find)
              ?.replacement,
            replacement,
          );
      } else {
        assert.equal(process.env.DETRAN_TEST_TIER ?? 'unit', 'unit');
        assert.equal(server.config.test.name, undefined);
        assert.deepEqual(server.config.test.include, [
          'src/**/*.spec.ts',
          'tests/unit/**/*.spec.ts',
        ]);
        assert.equal(server.config.test.environment, 'node');
        assert.equal(server.config.test.globals, true);
        assert.equal(server.config.test.fileParallelism, false);
        assert.equal(server.config.test.passWithNoTests, true);
        assert.equal(server.config.test.testTimeout, 10000);
        const expectedAliases = {
          '@detran/shared': path.join(
            root,
            'backend/domains/shared/src/index.ts',
          ),
          '@detran/portal-identity': path.join(
            root,
            'backend/domains/portal/identity/src/index.ts',
          ),
          '@detran/inf-deadlines': path.join(
            root,
            'backend/domains/inf/deadlines/src/index.ts',
          ),
        };
        assert.deepEqual(
          server.config.resolve.alias
            .filter(
              (item) =>
                typeof item.find === 'string' &&
                item.find.startsWith('@detran/'),
            )
            .map((item) => item.find)
            .sort(),
          Object.keys(expectedAliases).sort(),
        );
        for (const [find, replacement] of Object.entries(expectedAliases))
          assert.equal(
            server.config.resolve.alias.find((item) => item.find === find)
              ?.replacement,
            replacement,
          );
      }
      const load = (relative) =>
        server.ssrLoadModule(path.join(root, relative));
      const { PortalRequestsService } = await load(
        'backend/domains/portal/requests/src/handwritten/requests.service.ts',
      );
      const { PortalIdempotencyService } = await load(
        'backend/domains/portal/requests/src/handwritten/idempotency.service.ts',
      );
      const { RequestDelegationService, PORTAL_DELEGATION_TARGETS } =
        await load(
          'backend/domains/portal/requests/src/handwritten/delegation/delegation.service.ts',
        );
      const { PortalIdentityService, PortalClock } = await load(
        'backend/domains/portal/identity/src/index.ts',
      );
      const { TEAT_EVENT_OUTBOX, SqlTeatEventOutbox } = await load(
        'backend/domains/shared/src/index.ts',
      );
      const { constructInjectable, constructorDependencies } = await load(
        'backend/domains/portal/requests/tests/support/nest-construct.ts',
      );
      const metadata = Reflect.getMetadata(
        'design:paramtypes',
        PortalRequestsService,
      );
      const explicit =
        Reflect.getMetadata('self:paramtypes', PortalRequestsService) ?? [];
      const optional =
        Reflect.getMetadata('optional:paramtypes', PortalRequestsService) ?? [];
      const clock = { now: () => new Date(0), today: () => '1970-01-01' },
        context = { fixture: true },
        outbox = {
          append: () => {
            throw new Error('UNIT_NO_DATABASE');
          },
        };
      const target = {
        serviceKey: 'consulta_multas',
        availability: () => null,
      };
      const delegation = constructInjectable(RequestDelegationService, {
        PORTAL_DELEGATION_TARGETS: new Map([['consulta_multas', target]]),
      });
      const idempotency = constructInjectable(PortalIdempotencyService, {
        PortalClock: clock,
      });
      const identityService = constructInjectable(PortalIdentityService, {
        PortalClock: clock,
      });
      const providers = {
        PortalIdentityService: identityService,
        RequestDelegationService: delegation,
        PortalIdempotencyService: idempotency,
        PortalClock: clock,
        RequestContext: context,
        TEAT_EVENT_OUTBOX: outbox,
      };
      let instance,
        constructionFailure = null;
      try {
        instance = constructInjectable(PortalRequestsService, providers);
      } catch (error) {
        constructionFailure = String(error);
      }
      observed = {
        ...observed,
        metadata: metadata?.map((x) => x?.name) ?? null,
        explicit: explicit.map((x) => ({
          index: x.index,
          tokenName: x.param?.description,
        })),
        optional: [...optional].sort(),
        constructionFailure,
      };
      t.diagnostic(JSON.stringify(observed));
      observed.canonicalNames = [
        PortalRequestsService,
        PortalIdempotencyService,
        RequestDelegationService,
        PortalIdentityService,
        PortalClock,
      ].map((value) => value.name);
      assert.deepEqual(observed.canonicalNames, [
        'PortalRequestsService',
        'PortalIdempotencyService',
        'RequestDelegationService',
        'PortalIdentityService',
        'PortalClock',
      ]);
      assert.deepEqual(metadata, [
        PortalIdentityService,
        RequestDelegationService,
        PortalIdempotencyService,
        PortalClock,
        RequestContext,
        Object,
      ]);
      assert.equal(explicit.length, 1);
      assert.equal(explicit[0].index, 5);
      assert.equal(explicit[0].param, TEAT_EVENT_OUTBOX);
      assert.deepEqual([...optional].sort(), [3, 4, 5]);
      assert.deepEqual(constructorDependencies(PortalRequestsService), [
        { index: 0, name: 'PortalIdentityService', optional: false },
        { index: 1, name: 'RequestDelegationService', optional: false },
        { index: 2, name: 'PortalIdempotencyService', optional: false },
        { index: 3, name: 'PortalClock', optional: true },
        { index: 4, name: 'RequestContext', optional: true },
        { index: 5, name: 'TEAT_EVENT_OUTBOX', optional: true },
      ]);
      assert.equal(constructionFailure, null);
      assert.equal(instance.identity, identityService);
      assert.equal(instance.delegation, delegation);
      assert.equal(instance.idempotency, idempotency);
      assert.equal(instance.clock, clock);
      assert.equal(instance.requestContext, context);
      assert.equal(instance.outbox, outbox);
      assert.equal(identityService.clock, clock);
      assert.equal(idempotency.clock, clock);
      assert.equal(delegation.targetFor('consulta_multas'), target);
      assert.deepEqual(
        Reflect.getMetadata('design:paramtypes', PortalIdentityService),
        [PortalClock],
      );
      assert.deepEqual(
        Reflect.getMetadata('design:paramtypes', PortalIdempotencyService),
        [PortalClock],
      );
      assert.deepEqual(
        Reflect.getMetadata('optional:paramtypes', PortalIdentityService),
        [0],
      );
      assert.deepEqual(
        Reflect.getMetadata('optional:paramtypes', PortalIdempotencyService),
        [0],
      );
      assert.equal(
        Reflect.getMetadata('self:paramtypes', RequestDelegationService)[0]
          .param,
        PORTAL_DELEGATION_TARGETS,
      );
      for (const required of [
        'PortalIdentityService',
        'RequestDelegationService',
        'PortalIdempotencyService',
      ]) {
        const absent = { ...providers };
        delete absent[required];
        assert.throws(
          () => constructInjectable(PortalRequestsService, absent),
          new RegExp(required),
        );
      }
      assert.throws(
        () =>
          constructInjectable(RequestDelegationService, {
            WRONG_DELEGATION_TARGETS: new Map(),
          }),
        /PORTAL_DELEGATION_TARGETS/,
      );
      const optionalAbsent = constructInjectable(PortalRequestsService, {
        PortalIdentityService: identityService,
        RequestDelegationService: delegation,
        PortalIdempotencyService: idempotency,
        Object: outbox,
        WRONG_OUTBOX: outbox,
      });
      assert.ok(optionalAbsent.clock instanceof PortalClock);
      assert.equal(optionalAbsent.requestContext, undefined);
      assert.ok(optionalAbsent.outbox instanceof SqlTeatEventOutbox);
      assert.notEqual(optionalAbsent.outbox, outbox);
      assert.ok(
        constructInjectable(PortalIdempotencyService, {}).clock instanceof
          PortalClock,
      );
      assert.ok(
        constructInjectable(PortalIdentityService, {}).clock instanceof
          PortalClock,
      );
      const plugin = server.config.plugins.findIndex(
        (x) => x.name === 'detran-ordinary-nest-metadata',
      );
      assert.ok(
        plugin >= 0 &&
          plugin <
            server.config.plugins.findIndex((x) => x.name === 'vite:esbuild'),
      );
      assert.equal(server.config.plugins[plugin].enforce, 'pre');
      assert.equal(
        server.config.plugins.filter(
          (x) => x.name === 'detran-ordinary-nest-metadata',
        ).length,
        1,
      );
      const transform = server.config.plugins[plugin].transform;
      const call = (code, id) =>
        typeof transform === 'function'
          ? transform.call({}, code, id)
          : transform.handler.call({}, code, id);
      assert.equal(
        await call(
          '@Decorated() class TestOnly {}',
          path.join(
            root,
            'backend/domains/portal/requests/tests/support/example.ts',
          ),
        ),
        null,
      );
      assert.equal(
        await call(
          '@Decorated() class SpecOnly {}',
          path.join(
            root,
            'backend/domains/portal/requests/src/example.spec.ts',
          ),
        ),
        null,
      );
      await server.transformRequest(spec, { ssr: true });
      observed.closedSelectors = closedSecondTransformSelectors(
        server,
        targets,
      );
      assertClosedCompilationStages(stages, targets, nonTarget);
      for (const file of [support, spec]) {
        assert.ok(
          stages.some(
            (item) =>
              item.path === path.relative(root, file) &&
              item.plugin === 'vite:esbuild' &&
              !item.resultNull,
          ),
          'Support/spec normal compilation remains',
        );
      }
      observed.status = 'PASS';
    } finally {
      try {
        await server?.close();
      } finally {
        net.Server.prototype.listen = originalListen;
        net.Socket.prototype.connect = originalConnect;
        watcher.close();
        rmSync(cache, { recursive: true, force: true });
        if (!route.native)
          observed.bundleCache = await settleRequestsBundleCache(
            packageBundleCache,
            packageCacheBefore,
          );
        else
          assert.deepEqual(
            ignoredCacheSnapshot(packageBundleCache),
            packageCacheBefore,
          );
        const after = sourceSnapshot();
        writeFileSync(
          path.join(caseOutput, 'source-after.json'),
          JSON.stringify(after, null, 2) + '\n',
        );
        observed.listenAttempts = listenAttempts;
        observed.connectAttempts = connectAttempts;
        observed.connectGuardRestored =
          net.Socket.prototype.connect === originalConnect;
        observed.actualSourceStateUnchanged =
          JSON.stringify(before) === JSON.stringify(after);
        observed.sourceAdjacentCacheEvents = adjacent;
        observed.bundleCacheScope = {
          path: path.relative(root, packageBundleCache),
          nonOwnedAppRootCachesMeasured: false,
        };
        writeFileSync(
          path.join(caseOutput, 'observation.json'),
          JSON.stringify(observed, null, 2) + '\n',
        );
        assert.equal(listenAttempts, 0);
        assert.equal(connectAttempts, 0);
        assert.deepEqual(after, before);
        assert.deepEqual(adjacent, []);
      }
    }
  });
}
