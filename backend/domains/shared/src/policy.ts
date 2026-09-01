import type { Principal } from '@stynx-nyx/contracts';

import { canonicalRoles, type DetranRole } from './roles.js';

export type DetranPolicyKey = `${string}:${string}:${string}`;

const pec = (resource: string, action: string): DetranPolicyKey =>
  `ch:${resource}:${action}`;
const teat = (
  domain: string,
  resource: string,
  action: string,
): DetranPolicyKey => `${domain}:${resource}:${action}`;

const PEC_RULES: Array<[string, string, readonly DetranRole[]]> = [
  ['master-data', 'read', ['ADMIN', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE']],
  ['master-data', 'write', ['ADMIN', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE']],
  [
    'clinic',
    'read',
    ['ADMIN', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE', 'ADMIN_CLINICA'],
  ],
  ['clinic', 'write', ['ADMIN', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE']],
  ['clinic', 'create', ['ADMIN', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE']],
  ['clinic', 'update', ['ADMIN', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE']],
  [
    'user',
    'read',
    ['ADMIN', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE', 'ADMIN_CLINICA'],
  ],
  [
    'user',
    'write',
    ['ADMIN', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE', 'ADMIN_CLINICA'],
  ],
  [
    'professional',
    'read',
    ['ADMIN', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE', 'ADMIN_CLINICA'],
  ],
  [
    'professional',
    'write',
    ['ADMIN', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE', 'ADMIN_CLINICA'],
  ],
  [
    'professional',
    'create',
    ['ADMIN', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE', 'ADMIN_CLINICA'],
  ],
  [
    'professional',
    'update',
    ['ADMIN', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE', 'ADMIN_CLINICA'],
  ],
  ['biometric-station', 'read', ['SUPERVISOR', 'ADMIN_CLINICA', 'SUPORTE']],
  ['biometric-station', 'create', ['SUPERVISOR', 'ADMIN_CLINICA', 'SUPORTE']],
  ['biometric-station', 'update', ['SUPERVISOR', 'ADMIN_CLINICA', 'SUPORTE']],
  [
    'process-parameter',
    'read',
    ['ADMIN', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE'],
  ],
  [
    'process-parameter',
    'write',
    ['ADMIN', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE'],
  ],
  ['tenant', 'switch', ['ADMIN_CLINICA', 'GESTOR_DETRAN']],
  [
    'event',
    'read',
    ['GESTOR', 'GESTOR_DETRAN', 'SUPORTE', 'RECEPCAO', 'MEDICO', 'PSICOLOGO'],
  ],
  ['renach', 'process', ['RECEPCAO', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE']],
  ['renach', 'read', ['RECEPCAO', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE']],
  ['tsa', 'read', ['GESTOR', 'SUPERVISOR', 'SUPORTE']],
  ['tsa', 'write', ['GESTOR', 'SUPERVISOR', 'SUPORTE']],
  ['tox', 'read', ['GESTOR', 'GESTOR_DETRAN', 'SUPORTE']],
  ['tox', 'write', ['GESTOR', 'GESTOR_DETRAN', 'SUPORTE']],
  ['sefaz', 'validate', ['GESTOR', 'GESTOR_DETRAN', 'SUPERVISOR', 'SUPORTE']],
  ['council', 'read', ['GESTOR', 'SUPERVISOR', 'SUPORTE']],
  ['council', 'write', ['GESTOR', 'SUPERVISOR', 'SUPORTE']],
  ['integration-biometric', 'read', ['SUPERVISOR', 'ADMIN_CLINICA', 'SUPORTE']],
  [
    'integration-biometric',
    'write',
    ['SUPERVISOR', 'ADMIN_CLINICA', 'SUPORTE'],
  ],
  [
    'patient',
    'read',
    [
      'RECEPCAO',
      'MEDICO',
      'PSICOLOGO',
      'SUPERVISOR',
      'AUDITOR',
      'GESTOR',
      'GESTOR_DETRAN',
    ],
  ],
  [
    'patient',
    'list',
    [
      'RECEPCAO',
      'MEDICO',
      'PSICOLOGO',
      'SUPERVISOR',
      'AUDITOR',
      'GESTOR',
      'GESTOR_DETRAN',
    ],
  ],
  ['patient', 'create', ['RECEPCAO', 'ADMIN_CLINICA']],
  ['patient', 'update', ['RECEPCAO', 'ADMIN_CLINICA']],
  [
    'encounter',
    'read',
    [
      'RECEPCAO',
      'MEDICO',
      'PSICOLOGO',
      'SUPERVISOR',
      'AUDITOR',
      'GESTOR',
      'GESTOR_DETRAN',
    ],
  ],
  [
    'encounter',
    'list',
    [
      'RECEPCAO',
      'MEDICO',
      'PSICOLOGO',
      'SUPERVISOR',
      'AUDITOR',
      'GESTOR',
      'GESTOR_DETRAN',
    ],
  ],
  ['encounter', 'create', ['RECEPCAO']],
  ['encounter', 'update', ['RECEPCAO']],
  ['encounter', 'checkin', ['RECEPCAO', 'TECNICO_BIOMETRIA']],
  ['encounter', 'cancel', ['RECEPCAO', 'SUPERVISOR', 'GESTOR']],
  ['encounter', 'sign', ['MEDICO', 'PSICOLOGO']],
  ['encounter', 'close', ['MEDICO', 'PSICOLOGO']],
  [
    'episode-export',
    'read',
    ['MEDICO', 'PSICOLOGO', 'SUPERVISOR', 'AUDITOR', 'GESTOR', 'GESTOR_DETRAN'],
  ],
  [
    'exam',
    'read',
    [
      'RECEPCAO',
      'MEDICO',
      'PSICOLOGO',
      'SUPERVISOR',
      'AUDITOR',
      'GESTOR',
      'GESTOR_DETRAN',
    ],
  ],
  [
    'exam',
    'list',
    [
      'RECEPCAO',
      'MEDICO',
      'PSICOLOGO',
      'SUPERVISOR',
      'AUDITOR',
      'GESTOR',
      'GESTOR_DETRAN',
    ],
  ],
  ['exam', 'create', ['MEDICO', 'PSICOLOGO', 'RECEPCAO']],
  ['exam', 'update', ['MEDICO', 'PSICOLOGO']],
  ['exam-result', 'write', ['MEDICO', 'PSICOLOGO']],
  [
    'psych-instrument',
    'read',
    ['PSICOLOGO', 'SUPERVISOR', 'AUDITOR', 'GESTOR', 'GESTOR_DETRAN'],
  ],
  ['psych-instrument', 'create', ['SUPERVISOR', 'GESTOR', 'GESTOR_DETRAN']],
  ['psych-instrument', 'update', ['SUPERVISOR', 'GESTOR', 'GESTOR_DETRAN']],
  [
    'biometric',
    'capture',
    ['RECEPCAO', 'TECNICO_BIOMETRIA', 'MEDICO', 'PSICOLOGO'],
  ],
  [
    'biometric',
    'read',
    [
      'RECEPCAO',
      'TECNICO_BIOMETRIA',
      'SUPERVISOR',
      'AUDITOR',
      'GESTOR',
      'MEDICO',
      'PSICOLOGO',
      'GESTOR_DETRAN',
      'JUNTA',
      'CETRAN',
      'DPO',
      'SUPORTE',
    ],
  ],
  [
    'biometric-exception',
    'read',
    ['TECNICO_BIOMETRIA', 'RECEPCAO', 'SUPERVISOR', 'AUDITOR', 'GESTOR'],
  ],
  [
    'biometric-exception',
    'request',
    ['TECNICO_BIOMETRIA', 'RECEPCAO', 'SUPERVISOR'],
  ],
  ['biometric-exception', 'approve', ['SUPERVISOR']],
  ['signature', 'apply', ['MEDICO', 'PSICOLOGO']],
  [
    'signature',
    'read',
    [
      'RECEPCAO',
      'MEDICO',
      'PSICOLOGO',
      'SUPERVISOR',
      'AUDITOR',
      'GESTOR',
      'GESTOR_DETRAN',
    ],
  ],
  [
    'appointment',
    'read',
    ['RECEPCAO', 'ADMIN_CLINICA', 'MEDICO', 'PSICOLOGO', 'SUPERVISOR'],
  ],
  [
    'appointment',
    'list',
    ['RECEPCAO', 'ADMIN_CLINICA', 'MEDICO', 'PSICOLOGO', 'SUPERVISOR'],
  ],
  ['appointment', 'create', ['RECEPCAO', 'ADMIN_CLINICA']],
  ['appointment', 'update', ['RECEPCAO', 'ADMIN_CLINICA']],
  ['appointment', 'delete', ['RECEPCAO', 'ADMIN_CLINICA']],
  ['appointment', 'reroll', ['RECEPCAO', 'ADMIN_CLINICA', 'GESTOR']],
  ['appointment', 'no-show', ['RECEPCAO', 'ADMIN_CLINICA']],
  ['appointment', 'cancel', ['RECEPCAO', 'ADMIN_CLINICA']],
  [
    'schedule',
    'read',
    ['RECEPCAO', 'ADMIN_CLINICA', 'GESTOR', 'GESTOR_DETRAN'],
  ],
  ['schedule', 'create', ['ADMIN_CLINICA', 'GESTOR', 'GESTOR_DETRAN']],
  ['schedule', 'update', ['ADMIN_CLINICA', 'GESTOR', 'GESTOR_DETRAN']],
  [
    'appointment-assignment',
    'read',
    ['AUDITOR', 'GESTOR', 'GESTOR_DETRAN', 'SUPERVISOR'],
  ],
  [
    'report',
    'read',
    ['MEDICO', 'PSICOLOGO', 'SUPERVISOR', 'AUDITOR', 'GESTOR', 'GESTOR_DETRAN'],
  ],
  ['report', 'create', ['MEDICO', 'PSICOLOGO']],
  ['report', 'addendum-request', ['MEDICO', 'PSICOLOGO', 'SUPERVISOR']],
  ['report', 'addendum-approve-supervisor', ['SUPERVISOR']],
  ['report', 'addendum-approve-clinic-admin', ['ADMIN_CLINICA']],
  ['report', 'addendum-sign', ['MEDICO', 'PSICOLOGO']],
  ['candidate-dossier', 'read', ['CANDIDATO']],
  ['candidate-dossier', 'feedback-request', ['CANDIDATO']],
  ['candidate-dossier', 'feedback-schedule', ['PSICOLOGO']],
  ['candidate-dossier', 'feedback-complete', ['PSICOLOGO']],
  [
    'report-addendum',
    'read',
    ['MEDICO', 'PSICOLOGO', 'SUPERVISOR', 'AUDITOR', 'GESTOR', 'GESTOR_DETRAN'],
  ],
  [
    'report-addendum-approval',
    'read',
    ['SUPERVISOR', 'ADMIN_CLINICA', 'AUDITOR', 'GESTOR', 'GESTOR_DETRAN'],
  ],
  [
    'registration-block-notice',
    'read',
    ['MEDICO', 'PSICOLOGO', 'AUDITOR', 'GESTOR_DETRAN'],
  ],
  [
    'feedback-request',
    'read',
    ['PSICOLOGO', 'SUPERVISOR', 'AUDITOR', 'GESTOR_DETRAN'],
  ],
  [
    'document',
    'read',
    [
      'RECEPCAO',
      'MEDICO',
      'PSICOLOGO',
      'SUPERVISOR',
      'AUDITOR',
      'GESTOR',
      'GESTOR_DETRAN',
    ],
  ],
  ['document', 'create', ['RECEPCAO', 'MEDICO', 'PSICOLOGO']],
  ['document', 'update', ['RECEPCAO', 'MEDICO', 'PSICOLOGO']],
  ['document', 'delete', ['RECEPCAO', 'MEDICO', 'PSICOLOGO']],
  [
    'process-block',
    'read',
    [
      'RECEPCAO',
      'MEDICO',
      'PSICOLOGO',
      'SUPERVISOR',
      'AUDITOR',
      'GESTOR',
      'GESTOR_DETRAN',
    ],
  ],
  ['process-block', 'create', ['SUPERVISOR', 'GESTOR_DETRAN']],
  ['process-block', 'update', ['SUPERVISOR', 'GESTOR_DETRAN']],
  ['junta', 'create', ['AUDITOR', 'GESTOR', 'GESTOR_DETRAN']],
  ['junta', 'decide', ['JUNTA', 'CETRAN', 'GESTOR_DETRAN']],
  ['junta', 'read', ['AUDITOR', 'GESTOR', 'GESTOR_DETRAN', 'SUPERVISOR']],
  ['audit', 'read', ['AUDITOR', 'GESTOR', 'GESTOR_DETRAN', 'SUPERVISOR']],
  ['restriction', 'read', ['MEDICO', 'PSICOLOGO', 'SUPERVISOR', 'AUDITOR']],
  ['restriction', 'create', ['MEDICO', 'PSICOLOGO', 'SUPERVISOR']],
  ['restriction', 'update', ['MEDICO', 'PSICOLOGO', 'SUPERVISOR']],
  ['restriction', 'delete', ['MEDICO', 'PSICOLOGO', 'SUPERVISOR']],
  ['retention', 'read', ['DPO', 'AUDITOR', 'GESTOR_DETRAN']],
  ['retention', 'assess', ['DPO', 'GESTOR_DETRAN']],
  ['retention', 'hold', ['DPO', 'GESTOR_DETRAN']],
  ['retention', 'propose', ['DPO', 'GESTOR_DETRAN']],
  ['retention', 'review', ['DPO']],
  ['transmission', 'read', ['AUDITOR', 'GESTOR', 'GESTOR_DETRAN']],
  ['transmission', 'dispatch', ['GESTOR', 'GESTOR_DETRAN']],
  [
    'transmission',
    'enqueue',
    ['MEDICO', 'PSICOLOGO', 'GESTOR', 'GESTOR_DETRAN'],
  ],
  ['session-control', 'manage', ['ADMIN_CLINICA', 'GESTOR_DETRAN', 'SUPORTE']],
  [
    'telehealth-session',
    'create',
    ['MEDICO', 'PSICOLOGO', 'RECEPCAO', 'SUPERVISOR'],
  ],
  [
    'telehealth-session',
    'read',
    ['MEDICO', 'PSICOLOGO', 'RECEPCAO', 'SUPERVISOR'],
  ],
  [
    'telehealth-session',
    'update',
    ['MEDICO', 'PSICOLOGO', 'RECEPCAO', 'SUPERVISOR'],
  ],
  [
    'billing-event',
    'read',
    ['ADMIN_CLINICA', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE'],
  ],
  [
    'billing-event',
    'write',
    ['ADMIN_CLINICA', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE'],
  ],
  ['invoice', 'read', ['ADMIN_CLINICA', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE']],
  ['invoice', 'write', ['ADMIN_CLINICA', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE']],
  ['inconsistency', 'read', ['AUDITOR', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE']],
  [
    'inconsistency',
    'resolve',
    ['AUDITOR', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE'],
  ],
  [
    'complaint',
    'create',
    ['CANDIDATO', 'DPO', 'AUDITOR', 'GESTOR_DETRAN', 'SUPORTE'],
  ],
  [
    'complaint',
    'read',
    ['CANDIDATO', 'DPO', 'AUDITOR', 'GESTOR_DETRAN', 'SUPORTE'],
  ],
  [
    'clinical-control',
    'read',
    ['MEDICO', 'PSICOLOGO', 'SUPERVISOR', 'AUDITOR'],
  ],
  [
    'clinical-control',
    'write',
    ['MEDICO', 'PSICOLOGO', 'SUPERVISOR', 'AUDITOR'],
  ],
  [
    'operational-control',
    'read',
    ['ADMIN_CLINICA', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE'],
  ],
  [
    'operational-control',
    'write',
    ['ADMIN_CLINICA', 'GESTOR', 'GESTOR_DETRAN', 'SUPORTE'],
  ],
];

const TEAT_RULES: Array<[string, string, string, readonly DetranRole[]]> = [
  ['inf', 'ait', 'finalize', ['field-agent']],
  ['inf', 'ait', 'science', ['field-agent']],
  ['inf', 'ait', 'queue-transmission', ['field-agent', 'integration-operator']],
  ['inf', 'ait', 'receive-protocol', ['integration-operator']],
  [
    'inf',
    'ait',
    'request-correction',
    ['processing-operator', 'traffic-authority'],
  ],
  ['inf', 'ait', 'approve-correction', ['traffic-authority']],
  ['inf', 'ait', 'accept', ['traffic-authority']],
  ['inf', 'ait', 'reject', ['traffic-authority']],
  [
    'ops',
    'evidence',
    'initiate-upload',
    ['field-agent', 'processing-operator'],
  ],
  [
    'ops',
    'evidence',
    'complete-upload',
    ['field-agent', 'processing-operator'],
  ],
  [
    'ops',
    'evidence',
    'validate',
    ['processing-operator', 'AUDITOR', 'technical-admin'],
  ],
  ['ops', 'evidence', 'link', ['field-agent', 'processing-operator']],
  [
    'ops',
    'evidence',
    'add-custody-event',
    ['field-agent', 'processing-operator', 'AUDITOR', 'technical-admin'],
  ],
  [
    'ops',
    'probative-package',
    'generate',
    ['processing-operator', 'AUDITOR', 'technical-admin'],
  ],
  ['ops', 'offline-numbering-reservation', 'reserve', ['field-agent']],
  [
    'ops',
    'offline-numbering-reservation',
    'cancel',
    ['field-agent', 'field-supervisor'],
  ],
  ['ops', 'numbering-reservation', 'reserve', ['field-agent']],
  [
    'ops',
    'numbering-reservation',
    'cancel',
    ['field-agent', 'field-supervisor'],
  ],
  ['ops', 'sync-batch', 'submit', ['field-agent']],
  [
    'ops',
    'sync-conflict',
    'resolve',
    ['field-supervisor', 'processing-operator'],
  ],
  [
    'inf',
    'administrative-measure',
    'start',
    ['field-agent', 'processing-operator'],
  ],
  [
    'inf',
    'administrative-measure',
    'apply-term',
    ['field-agent', 'processing-operator'],
  ],
  [
    'inf',
    'administrative-measure',
    'register-retention',
    ['field-agent', 'processing-operator'],
  ],
  [
    'inf',
    'administrative-measure',
    'register-removal',
    ['field-agent', 'processing-operator'],
  ],
  [
    'inf',
    'administrative-measure',
    'inventory-vehicle',
    ['field-agent', 'processing-operator'],
  ],
  [
    'inf',
    'administrative-measure',
    'release',
    ['field-supervisor', 'traffic-authority'],
  ],
  ['inf', 'administrative-measure', 'conclude', ['traffic-authority']],
  ['inf', 'administrative-measure', 'cancel', ['traffic-authority']],
  ['inf', 'alcohol-procedure', 'start', ['field-agent']],
  ['inf', 'alcohol-procedure', 'record-test', ['field-agent']],
  ['inf', 'alcohol-procedure', 'record-refusal', ['field-agent']],
  ['inf', 'alcohol-procedure', 'record-psychomotor-signs', ['field-agent']],
  ['inf', 'alcohol-procedure', 'forward', ['field-agent']],
  ['inf', 'alcohol-procedure', 'close', ['field-agent', 'field-supervisor']],
  ['est', 'crash-record', 'start', ['field-agent']],
  ['est', 'crash-record', 'add-vehicle', ['field-agent']],
  ['est', 'crash-record', 'add-person', ['field-agent']],
  ['est', 'crash-record', 'add-victim', ['field-agent']],
  ['est', 'crash-record', 'attach-sketch', ['field-agent']],
  [
    'est',
    'crash-record',
    'validate',
    ['field-supervisor', 'processing-operator'],
  ],
  ['est', 'crash-record', 'close', ['field-supervisor', 'traffic-authority']],
  [
    'integration',
    'integration-batch',
    'add-item',
    ['integration-operator', 'technical-admin'],
  ],
  [
    'integration',
    'integration-batch',
    'submit',
    ['integration-operator', 'technical-admin'],
  ],
  [
    'integration',
    'integration-batch',
    'close',
    ['integration-operator', 'technical-admin'],
  ],
  [
    'integration',
    'integration-item',
    'receive-result',
    ['integration-operator', 'technical-admin'],
  ],
  [
    'integration',
    'integration-item',
    'retry',
    ['integration-operator', 'technical-admin'],
  ],
  ['shared', 'domain-audit-event', 'register', ['AUDITOR', 'technical-admin']],
  ['shared', 'security-incident', 'close', ['AUDITOR', 'technical-admin']],
  ['shared', 'data-export', 'complete', ['AUDITOR', 'technical-admin']],
  [
    'dashboard',
    'generated-report',
    'request',
    ['bi-analyst', 'agency-admin', 'technical-admin'],
  ],
  [
    'dashboard',
    'generated-report',
    'complete',
    ['bi-analyst', 'technical-admin'],
  ],
  ['dashboard', 'generated-report', 'fail', ['bi-analyst', 'technical-admin']],
  [
    'dashboard',
    'indicator-config',
    'publish',
    ['bi-analyst', 'agency-admin', 'technical-admin'],
  ],
  [
    'dashboard',
    'bi-panel',
    'publish',
    ['bi-analyst', 'agency-admin', 'technical-admin'],
  ],
  ['inf', 'normative-catalog', 'publish', ['agency-admin', 'technical-admin']],
  ['inf', 'normative-catalog', 'retire', ['agency-admin', 'technical-admin']],
  [
    'inf',
    'mobile-normative-package',
    'publish',
    ['agency-admin', 'technical-admin'],
  ],
  [
    'inf',
    'mobile-normative-package',
    'retire',
    ['agency-admin', 'technical-admin'],
  ],
  [
    'inf',
    'mobile-normative-package',
    'validate',
    ['field-agent', 'field-supervisor', 'agency-admin', 'technical-admin'],
  ],
];

/**
 * TEAT_COMMAND_RULES covered state-changing custody commands above. These are
 * the ported CRUD surfaces whose TEAT fallback classified as field-legal or
 * governance work; spelling them out keeps the unified matrix authoritative.
 */
const OPS_SURFACE_RULES: Array<[string, string, readonly DetranRole[]]> = [
  [
    'agent-profile',
    'read',
    [
      'field-agent',
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'technical-admin',
    ],
  ],
  [
    'agent-profile',
    'create',
    [
      'field-agent',
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'technical-admin',
    ],
  ],
  [
    'operational-device',
    'read',
    [
      'field-agent',
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'technical-admin',
    ],
  ],
  [
    'operational-device',
    'create',
    [
      'field-agent',
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'technical-admin',
    ],
  ],
  [
    'team',
    'read',
    [
      'field-agent',
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'technical-admin',
    ],
  ],
  [
    'team',
    'create',
    [
      'field-agent',
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'technical-admin',
    ],
  ],
  [
    'shift',
    'read',
    [
      'field-agent',
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'technical-admin',
    ],
  ],
  [
    'shift',
    'create',
    [
      'field-agent',
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'technical-admin',
    ],
  ],
  ['homologation', 'create', ['agency-admin', 'technical-admin']],
  ['application-version', 'create', ['agency-admin', 'technical-admin']],
  [
    'snapshot-person',
    'read',
    [
      'field-agent',
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'technical-admin',
    ],
  ],
  [
    'snapshot-person',
    'create',
    [
      'field-agent',
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'technical-admin',
    ],
  ],
  [
    'snapshot-vehicle',
    'read',
    [
      'field-agent',
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'technical-admin',
    ],
  ],
  [
    'snapshot-vehicle',
    'create',
    [
      'field-agent',
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'technical-admin',
    ],
  ],
  [
    'external-query',
    'create',
    [
      'field-agent',
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'technical-admin',
    ],
  ],
  [
    'evidence',
    'read',
    [
      'field-agent',
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'AUDITOR',
      'technical-admin',
    ],
  ],
];

const INF_READ_ROLES: readonly DetranRole[] = [
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
  'technical-admin',
  'AUDITOR',
  'bi-analyst',
  'integration-operator',
];
const INF_FIELD_LEGAL_ROLES: readonly DetranRole[] = [
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'technical-admin',
];
const INF_ADMIN_ROLES: readonly DetranRole[] = [
  'agency-admin',
  'technical-admin',
];
const INF_ADMIN_RESOURCES = new Set([
  'normative-catalog',
  'framing',
  'validation-rule',
  'agency-parameter',
  'document-template',
  'mobile-normative-package',
  'measure-type',
  'tow-provider',
  'yard',
]);
const INF_RESOURCES = [
  'ait',
  'ait-vehicle',
  'ait-person',
  'ait-status-history',
  'ait-correction',
  'ait-signature',
  'ait-print-event',
  'normative-catalog',
  'framing',
  'validation-rule',
  'agency-parameter',
  'document-template',
  'mobile-normative-package',
  'measure-type',
  'administrative-measure',
  'administrative-term',
  'measure-retention',
  'measure-removal',
  'vehicle-inventory',
  'tow-provider',
  'yard',
  'measure-status-history',
  'alcohol-procedure',
  'breathalyzer',
  'alcohol-test',
  'alcohol-refusal',
  'psychomotor-sign',
  'alcohol-forwarding',
] as const;
const INF_SURFACE_RULES: Array<[string, string, readonly DetranRole[]]> =
  INF_RESOURCES.flatMap((resource) => [
    [resource, 'read', INF_READ_ROLES],
    [
      resource,
      'create',
      INF_ADMIN_RESOURCES.has(resource)
        ? INF_ADMIN_ROLES
        : INF_FIELD_LEGAL_ROLES,
    ],
    [
      resource,
      'update',
      INF_ADMIN_RESOURCES.has(resource)
        ? INF_ADMIN_ROLES
        : INF_FIELD_LEGAL_ROLES,
    ],
    [resource, 'delete', ['technical-admin']],
  ]);

export const DETRAN_POLICY_MATRIX: Readonly<
  Record<DetranPolicyKey, readonly DetranRole[]>
> = Object.freeze(
  Object.fromEntries([
    ...PEC_RULES.map(([resource, action, roles]) => [
      pec(resource, action),
      roles,
    ]),
    ...TEAT_RULES.map(([domain, resource, action, roles]) => [
      teat(domain, resource, action),
      roles,
    ]),
    ...OPS_SURFACE_RULES.map(([resource, action, roles]) => [
      teat('ops', resource, action),
      roles,
    ]),
    ...INF_SURFACE_RULES.map(([resource, action, roles]) => [
      teat('inf', resource, action),
      roles,
    ]),
    ['portal:appeal:create', ['CIDADAO']],
    ['portal:appeal:read-own', ['CIDADAO']],
  ]) as Record<DetranPolicyKey, readonly DetranRole[]>,
);

const GLOBAL_ADMIN_ROLES = new Set<DetranRole>([
  'ADMIN',
  'GESTOR_DETRAN',
  'SUPORTE',
  'technical-admin',
]);

export function policyKey(resource: string, action: string): DetranPolicyKey {
  const segments = resource.split(':');
  if (
    segments.length !== 2 ||
    segments.some((segment) => !segment.trim()) ||
    !action.trim()
  ) {
    throw new Error(
      `Policy key must use domain:resource:action; received ${resource}:${action}`,
    );
  }
  return `${segments[0]}:${segments[1]}:${action}`;
}

export function permissionsForRoles(roles: readonly string[]): string[] {
  const canonical = canonicalRoles(roles);
  if (canonical.some((role) => GLOBAL_ADMIN_ROLES.has(role))) return ['*'];
  const permissions = new Set(canonical.map((role) => `role:${role}`));
  for (const [permission, allowed] of Object.entries(DETRAN_POLICY_MATRIX)) {
    if (allowed.some((role) => canonical.includes(role)))
      permissions.add(permission);
  }
  return [...permissions].sort();
}

export function isDetranActionAllowed(
  principal: Pick<Principal, 'roles' | 'permissions'> | undefined,
  resource: string | undefined,
  action: string | undefined,
): boolean {
  if (!principal) return false;
  if (!resource || !action) return false;
  const key = policyKey(resource, action);
  if (
    key === 'ch:retention:review' &&
    !canonicalRoles(principal.roles).includes('DPO')
  ) {
    return false;
  }
  if (
    principal.permissions.includes('*') ||
    principal.permissions.includes(key) ||
    principal.permissions.includes(`${resource}:*`)
  ) {
    return true;
  }
  const roles = canonicalRoles(principal.roles);
  if (roles.some((role) => GLOBAL_ADMIN_ROLES.has(role))) return true;
  const allowed = DETRAN_POLICY_MATRIX[key];
  return Boolean(allowed?.some((role) => roles.includes(role)));
}
