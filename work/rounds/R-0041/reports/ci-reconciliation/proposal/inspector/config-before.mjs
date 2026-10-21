import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { aliases } from './workspace.config.mjs';

// Complete existing semantic suite; no CLI filters, skips or weakened assertions.
export default defineConfig({
  root: fileURLToPath(new URL('../../../backend/app', import.meta.url)),
  resolve: { alias: aliases },
  test: {
    name: 'detran-invariant-ops-perf',
    environment: 'node',
    globals: true,
    include: ['tests/performance/backend-baseline.perf.spec.ts'],
    passWithNoTests: false,
    fileParallelism: false,
    testTimeout: 120000,
  },
});
