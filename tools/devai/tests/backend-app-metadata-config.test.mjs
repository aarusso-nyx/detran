import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  constants,
  accessSync,
  existsSync,
  lstatSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  watch,
  writeFileSync,
  mkdirSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import net from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = realpathSync(fileURLToPath(new URL('../../../', import.meta.url)));
const app = path.join(root, 'backend/app');
const requireRoot = createRequire(path.join(root, 'package.json'));
const requireApp = createRequire(path.join(app, 'package.json'));
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
const ts = requireRoot('typescript');
requireApp('reflect-metadata');
const { Test } = requireApp('@nestjs/testing');
const { Reflector } = requireApp('@nestjs/core');
const supplied = process.env.DETRAN_APP_METADATA_TEST_OUTPUT;
if (supplied) assert.ok(path.isAbsolute(supplied));
const capture =
  supplied ?? mkdtempSync(path.join(tmpdir(), 'detran-appbase-metadata-'));
mkdirSync(capture, { recursive: true });
const output = realpathSync(capture);
assert.ok(
  path.relative(root, output).startsWith(`..${path.sep}`),
  'Diagnostic output must be external',
);
const expectedAliases = {
  '@detran/shared': '../domains/shared/src/index.ts',
  '@detran/ch-billing': '../domains/ch/billing/src/index.ts',
  '@detran/ch-biometrics': '../domains/ch/biometrics/src/index.ts',
  '@detran/ch-clinical-controls':
    '../domains/ch/clinical-controls/src/index.ts',
  '@detran/ch-clinical-network': '../domains/ch/clinical-network/src/index.ts',
  '@detran/ch-clinical-reports': '../domains/ch/clinical-reports/src/index.ts',
  '@detran/ch-encounters': '../domains/ch/encounters/src/index.ts',
  '@detran/ch-exams': '../domains/ch/exams/src/index.ts',
  '@detran/ch-inconsistencies': '../domains/ch/inconsistencies/src/index.ts',
  '@detran/ch-juntas': '../domains/ch/juntas/src/index.ts',
  '@detran/ch-operational-controls':
    '../domains/ch/operational-controls/src/index.ts',
  '@detran/ch-patients': '../domains/ch/patients/src/index.ts',
  '@detran/ch-process-blocks': '../domains/ch/process-blocks/src/index.ts',
  '@detran/ch-restrictions': '../domains/ch/restrictions/src/index.ts',
  '@detran/ch-retention': '../domains/ch/retention/src/index.ts',
  '@detran/ch-scheduling': '../domains/ch/scheduling/src/index.ts',
  '@detran/ch-telehealth': '../domains/ch/telehealth/src/index.ts',
  '@detran/ch-toxicology': '../domains/ch/toxicology/src/index.ts',
  '@detran/dashboard-crashes': '../domains/dashboard/crashes/src/index.ts',
  '@detran/dashboard-monitor': '../domains/dashboard/monitor/src/index.ts',
  '@detran/inf-ait': '../domains/inf/ait/src/index.ts',
  '@detran/inf-deadlines': '../domains/inf/deadlines/src/index.ts',
  '@detran/inf-normative': '../domains/inf/normative/src/index.ts',
  '@detran/inf-measures': '../domains/inf/measures/src/index.ts',
  '@detran/inf-alcohol': '../domains/inf/alcohol/src/index.ts',
  '@detran/inf-infraction': '../domains/inf/infraction/src/index.ts',
  '@detran/inf-notification': '../domains/inf/notification/src/index.ts',
  '@detran/inf-rait-case': '../domains/inf/rait-case/src/index.ts',
  '@detran/inf-rait-worklist': '../domains/inf/rait-worklist/src/index.ts',
  '@detran/inf-rait-session': '../domains/inf/rait-session/src/index.ts',
  '@detran/inf-rait-org': '../domains/inf/rait-org/src/index.ts',
  '@detran/inf-collection': '../domains/inf/collection/src/index.ts',
  '@detran/inf-rait-integration':
    '../domains/inf/rait-integration/src/index.ts',
  '@detran/inf-speed': '../domains/inf/speed/src/index.ts',
  '@detran/est-crash': '../domains/est/crash/src/index.ts',
  '@detran/senatran-adapter': '../../packages/senatran-adapter/src/index.ts',
  '@detran/sefaz-adapter': '../../packages/sefaz-adapter/src/index.ts',
  '@detran/portal-complaints': '../domains/portal/complaints/src/index.ts',
  '@detran/portal-identity': '../domains/portal/identity/src/index.ts',
  '@detran/portal-requests': '../domains/portal/requests/src/index.ts',
  '@detran/integration-renaest-mirror':
    '../domains/integration/renaest-mirror/src/index.ts',
  '@detran/portal-inbox': '../domains/portal/inbox/src/index.ts',
  '@detran/portal-citizen-service':
    '../domains/portal/citizen-service/src/index.ts',
  '@detran/portal-projections': '../domains/portal/projections/src/index.ts',
  '@detran/ops-agency': '../domains/ops/agency/src/index.ts',
  '@detran/ops-core': '../domains/ops/core/src/index.ts',
  '@detran/ops-field': '../domains/ops/field/src/index.ts',
  '@detran/ops-snapshots': '../domains/ops/snapshots/src/index.ts',
  '@detran/ops-evidence': '../domains/ops/evidence/src/index.ts',
  '@detran/ops-offline-sync': '../domains/ops/offline-sync/src/index.ts',
  '@detran/ops-parameter': '../domains/ops/parameter/src/index.ts',
  '@detran/ops-provisioning': '../domains/ops/provisioning/src/index.ts',
};

