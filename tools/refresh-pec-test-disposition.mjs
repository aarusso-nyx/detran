import fs from 'node:fs';
import path from 'node:path';

const originArgument = process.argv.indexOf('--origin');
if (originArgument < 0 || !process.argv[originArgument + 1]) {
  throw new Error(
    'usage: node tools/refresh-pec-test-disposition.mjs --origin /path/to/pec',
  );
}
const origin = path.resolve(process.argv[originArgument + 1]);
const output = path.resolve('docs/meta/pec-origin-test-disposition.csv');

function filesBelow(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules')
      return filesBelow(target);
    return entry.isFile() && entry.name.endsWith('.spec.ts') ? [target] : [];
  });
}

const moduleTargets = [
  [
    'admin-process-parameters',
    'ported',
    'backend/app/src/pec-process-parameters.spec.ts',
  ],
  [
    'admin-clinics',
    'ported',
    'backend/domains/ch/clinical-network/tests/unit/professional-lifecycle.service.spec.ts',
  ],
  [
    'admin-professionals',
    'ported',
    'backend/domains/ch/clinical-network/tests/unit/professional-lifecycle.service.spec.ts',
  ],
  [
    'admin-master-data',
    'ported',
    'docs/framework/blueprints; pnpm blueprints:check',
  ],
  [
    'admin-operational-controls',
    'ported',
    'backend/domains/ch/operational-controls',
  ],
  [
    'appointments-scheduling',
    'ported',
    'backend/domains/ch/scheduling/tests/unit/appointment-distribution.service.spec.ts',
  ],
  [
    'archive-runtime',
    'ported',
    'backend/domains/ch/retention/tests/unit/retention-lifecycle.service.spec.ts',
  ],
  [
    'audit-compliance',
    'ported',
    'backend/app/src/pec-audit-query.service.spec.ts; backend/app/tests/integration/audit-persistence.integration.spec.ts',
  ],
  ['billing-billing', 'ported', 'backend/domains/ch/billing'],
  [
    'biometrics-biometric-capture',
    'ported',
    'backend/domains/ch/biometrics/tests/unit',
  ],
  [
    'encounters-clinical-encounter',
    'ported',
    'backend/domains/ch/encounters/tests/unit/encounter-lifecycle.service.spec.ts',
  ],
  [
    'exams-exam-orders',
    'ported',
    'backend/domains/ch/exams/tests/unit/exam-lifecycle.service.spec.ts',
  ],
  [
    'integration-biometric',
    'ported',
    'backend/domains/ch/biometrics/tests/unit',
  ],
  [
    'integration-councils',
    'ported',
    'backend/domains/ch/clinical-network/tests/unit/professional-lifecycle.service.spec.ts',
  ],
  [
    'integration-renach',
    'ported',
    'packages/senatran-adapter/src; backend/app/src/pec-renach-transmission.spec.ts',
  ],
  [
    'patients-patient-record',
    'ported',
    'backend/domains/ch/patients; backend/domains/ch/clinical-reports/tests/unit/candidate-dossier.service.spec.ts',
  ],
  ['process-blocks-workflow', 'ported', 'backend/domains/ch/process-blocks'],
  [
    'reports-bi-reports',
    'ported',
    'backend/domains/ch/clinical-reports/tests/unit; backend/app/tests/in-house/pec-dashboard.in-house.spec.ts',
  ],
  [
    'transmissions-detran-transmissions',
    'ported',
    'backend/app/src/pec-renach-transmission.spec.ts',
  ],
  [
    'documents-document-mgmt',
    'ported',
    'backend/domains/ch/clinical-reports/tests/unit',
  ],
  ['shared', 'ported', 'backend/domains/shared/src'],
  [
    'ports-external-ports',
    'ported',
    'packages/senatran-adapter/src/ports.spec.ts',
  ],
  [
    'integration-sefaz',
    'ported',
    'packages/sefaz-adapter/src; backend/app/src/pec-sefaz.service.spec.ts',
  ],
  [
    'integration-tsa',
    'ported',
    'backend/domains/ch/clinical-reports/tests/unit/report-lifecycle.service.spec.ts',
  ],
  [
    'signature-digital-signature',
    'ported',
    'backend/domains/ch/clinical-reports/tests/unit/report-lifecycle.service.spec.ts',
  ],
  [
    'integration-toxicology',
    'ported',
    'backend/app/src/pec-toxicology-inbound.spec.ts; backend/domains/ch/toxicology/tests/unit',
  ],
  [
    'juntas-medical-board',
    'ported',
    'backend/domains/ch/juntas/tests/unit/junta-lifecycle.service.spec.ts',
  ],
  [
    'admin-users',
    'ported',
    'backend/app/src/pec-user-admin.service.spec.ts; backend/app/src/pec-cognito-admin.service.spec.ts',
  ],
];

function disposition(relative) {
  if (relative.startsWith('tests/generated/devai/')) {
    return [
      'placeholder',
      'superseded',
      '.devai/pin/constitution.md; pnpm check',
      'it.todo-only generated DEVAI placeholder',
    ];
  }
  if (relative.startsWith('tests/generated/')) {
    return [
      'generated-wrapper',
      'superseded',
      'docs/framework/blueprints; pnpm blueprints:check; pnpm contracts:check',
      'origin generated metadata and trace wrapper',
    ];
  }
  if (relative.startsWith('tests/real/')) {
    return [
      'behavioral',
      'ported',
      'backend/app/tests/real; backend/app/tests/in-house/pec-real-environment.in-house.spec.ts; pnpm backend:test:real; pnpm backend:test:in-house',
      'conditional real-environment contract and in-house suite are retained; deployment execution is tracked separately from repository parity',
    ];
  }
  if (relative === 'apps/api/src/stynx-runtime.spec.ts') {
    return [
      'behavioral',
      'ported',
      'backend/app/src/detran-runtime.spec.ts',
      'kernel composition replacement',
    ];
  }
  if (
    relative.startsWith('tests/integration/') ||
    relative.startsWith('tests/e2e/')
  ) {
    return [
      'behavioral',
      'superseded',
      'pnpm backend:test:ci; docs/meta/pec-parity-blockers.json',
      'cross-module origin suite replaced by target tier suites and explicit AC accounting',
    ];
  }
  const match = moduleTargets.find(
    ([module]) =>
      relative.includes(`/domain/${module}/`) ||
      relative.startsWith(`domain/${module}/`),
  );
  if (match)
    return [
      'behavioral',
      match[1],
      match[2],
      'module behavior mapped under DETRAN boundaries',
    ];
  return [
    'behavioral',
    'blocked',
    'docs/meta/pec-porting-report.md#open-boundaries',
    'no safe target mapping',
  ];
}

const csv = (value) => `"${String(value).replaceAll('"', '""')}"`;
const specs = filesBelow(origin)
  .map((file) => path.relative(origin, file).split(path.sep).join('/'))
  .sort();
if (specs.length !== 611)
  throw new Error(`expected 611 origin specs, found ${specs.length}`);
const rows = specs.map((relative) =>
  [relative, ...disposition(relative)].map(csv).join(','),
);
fs.writeFileSync(
  output,
  ['origin_path,kind,disposition,target_evidence,reason', ...rows].join('\n') +
    '\n',
);
console.log(`wrote ${specs.length} rows to ${output}`);
