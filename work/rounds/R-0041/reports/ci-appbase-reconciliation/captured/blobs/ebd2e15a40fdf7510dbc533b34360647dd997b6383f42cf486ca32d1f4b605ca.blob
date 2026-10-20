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
const viteManifest = realpathSync(
  createRequire(vitestManifest).resolve('vite/package.json'),
);
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
const { createServer } = await import(
  pathToFileURL(path.join(path.dirname(viteManifest), 'dist/node/index.js'))
);
requireApp('reflect-metadata');
const { Test } = requireApp('@nestjs/testing');
const { Reflector } = requireApp('@nestjs/core');

async function withVite(action) {
  const cache = realpathSync(
    mkdtempSync(path.join(tmpdir(), 'detran-nest-vite-')),
  );
  const server = await createServer({
    configFile: path.join(
      root,
      'tools/security/invariants/ops-perf.config.mjs',
    ),
    configLoader: 'native',
    cacheDir: cache,
    server: { middlewareMode: true, watch: null },
    appType: 'custom',
  });
  try {
    assert.equal(origins.vitest.version, '4.1.11');
    assert.equal(origins.vite.version, '7.3.6');
    assert.equal(origins.typescript.version, '6.0.3');
    assert.ok(
      server.config.plugins.some((plugin) => plugin.name === 'vite:esbuild'),
    );
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
    const { DashboardStreamService } = await server.ssrLoadModule(
      path.join(root, 'backend/app/src/dashboard-stream.service.ts'),
    );
    const { Database } = requireApp('@stynx-nyx/data');
    const { RequestContext } = requireApp('@stynx-nyx/core');
    const { OpsParameterService } = await server.ssrLoadModule(
      '@detran/ops-parameter',
    );
    const { DASHBOARD_CLOCK } = await server.ssrLoadModule(
      '@detran/dashboard-monitor',
    );
    const metadata = Reflect.getMetadata(
      'design:paramtypes',
      DashboardStreamService,
    );
    const database = {};
    const requestContext = {};
    const parameters = {};
    let module;
    let failure;
    try {
      module = await Test.createTestingModule({
        providers: [
          DashboardStreamService,
          { provide: Database, useValue: database },
          { provide: RequestContext, useValue: requestContext },
          { provide: OpsParameterService, useValue: parameters },
          { provide: DASHBOARD_CLOCK, useValue: { now: () => new Date(0) } },
        ],
      }).compile();
    } catch (error) {
      failure = error;
    }
    t.diagnostic(
      JSON.stringify({
        metadata: metadata?.map((token) => token?.name),
        nestFailure: failure?.message,
      }),
    );
    try {
      assert.deepEqual(metadata?.slice(0, 3), [
        Database,
        RequestContext,
        OpsParameterService,
      ]);
      const metadataPlugin = server.config.plugins.findIndex(
        (plugin) => plugin.name === 'detran-ordinary-nest-metadata',
      );
      const esbuildPlugin = server.config.plugins.findIndex(
        (plugin) => plugin.name === 'vite:esbuild',
      );
      assert.ok(metadataPlugin >= 0 && metadataPlugin < esbuildPlugin);
      assert.equal(server.config.plugins[metadataPlugin].enforce, 'pre');
      assert.ifError(failure);
      const service = module.get(DashboardStreamService);
      assert.equal(service.database, database);
      assert.equal(service.requestContext, requestContext);
      assert.equal(service.parameters, parameters);
      const final = await server.transformRequest(
        path.join(root, 'backend/app/src/dashboard-stream.service.ts'),
        { ssr: true },
      );
      assert.ok(final?.code);
      assert.doesNotMatch(final.code, /\b(?:require\(|exports\.)/);
    } finally {
      await module?.close();
    }
  });
});

test('real shared policy guard metadata binds the actual Reflector after Vite7 and compiles', async (t) => {
  await withVite(async (server) => {
    const { DetranPolicyGuard } = await server.ssrLoadModule(
      path.join(root, 'backend/domains/shared/src/policy.guard.ts'),
    );
    const metadata = Reflect.getMetadata(
      'design:paramtypes',
      DetranPolicyGuard,
    );
    const reflector = new Reflector();
    const module = await Test.createTestingModule({
      providers: [
        DetranPolicyGuard,
        { provide: Reflector, useValue: reflector },
      ],
    }).compile();
    try {
      t.diagnostic(
        JSON.stringify({ metadata: metadata?.map((token) => token?.name) }),
      );
      assert.deepEqual(metadata, [Reflector]);
      assert.equal(module.get(DetranPolicyGuard).reflector, reflector);
    } finally {
      await module.close();
    }
  });
});

