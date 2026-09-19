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
      '@detran/portal-identity': fileURLToPath(
        new URL('../identity/src/index.ts', import.meta.url),
      ),
      '@detran/portal-requests': fileURLToPath(
        new URL('../requests/src/index.ts', import.meta.url),
      ),
      '@detran/inf-deadlines': fileURLToPath(
        new URL('../../inf/deadlines/src/index.ts', import.meta.url),
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