function runGit(argv) {
  const result = spawnSync('git', argv, { cwd: root });
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
function internalDirectory(directory, allowMissingLast = false) {
  const rel = path.relative(root, directory);
  assert.ok(rel && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel));
  let current = root;
  const parts = rel.split(path.sep);
  for (let i = 0; i < parts.length; i++) {
    current = path.join(current, parts[i]);
    let stat;
    try {
      stat = lstatSync(current);
    } catch (error) {
      if (error.code === 'ENOENT' && allowMissingLast && i === parts.length - 1)
        return;
      throw error;
    }
    assert.ok(
      stat.isDirectory() && !stat.isSymbolicLink(),
      `Regular internal directory required: ${current}`,
    );
  }
}
function nearestNodeModules(file) {
  let directory = path.dirname(file);
  for (;;) {
    const candidate = path.join(directory, 'node_modules');
    if (existsSync(candidate)) return candidate;
    assert.notEqual(
      directory,
      root,
      'No nearest node_modules outside worktree is admitted',
    );
    directory = path.dirname(directory);
  }
}
function cacheSnapshot(directory) {
  try {
    lstatSync(directory);
  } catch (error) {
    if (error.code === 'ENOENT') return { exists: false, entries: {} };
    throw error;
  }
  internalDirectory(directory);
  return {
    exists: true,
    entries: Object.fromEntries(
      readdirSync(directory)
        .sort()
        .map((name) => {
          const file = path.join(directory, name);
          let stat;
          try {
            stat = lstatSync(file);
          } catch (error) {
            assert.equal(error.code, 'ENOENT');
            return [
              name,
              { observation: 'unavailable-after-automatic-cleanup' },
            ];
          }
          const value = {
            mode: stat.mode & 0o7777,
            size: stat.size,
            kind: stat.isFile()
              ? 'file'
              : stat.isDirectory()
                ? 'directory'
                : stat.isSymbolicLink()
                  ? 'symlink'
                  : 'other',
          };
          if (stat.isSymbolicLink()) value.target = readFileSyncLink(file);
          if (stat.isFile()) {
            try {
              value.sha256 = sha(readFileSync(file));
            } catch (error) {
              assert.equal(error.code, 'ENOENT');
              value.observation = 'unavailable-after-automatic-cleanup';
            }
          }
          return [name, value];
        }),
    ),
  };
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function settleCache(directory, before, basename, bundled) {
  const observations = [];
  const expected = new RegExp(
    `^${basename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.timestamp-\\d+-[a-f0-9]+\\.mjs$`,
  );
  const deadline = Date.now() + 2000;
  for (;;) {
    const after = cacheSnapshot(directory);
    observations.push({
      observedAt: new Date().toISOString(),
      snapshot: after,
    });
    for (const [name, value] of Object.entries(before.entries))
      assert.deepEqual(
        after.entries[name],
        value,
        `Preexisting cache entry changed: ${name}`,
      );
    const added = Object.keys(after.entries).filter(
      (name) => !Object.hasOwn(before.entries, name),
    );
    for (const name of added)
      assert.ok(
        bundled && expected.test(name),
        `Unattributable cache entry: ${name}`,
      );
    if (added.length === 0)
      return {
        observations,
        transientByteCapture:
          'Before/after and settle observations only; bytes already automatically unlinked remain unavailable and no filename or hash is invented.',
      };
    assert.ok(
      Date.now() < deadline,
      'Expected cache file remained after the 2s automatic-unlink settle budget; no manual cleanup',
    );
    await sleep(Math.min(20, deadline - Date.now()));
  }
}
function controls(server, kind) {
  assert.equal(server.config.root, app);
  const actual = Object.fromEntries(
    server.config.resolve.alias
      .filter(
        (x) => typeof x.find === 'string' && x.find.startsWith('@detran/'),
      )
      .map((x) => [x.find, x.replacement]),
  );
  assert.deepEqual(
    actual,
    Object.fromEntries(
      Object.entries(expectedAliases).map(([name, relative]) => [
        name,
        fileURLToPath(
          new URL(relative, pathToFileURL(path.join(app, 'vitest.config.ts'))),
        ),
      ]),
    ),
  );
  const tier = process.env.DETRAN_TEST_TIER ?? 'unit';
  const tiers = {
    unit: ['src/**/*.spec.ts'],
    integration: ['tests/integration/**/*.integration.spec.ts'],
    e2e: ['tests/e2e/**/*.e2e.spec.ts'],
    real: ['tests/real/**/*.real.spec.ts'],
    'in-house': ['tests/in-house/**/*.in-house.spec.ts'],
  };
  assert.ok(Object.hasOwn(tiers, tier));
  assert.deepEqual(
    server.config.test.include,
    kind === 'performance'
      ? ['tests/performance/**/*.perf.spec.ts']
      : tiers[tier],
  );
  assert.equal(server.config.test.passWithNoTests, kind !== 'performance');
  assert.equal(
    server.config.test.testTimeout,
    kind === 'performance'
      ? 120000
      : tier === 'unit'
        ? 10000
        : tier === 'real'
          ? 180000
          : tier === 'in-house'
            ? 120000
            : 30000,
  );
  assert.equal(server.config.test.environment, 'node');
  assert.equal(server.config.test.globals, true);
  assert.equal(server.config.test.fileParallelism, false);
}
let declarationProof;
function strictDeclarationIdentity() {
  const declaration = path.join(
    root,
    'tools/security/invariants/nest-metadata-transform.d.mts',
  );
  const key = sha(readFileSync(declaration));
  if (declarationProof?.sha256 === key) return declarationProof;
  const config = ts.readConfigFile(
    path.join(app, 'tsconfig.json'),
    ts.sys.readFile,
  );
  assert.equal(config.error, undefined);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, app);
  assert.equal(parsed.errors.length, 0);
  assert.equal(parsed.options.strict, true);
  assert.equal(parsed.options.module, ts.ModuleKind.NodeNext);
  assert.equal(
    parsed.options.moduleResolution,
    ts.ModuleResolutionKind.NodeNext,
  );
  const roots = [
    path.join(app, 'vitest.config.ts'),
    path.join(app, 'vitest.performance.config.ts'),
    declaration,
  ];
  const program = ts.createProgram(roots, { ...parsed.options, noEmit: true });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.deepEqual(
    diagnostics.map((x) => ({
      code: x.code,
      text: ts.flattenDiagnosticMessageText(x.messageText, ' '),
    })),
    [],
  );
  const sf = program.getSourceFile(declaration);
  assert.ok(sf);
  const checker = program.getTypeChecker();
  const factory = sf.statements.find(
    (x) =>
      ts.isFunctionDeclaration(x) &&
      x.name?.text === 'createNestMetadataPlugin',
  );
  assert.ok(factory?.type && ts.isTypeReferenceNode(factory.type));
  const signature = checker.getSignatureFromDeclaration(factory);
  assert.ok(signature);
  const returned = checker.getReturnTypeOfSignature(signature);
  assert.equal(
    returned.flags & ts.TypeFlags.Any,
    0,
    'Factory return must not silently become any',
  );
  let symbol = checker.getSymbolAtLocation(factory.type.typeName);
  assert.ok(symbol);
  if (symbol.flags & ts.SymbolFlags.Alias)
    symbol = checker.getAliasedSymbol(symbol);
  assert.equal(symbol.name, 'Plugin');
  const declarations = symbol.declarations ?? [];
  assert.ok(declarations.length > 0);
  const paths = declarations.map((x) =>
    realpathSync(x.getSourceFile().fileName),
  );
  const viteDeclaration = realpathSync(
    path.join(path.dirname(viteManifest), 'dist/node/index.d.ts'),
  );
  const vitestAugmentation = realpathSync(
    path.join(path.dirname(vitestManifest), 'dist/config.d.ts'),
  );
  // Vitest augments Vite's Plugin with configureVitest. Both declarations
  // must belong to these exact physical peer packages, with no third origin.
  assert.deepEqual(
    [...new Set(paths)].sort(),
    [viteDeclaration, vitestAugmentation].sort(),
  );
  const viteSource = program
    .getSourceFiles()
    .find((file) => realpathSync(file.fileName) === viteDeclaration);
  assert.ok(viteSource);
  const viteModule = checker.getSymbolAtLocation(viteSource);
  assert.ok(viteModule);
  assert.equal(
    checker
      .getExportsOfModule(viteModule)
      .find((item) => item.name === 'Plugin'),
    symbol,
    'Factory Plugin must be the exact export of physical Vitest-peer Vite7',
  );
  assert.deepEqual(manifestIdentityAppVite(), origins.vite);
  declarationProof = {
    sha256: key,
    returnType: checker.typeToString(returned),
    returnIsAny: false,
    PluginDeclarationPaths: paths,
    vite: origins.vite,
    compiler: origins.typescript,
    canonicalStrictNodeNext: true,
    focusedAppbaseAndPerformanceDiagnostics: 0,
    skipLibCheckIsNotTheProof: true,
  };
  return declarationProof;
}
function manifestIdentityAppVite() {
  return identity(realpathSync(requireApp.resolve('vite/package.json')));
}