// Import lazily: an absent proposed helper never stands in for the functional
// Vite/Nest regression above. Each copy derives its own canonical fixture root.
async function fixture() {
  const { mkdirSync, writeFileSync, copyFileSync, symlinkSync } =
    await import('node:fs');
  const base = realpathSync(
    mkdtempSync(path.join(tmpdir(), 'detran-nest-contract-')),
  );
  const helper = path.join(
    base,
    'tools/security/invariants/nest-metadata-transform.mjs',
  );
  mkdirSync(path.dirname(helper), { recursive: true });
  copyFileSync(
    path.join(root, 'tools/security/invariants/nest-metadata-transform.mjs'),
    helper,
  );
  symlinkSync(
    path.join(root, 'node_modules'),
    path.join(base, 'node_modules'),
    'dir',
  );
  const write = (relative, contents) => {
    const file = path.join(base, relative);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(
      file,
      typeof contents === 'string' ? contents : JSON.stringify(contents),
    );
    return file;
  };
  const config = {
    compilerOptions: {
      target: 'ES2023',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      strict: true,
      noEmit: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    },
  };
  for (const prefix of [
    'backend/app',
    'backend/domains/shared',
    'backend/domains/demo/example',
    'backend/domains/ops/core',
  ])
    write(`${prefix}/tsconfig.json`, config);
  const { createNestMetadataPlugin } = await import(pathToFileURL(helper));
  const plugin = createNestMetadataPlugin();
  assert.equal(plugin.enforce, 'pre');
  assert.equal(typeof plugin.name, 'string');
  const transform = (code, file) => plugin.transform.call({}, code, file);
  return {
    base,
    config,
    write,
    transform,
    close: () => rmSync(base, { recursive: true, force: true }),
  };
}

const decorated = `function Injectable(): ClassDecorator { return () => {}; }
class Dependency {}
@Injectable()
export class Service { constructor(readonly dependency: Dependency) {} }
`;

