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
      '@detran/ch-billing': fileURLToPath(
        new URL('../domains/ch/billing/src/index.ts', import.meta.url),
      ),
      '@detran/ch-biometrics': fileURLToPath(
        new URL('../domains/ch/biometrics/src/index.ts', import.meta.url),
      ),
      '@detran/ch-clinical-controls': fileURLToPath(
        new URL(
          '../domains/ch/clinical-controls/src/index.ts',
          import.meta.url,
        ),
      ),
      '@detran/ch-clinical-network': fileURLToPath(
        new URL('../domains/ch/clinical-network/src/index.ts', import.meta.url),
      ),
      '@detran/ch-clinical-reports': fileURLToPath(
        new URL('../domains/ch/clinical-reports/src/index.ts', import.meta.url),
      ),
      '@detran/ch-encounters': fileURLToPath(
        new URL('../domains/ch/encounters/src/index.ts', import.meta.url),
      ),
      '@detran/ch-exams': fileURLToPath(
        new URL('../domains/ch/exams/src/index.ts', import.meta.url),
      ),
      '@detran/ch-inconsistencies': fileURLToPath(
        new URL('../domains/ch/inconsistencies/src/index.ts', import.meta.url),
      ),
      '@detran/ch-juntas': fileURLToPath(
        new URL('../domains/ch/juntas/src/index.ts', import.meta.url),
      ),
      '@detran/ch-operational-controls': fileURLToPath(
        new URL(
          '../domains/ch/operational-controls/src/index.ts',
          import.meta.url,
        ),
      ),
      '@detran/ch-patients': fileURLToPath(
        new URL('../domains/ch/patients/src/index.ts', import.meta.url),
      ),
      '@detran/ch-process-blocks': fileURLToPath(
        new URL('../domains/ch/process-blocks/src/index.ts', import.meta.url),
      ),
      '@detran/ch-restrictions': fileURLToPath(
        new URL('../domains/ch/restrictions/src/index.ts', import.meta.url),
      ),
      '@detran/ch-retention': fileURLToPath(
        new URL('../domains/ch/retention/src/index.ts', import.meta.url),
      ),
      '@detran/ch-scheduling': fileURLToPath(
        new URL('../domains/ch/scheduling/src/index.ts', import.meta.url),
      ),
      '@detran/ch-telehealth': fileURLToPath(
        new URL('../domains/ch/telehealth/src/index.ts', import.meta.url),
      ),
      '@detran/ch-toxicology': fileURLToPath(
        new URL('../domains/ch/toxicology/src/index.ts', import.meta.url),
      ),
      '@detran/inf-ait': fileURLToPath(
        new URL('../domains/inf/ait/src/index.ts', import.meta.url),
      ),
      '@detran/inf-deadlines': fileURLToPath(
        new URL('../domains/inf/deadlines/src/index.ts', import.meta.url),
      ),
      '@detran/inf-normative': fileURLToPath(
        new URL('../domains/inf/normative/src/index.ts', import.meta.url),
      ),
      '@detran/inf-measures': fileURLToPath(
        new URL('../domains/inf/measures/src/index.ts', import.meta.url),
      ),
      '@detran/inf-alcohol': fileURLToPath(
        new URL('../domains/inf/alcohol/src/index.ts', import.meta.url),
      ),
      '@detran/inf-infraction': fileURLToPath(
        new URL('../domains/inf/infraction/src/index.ts', import.meta.url),
      ),
      '@detran/inf-notification': fileURLToPath(
        new URL('../domains/inf/notification/src/index.ts', import.meta.url),
      ),
      '@detran/inf-rait-case': fileURLToPath(
        new URL('../domains/inf/rait-case/src/index.ts', import.meta.url),
      ),
      '@detran/inf-rait-worklist': fileURLToPath(
        new URL('../domains/inf/rait-worklist/src/index.ts', import.meta.url),
      ),
      '@detran/inf-rait-session': fileURLToPath(
        new URL('../domains/inf/rait-session/src/index.ts', import.meta.url),
      ),
      '@detran/inf-rait-org': fileURLToPath(
        new URL('../domains/inf/rait-org/src/index.ts', import.meta.url),
      ),
      '@detran/inf-collection': fileURLToPath(
        new URL('../domains/inf/collection/src/index.ts', import.meta.url),
      ),
      '@detran/inf-rait-integration': fileURLToPath(
        new URL(
          '../domains/inf/rait-integration/src/index.ts',
          import.meta.url,
        ),
      ),
      '@detran/inf-speed': fileURLToPath(
        new URL('../domains/inf/speed/src/index.ts', import.meta.url),
      ),
      '@detran/est-crash': fileURLToPath(
        new URL('../domains/est/crash/src/index.ts', import.meta.url),
      ),
      '@detran/senatran-adapter': fileURLToPath(
        new URL(
          '../../packages/senatran-adapter/src/index.ts',
          import.meta.url,
        ),
      ),
      '@detran/sefaz-adapter': fileURLToPath(
        new URL('../../packages/sefaz-adapter/src/index.ts', import.meta.url),
      ),
      '@detran/portal-complaints': fileURLToPath(
        new URL('../domains/portal/complaints/src/index.ts', import.meta.url),
      ),
      '@detran/portal-identity': fileURLToPath(
        new URL('../domains/portal/identity/src/index.ts', import.meta.url),
      ),
      '@detran/portal-requests': fileURLToPath(
        new URL('../domains/portal/requests/src/index.ts', import.meta.url),
      ),
      '@detran/portal-inbox': fileURLToPath(
        new URL('../domains/portal/inbox/src/index.ts', import.meta.url),
      ),
      '@detran/portal-citizen-service': fileURLToPath(
        new URL(
          '../domains/portal/citizen-service/src/index.ts',
          import.meta.url,
        ),
      ),
      '@detran/portal-projections': fileURLToPath(
        new URL('../domains/portal/projections/src/index.ts', import.meta.url),
      ),
      '@detran/ops-agency': fileURLToPath(
        new URL('../domains/ops/agency/src/index.ts', import.meta.url),
      ),
      '@detran/ops-core': fileURLToPath(
        new URL('../domains/ops/core/src/index.ts', import.meta.url),
      ),
      '@detran/ops-field': fileURLToPath(
        new URL('../domains/ops/field/src/index.ts', import.meta.url),
      ),
      '@detran/ops-snapshots': fileURLToPath(
        new URL('../domains/ops/snapshots/src/index.ts', import.meta.url),
      ),
      '@detran/ops-evidence': fileURLToPath(
        new URL('../domains/ops/evidence/src/index.ts', import.meta.url),
      ),
      '@detran/ops-offline-sync': fileURLToPath(
        new URL('../domains/ops/offline-sync/src/index.ts', import.meta.url),
      ),
      '@detran/ops-parameter': fileURLToPath(
        new URL('../domains/ops/parameter/src/index.ts', import.meta.url),
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
