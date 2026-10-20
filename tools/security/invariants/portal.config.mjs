import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { aliases } from './workspace.config.mjs';
import { createNestMetadataPlugin } from './nest-metadata-transform.mjs';

// These exact decorated files are already compiled by the metadata plugin.
const metadataCompiledSourcePatterns = [
  '../../../backend/domains/portal/requests/src/handwritten/requests.service.ts',
  '../../../backend/domains/portal/requests/src/handwritten/idempotency.service.ts',
  '../../../backend/domains/portal/requests/src/handwritten/delegation/delegation.service.ts',
  '../../../backend/domains/portal/identity/src/handwritten/identity.service.ts',
  '../../../backend/domains/portal/identity/src/handwritten/clock.ts',
].map((relative) => {
  const filename = fileURLToPath(new URL(relative, import.meta.url));
  return new RegExp(
    '^' + filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
  );
});

// Complete existing semantic suite; no CLI filters, skips or weakened assertions.
export default defineConfig({
  plugins: [createNestMetadataPlugin()],
  esbuild: { exclude: [/\.js$/, ...metadataCompiledSourcePatterns] },
  root: fileURLToPath(
    new URL('../../../backend/domains/portal/requests', import.meta.url),
  ),
  resolve: { alias: aliases },
  test: {
    name: 'detran-invariant-portal',
    environment: 'node',
    globals: true,
    include: ['tests/integration/portal-requests.integration.spec.ts'],
    passWithNoTests: false,
    fileParallelism: false,
    testTimeout: 30000,
  },
});
