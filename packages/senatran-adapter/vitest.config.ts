import { defineConfig } from 'vitest/config';

const tier = (process.env.DETRAN_TEST_TIER ?? 'unit') as
  'unit' | 'integration' | 'e2e' | 'real';

const includeByTier: Record<typeof tier, string[]> = {
  unit: ['src/**/*.spec.ts'],
  integration: ['tests/integration/**/*.integration.spec.ts'],
  e2e: ['tests/e2e/**/*.e2e.spec.ts'],
  real: ['tests/real/**/*.real.spec.ts'],
};

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: includeByTier[tier],
    passWithNoTests: false,
    fileParallelism: false,
    testTimeout: tier === 'unit' ? 10_000 : 30_000,
  },
});
