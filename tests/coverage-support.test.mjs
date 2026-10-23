import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  globSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  assertSourcePopulation,
  angularCoveragePlugin,
  coverageSourcePatterns,
  populationReporter,
  verifyExistingThresholds,
  workspacePopulation,
  withExactLineCounters,
} from './config/coverage-support.mjs';

const directories = [];
afterEach(() => {
  for (const dir of directories.splice(0))
    rmSync(dir, { recursive: true, force: true });
});
function temporary() {
  const dir = mkdtempSync(join(tmpdir(), 'detran-coverage-'));
  directories.push(dir);
  return dir;
}
function coverage(path, hits = 1) {
  return {
    path,
    statementMap: {
      0: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
    },
    s: { 0: hits },
    fnMap: {},
    f: {},
    branchMap: {},
    b: {},
  };
}
test('discovers every workspace package, including sources without tests', () => {
  const root = temporary();
  writeFileSync(
    join(root, 'pnpm-workspace.yaml'),
    "packages:\n  - 'packages/*'\n",
  );
  for (const name of ['one', 'untested']) {
    const dir = join(root, 'packages', name);
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'package.json'), '{}');
    writeFileSync(join(dir, 'src/index.ts'), 'export const value=1;');
    writeFileSync(join(dir, 'src/index.spec.ts'), '');
  }
  const result = workspacePopulation(root);
  assert.deepEqual(result.packages, ['packages/one', 'packages/untested']);
  assert.deepEqual(result.sources, [
    'packages/one/src/index.ts',
    'packages/untested/src/index.ts',
  ]);
});
test('rejects both missing source files and unexpected substitutes', () => {
  assert.throws(
    () => assertSourcePopulation(['a.ts', 'b.ts'], ['a.ts', 'other.ts']),
    /COVERAGE_SOURCE_POPULATION_MISMATCH.*b.ts.*other.ts/,
  );
});
test('counts a covered line once when multiple statements share it', () => {
  const entry = coverage('/fixture.ts', 0);
  entry.statementMap[1] = {
    start: { line: 1, column: 5 },
    end: { line: 1, column: 9 },
  };
  entry.statementMap[2] = {
    start: { line: 2, column: 0 },
    end: { line: 2, column: 4 },
  };
  entry.s[1] = 3;
  entry.s[2] = 0;
  const normalized = withExactLineCounters({ '/fixture.ts': entry });
  assert.deepEqual({ ...normalized['/fixture.ts'].l }, { 1: 3, 2: 0 });
  assert.deepEqual(normalized['/fixture.ts'].s, { 0: 0, 1: 3, 2: 0 });
  assert.equal(entry.l, undefined);
});
test('emits original mapped JavaScript for the BOAT library configuration', async () => {
  const root = process.cwd();
  const plugin = await angularCoveragePlugin(root, 'apps/boat/mobile');
  const file = join(root, 'apps/boat/mobile/src/lib/a11y.ts');
  const original = readFileSync(file, 'utf8');
  const result = await plugin.transform(original, file);
  assert.ok(result);
  assert.match(result.code, /export async function assertBoatA11y/);
  assert.doesNotMatch(result.code, /Readonly|Promise<boolean>/);
  assert.ok(result.map.sources.some((source) => source.endsWith('a11y.ts')));
  assert.ok(result.map.sourcesContent.includes(original));
});
test('compact coverage patterns retain generated and untested sources without test scaffolding', () => {
  const root = temporary();
  writeFileSync(
    join(root, 'pnpm-workspace.yaml'),
    "packages:\n  - 'packages/*'\n",
  );
  for (const name of ['one', 'untested']) {
    const dir = join(root, 'packages', name);
    mkdirSync(join(dir, 'src/generated'), { recursive: true });
    writeFileSync(join(dir, 'package.json'), '{}');
    for (const file of [
      'index.ts',
      'generated/client.ts',
      'index.spec.ts',
      'index.test.ts',
      'index.d.ts',
      'test-setup.ts',
    ])
      writeFileSync(join(dir, 'src', file), '');
  }
  const population = workspacePopulation(root);
  const patterns = coverageSourcePatterns(population);
  const actual = [
    ...globSync(patterns.include, { cwd: root, exclude: patterns.exclude }),
  ].sort();
  assert.deepEqual(actual, population.sources);
  assert.equal(actual.length, 4);
  assert.equal(patterns.include.length, 2);
});
test('preserves an existing package threshold even when other packages pass', () => {
  const root = temporary(),
    bad = join(root, 'mock/src/a.ts'),
    good = join(root, 'other/src/a.ts');
  const policy = [
    {
      root: 'mock',
      include: ['src/**/*.ts'],
      exclude: [],
      thresholds: { lines: 70 },
    },
  ];
  assert.throws(
    () =>
      verifyExistingThresholds(
        root,
        { [bad]: coverage(bad, 0), [good]: coverage(good) },
        policy,
      ),
    /COVERAGE_EXISTING_THRESHOLD_FAILED/,
  );
});
test('keeps maximum-uncovered and per-file threshold semantics', () => {
  const root = temporary(),
    a = join(root, 'mock/src/a.ts'),
    b = join(root, 'mock/src/b.ts');
  const report = { [a]: coverage(a), [b]: coverage(b, 0) };
  const base = { root: 'mock', include: ['src/**/*.ts'], exclude: [] };
  assert.equal(
    verifyExistingThresholds(root, report, [
      { ...base, thresholds: { lines: -1 } },
    ]).length,
    1,
  );
  assert.throws(
    () =>
      verifyExistingThresholds(root, report, [
        { ...base, thresholds: { lines: 50, perFile: true } },
      ]),
    /COVERAGE_EXISTING_THRESHOLD_FAILED/,
  );
});
function fixture() {
  const root = temporary();
  execFileSync('git', ['init', '--quiet', root]);
  execFileSync(
    'git',
    [
      '-c',
      'user.name=DEVAI Inspector',
      '-c',
      'user.email=inspector@devai.local',
      'commit',
      '--quiet',
      '--allow-empty',
      '-m',
      'test(coverage): isolated producer fixture',
    ],
    { cwd: root },
  );
  const file = join(root, 'src/a.ts'),
    moduleId = join(root, 'src/a.spec.ts');
  mkdirSync(join(root, 'coverage'));
  writeFileSync(
    join(root, 'coverage/coverage-final.json'),
    JSON.stringify({ [file]: coverage(file) }),
  );
  const context = {
    version: '4.1.11',
    config: {},
    filenamePattern: [],
    globTestSpecifications: async () => [{ project: { name: 'p' }, moduleId }],
  };
  const reporter = populationReporter(
    root,
    { packages: ['p'], sourceRoots: ['src'], sources: ['src/a.ts'] },
    [],
  );
  reporter.onInit(context);
  return {
    root,
    context,
    reporter,
    module: { project: { name: 'p' }, moduleId },
    sidecar: join(root, 'coverage/population.json'),
  };
}
test('binds a complete report to the actual commit, full population and digest', async () => {
  const f = fixture();
  await f.reporter.onTestRunStart();
  f.reporter.onTestRunEnd([f.module], [], 'passed');
  f.reporter.onFinishedReportCoverage();
  const value = JSON.parse(readFileSync(f.sidecar));
  assert.equal(value.binding.selector, 'full-suite');
  assert.match(value.binding.commit, /^[a-f0-9]{40}$/);
  assert.match(value.binding.reportSha256, /^[a-f0-9]{64}$/);
  assert.equal(value.filesMeasured, 1);
});
test('marks filtered runs partial and never binds failed tests', async () => {
  const f = fixture();
  f.context.filenamePattern = ['subset'];
  await f.reporter.onTestRunStart();
  f.reporter.onTestRunEnd([f.module], [], 'passed');
  f.reporter.onFinishedReportCoverage();
  assert.equal(
    JSON.parse(readFileSync(f.sidecar)).binding.selector,
    'partial-suite',
  );
  f.reporter.onInit(f.context);
  f.reporter.onTestRunEnd([f.module], [], 'failed');
  f.reporter.onFinishedReportCoverage();
  assert.equal(existsSync(f.sidecar), false);
});
test('a non-coverage unit run preserves the existing coverage binding', () => {
  const f = fixture();
  writeFileSync(f.sidecar, 'existing coverage binding');
  f.context.config.coverage = { enabled: false };
  f.reporter.onInit(f.context);
  f.reporter.onTestRunEnd([f.module], [], 'passed');
  f.reporter.onFinishedReportCoverage();
  assert.equal(readFileSync(f.sidecar, 'utf8'), 'existing coverage binding');
});
test('refuses to bind a report if HEAD moved during the producer run', async () => {
  const f = fixture();
  await f.reporter.onTestRunStart();
  execFileSync(
    'git',
    [
      '-c',
      'user.name=DEVAI Inspector',
      '-c',
      'user.email=inspector@devai.local',
      'commit',
      '--quiet',
      '--allow-empty',
      '-m',
      'test(coverage): move isolated candidate',
    ],
    { cwd: f.root },
  );
  f.reporter.onTestRunEnd([f.module], [], 'passed');
  const previousExitCode = process.exitCode;
  try {
    assert.throws(
      () => f.reporter.onFinishedReportCoverage(),
      /COVERAGE_CANDIDATE_CHANGED/,
    );
    assert.equal(process.exitCode, 1);
  } finally {
    process.exitCode = previousExitCode;
  }
  assert.equal(existsSync(f.sidecar), false);
});
test('refuses to bind a report that silently omitted a source', async () => {
  const f = fixture();
  await f.reporter.onTestRunStart();
  writeFileSync(join(f.root, 'coverage/coverage-final.json'), '{}');
  f.reporter.onTestRunEnd([f.module], [], 'passed');
  const previousExitCode = process.exitCode;
  try {
    assert.throws(
      () => f.reporter.onFinishedReportCoverage(),
      /COVERAGE_SOURCE_POPULATION_MISMATCH/,
    );
    assert.equal(process.exitCode, 1);
  } finally {
    process.exitCode = previousExitCode;
  }
  assert.equal(existsSync(f.sidecar), false);
});
