import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// D-160.8 admission only. Live installation/rollback claims require PostgreSQL.
const repo = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const cli = path.join(repo, 'tools/stynx-storage-install.mjs');
const metadataPath = 'backend/database/stynx-storage.json';
const outboxPath = 'backend/database/ddl/19-stynx-outbox.sql';
const offlinePath = 'backend/database/ddl/19-stynx-offline.sql';
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const binding = {
  ownerRole: 'postgres',
  appRole: 'role_app_backend',
  readerRole: null,
  tenantTable: { schema: 'auth', table: 'tenants', column: 'id' },
};
const specs = [
  ['@stynx-nyx/outbox', 'renderOutboxStorage'],
  ['@stynx-nyx/offline-sync', 'renderOfflineStorage'],
];

function write(root, name, bytes) {
  const file = path.join(root, name);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, bytes);
}

function fixture(run) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'detran-storage-install-'));
  try {
    for (const name of [
      metadataPath,
      'tools/stynx-version.json',
      'backend/app/package.json',
      'tools/stynx-storage/fixtures/publication-161/historical/scratch/r22-adoption-161/package-admission/projection/public-storage-projection.json.raw',
    ])
      write(root, name, readFileSync(path.join(repo, name)));
    const ddl = 'backend/database/ddl';
    mkdirSync(path.join(root, ddl), { recursive: true });
    // Copy real consumer DDL, including the owner ledger once authored by Engineer.
    for (const name of readdirSync(path.join(repo, ddl)).filter((name) =>
      name.endsWith('.sql'),
    ))
      copyFileSync(path.join(repo, ddl, name), path.join(root, ddl, name));
    symlinkSync(
      path.join(repo, 'backend/app/node_modules'),
      path.join(root, 'backend/app/node_modules'),
      'dir',
    );
    return run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function run(root, args = [root], cwd = root) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 30_000,
    maxBuffer: 8 * 1024 * 1024,
    // The plan-only CLI must not need a connection, even when ambient URLs are unusable.
    env: {
      ...process.env,
      DATABASE_URL: 'postgresql://inspector@127.0.0.1:1/invalid',
      STYNX_OWNER_DATABASE_URL: 'postgresql://inspector@127.0.0.1:1/invalid',
      STYNX_APP_DATABASE_URL: 'postgresql://inspector@127.0.0.1:1/invalid',
      STYNX_READER_DATABASE_URL: 'postgresql://inspector@127.0.0.1:1/invalid',
    },
  });
  assert.ifError(result.error);
  assert.equal(result.signal, null);
  return {
    status: result.status,
    stdout: result.stdout,
    output: `${result.stdout}${result.stderr}`,
  };
}

function reject(result, identity) {
  assert.equal(result.status, 1, result.output);
  assert.ok(result.output.includes(identity), result.output);
  assert.doesNotMatch(
    result.output,
    /ECONNREFUSED|connection refused|password authentication failed/i,
  );
}

function editMetadata(root, mutate) {
  const file = path.join(root, metadataPath);
  const metadata = JSON.parse(readFileSync(file, 'utf8'));
  mutate(metadata);
  writeFileSync(file, `${JSON.stringify(metadata, null, 2)}\n`);
}

function snapshot(root) {
  const files = [];
  const visit = (relative) => {
    for (const item of readdirSync(path.join(root, relative), {
      withFileTypes: true,
    })) {
      const name = path.join(relative, item.name);
      if (item.isSymbolicLink()) continue;
      if (item.isDirectory()) visit(name);
      else files.push([name, digest(readFileSync(path.join(root, name)))]);
    }
  };
  visit('');
  return files.sort((a, b) => a[0].localeCompare(b[0]));
}