for (const prefix of [
  'backend/app',
  'backend/domains/shared',
  'backend/domains/demo/example',
]) {
  test(`closed ${prefix} mapping retains metadata, target and ESM with deterministic sourcemaps`, async () => {
    const f = await fixture();
    try {
      const file = f.write(`${prefix}/src/service.ts`, decorated);
      const first = await f.transform(decorated, file);
      const second = await f.transform(decorated, file);
      assert.equal(typeof first?.code, 'string');
      assert.match(first.code, /design:paramtypes/);
      assert.match(first.code, /Dependency/);
      assert.match(first.code, /export/);
      assert.doesNotMatch(first.code, /\b(?:require\(|exports\.)/);
      assert.deepEqual(second, first);
      assert.ok(first.map);
      const map =
        typeof first.map === 'string' ? JSON.parse(first.map) : first.map;
      assert.ok(map.sources.some((entry) => entry.endsWith('service.ts')));
      assert.ok(map.sourcesContent.includes(decorated));
      assert.equal(readFileSync(file, 'utf8'), decorated);
      const changed = decorated.replace(
        'class Dependency {}',
        'class Dependency { value = 7; }',
      );
      f.write(`${prefix}/src/service.ts`, changed);
      assert.notEqual((await f.transform(changed, file)).code, first.code);
    } finally {
      f.close();
    }
  });
}

test('ops/core without decorators passes through despite genuinely absent metadata flags', async () => {
  const f = await fixture();
  try {
    f.write('backend/domains/ops/core/tsconfig.json', {
      compilerOptions: {
        target: 'ES2023',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
      },
    });
    const code = 'export const value: number = 3;';
    const file = f.write('backend/domains/ops/core/src/plain.ts', code);
    assert.equal(await f.transform(code, file), null);
    assert.equal(readFileSync(file, 'utf8'), code);
  } finally {
    f.close();
  }
});

for (const change of [
  { experimentalDecorators: false },
  { emitDecoratorMetadata: false },
  { experimentalDecorators: undefined, emitDecoratorMetadata: undefined },
]) {
  test(`decorated source refuses noncanonical flags ${JSON.stringify(change)}`, async () => {
    const f = await fixture();
    try {
      f.write('backend/app/tsconfig.json', {
        compilerOptions: { ...f.config.compilerOptions, ...change },
      });
      const file = f.write('backend/app/src/service.ts', decorated);
      await assert.rejects(async () => f.transform(decorated, file));
    } finally {
      f.close();
    }
  });
}

test('parameter-only decorator is detected without forcing absent flags', async () => {
  const f = await fixture();
  try {
    f.write('backend/app/tsconfig.json', {
      compilerOptions: { target: 'ES2023' },
    });
    const code =
      'declare function Inject(): ParameterDecorator; export class Service { constructor(@Inject() value: unknown) {} }';
    const file = f.write('backend/app/src/service.ts', code);
    await assert.rejects(async () => f.transform(code, file));
  } finally {
    f.close();
  }
});

for (const relative of [
  'backend/app/src/types.d.ts',
  'backend/app/tests/service.ts',
  'packages/demo/src/service.ts',
  'backend/domains/shared/tests/service.ts',
  'backend/domains/demo/example/node_modules/demo/service.ts',
]) {
  test(`out-of-population ${relative} passes through without widening compilation`, async () => {
    const f = await fixture();
    try {
      const file = f.write(relative, decorated);
      assert.equal(await f.transform(decorated, file), null);
    } finally {
      f.close();
    }
  });
}

for (const extra of [
  { extends: '../../../../outside.json' },
  { references: [{ path: '../../../../outside' }] },
]) {
  test(`mapped config refuses unsupported external composition ${JSON.stringify(extra)}`, async () => {
    const f = await fixture();
    try {
      f.write('backend/app/tsconfig.json', { ...f.config, ...extra });
      const file = f.write('backend/app/src/service.ts', decorated);
      await assert.rejects(async () => f.transform(decorated, file));
    } finally {
      f.close();
    }
  });
}

test('malformed mapped config and decorated syntax errors fail rather than silently emitting', async () => {
  const f = await fixture();
  try {
    const file = f.write('backend/app/src/service.ts', decorated);
    f.write('backend/app/tsconfig.json', '{');
    await assert.rejects(async () => f.transform(decorated, file));
    f.write('backend/app/tsconfig.json', f.config);
    const malformed = '@Injectable() export class Broken { constructor(';
    f.write('backend/app/src/service.ts', malformed);
    await assert.rejects(async () => f.transform(malformed, file));
  } finally {
    f.close();
  }
});

test('changed canonical config bytes invalidate cached transformed target semantics', async () => {
  const f = await fixture();
  try {
    const code =
      decorated + '\nexport const optional = (x: { v?: number }) => x.v ?? 7;';
    const file = f.write('backend/app/src/service.ts', code);
    const modern = await f.transform(code, file);
    f.write('backend/app/tsconfig.json', {
      compilerOptions: { ...f.config.compilerOptions, target: 'ES2017' },
    });
    const older = await f.transform(code, file);
    assert.notEqual(older.code, modern.code);
    f.write('backend/app/tsconfig.json', f.config);
    assert.deepEqual(await f.transform(code, file), modern);
  } finally {
    f.close();
  }
});

for (const kind of ['source', 'config', 'parent']) {
  test(`lexically internal ${kind} symlink refuses escape before transformation`, async () => {
    const { symlinkSync, unlinkSync, mkdirSync, writeFileSync } =
      await import('node:fs');
    const f = await fixture();
    const outside = realpathSync(
      mkdtempSync(path.join(tmpdir(), 'detran-nest-outside-')),
    );
    try {
      let file;
      if (kind === 'source') {
        const original = path.join(outside, 'outside.ts');
        writeFileSync(original, decorated);
        file = f.write('backend/app/src/service.ts', decorated);
        unlinkSync(file);
        symlinkSync(original, file);
      } else if (kind === 'config') {
        file = f.write('backend/app/src/service.ts', decorated);
        const original = path.join(outside, 'outside.json');
        writeFileSync(original, JSON.stringify(f.config));
        const config = path.join(f.base, 'backend/app/tsconfig.json');
        unlinkSync(config);
        symlinkSync(original, config);
      } else {
        mkdirSync(path.join(outside, 'example/src'), { recursive: true });
        writeFileSync(path.join(outside, 'example/src/service.ts'), decorated);
        symlinkSync(
          outside,
          path.join(f.base, 'backend/domains/linked'),
          'dir',
        );
        file = path.join(
          f.base,
          'backend/domains/linked/example/src/service.ts',
        );
      }
      await assert.rejects(async () => f.transform(decorated, file));
    } finally {
      f.close();
      rmSync(outside, { recursive: true, force: true });
    }
  });
}

test('decorator-like text in comments and literals does not trigger compilation', async () => {
  const f = await fixture();
  try {
    f.write('backend/app/tsconfig.json', {
      compilerOptions: { target: 'ES2023' },
    });
    const code = '// @Injectable()\nexport const text = "@Inject()";';
    const file = f.write('backend/app/src/plain.ts', code);
    assert.equal(await f.transform(code, file), null);
  } finally {
    f.close();
  }
});

test('virtual and query-bearing identities cannot expand the closed source population', async () => {
  const f = await fixture();
  try {
    const file = f.write('backend/app/src/service.ts', decorated);
    for (const id of [
      `\0${file}`,
      `${file}?raw`,
      `${file}?v=1`,
      `${file}#fragment`,
    ]) {
      let output;
      try {
        output = await f.transform(decorated, id);
      } catch {
        continue;
      }
      assert.equal(output, null, `ambiguous identity must not emit: ${id}`);
    }
  } finally {
    f.close();
  }
});

test('invalid canonical compiler option refuses without overriding it', async () => {
  const f = await fixture();
  try {
    f.write('backend/app/tsconfig.json', {
      compilerOptions: { ...f.config.compilerOptions, target: 'NOT_A_TARGET' },
    });
    const file = f.write('backend/app/src/service.ts', decorated);
    await assert.rejects(async () => f.transform(decorated, file));
  } finally {
    f.close();
  }
});
