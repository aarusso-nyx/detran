import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { aliases } from './workspace.config.mjs';

// Complete existing semantic suite; no CLI filters, skips or weakened assertions.
export default defineConfig({
  root: fileURLToPath(
    new URL('../../../backend/domains/ops/field', import.meta.url),
  ),
  resolve: { alias: aliases },
  test: {
    name: 'detran-invariant-ops-queue',
    environment: 'node',
    globals: true,
    include: ['tests/integration/shift-lifecycle.integration.spec.ts'],
    passWithNoTests: false,
    fileParallelism: false,
    testTimeout: 30000,
  },
});