function observeCompilationStages(server, tracked) {
  const records = [];
  for (const name of ['detran-ordinary-nest-metadata', 'vite:esbuild']) {
    const plugin = server.config.plugins.find((item) => item.name === name);
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

const canonicalControllerSpecs = [
  {
    name: 'RaitWorklistCommandsController',
    file: 'backend/domains/inf/rait-worklist/src/handwritten/rait-worklist-commands.controller.ts',
    service: 'RaitWorklistCommandService',
    serviceFile:
      'backend/domains/inf/rait-worklist/src/handwritten/rait-worklist-command.service.ts',
    field: 'service',
    negativeCrud: false,
  },
  {
    name: 'RaitSessionCommandsController',
    file: 'backend/domains/inf/rait-session/src/handwritten/rait-session-commands.controller.ts',
    service: 'RaitSessionCommandService',
    serviceFile:
      'backend/domains/inf/rait-session/src/handwritten/rait-session-command.service.ts',
    field: 'service',
    negativeCrud: false,
  },
  {
    name: 'DashboardStreamController',
    file: 'backend/app/src/dashboard-stream.controller.ts',
    service: null,
    serviceFile: null,
    field: null,
    negativeCrud: false,
  },
  {
    name: 'RaitCaseScopedReadsController',
    file: 'backend/domains/inf/rait-case/src/handwritten/rait-case-scoped-reads.controller.ts',
    service: 'RaitCaseScopeService',
    serviceFile:
      'backend/domains/inf/rait-case/src/handwritten/rait-case-scope.service.ts',
    field: 'scope',
    negativeCrud: false,
  },
  {
    name: 'RaitCaseCommandsController',
    file: 'backend/domains/inf/rait-case/src/handwritten/rait-case-commands.controller.ts',
    service: 'RaitCaseCommandService',
    serviceFile:
      'backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts',
    field: 'service',
    negativeCrud: false,
  },
  {
    name: 'RaitInquiryCommandsController',
    file: 'backend/domains/inf/rait-case/src/handwritten/rait-inquiry-commands.controller.ts',
    service: 'RaitInquiryCommandService',
    serviceFile:
      'backend/domains/inf/rait-case/src/handwritten/rait-inquiry-command.service.ts',
    field: 'service',
    negativeCrud: false,
  },
  {
    name: 'RaitAdmissibilityCommandsController',
    file: 'backend/domains/inf/rait-case/src/handwritten/rait-admissibility-commands.controller.ts',
    service: 'RaitAdmissibilityCommandService',
    serviceFile:
      'backend/domains/inf/rait-case/src/handwritten/rait-admissibility-command.service.ts',
    field: 'service',
    negativeCrud: false,
  },
  {
    name: 'RaitWorklistScopedReadsController',
    file: 'backend/domains/inf/rait-worklist/src/handwritten/rait-worklist-scoped-reads.controller.ts',
    service: 'RaitCaseScopeService',
    serviceFile:
      'backend/domains/inf/rait-case/src/handwritten/rait-case-scope.service.ts',
    field: 'scope',
    negativeCrud: false,
  },
  {
    name: 'RaitVoteController',
    file: 'backend/domains/inf/rait-session/src/controllers/rait-vote.controller.ts',
    service: 'RaitVoteService',
    serviceFile:
      'backend/domains/inf/rait-session/src/services/rait-vote.service.ts',
    field: 'service',
    negativeCrud: true,
  },
  {
    name: 'RaitMinutesController',
    file: 'backend/domains/inf/rait-session/src/controllers/rait-minutes.controller.ts',
    service: 'RaitMinutesService',
    serviceFile:
      'backend/domains/inf/rait-session/src/services/rait-minutes.service.ts',
    field: 'service',
    negativeCrud: true,
  },
];

function actualCanonicalNameConsumers() {
  function source(relative) {
    const text = readFileSync(path.join(root, relative), 'utf8');
    return ts.createSourceFile(relative, text, ts.ScriptTarget.Latest, true);
  }
  function exactlyOne(sf, predicate) {
    const matches = [];
    function walk(node) {
      if (predicate(node)) matches.push(node);
      ts.forEachChild(node, walk);
    }
    walk(sf);
    assert.equal(matches.length, 1, 'Canonical consumer must be unambiguous');
    return matches[0].getText(sf);
  }
  const dashboard = source(
    'backend/app/tests/e2e/dashboard-policy.e2e.spec.ts',
  );
  const collectorSource = exactlyOne(
    dashboard,
    (node) =>
      ts.isFunctionDeclaration(node) &&
      node.name?.text === 'collectMountedRoutes',
  );
  const session = source(
    'backend/app/tests/e2e/rait-session-deliberation-minutes-production.e2e.spec.ts',
  );
  const negativeDeclaration = exactlyOne(
    session,
    (node) =>
      ts.isVariableDeclaration(node) &&
      node.name.getText(session) === 'CRUD_CONTROLLERS',
  );
  const negativePredicate = exactlyOne(
    session,
    (node) =>
      ts.isArrowFunction(node) &&
      ts.isBinaryExpression(node.body) &&
      node.getText(session).includes('CRUD_CONTROLLERS.has(route.controller)'),
  );
  const compile = (text) =>
    ts.transpileModule(text, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2023,
        module: ts.ModuleKind.ESNext,
      },
    }).outputText;
  const collect = new Function(
    'Reflect',
    compile(collectorSource) + ';return collectMountedRoutes;',
  )(Reflect);
  const forbiddenControllers = new Function(
    compile('const ' + negativeDeclaration + ';') + ';return CRUD_CONTROLLERS;',
  )();
  const { RequestMethod } = requireApp('@nestjs/common');
  const rejectPost = new Function(
    'RequestMethod',
    'CRUD_CONTROLLERS',
    compile('const predicate = (' + negativePredicate + ');') +
      ';return predicate;',
  )(RequestMethod, forbiddenControllers);
  return {
    collect,
    rejectPost,
    forbiddenControllers,
    sourceHashes: {
      dashboardCollector: sha(collectorSource),
      negativeDeclaration: sha(negativeDeclaration),
      negativePredicate: sha(negativePredicate),
    },
  };
}

