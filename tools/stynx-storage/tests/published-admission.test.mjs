import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  constants,
  cpSync,
  existsSync,
  linkSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import path from 'node:path';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';

// Inspector A3/A3b: real published artifacts, no package mocks or SDK imports here.
const repo = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const admission = path.join(repo, 'scratch/r22-adoption-161/package-admission');
const cli = path.join(repo, 'tools/stynx-storage-project-published.mjs');
const output =
  'scratch/r22-adoption-161/portable-ci/retention-03/projection/public-storage-projection.json';
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const canonical = (v) =>
  Array.isArray(v)
    ? v.map(canonical)
    : v !== null && typeof v === 'object'
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, canonical(v[k])]),
        )
      : v;
const parse = (root, name) =>
  JSON.parse(readFileSync(physical(root, name), 'utf8'));
const binding = {
  ownerRole: 'postgres',
  appRole: 'role_app_backend',
  readerRole: null,
  tenantTable: { schema: 'auth', table: 'tenants', column: 'id' },
};
let shared;
const cleanEnv = () => {
  const env = { ...process.env };
  for (const key of ['NODE_OPTIONS', 'NODE_PATH', 'NODE_PG_FORCE_NATIVE'])
    delete env[key];
  return env;
};
// Logical historical names map to authentic portable raw input copies, never forged producer records.
function physical(root, name) {
  const historical =
    portableInput +
    '/historical/tools/stynx-storage/fixtures/publication-161/historical/scratch/r22-adoption-161/package-admission/';
  const fixed = [
    'retention-manifest.json',
    'protected-publication-verification.json',
    'runtime/closure-manifest.json',
    'runtime/module-boundary-disposition.json',
    'runtime/static-module-graph.json',
  ];
  if (fixed.includes(name)) return path.join(root, historical + name + '.raw');
  if (name.startsWith('runtime/'))
    return path.join(root, portableInput, 'target', name);
  if (name.startsWith('projection'))
    return path.join(
      root,
      portableProjection + name.slice('projection'.length),
    );
  if (name.startsWith('tarballs/') || name.startsWith('extracted/')) {
    const old = JSON.parse(
      readFileSync(path.join(root, historical + 'retention-manifest.json.raw')),
    );
    const current = JSON.parse(
      readFileSync(
        path.join(root, portableInput, 'metadata/portable-input-manifest.json'),
      ),
    );
    const original = old.packages.find(
      (p) =>
        name === p.archive.path || name.startsWith(p.extraction.root + '/'),
    );
    assert.ok(
      original,
      'Every historical package path has an exact portable counterpart',
    );
    const target = current.target.packages.find(
      (p) => p.name === original.name && p.version === '1.6.1',
    );
    assert.ok(target);
    return path.join(
      root,
      name === original.archive.path
        ? target.archive.path
        : target.root +
            '/' +
            name
              .slice(original.extraction.root.length + 1)
              .replace(/^package\//u, ''),
    );
  }
  return path.join(root, name);
}
const actualRefusals = [];
function run(root, args = [root], extraEnv = {}) {
  return spawnSync(
    process.execPath,
    [path.join(root, 'tools/stynx-storage-project-published.mjs'), ...args],
    {
      cwd: root,
      env: { LANG: 'C', LC_ALL: 'C', TZ: 'UTC', ...extraEnv },
      encoding: 'utf8',
      timeout: 600000,
      maxBuffer: 1024 * 1024,
    },
  );
}
function ready() {
  assert.ok(existsSync(cli), 'Reviewed production projector required');
  shared = genuinePortableCopy();
  return shared;
}
after(() => {
  if (shared) rmSync(shared, { recursive: true, force: true });
});
function fixture(action) {
  const root = ready();
  const backups = new Map();
  const save = (name) => {
    if (!backups.has(name))
      backups.set(name, readFileSync(physical(root, name)));
  };
  const write = (name, bytes) => {
    save(name);
    writeFileSync(physical(root, name), bytes);
  };
  const edit = (name, fn) => {
    const data = parse(root, name);
    fn(data);
    write(name, JSON.stringify(data, null, 2) + '\n');
  };
  const syncClosure = () =>
    edit('runtime/closure-manifest.json', (c) => {
      const b = readFileSync(physical(root, 'retention-manifest.json'));
      c.admissionInputs.retentionManifest.sha256 = sha(b);
    });
  const syncRuntimeRecord = (name, key) =>
    edit('runtime/closure-manifest.json', (c) => {
      const b = readFileSync(physical(root, 'runtime/' + name));
      c[key].sha256 = sha(b);
      c[key].bytes = b.length;
    });
  try {
    return action({ root, write, edit, save, syncClosure, syncRuntimeRecord });
  } finally {
    for (const [name, bytes] of backups) {
      rmSync(physical(root, name), { force: true });
      writeFileSync(physical(root, name), bytes);
    }
  }
}
function reject(root, args, env) {
  const r = run(root, args ?? [root], env);
  assert.equal(r.error, undefined, String(r.error));
  assert.notEqual(
    r.status,
    0,
    'Tampered actual artifact/root/environment must refuse',
  );
  assert.doesNotMatch(
    r.stderr,
    /Cannot find module .*project-published-storage|ERR_MODULE_NOT_FOUND/u,
    'A guard refusal must not be missing-driver RED',
  );
  assert.equal(
    existsSync(path.join(root, output)),
    false,
    'No accepted output on refusal',
  );
  assert.ok(
    (r.stderr + r.stdout).trim().length > 0,
    'Refusal identifies its failed boundary',
  );
  actualRefusals.push({ args, status: r.status, stderr: r.stderr.trim() });
}
function success(root) {
  const r = run(root);
  assert.equal(r.error, undefined, String(r.error));
  assert.equal(r.status, 0, r.stderr);
  assert.doesNotMatch(
    r.stdout,
    /CREATE TABLE|ALTER TABLE/u,
    'Default stdout must not dump full SQL',
  );
  return parse(root, output);
}
const pkg = (m) => m.packages.find((p) => p.name === '@stynx-nyx/offline-sync');
function extractedEntry(f, coherent = false) {
  const m = parse(f.root, 'retention-manifest.json');
  const p = pkg(m);
  const rec = p.extraction.regularFiles.find((x) =>
    x.path.endsWith('/src/index.js'),
  );
  const name = `${p.extraction.root}/${rec.path}`;
  const bytes = Buffer.concat([
    readFileSync(physical(f.root, name)),
    Buffer.from('\n// Inspector actual-byte drift\n'),
  ]);
  f.write(name, bytes);
  if (coherent) {
    f.edit('retention-manifest.json', (x) => {
      pkg(x).extraction.regularFiles.find((q) => q.path === rec.path).sha256 =
        sha(bytes);
      pkg(x).extraction.regularFiles.find((q) => q.path === rec.path).bytes =
        bytes.length;
    });
    f.syncClosure();
  }
}

test('published identity, fixed binding and closed public result roots', () =>
  fixture(({ root }) => {
    const d = success(root);
    assert.deepEqual(
      Object.keys(d).sort(),
      [
        'formatVersion',
        'publication',
        'binding',
        'inputs',
        'outbox',
        'offline',
        'offlineMigrations',
        'digests',
      ].sort(),
    );
    assert.equal(d.formatVersion, 1);
    assert.equal(
      d.publication.candidate,
      '3e3da1f7ceb6dd4a7dd2f9d6e0dc704437e262a0',
    );
    assert.equal(
      d.publication.tree,
      'e2ce9989249d1bc13403dc21f5a421b24178ef29',
    );
    assert.equal(d.publication.workflowRun, '38445937806');
    assert.deepEqual(
      Object.keys(d.publication).sort(),
      ['candidate', 'tree', 'workflowRun', 'protectedVerification'].sort(),
    );
    assert.deepEqual(d.publication.protectedVerification, {
      path: 'protected-publication-verification.json',
      sha256:
        '46815c17be9dbcd2080a3a0c08db958bd42390d8766c64ef40bebd5017074318',
    });
    assert.deepEqual(
      Object.keys(d.digests).sort(),
      ['outbox', 'offline', 'offlineMigrations'].sort(),
    );
    assert.deepEqual(d.binding, binding);
    for (const name of ['outbox', 'offline']) {
      const a = d[name];
      assert.deepEqual(
        Object.keys(a).sort(),
        [
          'contractVersion',
          'packageVersion',
          'binding',
          'objectsSql',
          'roleBindingsSql',
          'manifest',
        ].sort(),
      );
      assert.equal(a.packageVersion, '1.6.1');
      assert.deepEqual(a.binding, binding);
      assert.deepEqual(d.digests[name], {
        objectsSqlSha256: sha(a.objectsSql),
        roleBindingsSqlSha256: sha(a.roleBindingsSql),
        manifestSha256: sha(JSON.stringify(canonical(a.manifest))),
      });
    }
    assert.deepEqual(d.inputs, {
      retentionManifestSha256: sha(
        readFileSync(physical(root, 'retention-manifest.json')),
      ),
      runtimeClosureManifestSha256: sha(
        readFileSync(physical(root, 'runtime/closure-manifest.json')),
      ),
    });
  }));
test('nine ordered public migrations preserve exact raw prefix and distinct bound SQL', () =>
  fixture(({ root }) => {
    const d = success(root);
    const migrations = d.offlineMigrations.migrations;
    assert.equal(migrations.length, 9);
    assert.equal(d.offlineMigrations.packageVersion, '1.6.1');
    assert.deepEqual(d.offlineMigrations.binding, binding);
    const expected = [
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
    const rawPrefix = [
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
    migrations.forEach((m, i) => {
      assert.deepEqual(Object.keys(m).sort(), ['source', 'sql', 'sqlSha256']);
      assert.equal(path.basename(m.source.path), expected[i]);
      assert.equal(m.source.sha256, rawPrefix[i]);
      assert.equal(sha(m.sql), m.sqlSha256);
      assert.deepEqual(d.digests.offlineMigrations[i], {
        sourcePath: m.source.path,
        rawSqlSha256: m.source.sha256,
        boundSqlSha256: m.sqlSha256,
      });
    });
    assert.notEqual(migrations[0].source.sha256, migrations[0].sqlSha256);
  }));
test('outbox no-op compares actual objects/bindings/catalog separately from version metadata', () =>
  fixture(({ root }) => {
    const d = success(root);
    const prior = parse(
      path.join(repo, 'scratch/r22-adoption-160/baseline-preparation'),
      'outbox-prior-artifact.json',
    );
    assert.equal(d.outbox.objectsSql, prior.objectsSql);
    assert.equal(d.outbox.roleBindingsSql, prior.roleBindingsSql);
    assert.deepEqual(d.outbox.manifest.catalog, prior.manifest.catalog);
    assert.equal(prior.packageVersion, '1.6.0');
    assert.notEqual(d.outbox.packageVersion, prior.packageVersion);
  }));
test('same admitted inputs produce byte-identical deterministic projection', () =>
  fixture(({ root }) => {
    success(root);
    const first = readFileSync(path.join(root, output));
    // Fresh test-owned output directory: production remains exclusive and refuses implicit reuse.
    rmSync(path.join(root, portableProjection), {
      recursive: true,
      force: true,
    });
    success(root);
    assert.deepEqual(readFileSync(path.join(root, output)), first);
  }));
for (const [name, args] of [
  ['missing argument', []],
  ['extra argument', ['ROOT', 'extra']],
  ['flag', ['--full']],
  ['nonexistent root', ['/nonexistent/detran-r22-published-root']],
])
  test(`CLI refuses ${name}`, () =>
    fixture(({ root }) =>
      reject(
        root,
        args.map((a) => (a === 'ROOT' ? root : a)),
      ),
    ));
for (const [name, mutate] of [
  [
    'wrong publication',
    (m) => {
      m.publication.candidate = '0'.repeat(40);
    },
  ],
  [
    'wrong version',
    (m) => {
      m.targetVersion = '1.6.2';
    },
  ],
  [
    'missing roster member',
    (m) => {
      m.packages.pop();
    },
  ],
  [
    'duplicate roster member',
    (m) => {
      m.packages.push(m.packages[0]);
    },
  ],
  [
    'extra field',
    (m) => {
      m.unapproved = true;
    },
  ],
  [
    'missing field',
    (m) => {
      delete m.limits;
    },
  ],
  [
    'path traversal',
    (m) => {
      m.packages[0].archive.path = '../outside.tgz';
    },
  ],
])
  test(`retention refuses ${name}`, () =>
    fixture((f) => {
      f.edit('retention-manifest.json', mutate);
      f.syncClosure();
      reject(f.root);
    }));
test('duplicate JSON keys refuse even if later value restores expected value', () =>
  fixture((f) => {
    const b = readFileSync(physical(f.root, 'retention-manifest.json'), 'utf8');
    f.write(
      'retention-manifest.json',
      b.replace('"formatVersion": 1', '"formatVersion": 2, "formatVersion": 1'),
    );
    f.syncClosure();
    reject(f.root);
  }));
test('malformed JSON refuses', () =>
  fixture((f) => {
    f.write('retention-manifest.json', '{');
    f.syncClosure();
    reject(f.root);
  }));
test('retained tar byte drift refuses', () =>
  fixture((f) => {
    const p = pkg(parse(f.root, 'retention-manifest.json')).archive.path;
    f.write(
      p,
      Buffer.concat([readFileSync(physical(f.root, p)), Buffer.from('tamper')]),
    );
    reject(f.root);
  }));
test('tar drift with recomputed local hash refuses protected publication mismatch', () =>
  fixture((f) => {
    const p = pkg(parse(f.root, 'retention-manifest.json')).archive.path;
    const b = Buffer.concat([
      readFileSync(physical(f.root, p)),
      Buffer.from('tamper'),
    ]);
    f.write(p, b);
    f.edit('retention-manifest.json', (m) => {
      pkg(m).archive.sha256 = sha(b);
      pkg(m).archive.bytes = b.length;
    });
    f.syncClosure();
    reject(f.root);
  }));
test('public extracted entrypoint byte drift refuses', () =>
  fixture((f) => {
    extractedEntry(f);
    reject(f.root);
  }));
test('extracted entrypoint drift with recomputed local manifest still refuses real tar mismatch', () =>
  fixture((f) => {
    extractedEntry(f, true);
    reject(f.root);
  }));
test('missing public export refuses original package manifest drift', () =>
  fixture((f) => {
    const p = pkg(parse(f.root, 'retention-manifest.json')).packageManifest
      .path;
    f.edit(p, (m) => {
      m.main = './private/missing.js';
    });
    reject(f.root);
  }));
test('absent runtime closure refuses', () =>
  fixture((f) => {
    const n = 'runtime/closure-manifest.json';
    f.save(n);
    rmSync(physical(f.root, n));
    reject(f.root);
  }));
test('runtime closure unknown field refuses', () =>
  fixture((f) => {
    f.edit('runtime/closure-manifest.json', (c) => {
      c.acceptEverything = true;
    });
    reject(f.root);
  }));
test('boundary descriptor drift with coherent closure hash refuses exact site authority', () =>
  fixture((f) => {
    f.edit('runtime/module-boundary-disposition.json', (d) => {
      d.sites.pop();
    });
    f.syncRuntimeRecord('module-boundary-disposition.json', 'boundaryReview');
    reject(f.root);
  }));
test('module graph drift with coherent closure hash refuses unknown edge', () =>
  fixture((f) => {
    f.edit('runtime/static-module-graph.json', (d) => {
      d.dynamic.push({
        from: d.files[0].path,
        kind: 'require',
        expression: 'unapproved',
      });
    });
    f.syncRuntimeRecord('static-module-graph.json', 'graph');
    reject(f.root);
  }));
test('runtime loaded public entrypoint byte drift refuses', () =>
  fixture((f) => {
    const c = parse(f.root, 'runtime/closure-manifest.json');
    const p = `runtime/${c.loader.roots[1].path}`;
    f.write(
      p,
      Buffer.concat([
        readFileSync(physical(f.root, p)),
        Buffer.from('\n// drift\n'),
      ]),
    );
    reject(f.root);
  }));
test('same-byte external symlink refuses', () =>
  fixture((f) => {
    const p = pkg(parse(f.root, 'retention-manifest.json')).archive.path;
    f.save(p);
    rmSync(physical(f.root, p));
    symlinkSync(path.join(admission, p), physical(f.root, p));
    reject(f.root);
  }));
test('projection directory cannot escape admission root through a symlink', () =>
  fixture(({ root }) => {
    const outside = mkdtempSync(
      path.join(os.tmpdir(), 'detran-projection-outside-'),
    );
    try {
      symlinkSync(outside, physical(root, 'projection'));
      reject(root);
      assert.equal(
        existsSync(path.join(outside, 'public-storage-projection.json')),
        false,
      );
    } finally {
      rmSync(physical(root, 'projection'), { force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  }));
for (const [key, value] of [
  ['NODE_PG_FORCE_NATIVE', '1'],
  ['NODE_PATH', '/tmp/unapproved-node-path'],
  ['NODE_OPTIONS', '--trace-warnings'],
])
  test(`ambient ${key} refuses before SDK import`, () =>
    fixture(({ root }) => reject(root, [root], { [key]: value })));

// Added from independent source review; first execution follows the reviewed fix.
// The original 32 missing-driver RED cases and their assertions remain unchanged.
test('existing observation hardlink cannot modify an external sentinel', () =>
  fixture(({ root }) => {
    const outside = mkdtempSync(
      path.join(os.tmpdir(), 'detran-observation-link-'),
    );
    const sentinel = path.join(outside, 'sentinel.json');
    const original = Buffer.from('{"inspector":"keep external bytes"}\n');
    try {
      writeFileSync(sentinel, original);
      mkdirSync(physical(root, 'projection'));
      linkSync(sentinel, physical(root, 'projection/import-observation.json'));
      const r = run(root);
      assert.equal(r.error, undefined, String(r.error));
      assert.deepEqual(readFileSync(sentinel), original);
      assert.doesNotMatch(
        r.stderr,
        /Cannot find module .*project-published-storage|ERR_MODULE_NOT_FOUND/u,
      );
      if (r.status === 0) {
        assert.equal(existsSync(path.join(root, output)), true);
        assert.notDeepEqual(
          readFileSync(physical(root, 'projection/import-observation.json')),
          original,
        );
      } else {
        assert.equal(existsSync(path.join(root, output)), false);
        assert.ok((r.stderr + r.stdout).trim().length > 0);
      }
    } finally {
      rmSync(physical(root, 'projection'), { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  }));

// Source-only consumer guard seam. These tests do not import/evaluate any SDK.
// Facts use real retained file/package bytes; context/result deltas are local DTOs.
function canonicalFormatFacts() {
  const c = parse(repo, 'runtime/closure-manifest.json');
  const entry = c.loader.roots.find((x) => x.name === '@stynx-nyx/outbox');
  const packagePath = 'node_modules/@stynx-nyx/outbox/package.json';
  const bytes = readFileSync(physical(repo, 'runtime/' + entry.path));
  const packageBytes = readFileSync(physical(repo, 'runtime/' + packagePath));
  return {
    file: {
      relativePath: entry.path,
      expectedSha256: entry.sha256,
      actualSha256: sha(bytes),
      nearestPackageJsonPath: packagePath,
      nearestPackageJsonSha256: sha(packageBytes),
    },
    nearestPackage: {
      relativePath: packagePath,
      actualSha256: sha(packageBytes),
      manifest: JSON.parse(packageBytes),
    },
    context: {
      format: undefined,
      conditions: ['require', 'node', 'node-addons', 'module-sync'],
    },
    result: { format: undefined },
  };
}
function canonicalFormatHelper() {
  const toolRequire = createRequire(
    path.join(repo, 'backend/app/package.json'),
  );
  const ts = toolRequire('typescript');
  const source = readFileSync(cli, 'utf8');
  const ast = ts.createSourceFile(cli, source, ts.ScriptTarget.Latest, true);
  let helper;
  function visit(n) {
    if (
      ts.isFunctionDeclaration(n) &&
      n.name?.text === 'isCanonicalUnspecifiedCjsFormat'
    ) {
      assert.equal(
        helper,
        undefined,
        'Exactly one source witness helper required',
      );
      helper = n;
    }
    ts.forEachChild(n, visit);
  }
  visit(ast);
  assert.ok(
    helper,
    'Prospective source-witness RED: canonical Node format helper absent',
  );
  return runInNewContext(`(${helper.getText(ast)})`, Object.create(null), {
    timeout: 1000,
  });
}
test('source-only format witness admits real bytebound require .js with absent package type', () => {
  const helper = canonicalFormatHelper();
  const f = canonicalFormatFacts();
  assert.equal(Object.hasOwn(f.nearestPackage.manifest, 'type'), false);
  assert.equal(helper(f.file, f.nearestPackage, f.context, f.result), true);
});
for (const [name, delta] of [
  [
    'context null format',
    (f) => {
      f.context.format = null;
    },
  ],
  [
    'result null format',
    (f) => {
      f.result.format = null;
    },
  ],
  [
    'unknown result format',
    (f) => {
      f.result.format = 'unreviewed';
    },
  ],
  [
    'explicit result commonjs',
    (f) => {
      f.result.format = 'commonjs';
    },
  ],
  [
    'import-only context',
    (f) => {
      f.context.conditions = ['node', 'import'];
    },
  ],
  [
    'mixed require/import context',
    (f) => {
      f.context.conditions = ['require', 'import'];
    },
  ],
  [
    'missing require condition',
    (f) => {
      f.context.conditions = ['node'];
    },
  ],
  [
    'own commonjs package type',
    (f) => {
      f.nearestPackage.manifest.type = 'commonjs';
    },
  ],
  [
    'own module package type',
    (f) => {
      f.nearestPackage.manifest.type = 'module';
    },
  ],
  [
    'own undefined package type',
    (f) => {
      f.nearestPackage.manifest.type = undefined;
    },
  ],
  [
    'package hash mismatch',
    (f) => {
      f.nearestPackage.actualSha256 = '0'.repeat(64);
    },
  ],
  [
    'file hash mismatch',
    (f) => {
      f.file.actualSha256 = '0'.repeat(64);
    },
  ],
  [
    'malformed agreed file hash',
    (f) => {
      f.file.actualSha256 = f.file.expectedSha256 = 'bad';
    },
  ],
  [
    'non-js extension',
    (f) => {
      f.file.relativePath = f.file.relativePath.replace(/\.js$/u, '.cjs');
    },
  ],
  [
    'file outside nearest package',
    (f) => {
      f.file.relativePath = 'node_modules/unrelated/file.js';
    },
  ],
  [
    'traversal file path',
    (f) => {
      f.file.relativePath = 'node_modules/@stynx-nyx/outbox/../outside.js';
    },
  ],
  [
    'different nearest package path',
    (f) => {
      f.nearestPackage.relativePath = 'node_modules/unrelated/package.json';
    },
  ],
  [
    'missing nearest package',
    (f) => {
      f.nearestPackage = null;
    },
  ],
])
  test(`source-only format witness refuses ${name}`, () => {
    const helper = canonicalFormatHelper();
    const f = canonicalFormatFacts();
    delta(f);
    assert.equal(helper(f.file, f.nearestPackage, f.context, f.result), false);
  });

// Original52 names/assertion meanings preserved; real portable paths and exclusive test-owned output lifecycle replace the historical harness.
const portableProjector = path.join(
  repo,
  'tools/stynx-storage-project-published.mjs',
);
test('portable projector source exists with fixed retention03 discovery and no top-level SDK import', () => {
  const s = readFileSync(portableProjector, 'utf8');
  assert.match(
    s,
    /const INPUT = 'scratch\/r22-adoption-161\/portable-ci\/retention-03\/inputs';/u,
  );
  assert.match(
    s,
    /const manifestBytes = bytesAt\(\s*root,\s*INPUT \+ '\/metadata\/portable-input-manifest\.json'/u,
  );
  assert(
    s.includes('scratch/r22-adoption-161/portable-ci/retention-03/projection'),
  );
  assert(s.includes('R22_PUBLISHED_PROJECTION_REFUSED:'));
  assert.doesNotMatch(s, /from\s+['"]@stynx-nyx\//u);
});
for (const [name, args] of [
  ['missing root', []],
  ['extra selector', [repo, '--sdk']],
  ['foreign root', ['/tmp/R22-foreign-projector-root']],
  ['relative root', ['.']],
  ['traversal root', [repo + '/../detran']],
  ['URL root', ['file://' + repo]],
])
  test('portable projector CLI typed-refuses ' + name + ' before SDK', () => {
    const result = spawnSync(process.execPath, [portableProjector, ...args], {
      cwd: repo,
      env: { LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8', TZ: 'UTC' },
      encoding: 'utf8',
      timeout: 10000,
    });
    assert.equal(result.error, undefined);
    assert.equal(result.signal, null);
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, '');
    assert.match(
      result.stderr,
      /^R22_PUBLISHED_PROJECTION_REFUSED:invalid-cli\s*$/u,
    );
    assert.doesNotMatch(result.stderr, /MODULE_NOT_FOUND|TypeError/u);
  });

// Genuine historical copied-root artifacts. These four vectors precede the c819 source correction.
let portableCopy;
const portableInput =
  'scratch/r22-adoption-161/portable-ci/retention-03/inputs';
const portableProjection =
  'scratch/r22-adoption-161/portable-ci/retention-03/projection';
function genuinePortableCopy() {
  if (!portableCopy) {
    portableCopy = realpathSync(
      mkdtempSync(path.join(os.tmpdir(), 'detran-portable-copied-root-')),
    );
    for (const name of [
      'tools/stynx-storage-project-published.mjs',
      'tools/stynx-storage-ci-inputs.mjs',
      'tools/stynx-storage-ci-validation.mjs',
      'tools/stynx-storage/fixtures',
      'tools/stynx-storage/retained-observations',
      'pnpm-lock.yaml',
      portableInput,
    ]) {
      const target = path.join(portableCopy, name);
      mkdirSync(path.dirname(target), { recursive: true });
      cpSync(path.join(repo, name), target, {
        recursive: true,
        mode: constants.COPYFILE_FICLONE,
        verbatimSymlinks: true,
      });
    }
  }
  rmSync(path.join(portableCopy, portableProjection), {
    recursive: true,
    force: true,
  });
  return portableCopy;
}
after(() => {
  if (portableCopy) rmSync(portableCopy, { recursive: true, force: true });
});
function portableCopyRun(root) {
  return spawnSync(
    process.execPath,
    [path.join(root, 'tools/stynx-storage-project-published.mjs'), root],
    {
      cwd: root,
      env: { LANG: 'C', LC_ALL: 'C', TZ: 'UTC' },
      encoding: 'utf8',
      timeout: 600000,
      maxBuffer: 1024 * 1024,
    },
  );
}
function copiedRootTamper(action) {
  const root = genuinePortableCopy(),
    manifestName = portableInput + '/metadata/portable-input-manifest.json',
    observationName =
      portableInput + '/metadata/retention-execution-observation.json',
    mRaw = readFileSync(path.join(root, manifestName)),
    oRaw = readFileSync(path.join(root, observationName));
  try {
    return action(root, manifestName, observationName);
  } finally {
    writeFileSync(path.join(root, manifestName), mRaw);
    writeFileSync(path.join(root, observationName), oRaw);
  }
}
function signTamperedManifest(root, name, document) {
  const { recordSha256, ...unsigned } = document;
  document.recordSha256 = 'sha256:' + sha(JSON.stringify(canonical(unsigned)));
  writeFileSync(
    path.join(root, name),
    JSON.stringify(document, null, 2) + '\n',
  );
}
function copiedRootReject(root) {
  const r = portableCopyRun(root);
  assert.equal(r.error, undefined);
  assert.notEqual(r.status, 0);
  assert.match(
    r.stderr,
    /^R22_PUBLISHED_PROJECTION_REFUSED:(?:input-identity|invalid-document)\s*$/u,
  );
  assert.equal(r.stdout, '');
  assert.equal(
    existsSync(
      path.join(root, portableProjection, 'public-storage-projection.json'),
    ),
    false,
  );
}
test('copied-root historical exact authentic manifest preserves documentary origin and projects in the current real root', () => {
  const root = genuinePortableCopy();
  const raw = readFileSync(
    path.join(root, portableInput, 'metadata/portable-input-manifest.json'),
  );
  assert.equal(
    sha(raw),
    '1429a543a35d9feafdea222680c9420856de59f9d13d175bc063a4b40275424d',
  );
  assert.notEqual(JSON.parse(raw).repository.root, root);
  const observed = portableCopyRun(root);
  assert.equal(observed.error, undefined);
  assert.equal(observed.status, 0, observed.stderr);
  assert.equal(
    sha(
      readFileSync(
        path.join(root, portableProjection, 'public-storage-projection.json'),
      ),
    ),
    '944f0041700de5e2c31ebf0e71b7999df999d76cc6645b3bec38ddfc0f692388',
  );
});
test('copied-root recomputed historical root manifest cannot acquire authentic observation authority', () =>
  copiedRootTamper((root, name) => {
    const m = parse(root, name);
    m.repository.root = root;
    signTamperedManifest(root, name, m);
    copiedRootReject(root);
  }));
test('copied-root changed historical observation with coherent manifest hash still refuses', () =>
  copiedRootTamper((root, name, observationName) => {
    const o = parse(root, observationName);
    o.pid += 1;
    const b = Buffer.from(JSON.stringify(o, null, 2) + '\n');
    writeFileSync(path.join(root, observationName), b);
    const m = parse(root, name);
    m.outputs[0].bytes = b.length;
    m.outputs[0].sha256 = 'sha256:' + sha(b);
    signTamperedManifest(root, name, m);
    copiedRootReject(root);
  }));
test('copied-root forged current-source observation cannot waive current producer root equality', () =>
  copiedRootTamper((root, name, observationName) => {
    const o = parse(root, observationName),
      current = readFileSync(
        path.join(root, 'tools/stynx-storage-ci-inputs.mjs'),
      );
    const producer = o.sources.find(
      (x) => x.path === 'tools/stynx-storage-ci-inputs.mjs',
    );
    producer.bytes = current.length;
    producer.sha256 = 'sha256:' + sha(current);
    const b = Buffer.from(JSON.stringify(o, null, 2) + '\n');
    writeFileSync(path.join(root, observationName), b);
    const m = parse(root, name);
    m.outputs[0].bytes = b.length;
    m.outputs[0].sha256 = 'sha256:' + sha(b);
    signTamperedManifest(root, name, m);
    assert.notEqual(m.repository.root, root);
    copiedRootReject(root);
  }));
