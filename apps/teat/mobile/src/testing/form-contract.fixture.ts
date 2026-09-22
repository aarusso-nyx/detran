export interface FormContractFixture {
  readonly modulePath: string;
  readonly exportName: string;
  readonly required: readonly string[];
  readonly validPayload: Readonly<Record<string, unknown>>;
}

// Independent technical transcription of ARCH-TEAT-MOBILE-CONTRACT §3.
// source_pending never becomes a local payload field.
export const FORM_CONTRACT_FIXTURES: readonly FormContractFixture[] = [
  {
    modulePath: 'data/local/open-shift.schema',
    exportName: 'openShiftSchema',
    required: ['unidade', 'equipe', 'viatura', 'localizacao'],
    validPayload: {
      unidade: 'unit-001',
      equipe: 'team-001',
      viatura: 'vehicle-001',
      localizacao: 'field-location',
    },
  },
  {
    modulePath: 'data/local/ait-vehicle.schema',
    exportName: 'aitVehicleSchema',
    required: ['placa', 'visually_confirmed_by_agent', 'divergencia'],
    validPayload: {
      placa: 'ABC1D23',
      visually_confirmed_by_agent: true,
      divergencia: false,
    },
  },
  {
    modulePath: 'data/local/ait-driver.schema',
    exportName: 'aitDriverSchema',
    required: ['condutor', 'identified_by', 'abordagem'],
    validPayload: {
      condutor: '11144477735',
      identified_by: 'cpf',
      abordagem: 'abordado',
    },
  },
  {
    modulePath: 'data/local/ait-frame.schema',
    exportName: 'aitFrameSchema',
    required: [
      'enquadramento',
      'approach_class',
      'required_fields',
      'requires_equipment',
    ],
    validPayload: {
      enquadramento: 'CTB-000',
      approach_class: 'caso_1',
      required_fields: [],
      requires_equipment: false,
    },
  },
  {
    modulePath: 'data/local/ait-location.schema',
    exportName: 'aitLocationSchema',
    required: ['local', 'uf', 'municipio', 'gps_accuracy_m', 'manual_edition'],
    validPayload: {
      local: 'field-location',
      uf: 'SP',
      municipio: 'Sao Paulo',
      gps_accuracy_m: 5,
      manual_edition: false,
    },
  },
  {
    modulePath: 'data/local/ait-evidence.schema',
    exportName: 'aitEvidenceSchema',
    required: ['tipo', 'hash'],
    validPayload: {
      tipo: 'photo',
      hash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    },
  },
  {
    modulePath: 'data/local/ait-signature.schema',
    exportName: 'aitSignatureSchema',
    required: ['resultado'],
    validPayload: { resultado: 'assinado' },
  },
  {
    modulePath: 'data/local/ait-review.schema',
    exportName: 'aitReviewSchema',
    required: [
      'blocking_validations_green',
      'reserved_number',
      'package_valid',
      'explicit_action',
    ],
    validPayload: {
      blocking_validations_green: true,
      reserved_number: 'AIT-0001',
      package_valid: true,
      explicit_action: 'finalize',
    },
  },
  {
    modulePath: 'data/local/ait-cancel-request.schema',
    exportName: 'aitCancelRequestSchema',
    required: ['justificativa', 'destinatario', 'base_legal', 'origin_status'],
    validPayload: {
      justificativa: 'erro material',
      destinatario: 'traffic-authority',
      base_legal: 'CTB-281',
      origin_status: 'FINALIZADO_LOCAL',
    },
  },
  {
    modulePath: 'data/local/alcohol-device.schema',
    exportName: 'alcoholDeviceSchema',
    required: ['breathalyzer_id', 'verification_valid'],
    validPayload: { breathalyzer_id: 'BAF-001', verification_valid: true },
  },
  {
    modulePath: 'data/local/alcohol-result.schema',
    exportName: 'alcoholResultSchema',
    required: ['medido', 'considerado', 'horario'],
    validPayload: {
      medido: 0.05,
      considerado: 0.04,
      horario: '2026-09-22T09:00:00Z',
    },
  },
  {
    modulePath: 'data/local/alcohol-refusal.schema',
    exportName: 'alcoholRefusalSchema',
    required: ['kind', 'descricao', 'testemunha'],
    validPayload: {
      kind: 'recusa',
      descricao: 'recusa declarada',
      testemunha: 'witness-001',
    },
  },
  {
    modulePath: 'data/local/measure-term.schema',
    exportName: 'measureTermSchema',
    required: [
      'caput_fields',
      'art14_1_fields',
      'withdrawal_deadlines',
      'signature_outcome',
    ],
    validPayload: {
      caput_fields: ['1', '2', '3', '4', '5', '6', '7'],
      art14_1_fields: ['1', '2', '3', '4'],
      withdrawal_deadlines: ['2026-09-23', '2026-10-07'],
      signature_outcome: 'assinado',
    },
  },
  {
    modulePath: 'data/local/sync-conflict.schema',
    exportName: 'syncConflictSchema',
    required: ['action', 'description'],
    validPayload: {
      action: 'manual_review',
      description: 'revisar manualmente',
    },
  },
];

export const AIT_FRAME_CASO_3 = {
  enquadramento: 'CTB-000',
  approach_class: 'caso_3',
  justificativa: 'abordagem impossibilitada',
  required_fields: [],
  requires_equipment: false,
} as const;
export const AIT_SIGNATURE_BRANCHES = [
  { resultado: 'assinado' },
  { resultado: 'recusa', motivo: 'recusa declarada' },
  { resultado: 'impossibilidade', motivo: 'impossibilidade tecnica' },
] as const;
export const ALCOHOL_REFUSAL_BRANCHES = [
  { kind: 'recusa', descricao: 'recusa declarada', testemunha: 'witness-001' },
  {
    kind: 'impossibilidade',
    descricao: 'falha tecnica',
    testemunha: 'witness-001',
  },
] as const;
export const SYNC_CONFLICT_ACTIONS = [
  'manual_review',
  'accept_server',
  'reject',
  'retry_after_correction',
] as const;