test('A160-07 plan contains the exact two installed public artifacts without connecting', () => {
  fixture((root) => {
    const result = run(root);
    assert.equal(result.status, 0, result.output);
    const plan = JSON.parse(result.stdout);
    assert.equal(plan.version, 1);
    assert.equal(plan.packages.length, 2);
    const metadata = JSON.parse(
      readFileSync(path.join(root, metadataPath), 'utf8'),
    );
    const requireApp = createRequire(
      path.join(root, 'backend/app/package.json'),
    );
    for (const [index, [name, render]] of specs.entries()) {
      const artifact = requireApp(name)[render](binding);
      assert.deepEqual(
        plan.packages[index].metadata,
        metadata.artifacts[index],
      );
      assert.equal(plan.packages[index].metadata.package, name);
      assert.equal(plan.packages[index].objectsSql, artifact.objectsSql);
      assert.equal(
        plan.packages[index].roleBindingsSql,
        artifact.roleBindingsSql,
      );
      assert.equal(
        digest(plan.packages[index].objectsSql),
        metadata.artifacts[index].objectsSha256,
      );
      assert.equal(
        digest(plan.packages[index].roleBindingsSql),
        metadata.artifacts[index].roleBindingsSha256,
      );
    }
  });
});

test('A160-07 plan is deterministic and only reads its selected fixture root', () => {
  fixture((root) => {
    const before = snapshot(root);
    const first = run(root);
    const second = run(root, [root], repo);
    assert.equal(first.status, 0, first.output);
    assert.equal(second.status, 0, second.output);
    assert.equal(second.stdout, first.stdout);
    assert.deepEqual(snapshot(root), before);
  });
});

for (const [label, mutate] of [
  [
    'version',
    (m) => {
      m.artifacts[0].packageVersion = '1.5.0';
    },
  ],
  [
    'binding',
    (m) => {
      m.artifacts[0].binding.appRole = 'postgres';
    },
  ],
  [
    'tenant target',
    (m) => {
      m.artifacts[1].binding.tenantTable.schema = 'tenancy';
    },
  ],
  [
    'entrypoint digest',
    (m) => {
      m.artifacts[0].entrypointSha256 = '0'.repeat(64);
    },
  ],
  [
    'source digest',
    (m) => {
      m.artifacts[1].manifest.sources[0].sha256 = '0'.repeat(64);
    },
  ],
  [
    'duplicate package',
    (m) => {
      m.artifacts.push(structuredClone(m.artifacts[0]));
    },
  ],
  [
    'partial package group',
    (m) => {
      m.artifacts.pop();
    },
  ],
]) {
  test(`A160-07 rejects ${label} before a connection attempt`, () => {
    fixture((root) => {
      editMetadata(root, mutate);
      reject(run(root), 'stynx-storage.json');
    });
  });
}

for (const name of [
  outboxPath,
  offlinePath,
  metadataPath,
  'tools/stynx-version.json',
  'backend/app/package.json',
  'backend/app/node_modules',
]) {
  test(`A160-07 missing ${name} refuses without ambient checkout fallback`, () => {
    fixture((root) => {
      rmSync(path.join(root, name), { recursive: true, force: true });
      reject(run(root, [root], repo), path.basename(name));
    });
  });
}

for (const name of [outboxPath, offlinePath]) {
  test(`A160-07 changed ${name} refuses even with recomputed local file hash`, () => {
    fixture((root) => {
      write(
        root,
        name,
        `${readFileSync(path.join(root, name), 'utf8')}\n-- edited fixture\n`,
      );
      editMetadata(root, (metadata) => {
        metadata.artifacts.find((entry) => entry.target === name).sha256 =
          digest(readFileSync(path.join(root, name)));
      });
      reject(run(root), path.basename(name));
    });
  });
}

test('A160-07 wrong exact pin refuses during admission', () => {
  fixture((root) => {
    write(root, 'tools/stynx-version.json', '{"version":"1.5.0"}\n');
    reject(run(root), 'stynx-version.json');
  });
});

test('A160-07 caller cannot add SQL, binding, force or adoption arguments', () => {
  fixture((root) => {
    for (const argument of [
      '--force',
      '--adopt-existing',
      '--sql=SELECT 1',
      '--owner=postgres',
    ])
      reject(run(root, [root, argument]), 'root');
  });
});

