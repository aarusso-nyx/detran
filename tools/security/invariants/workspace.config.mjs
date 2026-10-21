import { fileURLToPath } from 'node:url';

// Static workspace source aliases; no ambient configuration or test selection.
export const aliases = {
  '@detran/ch-billing': fileURLToPath(
    new URL(
      '../../../backend/domains/ch/billing/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ch-biometrics': fileURLToPath(
    new URL(
      '../../../backend/domains/ch/biometrics/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ch-clinical-controls': fileURLToPath(
    new URL(
      '../../../backend/domains/ch/clinical-controls/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ch-clinical-network': fileURLToPath(
    new URL(
      '../../../backend/domains/ch/clinical-network/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ch-clinical-reports': fileURLToPath(
    new URL(
      '../../../backend/domains/ch/clinical-reports/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ch-encounters': fileURLToPath(
    new URL(
      '../../../backend/domains/ch/encounters/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ch-exams': fileURLToPath(
    new URL('../../../backend/domains/ch/exams/src/index.ts', import.meta.url),
  ),
  '@detran/ch-inconsistencies': fileURLToPath(
    new URL(
      '../../../backend/domains/ch/inconsistencies/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ch-juntas': fileURLToPath(
    new URL('../../../backend/domains/ch/juntas/src/index.ts', import.meta.url),
  ),
  '@detran/ch-operational-controls': fileURLToPath(
    new URL(
      '../../../backend/domains/ch/operational-controls/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ch-patients': fileURLToPath(
    new URL(
      '../../../backend/domains/ch/patients/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ch-process-blocks': fileURLToPath(
    new URL(
      '../../../backend/domains/ch/process-blocks/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ch-restrictions': fileURLToPath(
    new URL(
      '../../../backend/domains/ch/restrictions/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ch-retention': fileURLToPath(
    new URL(
      '../../../backend/domains/ch/retention/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ch-scheduling': fileURLToPath(
    new URL(
      '../../../backend/domains/ch/scheduling/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ch-telehealth': fileURLToPath(
    new URL(
      '../../../backend/domains/ch/telehealth/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ch-toxicology': fileURLToPath(
    new URL(
      '../../../backend/domains/ch/toxicology/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/dashboard-crashes': fileURLToPath(
    new URL(
      '../../../backend/domains/dashboard/crashes/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/dashboard-monitor': fileURLToPath(
    new URL(
      '../../../backend/domains/dashboard/monitor/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/est-crash': fileURLToPath(
    new URL('../../../backend/domains/est/crash/src/index.ts', import.meta.url),
  ),
  '@detran/inf-ait': fileURLToPath(
    new URL('../../../backend/domains/inf/ait/src/index.ts', import.meta.url),
  ),
  '@detran/inf-alcohol': fileURLToPath(
    new URL(
      '../../../backend/domains/inf/alcohol/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/inf-collection': fileURLToPath(
    new URL(
      '../../../backend/domains/inf/collection/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/inf-deadlines': fileURLToPath(
    new URL(
      '../../../backend/domains/inf/deadlines/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/inf-infraction': fileURLToPath(
    new URL(
      '../../../backend/domains/inf/infraction/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/inf-measures': fileURLToPath(
    new URL(
      '../../../backend/domains/inf/measures/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/inf-normative': fileURLToPath(
    new URL(
      '../../../backend/domains/inf/normative/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/inf-notification': fileURLToPath(
    new URL(
      '../../../backend/domains/inf/notification/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/inf-rait-case': fileURLToPath(
    new URL(
      '../../../backend/domains/inf/rait-case/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/inf-rait-integration': fileURLToPath(
    new URL(
      '../../../backend/domains/inf/rait-integration/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/inf-rait-org': fileURLToPath(
    new URL(
      '../../../backend/domains/inf/rait-org/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/inf-rait-session': fileURLToPath(
    new URL(
      '../../../backend/domains/inf/rait-session/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/inf-rait-worklist': fileURLToPath(
    new URL(
      '../../../backend/domains/inf/rait-worklist/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/inf-speed': fileURLToPath(
    new URL('../../../backend/domains/inf/speed/src/index.ts', import.meta.url),
  ),
  '@detran/integration-renaest-mirror': fileURLToPath(
    new URL(
      '../../../backend/domains/integration/renaest-mirror/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ops-agency': fileURLToPath(
    new URL(
      '../../../backend/domains/ops/agency/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ops-core': fileURLToPath(
    new URL('../../../backend/domains/ops/core/src/index.ts', import.meta.url),
  ),
  '@detran/ops-evidence': fileURLToPath(
    new URL(
      '../../../backend/domains/ops/evidence/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ops-example': fileURLToPath(
    new URL(
      '../../../backend/domains/ops/example/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ops-field': fileURLToPath(
    new URL('../../../backend/domains/ops/field/src/index.ts', import.meta.url),
  ),
  '@detran/ops-offline-sync': fileURLToPath(
    new URL(
      '../../../backend/domains/ops/offline-sync/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ops-parameter': fileURLToPath(
    new URL(
      '../../../backend/domains/ops/parameter/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ops-provisioning': fileURLToPath(
    new URL(
      '../../../backend/domains/ops/provisioning/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/ops-snapshots': fileURLToPath(
    new URL(
      '../../../backend/domains/ops/snapshots/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/portal-citizen-service': fileURLToPath(
    new URL(
      '../../../backend/domains/portal/citizen-service/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/portal-complaints': fileURLToPath(
    new URL(
      '../../../backend/domains/portal/complaints/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/portal-identity': fileURLToPath(
    new URL(
      '../../../backend/domains/portal/identity/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/portal-inbox': fileURLToPath(
    new URL(
      '../../../backend/domains/portal/inbox/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/portal-projections': fileURLToPath(
    new URL(
      '../../../backend/domains/portal/projections/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/portal-requests': fileURLToPath(
    new URL(
      '../../../backend/domains/portal/requests/src/index.ts',
      import.meta.url,
    ),
  ),
  '@detran/shared': fileURLToPath(
    new URL('../../../backend/domains/shared/src/index.ts', import.meta.url),
  ),
  '@detran/api-clients': fileURLToPath(
    new URL('../../../packages/api-clients/src/index.ts', import.meta.url),
  ),
  '@detran/sefaz-adapter': fileURLToPath(
    new URL('../../../packages/sefaz-adapter/src/index.ts', import.meta.url),
  ),
  '@detran/senatran-adapter': fileURLToPath(
    new URL('../../../packages/senatran-adapter/src/index.ts', import.meta.url),
  ),
  '@detran/ui': fileURLToPath(
    new URL('../../../packages/ui/src/index.ts', import.meta.url),
  ),
};
