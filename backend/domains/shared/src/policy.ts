import type { Principal } from '@stynx-nyx/contracts';

import { DETRAN_ROLES, canonicalRoles, type DetranRole } from './roles.js';

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
  ['junta', 'designate', ['GESTOR_DETRAN']],
  ['junta', 'designate-special', ['CETRAN', 'GESTOR_DETRAN']],
  ['junta', 'decide', ['JUNTA', 'CETRAN']],
  ['junta', 'appeal', ['AUDITOR', 'GESTOR', 'GESTOR_DETRAN']],
  ['junta', 'forward', ['GESTOR_DETRAN']],
  [
    'junta',
    'read',
    ['AUDITOR', 'GESTOR', 'GESTOR_DETRAN', 'SUPERVISOR', 'JUNTA', 'CETRAN'],
  ],
  [
    'junta',
    'list',
    ['AUDITOR', 'GESTOR', 'GESTOR_DETRAN', 'SUPERVISOR', 'JUNTA', 'CETRAN'],
  ],
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
  [
    'portal',
    'complaint',
    'create',
    ['CANDIDATO', 'DPO', 'AUDITOR', 'GESTOR_DETRAN', 'SUPORTE'],
  ],
  [
    'portal',
    'complaint',
    'read',
    ['CANDIDATO', 'DPO', 'AUDITOR', 'GESTOR_DETRAN', 'SUPORTE'],
  ],
  [
    'portal',
    'complaint',
    'update',
    ['DPO', 'AUDITOR', 'GESTOR_DETRAN', 'SUPORTE'],
  ],
  ['platform', 'audit', 'read', ['AUDITOR', 'GESTOR_DETRAN', 'SUPORTE']],
  ['platform', 'audit', 'export', ['AUDITOR', 'GESTOR_DETRAN', 'SUPORTE']],
  ['platform', 'user', 'read', ['ADMIN_CLINICA', 'GESTOR_DETRAN', 'SUPORTE']],
  ['platform', 'user', 'create', ['ADMIN_CLINICA', 'GESTOR_DETRAN', 'SUPORTE']],
  ['platform', 'user', 'update', ['ADMIN_CLINICA', 'GESTOR_DETRAN', 'SUPORTE']],
  ['platform', 'user', 'delete', ['ADMIN_CLINICA', 'GESTOR_DETRAN', 'SUPORTE']],
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
  [
    'est',
    'crash-record',
    'attach-sketch',
    ['field-agent', 'processing-operator'],
  ],
  [
    'est',
    'crash-record',
    'validate',
    ['processing-operator', 'traffic-authority'],
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
  ['parameter', 'read', ['agency-admin']],
  ['parameter', 'update', ['agency-admin']],
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
  [
    'homologation',
    'read',
    [
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'agency-admin',
      'technical-admin',
      'integration-operator',
      'AUDITOR',
    ],
  ],
  ['homologation', 'create', ['agency-admin', 'technical-admin']],
  [
    'application-version',
    'read',
    [
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'agency-admin',
      'technical-admin',
      'integration-operator',
      'AUDITOR',
    ],
  ],
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
  'speed-meter',
  'speed-meter-certificate',
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
  'speed-meter',
  'speed-meter-certificate',
  'speed-measurement',
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

/**
 * RAIT (Recursos Administrativos de Infrações de Trânsito) — generated CRUD
 * surfaces of BP-INF-RAIT-CASE-001, BP-INF-RAIT-WORKLIST-001 and
 * BP-INF-RAIT-SESSION-001, plus the command surface of
 * docs/framework/arch/rait-web-frontend.md §7. Roles: shared/actors.md
 * §Papéis granulares RAIT (Owner, 2026-09-12).
 */
const RAIT_STAFF_ROLES: readonly DetranRole[] = [
  'rait-analyst',
  'rait-coordinator',
  'rait-secretary',
  'rait-signing-authority',
  'rait-central-authority',
  'rait-rapporteur',
  'rait-chair',
  'rait-manager',
  'rait-hr',
  'rait-finance',
];
const RAIT_READ_ROLES: readonly DetranRole[] = [
  ...RAIT_STAFF_ROLES,
  'agency-admin',
  'AUDITOR',
  'bi-analyst',
  'integration-operator',
  'traffic-authority',
];
const RAIT_CASE_WRITE_ROLES: readonly DetranRole[] = [
  'rait-analyst',
  'rait-secretary',
  'rait-coordinator',
  'rait-rapporteur',
  'rait-chair',
];
const RAIT_SURFACE_WRITE_ROLES: Readonly<
  Record<string, readonly DetranRole[]>
> = {
  'rait-case': RAIT_CASE_WRITE_ROLES,
  'rait-party': ['rait-secretary', 'rait-analyst'],
  'rait-document': RAIT_CASE_WRITE_ROLES,
  'rait-admissibility': ['rait-analyst', 'rait-secretary'],
  'rait-deadline': ['agency-admin'],
  'rait-inquiry': ['rait-analyst', 'rait-rapporteur'],
  'rait-decision': ['rait-signing-authority', 'rait-chair'],
  'rait-communication': ['rait-secretary'],
  'rait-case-event': ['agency-admin'],
  'rait-pool': ['rait-coordinator', 'agency-admin'],
  'rait-pool-member': ['rait-hr', 'rait-chair', 'rait-coordinator'],
  'rait-assignment': [
    'rait-analyst',
    'rait-coordinator',
    'rait-manager',
    'rait-chair',
    'rait-secretary',
  ],
  'rait-impediment': [
    'rait-rapporteur',
    'rait-chair',
    'rait-secretary',
    'rait-signing-authority',
    'rait-analyst',
  ],
  'rait-clock': ['agency-admin'],
  'rait-clock-alert': [
    'rait-manager',
    'rait-coordinator',
    'rait-chair',
    'rait-analyst',
    'rait-rapporteur',
  ],
  'rait-session': ['rait-chair', 'rait-secretary'],
  'rait-agenda-item': ['rait-chair', 'rait-secretary', 'rait-rapporteur'],
  'rait-attendance': ['rait-secretary', 'rait-chair'],
  'rait-vote': ['rait-rapporteur', 'rait-chair'],
  'rait-oral-argument': ['rait-secretary', 'rait-chair'],
  'rait-minutes': ['rait-secretary', 'rait-chair'],
};
const RAIT_SURFACE_RULES: Array<[string, string, readonly DetranRole[]]> =
  Object.entries(RAIT_SURFACE_WRITE_ROLES).flatMap(([resource, writers]) => [
    [resource, 'read', RAIT_READ_ROLES],
    [resource, 'create', writers],
    [resource, 'update', writers],
    [resource, 'delete', ['technical-admin']],
  ]);
/** Command surface (state-guarded endpoints, rait-web-frontend.md §7). */
const RAIT_COMMAND_RULES: Array<[string, string, readonly DetranRole[]]> = [
  ['rait-case', 'protocol', ['rait-secretary']],
  ['rait-case', 'claim-next', ['rait-analyst']],
  ['rait-case', 'triage', ['rait-analyst', 'rait-secretary']],
  ['rait-case', 'admit', ['rait-analyst']],
  ['rait-case', 'reject', ['rait-analyst']],
  ['rait-case', 'remit-jari', ['rait-secretary']],
  ['rait-case', 'receive-judging-body', ['rait-secretary']],
  ['rait-case', 'open-inquiry', ['rait-analyst', 'rait-rapporteur']],
  ['rait-case', 'answer-inquiry', ['rait-analyst', 'rait-rapporteur']],
  ['rait-case', 'extend-inquiry', ['rait-analyst', 'rait-rapporteur']],
  ['rait-case', 'submit-draft', ['rait-analyst']],
  ['rait-case', 'withdraw', ['rait-secretary']],
  ['rait-case', 'redirect', ['rait-secretary']],
  ['rait-case', 'resolve-pending-content', ['rait-secretary']],
  ['rait-decision', 'sign', ['rait-signing-authority']],
  ['rait-decision', 'return-draft', ['rait-signing-authority']],
  ['rait-batch', 'open', ['rait-secretary']],
  ['rait-batch', 'draw', ['rait-secretary']],
  ['rait-batch', 'approve', ['rait-chair']],
  ['rait-batch', 'accept', ['rait-rapporteur']],
  ['rait-batch', 'impede', ['rait-rapporteur']],
  ['rait-opinion', 'register', ['rait-rapporteur']],
  ['rait-agenda', 'close', ['rait-chair']],
  ['rait-session', 'open', ['rait-chair']],
  ['rait-session', 'adjourn', ['rait-chair']],
  ['rait-session', 'vote', ['rait-rapporteur', 'rait-chair']],
  ['rait-session', 'casting-vote', ['rait-chair']],
  ['rait-session', 'view-request', ['rait-rapporteur']],
  ['rait-session', 'proclaim', ['rait-chair']],
  ['rait-session', 'convene-extraordinary', ['rait-chair']],
  ['rait-minutes', 'generate', ['rait-secretary']],
  ['rait-minutes', 'sign', ['rait-secretary', 'rait-chair']],
  ['rait-minutes', 'publish', ['rait-secretary']],
  ['rait-appeal', 'authority-decide', ['rait-central-authority']],
  ['rait-appeal', 'waive', ['rait-central-authority']],
  [
    'rait-assignment',
    'reassign',
    ['rait-coordinator', 'rait-manager', 'rait-chair'],
  ],
  [
    'rait-impediment',
    'declare',
    ['rait-rapporteur', 'rait-signing-authority', 'rait-analyst'],
  ],
  ['rait-impediment', 'suspicion', ['rait-secretary']],
  ['rait-schedule', 'publish', ['rait-coordinator', 'rait-chair']],
  ['rait-member', 'mandate', ['rait-hr']],
  ['rait-jeton', 'generate', ['rait-secretary']],
  ['rait-jeton', 'approve', ['rait-chair']],
  ['rait-unit', 'constitute', ['rait-manager']],
  ['rait-unit', 'activate', ['rait-manager']],
  [
    'rait-clock',
    'acknowledge-alert',
    [
      'rait-analyst',
      'rait-rapporteur',
      'rait-coordinator',
      'rait-chair',
      'rait-manager',
    ],
  ],
  ['rait-extinction', 'declare', ['rait-signing-authority', 'rait-chair']],
  ['rait-suspension-act', 'create', ['rait-signing-authority', 'rait-chair']],
  ['rait-parameter', 'update', ['agency-admin']],
  ['rait-export', 'create', ['AUDITOR']],
  ['rait-quality-sample', 'review', ['rait-coordinator']],
  ['rait-capacity-plan', 'publish', ['rait-coordinator', 'rait-manager']],
  ['rait-incident', 'open', ['rait-manager', 'rait-coordinator', 'rait-chair']],
  ['rait-integration', 'retry', ['integration-operator']],
  ['rait-integration', 'reconcile', ['integration-operator', 'rait-manager']],
  ['rait-collection', 'issue', ['rait-finance']],
  ['rait-refund', 'order', ['rait-finance']],
  ['rait-debt', 'handoff', ['rait-finance']],
  ['rait-payment', 'reconcile', ['rait-finance']],
  ['rait-archive', 'seal', ['rait-secretary']],
  ['rait-archive', 'apply-retention', ['rait-secretary']],
];

/**
 * DASHBOARD (WP-D0, CTG-0001 §2) — role sets used by the `dashboard:*`
 * matrix below. Names and membership are fixed by the contract; do not
 * widen them without an updated CTG.
 */
const DASH_AREA_MANAGERS: readonly DetranRole[] = [
  'rait-manager',
  'rait-coordinator',
  'rait-chair',
  'traffic-authority',
  'GESTOR',
];
const DASH_TECH: readonly DetranRole[] = [
  'technical-admin',
  'integration-operator',
];
const DASH_ALERT_OWNERS: readonly DetranRole[] = [
  ...DASH_AREA_MANAGERS,
  'agency-admin',
  ...DASH_TECH,
];
const DASH_N0_ROLES: readonly DetranRole[] = DETRAN_ROLES.filter(
  (role) => role !== 'CANDIDATO' && role !== 'CIDADAO',
);
const DASH_EXPORT_ROLES: readonly DetranRole[] = [
  'agency-admin',
  'GESTOR_DETRAN',
  ...DASH_AREA_MANAGERS,
  'dash-operator',
  'dash-duty-owner',
  ...DASH_TECH,
  'bi-analyst',
];

/**
 * `dashboard:*` matrix, CTG-0001 §3. The five `(=)` rules
 * (indicator-config:publish, bi-panel:publish, generated-report:request/
 * complete/fail) already exist in TEAT_RULES above and are preserved
 * there verbatim; only the 27 new permissions are added here.
 */
const DASHBOARD_RULES: Array<[string, string, string, readonly DetranRole[]]> =
  [
    [
      'dashboard',
      'alert',
      'read',
      [
        'dash-operator',
        ...DASH_AREA_MANAGERS,
        'agency-admin',
        'technical-admin',
        'AUDITOR',
      ],
    ],
    ['dashboard', 'alert', 'ack', ['dash-operator', ...DASH_ALERT_OWNERS]],
    ['dashboard', 'alert', 'treat', DASH_ALERT_OWNERS],
    ['dashboard', 'alert', 'close', ['dash-operator']],
    ['dashboard', 'alert', 'annotate', DASH_TECH],
    [
      'dashboard',
      'incident',
      'read',
      [...DASH_AREA_MANAGERS, 'agency-admin', 'AUDITOR'],
    ],
    ['dashboard', 'duty', 'read', DASH_N0_ROLES],
    ['dashboard', 'duty-cycle', 'read', DASH_N0_ROLES],
    ['dashboard', 'duty-cycle', 'start', ['dash-duty-owner', 'agency-admin']],
    ['dashboard', 'duty-cycle', 'prepare', ['dash-duty-owner', 'agency-admin']],
    ['dashboard', 'duty-cycle', 'submit', ['dash-duty-owner', 'agency-admin']],
    ['dashboard', 'duty-cycle', 'prove', ['dash-duty-owner', 'agency-admin']],
    ['dashboard', 'duty-cycle', 'archive', ['dash-operator', 'agency-admin']],
    ['dashboard', 'indicator', 'read', DASH_N0_ROLES],
    [
      'dashboard',
      'indicator-config',
      'read',
      ['bi-analyst', 'agency-admin', 'technical-admin', 'AUDITOR'],
    ],
    [
      'dashboard',
      'indicator-config',
      'update',
      ['bi-analyst', 'agency-admin', 'technical-admin'],
    ],
    [
      'dashboard',
      'bi-panel',
      'read',
      ['bi-analyst', 'agency-admin', 'technical-admin', 'AUDITOR'],
    ],
    [
      'dashboard',
      'generated-report',
      'read',
      ['bi-analyst', 'agency-admin', 'technical-admin', 'AUDITOR'],
    ],
    [
      'dashboard',
      'source',
      'read',
      ['technical-admin', 'integration-operator', 'dash-operator', 'AUDITOR'],
    ],
    ['dashboard', 'export', 'create', DASH_EXPORT_ROLES],
    ['dashboard', 'export', 'approve', ['agency-admin']],
    [
      'dashboard',
      'audit-trail',
      'read',
      ['AUDITOR', 'DPO', 'agency-admin', ...DASH_AREA_MANAGERS],
    ],
    [
      'dashboard',
      'comparison',
      'read',
      ['agency-admin', ...DASH_AREA_MANAGERS, 'bi-analyst', 'AUDITOR'],
    ],
    [
      'dashboard',
      'transparency-audit',
      'read',
      ['technical-admin', 'agency-admin', 'AUDITOR'],
    ],
    [
      'dashboard',
      'transparency-audit',
      'audit',
      ['technical-admin', 'agency-admin'],
    ],
    ['dashboard', 'dataset', 'read', DASH_N0_ROLES],
    ['dashboard', 'kpi', 'read', ['agency-admin', 'dash-operator', 'AUDITOR']],
  ];

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
    ...RAIT_SURFACE_RULES.map(([resource, action, roles]) => [
      teat('inf', resource, action),
      roles,
    ]),
    ...RAIT_COMMAND_RULES.map(([resource, action, roles]) => [
      teat('inf', resource, action),
      roles,
    ]),
    ...DASHBOARD_RULES.map(([domain, resource, action, roles]) => [
      teat(domain, resource, action),
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

/**
 * These are statutory command grants, not administrative CRUD permissions.
 * In particular, a global administration role does not stand in for the
 * member/office relationship checked by the command transaction.  Keeping
 * this exception before the generic administrative shortcut prevents an
 * accidental broadening when new global roles are added.
 */
const RAIT_STRICT_COMMAND_RULES = new Map<
  DetranPolicyKey,
  readonly DetranRole[]
>([
  ['inf:rait-schedule:create', ['rait-coordinator']],
  ['inf:rait-schedule:publish', ['rait-coordinator']],
  ['inf:rait-batch:create', ['rait-secretary']],
  ['inf:rait-batch:open', ['rait-secretary']],
  ['inf:rait-batch:draw', ['rait-secretary']],
  ['inf:rait-batch:approve', ['rait-chair']],
  ['inf:rait-batch-item:accept', ['rait-rapporteur']],
  ['inf:rait-batch-item:impediment', ['rait-rapporteur']],
  [
    'inf:rait-assignment:reassign',
    ['rait-coordinator', 'rait-manager', 'rait-chair'],
  ],
  [
    'inf:rait-impediment:declare',
    ['rait-rapporteur', 'rait-signing-authority', 'rait-analyst'],
  ],
  ['inf:rait-impediment:suspicion', ['rait-secretary']],
  ['inf:rait-agenda:close', ['rait-chair']],
  ['inf:rait-session:close-agenda', ['rait-chair']],
  ['inf:rait-session:open', ['rait-chair']],
  ['inf:rait-session:adjourn', ['rait-chair', 'rait-secretary']],
  ['inf:rait-session:convene-extraordinary', ['rait-chair']],
  ['inf:rait-agenda-item:read', ['rait-rapporteur']],
  ['inf:rait-agenda-item:view', ['rait-rapporteur']],
  ['inf:rait-agenda-item:withdraw', ['rait-chair']],
  ['inf:rait-vote:create', ['rait-chair', 'rait-rapporteur']],
  ['inf:rait-agenda-item:proclaim', ['rait-chair']],
  ['inf:rait-minutes:create', ['rait-secretary']],
  ['inf:rait-minutes:sign', ['rait-chair', 'rait-rapporteur']],
  ['inf:rait-minutes:publish', ['rait-secretary']],
  ['inf:rait-session:vote', ['rait-rapporteur', 'rait-chair']],
  ['inf:rait-session:casting-vote', ['rait-chair']],
  ['inf:rait-session:view-request', ['rait-rapporteur']],
  ['inf:rait-session:proclaim', ['rait-chair']],
  ['inf:rait-minutes:generate', ['rait-secretary']],
  ['inf:rait-minutes:sign', ['rait-chair', 'rait-rapporteur']],
  ['inf:rait-minutes:publish', ['rait-secretary']],
]);
const RAIT_DISABLED_POLICY_KEYS = new Set<DetranPolicyKey>([
  'inf:rait-oral-argument:create',
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
  // Protocol is a deliberately narrow intake authority.  It must not inherit
  // the global administrator or permission-wildcard shortcuts below: only an
  // active secretary role may begin an immutable RAIT intake.
  if (key === 'inf:rait-case:protocol') {
    return canonicalRoles(principal.roles).includes('rait-secretary');
  }
  if (RAIT_DISABLED_POLICY_KEYS.has(key)) return false;
  const strictRaitRoles = RAIT_STRICT_COMMAND_RULES.get(key);
  if (strictRaitRoles) {
    const roles = canonicalRoles(principal.roles);
    return strictRaitRoles.some((role) => roles.includes(role));
  }
  if (
    principal.permissions.includes('*') ||
    principal.permissions.includes(key) ||
    principal.permissions.includes(`${resource}:*`)
  ) {
    return true;
  }
  const roles = canonicalRoles(principal.roles);
  if (key === 'ops:parameter:update' || key === 'ops:parameter:read') {
    return roles.includes('agency-admin');
  }
  if (roles.some((role) => GLOBAL_ADMIN_ROLES.has(role))) return true;
  const allowed = DETRAN_POLICY_MATRIX[key];
  return Boolean(allowed?.some((role) => roles.includes(role)));
}

/**
 * DASHBOARD access layers (RN-DASH-170, CTG-0001 §4-§5). `dashboardLayerFor`
 * returns a ceiling, never a grant: authorization is
 * `isDetranActionAllowed` AND the layer AND the dynamic checks of CTG-0001
 * §6 (domain scoping, `X-Purpose`, owner checks) — none of which live here.
 */
export type DashboardLayer = 'N0' | 'N1' | 'N2';
export type DashboardLayerRequirement = DashboardLayer | 'N3';

const DASHBOARD_LAYER_RANK: Readonly<Record<DashboardLayer, number>> = {
  N0: 0,
  N1: 1,
  N2: 2,
};

const DASHBOARD_LAYER_BY_ROLE: Readonly<
  Partial<Record<DetranRole, DashboardLayer>>
> = {
  'agency-admin': 'N2',
  GESTOR_DETRAN: 'N2',
  AUDITOR: 'N2',
  DPO: 'N2',
  'rait-manager': 'N2',
  'rait-coordinator': 'N2',
  'rait-chair': 'N2',
  'traffic-authority': 'N2',
  GESTOR: 'N2',
  'dash-operator': 'N1',
  'dash-duty-owner': 'N1',
  'technical-admin': 'N1',
  'integration-operator': 'N1',
  'bi-analyst': 'N1',
};

export function dashboardLayerFor(roles: readonly string[]): DashboardLayer {
  let max: DashboardLayer = 'N0';
  for (const role of canonicalRoles(roles)) {
    const layer = DASHBOARD_LAYER_BY_ROLE[role];
    if (layer && DASHBOARD_LAYER_RANK[layer] > DASHBOARD_LAYER_RANK[max]) {
      max = layer;
    }
  }
  return max;
}

export function dashboardLayerAllows(
  roles: readonly string[],
  required: DashboardLayerRequirement,
): boolean {
  if (required === 'N3') return false;
  return (
    DASHBOARD_LAYER_RANK[dashboardLayerFor(roles)] >=
    DASHBOARD_LAYER_RANK[required]
  );
}
