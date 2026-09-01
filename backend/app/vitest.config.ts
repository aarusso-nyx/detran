import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const tier = (process.env.DETRAN_TEST_TIER ?? 'unit') as
  'unit' | 'integration' | 'e2e' | 'real' | 'in-house';

const includeByTier: Record<typeof tier, string[]> = {
  unit: ['src/**/*.spec.ts'],
  integration: ['tests/integration/**/*.integration.spec.ts'],
  e2e: ['tests/e2e/**/*.e2e.spec.ts'],
  real: ['tests/real/**/*.real.spec.ts'],
  'in-house': ['tests/in-house/**/*.in-house.spec.ts'],
};

export default defineConfig({
  resolve: {
    alias: {
      '@detran/shared': fileURLToPath(
        new URL('../domains/shared/src/index.ts', import.meta.url),
      ),
      '@detran/senatran-adapter': fileURLToPath(
        new URL(
          '../../packages/senatran-adapter/src/index.ts',
          import.meta.url,
        ),
      ),
      '@detran/ch-juntas': fileURLToPath(
        new URL('../domains/ch/juntas/src/index.ts', import.meta.url),
      ),
      '@detran/ch-toxicology': fileURLToPath(
        new URL('../domains/ch/toxicology/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: includeByTier[tier],
    passWithNoTests: true,
    fileParallelism: false,
    testTimeout:
      tier === 'unit' ? 10_000 : tier === 'in-house' ? 120_000 : 30_000,
  },
});