for (const [kind, filename] of [
  ['appbase', 'vitest.config.ts'],
  ['performance', 'vitest.performance.config.ts'],
]) {
  for (const loader of ['default-bundle', 'runner']) {
    test(`actual ${kind} ${loader} preserves controls and final Nest metadata/injected tokens without listeners`, async (t) => {
      const label = `${kind}-${loader}`;
      const configFile = path.join(app, filename);
      const caseDir = path.join(output, label);
      mkdirSync(caseDir, { recursive: true });
      assert.equal(origins.vitest.version, '4.1.11');
      assert.equal(origins.vite.version, '7.3.6');
      assert.equal(origins.typescript.version, '6.0.3');
      assert.deepEqual(manifestIdentityAppVite(), origins.vite);
      const sourceBefore = sourceSnapshot();
      writeFileSync(
        path.join(caseDir, 'source-before.json'),
        JSON.stringify(sourceBefore, null, 2) + '\n',
      );

      const modules = nearestNodeModules(configFile);
      assert.equal(modules, path.join(app, 'node_modules'));
      internalDirectory(modules);
      accessSync(modules, constants.W_OK);
      const bundleCache = path.join(modules, '.vite-temp');
      internalDirectory(bundleCache, true);
      const ignored = spawnSync(
        'git',
        ['check-ignore', '--no-index', '--', path.relative(root, bundleCache)],
        { cwd: root },
      );
      assert.equal(
        ignored.status,
        0,
        'Default bundler cache must already be ignored',
      );
      const cacheBefore = cacheSnapshot(bundleCache);
      writeFileSync(
        path.join(caseDir, 'cache-before.json'),
        JSON.stringify(cacheBefore, null, 2) + '\n',
      );
      const adjacentEvents = [];
      const sourceWatcher = watch(app, (_event, name) => {
        if (name?.toString().startsWith(`${filename}.timestamp-`))
          adjacentEvents.push(name.toString());
      });
      const cache = realpathSync(
        mkdtempSync(path.join(output, `${label}-transform-cache-`)),
      );
      const originalListen = net.Server.prototype.listen;
      let listenAttempts = 0;
      let server;
      let dashboardModule;
      let guardModule;
      let namedControllerModule;
      let primary;
      const observation = {
        label,
        loaderOverrideOmitted: loader === 'default-bundle',
        origins,
        expectedCache: bundleCache,
        cacheBefore,
        sourceAdjacentEvents: adjacentEvents,
      };
      net.Server.prototype.listen = function () {
        listenAttempts++;
        throw new Error('APPBASE_UNIT_NET_LISTEN_REFUSED');
      };
      try {
        const options = {
          root: app,
          configFile,
          cacheDir: cache,
          server: { middlewareMode: true, watch: null, ws: false },
          appType: 'custom',
        };
        if (loader === 'runner') options.configLoader = 'runner';
        server = await createServer(options);
        controls(server, kind);
        observation.controlChecks = 'PASS';
        const controllerTargets = canonicalControllerSpecs.map((item) =>
          path.join(root, item.file),
        );
        const normalSource = path.join(app, 'src/dashboard-stream.service.ts');
        const stages = observeCompilationStages(server, [
          ...controllerTargets,
          normalSource,
        ]);
        observation.compilationStages = stages;

        observation.pluginOrder = server.config.plugins.map((x) => x.name);
        const { DashboardStreamService } = await server.ssrLoadModule(
          path.join(app, 'src/dashboard-stream.service.ts'),
        );
        const { Database } = requireApp('@stynx-nyx/data');
        const { RequestContext } = requireApp('@stynx-nyx/core');
        const { OpsParameterService } = await server.ssrLoadModule(
          '@detran/ops-parameter',
        );
        const { DASHBOARD_CLOCK } = await server.ssrLoadModule(
          '@detran/dashboard-monitor',
        );
        const { DetranPolicyGuard } = await server.ssrLoadModule(
          path.join(root, 'backend/domains/shared/src/policy.guard.ts'),
        );
        const dashboardMetadata = Reflect.getMetadata(
          'design:paramtypes',
          DashboardStreamService,
        );
        const guardMetadata = Reflect.getMetadata(
          'design:paramtypes',
          DetranPolicyGuard,
        );
        const database = {};
        const requestContext = {};
        const parameters = {};
        const reflector = new Reflector();
        let dashboardFailure;
        try {
          dashboardModule = await Test.createTestingModule({
            providers: [
              DashboardStreamService,
              { provide: Database, useValue: database },
              { provide: RequestContext, useValue: requestContext },
              { provide: OpsParameterService, useValue: parameters },
              {
                provide: DASHBOARD_CLOCK,
                useValue: { now: () => new Date(0) },
              },
            ],
          }).compile();
        } catch (error) {
          dashboardFailure = error;
        }
        guardModule = await Test.createTestingModule({
          providers: [
            DetranPolicyGuard,
            { provide: Reflector, useValue: reflector },
          ],
        }).compile();
        observation.dashboardMetadata =
          dashboardMetadata?.map((x) => x?.name) ?? null;
        observation.guardMetadata = guardMetadata?.map((x) => x?.name) ?? null;
        observation.actualDashboardNestFailure =
          dashboardFailure?.message ?? null;
        observation.guardReflectorActuallyInjected =
          guardModule.get(DetranPolicyGuard).reflector === reflector;
        t.diagnostic(
          JSON.stringify({
            label,
            dashboardMetadata: observation.dashboardMetadata,
            guardMetadata: observation.guardMetadata,
            actualDashboardNestFailure: observation.actualDashboardNestFailure,
            guardReflectorActuallyInjected:
              observation.guardReflectorActuallyInjected,
          }),
        );
        assert.deepEqual(dashboardMetadata?.slice(0, 3), [
          Database,
          RequestContext,
          OpsParameterService,
        ]);
        assert.deepEqual(guardMetadata, [Reflector]);
        assert.ifError(dashboardFailure);
        const instance = dashboardModule.get(DashboardStreamService);
        assert.equal(instance.database, database);
        assert.equal(instance.requestContext, requestContext);
        assert.equal(instance.parameters, parameters);
        assert.equal(guardModule.get(DetranPolicyGuard).reflector, reflector);
        const pluginIndex = server.config.plugins.findIndex(
          (x) => x.name === 'detran-ordinary-nest-metadata',
        );
        const esbuildIndex = server.config.plugins.findIndex(
          (x) => x.name === 'vite:esbuild',
        );
        assert.ok(pluginIndex >= 0 && pluginIndex < esbuildIndex);
        assert.equal(
          server.config.plugins.filter(
            (x) => x.name === 'detran-ordinary-nest-metadata',
          ).length,
          1,
          'Performance must inherit exactly one base registration',
        );
        assert.equal(server.config.plugins[pluginIndex].enforce, 'pre');
        for (const file of [
          path.join(app, 'src/dashboard-stream.service.ts'),
          path.join(root, 'backend/domains/shared/src/policy.guard.ts'),
        ]) {
          const final = await server.transformRequest(file, { ssr: true });
          assert.ok(final?.code);
          assert.doesNotMatch(final.code, /\b(?:require\(|exports\.)/);
        }
        const { of, firstValueFrom } = requireApp('rxjs');
        const load = (name) => server.ssrLoadModule(path.join(root, name));
        const { RaitTransactionalAuditInterceptor } = await load(
          'backend/app/src/rait-transactional-audit.interceptor.ts',
        );
        const controllerSpecs = [
          {
            file: controllerTargets[0],
            name: 'RaitWorklistCommandsController',
            service: 'RaitWorklistCommandService',
            serviceFile:
              'backend/domains/inf/rait-worklist/src/handwritten/rait-worklist-command.service.ts',
            handlers: [
              'createSchedule',
              'publishSchedule',
              'createBatch',
              'approveBatch',
              'acceptBatchItem',
              'declareBatchItemImpediment',
            ],
          },
          {
            file: controllerTargets[1],
            name: 'RaitSessionCommandsController',
            service: 'RaitSessionCommandService',
            serviceFile:
              'backend/domains/inf/rait-session/src/handwritten/rait-session-command.service.ts',
            handlers: [
              'closeAgenda',
              'open',
              'adjourn',
              'conveneExtraordinary',
              'read',
              'view',
              'withdraw',
              'createVote',
              'proclaim',
              'createMinutes',
              'signMinutes',
              'publish',
            ],
          },
        ];
        observation.auditControllers = [];
        observation.auditBranches = [];
        for (const expected of controllerSpecs) {
          const Controller = (await server.ssrLoadModule(expected.file))[
            expected.name
          ];
          const Service = (await load(expected.serviceFile))[expected.service];
          const metadata = Reflect.getMetadata('design:paramtypes', Controller);
          observation.auditControllers.push({
            expected: expected.name,
            runtimeName: Controller.name,
            serviceIdentity: metadata?.[0] === Service,
          });
          assert.deepEqual(metadata, [Service]);
          for (const handlerName of expected.handlers) {
            const handler = Controller.prototype[handlerName];
            assert.equal(typeof handler, 'function');
            let nextCalls = 0,
              delegateCalls = 0;
            const interceptor = new RaitTransactionalAuditInterceptor({
              intercept() {
                delegateCalls++;
                return of('duplicated-audit');
              },
            });
            const value = await firstValueFrom(
              interceptor.intercept(
                { getClass: () => Controller, getHandler: () => handler },
                {
                  handle() {
                    nextCalls++;
                    return of('single-transaction-audit');
                  },
                },
              ),
            );
            observation.auditBranches.push({
              controller: expected.name,
              handlerName,
              actualHandlerName: handler.name,
              value,
              nextCalls,
              delegateCalls,
            });
          }
          const ordinaryHandler = Controller.prototype.run;
          assert.equal(typeof ordinaryHandler, 'function');
          let delegateCalls = 0;
          const interceptor = new RaitTransactionalAuditInterceptor({
            intercept() {
              delegateCalls++;
              return of('ordinary-delegate');
            },
          });
          assert.equal(
            await firstValueFrom(
              interceptor.intercept(
                {
                  getClass: () => Controller,
                  getHandler: () => ordinaryHandler,
                },
                {
                  handle() {
                    throw new Error('Unmapped handler must delegate');
                  },
                },
              ),
            ),
            'ordinary-delegate',
          );
          assert.equal(delegateCalls, 1);
        }
        assert.equal(observation.auditBranches.length, 18);
        for (const controller of observation.auditControllers)
          assert.equal(
            controller.runtimeName,
            controller.expected,
            'Canonical controller name is part of the unchanged audit-dispatch contract',
          );
        for (const branch of observation.auditBranches) {
          assert.equal(branch.actualHandlerName, branch.handlerName);
          assert.equal(branch.value, 'single-transaction-audit');
          assert.equal(branch.nextCalls, 1);
          assert.equal(branch.delegateCalls, 0);
        }
        // Exercise every actual canonical-name consumer, including negative
        // consumers: a numeric rename must not hide a forbidden CRUD POST.
        const compiledControllers = [];
        const providers = new Map();
        const serviceValues = new Map();
        observation.canonicalNameConsumers = [];
        const streamExports = await load(
          'backend/app/src/dashboard-stream.service.ts',
        );
        const poller = {};
        for (const expected of canonicalControllerSpecs) {
          const Controller = (await load(expected.file))[expected.name];
          assert.equal(Controller.name, expected.name);
          compiledControllers.push(Controller);
          const metadata = Reflect.getMetadata('design:paramtypes', Controller);
          if (expected.name === 'DashboardStreamController') {
            assert.deepEqual(metadata, [
              DashboardStreamService,
              Database,
              RequestContext,
              Object,
            ]);
            assert.deepEqual(
              Reflect.getMetadata('self:paramtypes', Controller),
              [{ index: 3, param: streamExports.DASHBOARD_STREAM_POLLER }],
            );
            providers.set(DashboardStreamService, instance);
            providers.set(Database, database);
            providers.set(RequestContext, requestContext);
            providers.set(streamExports.DASHBOARD_STREAM_POLLER, poller);
          } else {
            const Service = (await load(expected.serviceFile))[
              expected.service
            ];
            assert.deepEqual(metadata, [Service]);
            if (!serviceValues.has(Service)) serviceValues.set(Service, {});
            providers.set(Service, serviceValues.get(Service));
          }
          observation.canonicalNameConsumers.push({
            expected: expected.name,
            runtimeName: Controller.name,
            metadata: metadata.map((value) => value.name),
            negativeCrud: expected.negativeCrud,
          });
        }
        namedControllerModule = await Test.createTestingModule({
          controllers: compiledControllers,
          providers: [...providers].map(([provide, useValue]) => ({
            provide,
            useValue,
          })),
        }).compile();
        const consumers = actualCanonicalNameConsumers();
        const shared = await load('backend/domains/shared/src/index.ts');
        const { ModulesContainer } = requireApp('@nestjs/core');
        const realModules = namedControllerModule.get(ModulesContainer);
        const routes = consumers.collect(
          realModules.values(),
          shared.DETRAN_RESOURCE_METADATA_KEY,
          shared.DETRAN_ACTION_METADATA_KEY,
          shared.policyKey,
        );
        const stream = routes.find(
          (route) =>
            route.key === 'dashboard:alert:read' &&
            route.controller === 'DashboardStreamController',
        );
        assert.ok(
          stream,
          'Source-identical Dashboard canonical-name consumer must resolve real Nest controller',
        );
        assert.equal(stream.method, 'stream');
        observation.actualConsumerSourceHashes = consumers.sourceHashes;
        observation.dashboardPolicyConsumer = stream;
        observation.negativeCrudConsumers = [];
        for (const expected of canonicalControllerSpecs) {
          const Controller = compiledControllers.find(
            (item) => item.name === expected.name,
          );
          const actual = namedControllerModule.get(Controller);
          if (expected.name === 'DashboardStreamController') {
            assert.equal(actual.service, instance);
            assert.equal(actual.database, database);
            assert.equal(actual.requestContext, requestContext);
            assert.equal(actual.poller, poller);
          } else {
            const Service = (await load(expected.serviceFile))[
              expected.service
            ];
            assert.equal(actual[expected.field], serviceValues.get(Service));
          }
          if (!expected.negativeCrud) continue;
          assert.ok(consumers.forbiddenControllers.has(Controller.name));
          const { RequestMethod } = requireApp('@nestjs/common');
          const actualRoutes = Object.getOwnPropertyNames(Controller.prototype)
            .filter((name) => typeof Controller.prototype[name] === 'function')
            .map((name) => ({
              controller: Controller.name,
              method: Reflect.getMetadata('method', Controller.prototype[name]),
            }))
            .filter((route) => route.method !== undefined);
          assert.deepEqual(
            actualRoutes.map((route) => route.method),
            [RequestMethod.GET, RequestMethod.GET],
          );
          assert.deepEqual(actualRoutes.filter(consumers.rejectPost), []);
          // Counterfactual records only; never mutate real class/route metadata.
          const forbiddenPosts = actualRoutes.map((route) => ({
            ...route,
            method: RequestMethod.POST,
          }));
          assert.equal(
            forbiddenPosts.filter(consumers.rejectPost).length,
            2,
            'Canonical negative consumer must detect forbidden POST, not lose renamed controller identity',
          );
          observation.negativeCrudConsumers.push({
            controller: Controller.name,
            actualGetRoutes: actualRoutes.length,
            actualForbiddenPosts: 0,
            counterfactualPostsDetected: 2,
          });
        }
        assert.equal(observation.canonicalNameConsumers.length, 10);
        assert.equal(observation.negativeCrudConsumers.length, 2);
        observation.closedSelectors = closedSecondTransformSelectors(
          server,
          controllerTargets,
        );
        assertClosedCompilationStages(stages, controllerTargets, normalSource);
        observation.declaration = strictDeclarationIdentity();
        observation.status = 'PASS';
      } catch (error) {
        primary = error;
        observation.status = 'FAIL';
        observation.failure = { name: error.name, message: error.message };
      } finally {
        try {
          await dashboardModule?.close();
          await guardModule?.close();
          await namedControllerModule?.close();
          await server?.close();
        } finally {
          net.Server.prototype.listen = originalListen;
          sourceWatcher.close();
          rmSync(cache, { recursive: true, force: true });
        }
        try {
          observation.cacheSettle = await settleCache(
            bundleCache,
            cacheBefore,
            filename,
            loader === 'default-bundle',
          );
          assert.deepEqual(
            adjacentEvents,
            [],
            'Source-adjacent bundler fallback is forbidden',
          );
          assert.equal(
            listenAttempts,
            0,
            'No network listener may be attempted',
          );
        } catch (error) {
          observation.custodyFailure = { message: error.message };
          primary ??= error;
        }
        const sourceAfter = sourceSnapshot();
        writeFileSync(
          path.join(caseDir, 'source-after.json'),
          JSON.stringify(sourceAfter, null, 2) + '\n',
        );
        try {
          assert.deepEqual(
            sourceAfter,
            sourceBefore,
            'Tracked/nonignored source/modes/link targets must remain exact during a case',
          );
        } catch (error) {
          observation.sourceCustodyFailure = error.message;
          primary ??= error;
        }
        observation.listenAttempts = listenAttempts;
        observation.listenerGuardRestored =
          net.Server.prototype.listen === originalListen;
        observation.sourceHashCount = Object.keys(sourceAfter).length;
        observation.actualSourceStateUnchanged =
          JSON.stringify(sourceAfter) === JSON.stringify(sourceBefore);
        observation.finishedAt = new Date().toISOString();
        writeFileSync(
          path.join(caseDir, 'observation.json'),
          JSON.stringify(observation, null, 2) + '\n',
        );
      }
      if (primary) throw primary;
    });
  }
}
