import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
const tier = process.env.DETRAN_TEST_TIER ?? 'unit';
const include: Record<string, string[]> = {
  unit: ['src/**/*.spec.ts', 'tests/unit/**/*.spec.ts'],
  integration: ['tests/integration/**/*.integration.spec.ts'],
  e2e: ['tests/e2e/**/*.e2e.spec.ts'],
  real: ['tests/real/**/*.real.spec.ts'],
};
export default defineConfig({
  resolve: {
    alias: {
      '@detran/shared': fileURLToPath(
        new URL('../../shared/src/index.ts', import.meta.url),
      ),
      '@detran/inf-rait-case': fileURLToPath(
        new URL('../rait-case/src/index.ts', import.meta.url),
      ),
      '@detran/inf-rait-worklist': fileURLToPath(
        new URL('../rait-worklist/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: include[tier],
    passWithNoTests: true,
    fileParallelism: false,
    testTimeout: tier === 'unit' ? 10000 : 30000,
  },
});
