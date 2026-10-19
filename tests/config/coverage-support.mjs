import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  globSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, matchesGlob, relative, resolve } from 'node:path';
import istanbulCoverage from 'istanbul-lib-coverage';

const { createCoverageMap } = istanbulCoverage;
// Six complete Angular compiler programs plus the merged V8 coverage map exceed
// Node's default heap. Keep at most two unchanged program contexts; evicted apps
// rebuild from the same canonical configurations on the next transform.
const angularPrograms = new Map();

export function coverageExclusions(root) {
  // The installed contract admits literal repository paths, never globs.
  const suites = globSync(
    [
      'backend/**/tests/integration',
      'backend/**/tests/e2e',
      'backend/**/tests/real',
      'backend/**/tests/in-house',
      'senatran-mock/tests/integration',
      'senatran-mock/tests/e2e',
      'senatran-mock/tests/real',
    ],
    { cwd: root, exclude: ['**/node_modules/**', '**/dist/**'] },
  );
  return [
    ...new Set([
      ...suites,
      ...['tools', 'tests'].filter((path) => existsSync(join(root, path))),
    ]),
  ].sort();
}
export const sha256 = (bytes) =>
  createHash('sha256').update(bytes).digest('hex');

export function workspacePopulation(root) {
  const lines = readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8')
    .trim()
    .split('\n');
  if (lines.shift() !== 'packages:')
    throw new Error('COVERAGE_WORKSPACE_FORMAT_UNSUPPORTED');
  const patterns = lines.map((line) => {
    const match = /^\s+- '([^']+)'$/.exec(line);
    if (!match) throw new Error('COVERAGE_WORKSPACE_FORMAT_UNSUPPORTED');
    return `${match[1]}/package.json`;
  });
  const packages = [...new Set(globSync(patterns, { cwd: root }))]
    .map(dirname)
    .sort();
  const sourceRoots = packages
    .filter((dir) => existsSync(join(root, dir, 'src')))
    .map((dir) => `${dir}/src`);
  sourceRoots.push(
    ...globSync(
      ['senatran-mock/apps/*/src', 'senatran-mock/domain/*/api/src'],
      { cwd: root },
    ),
  );
  const roots = [...new Set(sourceRoots)].sort();
  const sources = [
    ...new Set(
      globSync(
        roots.map((dir) => `${dir}/**/*.ts`),
        { cwd: root },
      ),
    ),
  ]
    .filter(
      (file) =>
        !/\.(spec|test|d)\.ts$/.test(file) && !file.endsWith('/test-setup.ts'),
    )
    .sort();
  if (!packages.length || !sources.length)
    throw new Error('COVERAGE_POPULATION_EMPTY');
  return { packages, sourceRoots: roots, sources };
}

// Reuse Angular's existing JIT transformation through the compiler's emitter, so
// coverage maps retain original positions instead of printed transformed text.
export async function angularCoveragePlugin(root, app) {
  const appRoot = resolve(root, app);
  const require = createRequire(join(appRoot, 'package.json'));
  const ts = require('typescript');
  const { angularJitApplicationTransform } = await import(
    require.resolve('@angular/compiler-cli')
  );
  return {
    name: 'scorecard-angular-original-source-map',
    enforce: 'pre',
    transform(_code, id) {
      if (
        !id.endsWith('.ts') ||
        id.includes('node_modules') ||
        !id.startsWith(`${appRoot}/`)
      )
        return null;
      let program = angularPrograms.get(appRoot);
      if (!program) {
        const load = (file) => {
          const path = join(appRoot, file),
            config = ts.readConfigFile(path, ts.sys.readFile);
          if (config.error) throw new Error('COVERAGE_TSCONFIG_UNREADABLE');
          return ts.parseJsonConfigFileContent(
            config.config,
            ts.sys,
            dirname(path),
          );
        };
        const appConfig = load('tsconfig.app.json'),
          spec = load('tsconfig.spec.json');
        program = ts.createProgram(
          [...new Set([...spec.fileNames, ...appConfig.fileNames])],
          {
            ...spec.options,
            noEmit: false,
            noEmitOnError: false,
            sourceMap: true,
            inlineSourceMap: false,
            inlineSources: true,
          },
        );
      }
      angularPrograms.delete(appRoot);
      angularPrograms.set(appRoot, program);
      while (angularPrograms.size > 2)
        angularPrograms.delete(angularPrograms.keys().next().value);
      const source = program.getSourceFile(id);
      if (!source) return null;
      let code, map;
      const result = program.emit(
        source,
        (name, content) => {
          if (name.endsWith('.js')) code = content;
          else if (name.endsWith('.js.map')) map = content;
        },
        undefined,
        false,
        { before: [angularJitApplicationTransform(program)] },
      );
      if (result.emitSkipped || code === undefined || map === undefined)
        throw new Error(`COVERAGE_ORIGINAL_SOURCE_MAP_MISSING:${id}`);
      return { code, map: JSON.parse(map) };
    },
  };
}

