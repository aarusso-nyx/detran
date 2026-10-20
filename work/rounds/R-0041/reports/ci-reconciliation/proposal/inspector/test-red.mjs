import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = realpathSync(fileURLToPath(new URL('../../../', import.meta.url)));
const requireRoot = createRequire(path.join(root, 'package.json'));
const requireApp = createRequire(path.join(root, 'backend/app/package.json'));
const vitestManifest = realpathSync(requireRoot.resolve('vitest/package.json'));
const viteManifest = realpathSync(createRequire(vitestManifest).resolve('vite/package.json'));
const tsManifest = realpathSync(requireRoot.resolve('typescript/package.json'));
const manifestIdentity = (file) => ({
  path: file,
  sha256: createHash('sha256').update(readFileSync(file)).digest('hex'),
  version: JSON.parse(readFileSync(file, 'utf8')).version,
});
const origins = {
  vitest: manifestIdentity(vitestManifest),
  vite: manifestIdentity(viteManifest),
  typescript: manifestIdentity(tsManifest),
};
const { createServer } = await import(pathToFileURL(path.join(path.dirname(viteManifest), 'dist/node/index.js')));
requireApp('reflect-metadata');
const { Test } = requireApp('@nestjs/testing');
const { Reflector } = requireApp('@nestjs/core');

async function withVite(action) {
  const cache = realpathSync(mkdtempSync(path.join(tmpdir(), 'detran-nest-vite-')));
  const server = await createServer({
    configFile: path.join(root, 'tools/security/invariants/ops-perf.config.mjs'),
    configLoader: 'native',
    cacheDir: cache,
    server: { middlewareMode: true, watch: null },
    appType: 'custom',
  });
  try {
    assert.equal(origins.vitest.version, '4.1.11');
    assert.equal(origins.vite.version, '7.3.6');
    assert.equal(origins.typescript.version, '6.0.3');
    assert.ok(server.config.plugins.some((plugin) => plugin.name === 'vite:esbuild'));
    return await action(server);
  } finally {
    await server.close();
    rmSync(cache, { recursive: true, force: true });
    assert.deepEqual(manifestIdentity(tsManifest), origins.typescript);
    assert.deepEqual(manifestIdentity(viteManifest), origins.vite);
  }
}

test('real Vite7 full chain retains DashboardStreamService DI metadata and Nest compilation', async (t) => {
  t.diagnostic(JSON.stringify(origins));
  await withVite(async (server) => {
    const { DashboardStreamService } = await server.ssrLoadModule(path.join(root, 'backend/app/src/dashboard-stream.service.ts'));
    const { Database } = requireApp('@stynx-nyx/data');
    const { RequestContext } = requireApp('@stynx-nyx/core');
    const { OpsParameterService } = await server.ssrLoadModule('@detran/ops-parameter');
    const { DASHBOARD_CLOCK } = await server.ssrLoadModule('@detran/dashboard-monitor');
    const metadata = Reflect.getMetadata('design:paramtypes', DashboardStreamService);
    const database = {};
    const requestContext = {};
    const parameters = {};
    let module;
    let failure;
    try {
      module = await Test.createTestingModule({ providers: [
        DashboardStreamService,
        { provide: Database, useValue: database },
        { provide: RequestContext, useValue: requestContext },
        { provide: OpsParameterService, useValue: parameters },
        { provide: DASHBOARD_CLOCK, useValue: { now: () => new Date(0) } },
      ] }).compile();
    } catch (error) { failure = error; }
    t.diagnostic(JSON.stringify({ metadata: metadata?.map((token) => token?.name), nestFailure: failure?.message }));
    try {
      assert.deepEqual(metadata?.slice(0, 3), [Database, RequestContext, OpsParameterService]);
      assert.ifError(failure);
      const service = module.get(DashboardStreamService);
      assert.equal(service.database, database);
      assert.equal(service.requestContext, requestContext);
      assert.equal(service.parameters, parameters);
      const final = await server.transformRequest(path.join(root, 'backend/app/src/dashboard-stream.service.ts'), { ssr: true });
      assert.ok(final?.code);
      assert.doesNotMatch(final.code, /\b(?:require\(|exports\.)/);
    } finally { await module?.close(); }
  });
});

test('real shared policy guard metadata binds the actual Reflector after Vite7 and compiles', async (t) => {
  await withVite(async (server) => {
    const { DetranPolicyGuard } = await server.ssrLoadModule(path.join(root, 'backend/domains/shared/src/policy.guard.ts'));
    const metadata = Reflect.getMetadata('design:paramtypes', DetranPolicyGuard);
    const reflector = new Reflector();
    const module = await Test.createTestingModule({ providers: [DetranPolicyGuard, { provide: Reflector, useValue: reflector }] }).compile();
    try {
      t.diagnostic(JSON.stringify({ metadata: metadata?.map((token) => token?.name) }));
      assert.deepEqual(metadata, [Reflector]);
      assert.equal(module.get(DetranPolicyGuard).reflector, reflector);
    } finally { await module.close(); }
  });
});
