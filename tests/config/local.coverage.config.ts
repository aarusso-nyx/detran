import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig } from 'vitest/config';
import {
  angularCoveragePlugin,
  coverageSourcePatterns,
  populationReporter,
  workspacePopulation,
} from './coverage-support.mjs';

const root = resolve(import.meta.dirname, '../..');
const population = workspacePopulation(root);
const coveragePatterns = coverageSourcePatterns(population);
const testResultsFile = resolve(
  root,
  '.devai/local/rounds/R-0036/coverage-runs',
  `${Date.now()}-${process.pid}`,
  'test-results.json',
);
const projects = [],
  policies = [],
  angular = [];
if (
  (process.env.DETRAN_TEST_TIER ?? 'unit') !== 'unit' ||
  (process.env.SENATRAN_TEST_TIER ?? 'unit') !== 'unit'
)
  throw new Error('COVERAGE_LOCAL_UNIT_POPULATION_REQUIRED');
for (const pkg of population.packages) {
  const file = resolve(root, pkg, 'vitest.config.ts');
  if (!existsSync(file)) continue;
  const original = (await import(/* @vite-ignore */ pathToFileURL(file).href))
    .default;
  if (typeof original !== 'object' || original === null)
    throw new Error(`COVERAGE_PROJECT_CONFIG_UNSUPPORTED:${pkg}`);
  const originalTest = original.test ?? {};
  const plugins = [...(original.plugins ?? [])];
  const jit = plugins.findIndex(
    (plugin) => plugin?.name === 'angular-jit-initializer-apis',
  );
  if (jit >= 0) {
    const plugin = await angularCoveragePlugin(root, pkg);
    plugins[jit] = plugin;
    angular.push(plugin);
  }
  const coverage = originalTest.coverage;
  if (coverage?.thresholds)
    policies.push({
      root: pkg,
      thresholds: coverage.thresholds,
      include: coverage.include ?? ['**/*.ts'],
      exclude: coverage.exclude ?? [],
    });
  const { coverage: _coverage, ...test } = originalTest;
  if (test.pool && test.pool !== 'forks')
    throw new Error(`COVERAGE_PACKAGE_CONTEXT_POOL_UNSUPPORTED:${pkg}`);
  const setup = Array.isArray(test.setupFiles)
    ? test.setupFiles
    : test.setupFiles
      ? [test.setupFiles]
      : [];
  projects.push({
    ...original,
    root: resolve(root, pkg),
    plugins,
    test: {
      ...test,
      name: pkg,
      pool: 'forks',
      coverage: undefined,
      provide: { ...test.provide, scorecardPackageCwd: resolve(root, pkg) },
      setupFiles: [resolve(root, 'tests/config/package-cwd.mjs'), ...setup],
    },
  });
}
export default defineConfig({
  root,
  plugins: angular,
  test: {
    name: 'DETRAN full-source local unit coverage',
    projects,
    maxWorkers: 2,
    reporters: [
      'default',
      'json',
      populationReporter(root, population, policies, testResultsFile),
    ],
    outputFile: { json: testResultsFile },
    coverage: {
      enabled: true,
      provider: 'v8',
      // Bound AST/source-map remapping while preserving every covered source.
      processingConcurrency: 1,
      clean: true,
      reportsDirectory: resolve(root, 'coverage'),
      reporter: ['json', 'json-summary', 'text-summary'],
      ...coveragePatterns,
    },
  },
});