// Source-only prospective canonical composition witnesses. No SDK or SQL evaluated.
test('public composition canonical shell calls runStorageApply and cannot select private R22', () => {
  const source = readFileSync(
    path.join(repo, 'backend/database/apply.sh'),
    'utf8',
  );
  assert.match(source, /tools\/stynx-storage-public-install\.mjs/u);
  assert.match(source, /runStorageApply\(root,\s*\{\s*full:/u);
  assert.doesNotMatch(
    source,
    /runStorageInstall|tools\/stynx-storage-install\.mjs|detran_r22_161_full|DETRAN_R22_STYNX_161_FULL_AUTHORIZED/u,
  );
});
test('public composition actual public module has sole closed export and no active scratch or Mac lease selectors', () => {
  const source = readFileSync(
    path.join(repo, 'tools/stynx-storage-public-install.mjs'),
    'utf8',
  );
  const ts = createRequire(import.meta.url)(
    path.join(
      repo,
      'node_modules/.pnpm/typescript@6.0.3/node_modules/typescript/lib/typescript.js',
    ),
  );
  const ast = ts.createSourceFile(
    'public-install.mjs',
    source,
    ts.ScriptTarget.Latest,
    true,
  );
  const exported = ast.statements.filter(
    (n) =>
      n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ||
      ts.isExportDeclaration(n) ||
      ts.isExportAssignment(n),
  );
  assert.equal(exported.length, 1);
  assert.ok(ts.isFunctionDeclaration(exported[0]));
  assert.equal(exported[0].name.text, 'runStorageApply');
  assert.equal(exported[0].parameters.length, 2);
  assert.doesNotMatch(
    source,
    /scratch\/r22|\/Users\/|\/Volumes\/|DETRAN_R22|STORAGE_RUNNER_ACTIVATION/u,
  );
  assert.match(
    source,
    /tools\/stynx-storage\/public-install-release-admission\.json/u,
  );
});
test('public composition shared artifact comparison uses canonical protected fixture without requiring scratch944', () => {
  const source = readFileSync(
    path.join(repo, 'tools/rls-ddl-coverage.mjs'),
    'utf8',
  );
  assert.doesNotMatch(
    source,
    /scratch\/r22-adoption-161\/package-admission\/projection\/public-storage-projection\.json/u,
  );
  assert.match(source, /tools\/stynx-storage\/fixtures/u);
  assert.match(
    source,
    /944f0041700de5e2c31ebf0e71b7999df999d76cc6645b3bec38ddfc0f692388/u,
  );
});
test('public composition normal old history refuses while authorized full captures real reset before fresh transaction', () => {
  const source = readFileSync(
    path.join(repo, 'tools/stynx-storage-public-install.mjs'),
    'utf8',
  );
  assert.match(source, /detran_local_stack/u);
  assert.match(source, /detran_r7_ctg1_a2/u);
  assert.match(source, /detran_r13/u);
  for (const authorization of [
    'DETRAN_LOCAL_STACK_FULL_AUTHORIZED',
    'DETRAN_PRIORITY_UPGRADE_FULL_AUTHORIZED',
    'DETRAN_R13_FULL_AUTHORIZED',
  ])
    assert.ok(source.includes(authorization));
  assert.match(source, /DROP DATABASE/u);
  assert.match(source, /CREATE DATABASE/u);
  assert.match(source, /databaseOid/u);
  assert.match(source, /fresh-1\.6\.1/u);
  assert.doesNotMatch(source, /spawn\w*\([^\n]*['"]psql/u);
});

// Public candidate01 source/pure regressions: TEST_ONLY ports, no installed SDK/SQL.
const publicSource = () =>
  readFileSync(
    path.join(repo, 'tools/stynx-storage-public-install.mjs'),
    'utf8',
  );
function publicFunction(name) {
  const ts = createRequire(import.meta.url)(
    path.join(
      repo,
      'node_modules/.pnpm/typescript@6.0.3/node_modules/typescript/lib/typescript.js',
    ),
  );
  const s = publicSource();
  const ast = ts.createSourceFile(
    'public-install.mjs',
    s,
    ts.ScriptTarget.Latest,
    true,
  );
  const node = ast.statements.find(
    (n) => ts.isFunctionDeclaration(n) && n.name?.text === name,
  );
  assert.ok(node, 'Actual private source function missing: ' + name);
  return node.getText(ast).replace(/^export\s+/u, '');
}
const purePublicRefusal = (condition, message) => {
  if (!condition)
    throw Object.assign(new Error(message), {
      code: 'STYNX_PUBLIC_INSTALL_REFUSED',
    });
};
test('public candidate01 correction runtime guard precedes first renderer and pg evaluation and rehashes before COMMIT', () => {
  const s = publicFunction('runStorageApply');
  const guard = s.indexOf('installPublicStorageRuntimeGuard(');
  const render = s.indexOf('storagePlan(root)');
  const pg = s.indexOf("('pg')");
  assert.ok(
    guard >= 0 && guard < render && guard < pg,
    'Canonical admitted runtime guard must precede renderer/pg evaluation',
  );
  const commit = s.indexOf('commitAttempted = true');
  assert.ok(commit > 0);
  assert.match(
    s.slice(
      s.lastIndexOf("retained.write('candidate/manifest.json'", commit),
      commit,
    ),
    /rehash\(\)/u,
  );
  assert.match(s, /const rehash = \(\) => \{\s*realm\.rehash\(\);/u);
  assert.match(s, /const realm = installPublicStorageRuntimeGuard\(/u);
  const helper = readFileSync(
    path.join(repo, 'tools/stynx-storage-public-runtime-guard.mjs'),
    'utf8',
  );
  assert.match(helper, /installPublicStorageRuntimeGuard/u);
  assert.doesNotMatch(helper, /scratch\/r22|\/Users\/|\/Volumes\//u);
});
test('public candidate01 correction retains whole actual candidate state and verifier reports before COMMIT manifest', () => {
  const s = publicFunction('runStorageApply');
  const state = s.search(
    /retained\.write\(\s*['"]candidate\/before-commit-state\.json['"],\s*beforeCommit\s*,?\s*\)/u,
  );
  const manifest = s.indexOf("retained.write('candidate/manifest.json'");
  const commit = s.indexOf('commitAttempted = true');
  assert.ok(
    state >= 0 && state < manifest && manifest < commit,
    'Durable actual whole state must enter candidate manifest before write COMMIT',
  );
  assert.match(
    s.slice(0, manifest),
    /verify\(\s*target,\s*root,\s*plan,\s*retained,\s*['"]candidate['"]\s*,?\s*\)/u,
  );
  assert.match(
    s.slice(manifest, commit),
    /files:\s*\[\.\.\.retained\.files\]/u,
  );
  assert.match(s.slice(manifest, commit), /beforeCommit: beforeCommitRef/u);
  assert.match(
    s.slice(manifest, commit),
    /candidateVerifiers: candidateVerifierRef/u,
  );
});
test('public candidate01 correction refuses unsafe existing writer even when actual equals unchanged entry', () => {
  const { isDeepStrictEqual } = createRequire(import.meta.url)('node:util');
  const safe = (name, oid, inherit) => ({
    oid,
    rolname: name,
    rolsuper: false,
    rolinherit: inherit,
    rolcreaterole: false,
    rolcreatedb: false,
    rolcanlogin: false,
    rolreplication: false,
    rolbypassrls: false,
    rolconnlimit: -1,
    rolvaliduntil: null,
  });
  const graph = {
    roles: [
      safe('role_app_backend', '40000', false),
      safe('role_auditor_min', '40001', false),
      safe('role_rait_priority_writer', '40002', true),
    ],
    memberships: [],
    settings: [],
    reachability: [],
  };
  const source = publicSource();
  const maybeWriter = source.includes('function validateWriterRole(')
    ? publicFunction('validateWriterRole')
    : '';
  const validate = new Function(
    'isDeepStrictEqual',
    'requireFact',
    maybeWriter + '\nreturn (' + publicFunction('validateRoleChanges') + ');',
  )(isDeepStrictEqual, purePublicRefusal);
  assert.doesNotThrow(() => validate(graph, structuredClone(graph)));
  const accepted = [];
  for (const [field, value] of [
    ['rolcanlogin', true],
    ['rolsuper', true],
    ['rolbypassrls', true],
    ['rolcreaterole', true],
    ['rolcreatedb', true],
    ['rolreplication', true],
    ['rolinherit', false],
    ['rolconnlimit', 0],
    ['rolvaliduntil', '2030-01-01'],
  ]) {
    const drift = structuredClone(graph);
    drift.roles[2][field] = value;
    try {
      validate(drift, structuredClone(drift));
      accepted.push(field);
    } catch (error) {
      assert.equal(error.code, 'STYNX_PUBLIC_INSTALL_REFUSED');
    }
  }
  assert.deepEqual(
    accepted,
    [],
    'Equal entry does not authorize unsafe writer flags',
  );
});
test('public candidate01 correction checks irreversible signal after awaited close or foreign query before ordinary connect and full DROP', () => {
  const s = publicFunction('runStorageApply');
  const readOnly = s.slice(
    s.indexOf('const readOnly ='),
    s.indexOf('\n  try {', s.indexOf('const readOnly =')),
  );
  assert.match(
    readOnly,
    /await closeTarget\(\);\s*if\s*\(!recovery\)\s*checkSignal\(\);[\s\S]*?await target\.connect\(\)/u,
  );
  assert.match(
    s,
    /'Full reset refuses active foreign target clients',[\s\S]*?\);\s*checkSignal\(\);\s*target = new Client\(settings\);/u,
  );
  assert.match(
    s,
    /'Foreign client appeared before DROP',[\s\S]*?\);\s*checkSignal\(\);\s*destructiveAttempted = true;/u,
  );
  assert.match(
    s,
    /checkSignal\(\);\s*const create = await maintenance\.query\(/u,
  );
  assert.match(s, /const recovery = await readOnly\(true\)/u);
  assert.match(s, /if \(interrupted\)[\s\S]*?'postcommit-stop'/u);
});
test('public candidate01 correction durably retains actual failing public report before typed acceptance refusal', async () => {
  const report = {
    supported: false,
    checks: [{ name: 'TEST_ONLY actual port refusal', status: 'fail' }],
  };
  const events = [];
  const api = {
    verifyOutboxStorage: async () => {
      events.push('verify');
      return report;
    },
  };
  const verify = new Function(
    'createRequire',
    'path',
    'fixedBinding',
    'requireFact',
    'return (' + publicFunction('verify') + ');',
  )(() => () => api, path, binding, purePublicRefusal);
  const retained = {
    write(name, value) {
      events.push({ name, value });
      return { path: name, sha256: 'sha256:' + '0'.repeat(64) };
    },
  };
  await assert.rejects(
    verify(
      {},
      repo,
      {
        packages: [
          { schema: 'outbox', metadata: { package: '@stynx-nyx/outbox' } },
        ],
      },
      retained,
      'candidate',
    ),
    { code: 'STYNX_PUBLIC_INSTALL_REFUSED' },
  );
  assert.deepEqual(events, [
    'verify',
    {
      name: 'reports/candidate-outbox-verifier.json',
      value: { phase: 'candidate', report },
    },
  ]);
});
test('public candidate01 correction symbol option key gives typed refusal without accessor or string coercion', () => {
  const { isDeepStrictEqual } = createRequire(import.meta.url)('node:util');
  const closed = new Function(
    'isDeepStrictEqual',
    'requireFact',
    'return (' + publicFunction('closed') + ');',
  )(isDeepStrictEqual, purePublicRefusal);
  const value = { full: false, [Symbol('TEST_ONLY extra')]: true };
  assert.throws(() => closed(value, ['full']), {
    code: 'STYNX_PUBLIC_INSTALL_REFUSED',
  });
});

function builtinOnlyPublicProbe(program, extraEnv = {}) {
  const code = `import {registerHooks,isBuiltin} from 'node:module';
    registerHooks({resolve(specifier,context,next){if(!isBuiltin(specifier)&&!specifier.startsWith('file:')&&!specifier.startsWith('.')&&!specifier.startsWith('/'))throw Error('TEST_ONLY_SDK_EVALUATION_REFUSED:'+specifier);return next(specifier,context);},load(url,context,next){if(url.includes('/node_modules/'))throw Error('TEST_ONLY_SDK_EVALUATION_REFUSED:'+url);return next(url,context);}});
    ${program}`;
  return spawnSync(process.execPath, ['--input-type=module', '--eval', code], {
    cwd: repo,
    env: {
      PATH: '/usr/bin:/bin',
      DB_HOST: '127.0.0.1',
      DB_PORT: '1',
      DB_NAME: 'TEST_ONLY_public_no_connection',
      DB_USER: 'postgres',
      ...extraEnv,
    },
    encoding: 'utf8',
    timeout: 15000,
  });
}
test('public pure closed 73 file plan keeps 11 preflight comparisons and exact late order without SDK', () => {
  const result = builtinOnlyPublicProbe(`
    import assert from 'node:assert/strict';
    import {readFileSync} from 'node:fs';
    import {createHash} from 'node:crypto';
    const {createStorageDdlPlan}=await import('./tools/stynx-storage-ddl-plan.mjs');
    for(const full of [false,true]){
      const p=createStorageDdlPlan(process.cwd(),full);
      assert.equal(p.files.size,73);assert.equal(p.steps.length,71);
      assert.equal(p.preflight.split("Canonical legacy catalog differs:").length-1,11);
      assert.deepEqual(p.steps.slice(-6).map(x=>x.name),['20-rls-policies.sql','21-ops-provisioning.sql','19-rait-priority-enforce.sql','19-rait-priority-verify.sql','06-storage-signed-documents.sql','31-inf-signature-policy-guards.sql']);
      assert.equal(p.steps.filter(x=>x.kind==='storage').length,1);
      for(const [name,record]of p.files){const bytes=readFileSync('backend/database/ddl/'+name);assert.equal(record.sql,bytes.toString('utf8'));assert.equal(record.sha256,createHash('sha256').update(bytes).digest('hex'));}
    }
    console.log('TEST_ONLY_PURE73_NO_SDK_SQL');`);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /TEST_ONLY_PURE73_NO_SDK_SQL/u);
});
test('public pure parser preserves exact old schema and canonical result for NOT_ADMISSION forward DTO and precision refusals', () => {
  const result = builtinOnlyPublicProbe(`
    import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
    const old=await import('./tools/stynx-storage-forward.mjs');const actual=await import('./tools/stynx-storage-public-custody.mjs');
    const a=readFileSync('tools/stynx-storage-forward.mjs','utf8'),b=readFileSync('tools/stynx-storage-public-custody.mjs','utf8');
    const slice=s=>s.slice(s.indexOf('function unicode('),s.indexOf('export function parseStorageCustodyDocument('));assert.equal(slice(a),slice(b));
    const ref={path:'TEST_ONLY/NOT_ADMISSION.json',sha256:'sha256:'+'0'.repeat(64)};
    const binding={ownerRole:'postgres',appRole:'role_app_backend',readerRole:null,tenantTable:{schema:'auth',table:'tenants',column:'id'}};
    const publication={version:'1.6.1',commit:'3e3da1f7ceb6dd4a7dd2f9d6e0dc704437e262a0',tree:'e2ce9989249d1bc13403dc21f5a421b24178ef29',workflowRun:'38445937806'};
    const doc={formatVersion:'detran-stynx-offline-forward-receipt/1',kind:'forward-migration-executed',subject:{databaseName:'TEST_ONLY_NOT_ADMISSION',databaseOid:'12345',clusterSystemIdentifier:'1234567890',owner:'postgres'},package:'@stynx-nyx/offline-sync',baselineId:ref.sha256,targetPackageVersion:'1.6.1',targetPublicationDigest:actual.recordDigest(publication),binding,bindingDigest:actual.recordDigest(binding),ordinal:9,source:{path:'packages/offline-sync/migrations/0009_numbering_reconciliations.sql',sha256:'7167a3d32e5048c56b453bb6cc5868a5c1c67f2aeab721a2832f13e4af1ca1fd'},boundSqlSha256:'e03be4b98bff78e229104958f1b483473794ea7007c722488911075694585de7',predecessor:{kind:'baseline',baselineId:ref.sha256,coveredPrefixLength:8},execution:{by:'postgres',atUtc:'2026-10-14T12:00:00.123456Z'},evidence:{priorStateRecordDigest:ref.sha256,executionPlanDigest:ref.sha256,reviewedCandidateDigest:ref.sha256,boundSqlArtifact:ref}};
    doc.recordSha256=actual.recordDigest(doc);const text=JSON.stringify(doc);assert.deepEqual(actual.parseStorageCustodyDocument(text,'forward'),old.parseStorageCustodyDocument(text,'forward'));
    for(const text of ['{}','{"ordinal":9,"ordinal":9}',JSON.stringify(doc).replace('"ordinal":9','"ordinal":9.0000000000000001'),'"\\\\ud800"'])for(const p of[old,actual])assert.throws(()=>p.parseStorageCustodyDocument(text,'forward'),{code:'R22_STORAGE_CUSTODY_INVALID'});
    console.log('TEST_ONLY_PARSER_EQUIVALENCE_NOT_ADMISSION');`);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /TEST_ONLY_PARSER_EQUIVALENCE_NOT_ADMISSION/u);
});
test('public pure hostile loader refuses before any SDK or SQL and unknown full authorization stays closed', () => {
  const result = builtinOnlyPublicProbe(`
    import assert from 'node:assert/strict';const{runStorageApply}=await import('./tools/stynx-storage-public-install.mjs');
    await assert.rejects(runStorageApply(process.cwd(),{full:false}),{code:'STYNX_PUBLIC_INSTALL_REFUSED'});
    await assert.rejects(runStorageApply(process.cwd(),{full:true}),{code:'STYNX_PUBLIC_INSTALL_REFUSED'});
    await assert.rejects(runStorageApply(process.cwd(),{full:false,sql:'TEST_ONLY SELECT 1'}),{code:'STYNX_PUBLIC_INSTALL_REFUSED'});
    console.log('TEST_ONLY_HOSTILE_LOADER_NO_SDK_SQL');`);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /TEST_ONLY_HOSTILE_LOADER_NO_SDK_SQL/u);
});

// Preserve the original unavailable-release gate as an explicit TEST_ONLY
// consumer-main fixture. Exact old47b9 bytes, no SDK transformation/admission.
test('public pure null release refuses before any SDK or SQL and unknown full authorization stays closed', () => {
  const result = builtinOnlyPublicProbe(`
    import assert from 'node:assert/strict';
    import {readFileSync} from 'node:fs';
    import {createHash} from 'node:crypto';
    import {registerHooks as registerFixtureHooks} from 'node:module';
    import {pathToFileURL} from 'node:url';
    import path from 'node:path';
    const fixture=readFileSync('tools/stynx-storage/consumer-fixtures/public-installer-reviews/public-main-null-release-47b9.test-only.mjs.raw');
    assert.equal(createHash('sha256').update(fixture).digest('hex'),'47b937958c3120125995290283518e54d7ad7ac3eb666d4bf73e8a546353246a');
    const main=pathToFileURL(path.resolve('tools/stynx-storage-public-install.mjs')).href;
    registerFixtureHooks({load(url,context,next){if(url===main)return{source:fixture,format:'module',shortCircuit:true};return next(url,context);}});
    const{runStorageApply}=await import('./tools/stynx-storage-public-install.mjs');
    await assert.rejects(runStorageApply(process.cwd(),{full:false}),{code:'STYNX_PUBLIC_INSTALL_RELEASE_UNAVAILABLE'});
    await assert.rejects(runStorageApply(process.cwd(),{full:true}),{code:'STYNX_PUBLIC_INSTALL_REFUSED'});
    await assert.rejects(runStorageApply(process.cwd(),{full:false,sql:'TEST_ONLY SELECT 1'}),{code:'STYNX_PUBLIC_INSTALL_REFUSED'});
    console.log('TEST_ONLY_NULL_RELEASE_NO_SDK_SQL');`);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /TEST_ONLY_NULL_RELEASE_NO_SDK_SQL/u);
});
