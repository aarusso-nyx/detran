import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { aliases } from './workspace.config.mjs';

// Complete existing semantic suite; no CLI filters, skips or weakened assertions.
export default defineConfig({
  root: fileURLToPath(
    new URL('../../../backend/domains/shared', import.meta.url),
  ),
  resolve: { alias: aliases },
  test: {
    name: 'detran-invariant-rbac',
    environment: 'node',
    globals: true,
    include: ['src/policy.guard.spec.ts', 'src/policy.spec.ts'],
    passWithNoTests: false,
    fileParallelism: false,
    testTimeout: 10000,
  },
});