export function assertSourcePopulation(expected, observed) {
  const wanted = new Set(expected),
    actual = new Set(observed);
  const missing = [...wanted].filter((file) => !actual.has(file));
  const unexpected = [...actual].filter((file) => !wanted.has(file));
  if (missing.length || unexpected.length)
    throw new Error(
      `COVERAGE_SOURCE_POPULATION_MISMATCH:${JSON.stringify({ missing, unexpected })}`,
    );
}

export function verifyExistingThresholds(root, report, policies) {
  const results = [];
  for (const policy of policies) {
    const subset = Object.fromEntries(
      Object.entries(report).filter(([path]) => {
        const file = relative(resolve(root, policy.root), path);
        return (
          !file.startsWith('..') &&
          policy.include.some((glob) => matchesGlob(file, glob)) &&
          !policy.exclude.some((glob) => matchesGlob(file, glob))
        );
      }),
    );
    const map = createCoverageMap(subset);
    if (!map.files().length)
      throw new Error(`COVERAGE_THRESHOLD_POPULATION_EMPTY:${policy.root}`);
    const summaries = policy.thresholds.perFile
      ? map.files().map((file) => map.fileCoverageFor(file).toSummary().data)
      : [map.getCoverageSummary().data];
    for (const [metric, limit] of Object.entries(policy.thresholds)) {
      if (metric === 'perFile') continue;
      if (
        !['lines', 'branches', 'functions', 'statements'].includes(metric) ||
        typeof limit !== 'number'
      )
        throw new Error(
          `COVERAGE_THRESHOLD_CONTRACT_UNSUPPORTED:${policy.root}:${metric}`,
        );
      if (
        summaries.some((summary) =>
          limit >= 0
            ? summary[metric].pct < limit
            : summary[metric].total - summary[metric].covered > -limit,
        )
      )
        throw new Error(
          `COVERAGE_EXISTING_THRESHOLD_FAILED:${policy.root}:${metric}:${limit}`,
        );
    }
    results.push({
      root: policy.root,
      thresholds: policy.thresholds,
      files: map.files().length,
      summary: map.getCoverageSummary().data,
    });
  }
  return results;
}

export function populationReporter(root, population, policies) {
  const reportPath = join(root, 'coverage/coverage-final.json'),
    sidecar = join(root, 'coverage/population.json');
  let ctx,
    modules = [],
    passed = false,
    expected = [],
    collecting = true,
    candidate;
  return {
    onInit(vitest) {
      ctx = vitest;
      collecting = vitest.config.coverage?.enabled !== false;
      if (collecting) {
        candidate = execFileSync('git', ['rev-parse', 'HEAD'], {
          cwd: root,
          encoding: 'utf8',
        }).trim();
        rmSync(sidecar, { force: true });
      }
    },
    async onTestRunStart() {
      expected = (await ctx.globTestSpecifications([]))
        .map((spec) => `${spec.project.name}:${spec.moduleId}`)
        .sort();
    },
    onTestRunEnd(testModules, errors, reason) {
      modules = testModules;
      passed = reason === 'passed' && errors.length === 0;
    },
    onFinishedReportCoverage() {
      if (!collecting || !passed) return;
      try {
        const bytes = readFileSync(reportPath),
          report = JSON.parse(bytes);
        const measured = Object.keys(report)
          .map((file) => relative(root, file))
          .sort();
        assertSourcePopulation(population.sources, measured);
        const thresholds = verifyExistingThresholds(root, report, policies);
        const executed = modules
          .map((mod) => `${mod.project.name}:${mod.moduleId}`)
          .sort();
        const config = ctx.config;
        const partial =
          JSON.stringify(executed) !== JSON.stringify(expected) ||
          (ctx.filenamePattern ?? []).length > 0 ||
          config.testNamePattern ||
          config.shard ||
          config.changed ||
          config.related?.length ||
          config.project?.length;
        const commit = execFileSync('git', ['rev-parse', 'HEAD'], {
          cwd: root,
          encoding: 'utf8',
        }).trim();
        if (commit !== candidate) throw new Error('COVERAGE_CANDIDATE_CHANGED');
        mkdirSync(dirname(sidecar), { recursive: true });
        writeFileSync(
          sidecar,
          JSON.stringify(
            {
              schemaVersion: '1.0.0',
              population: 'local',
              exclusions: coverageExclusions(root),
              include: population.sourceRoots,
              sourceFiles: measured,
              filesMeasured: measured.length,
              testFiles: modules.length,
              workspacePackages: population.packages,
              declaredTestFiles: expected,
              executedTestFiles: executed,
              existingThresholdChecks: thresholds,
              binding: {
                commit,
                producer: {
                  name: 'devai-local-coverage-producer',
                  version: ctx.version,
                },
                selector: partial ? 'partial-suite' : 'full-suite',
                reportSha256: sha256(bytes),
              },
            },
            null,
            2,
          ) + '\n',
        );
      } catch (error) {
        process.exitCode = 1;
        rmSync(sidecar, { force: true });
        throw error;
      }
    },
  };
}
