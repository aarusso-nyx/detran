import { expect, it } from 'vitest';

const SCHEMA_EXPORTS = [
  'crashStartSchema',
  'crashLocationSchema',
  'crashConditionsSchema',
  'crashVehiclesSchema',
  'crashPeopleSchema',
  'crashVictimsSchema',
  'crashDynamicsSchema',
  'crashSketchSchema',
  'crashEvidenceSchema',
  'crashDamagesSchema',
  'crashReviewSchema',
  'crashComplementSchema',
  'renaestSchema',
  'subjectRequestSchema',
] as const;
const GATES = [
  'start',
  'location',
  'conditions',
  'vehicles',
  'people',
  'victims',
  'dynamics',
  'sketch',
  'evidence',
  'damages',
  'review',
  'complement',
  'close',
  'transmit',
  'subject-request',
] as const;

const GATE_PAYLOADS: Readonly<
  Record<(typeof GATES)[number], Readonly<{ valid: unknown; invalid: unknown }>>
> = {
  start: {
    valid: { crash_type: 'collision', severity: 'material', shift: 'day' },
    invalid: { crash_type: '', severity: 'material', shift: 'day' },
  },
  location: {
    valid: {
      occurred_at: '2026-09-24T10:00:00-03:00',
      recorded_at: '2026-09-24T10:05:00-03:00',
      location_mode: 'gps',
      gps_latitude: -23.55,
      gps_longitude: -46.63,
      gps_accuracy_m: 4,
      uf: 'SP',
      municipality: 'Sao Paulo',
    },
    invalid: {
      occurred_at: '2026-09-24T10:10:00-03:00',
      recorded_at: '2026-09-24T10:05:00-03:00',
      location_mode: 'gps',
      uf: 'SP',
      municipality: 'Sao Paulo',
    },
  },
  conditions: {
    valid: {
      road_condition: 'dry',
      weather: 'clear',
      lighting: 'daylight',
      signage: 'visible',
    },
    invalid: {
      road_condition: '',
      weather: 'clear',
      lighting: 'daylight',
      signage: 'visible',
    },
  },
  vehicles: {
    valid: { vehicles: [{ role: 'involved', sequence: 1, plate: 'ABC1D23' }] },
    invalid: { vehicles: [{ role: '', sequence: 0 }] },
  },
  people: {
    valid: {
      people: [
        { role: 'condutor', person_id: 'person-001', vehicle_sequence: 1 },
      ],
    },
    invalid: { people: [{ role: 'unknown' }] },
  },
  victims: {
    valid: {
      person_id: 'person-001',
      severity: 'injured',
      death_at_scene: false,
      medical_care: true,
      destination_hospital: 'Hospital Municipal',
      purpose: 'crash-investigation',
      audited: true,
    },
    invalid: {
      person_id: 'person-001',
      severity: 'injured',
      death_at_scene: false,
      medical_care: true,
      purpose: '',
      audited: false,
    },
  },
  dynamics: {
    valid: { regime: '176', duties_176: ['secure-scene'] },
    invalid: { regime: '179' },
  },
  sketch: {
    valid: { sketch_type: 'drawing', drawing_json: '{"lines":[]}' },
    invalid: { sketch_type: 'video' },
  },
  evidence: {
    valid: {
      photos: [
        { hash: 'sha256:scene', mime_type: 'image/jpeg', scene_only: true },
      ],
    },
    invalid: {
      photos: [
        { hash: 'sha256:victim', mime_type: 'image/jpeg', scene_only: false },
      ],
    },
  },
  damages: {
    valid: {
      damages: [{ asset_nature: 'vehicle', description: 'front damage' }],
      witnesses: [{ name: 'Witness', refused: false }],
    },
    invalid: {
      damages: [{ asset_nature: '', description: 'front damage' }],
      witnesses: [],
    },
  },
  review: {
    valid: {
      minimum_data_complete: true,
      vehicle_or_person_count: 1,
      victims_complete_when_required: true,
      content_hash: 'sha256:review',
      idempotency_key: 'idem-review-001',
    },
    invalid: {
      minimum_data_complete: false,
      vehicle_or_person_count: 0,
      victims_complete_when_required: true,
      content_hash: 'sha256:review',
      idempotency_key: 'idem-review-001',
    },
  },
  complement: {
    valid: { missing_fields: ['location.reference'] },
    invalid: { missing_fields: [] },
  },
  close: {
    valid: {
      natural_key: 'crash-001',
      final_dynamics: true,
      victims_complete_when_required: true,
      action: 'close',
    },
    invalid: {
      natural_key: '',
      final_dynamics: true,
      victims_complete_when_required: true,
      action: 'close',
    },
  },
  transmit: {
    valid: {
      natural_key: 'crash-001',
      final_dynamics: true,
      victims_complete_when_required: true,
      action: 'transmit',
      idempotency_key: 'idem-transmit-001',
    },
    invalid: {
      natural_key: 'crash-001',
      final_dynamics: true,
      victims_complete_when_required: true,
      action: 'transmit',
    },
  },
  'subject-request': {
    valid: {
      request: 'access',
      purpose: 'data-subject-request',
      subject_id: 'subject-001',
      audited: true,
    },
    invalid: {
      request: 'elimination',
      purpose: 'data-subject-request',
      subject_id: 'subject-001',
      audited: true,
      retention_block: true,
    },
  },
};

it('dado o módulo real de forms BOAT quando carregado então exporta exatamente os quatorze schemas', async () => {
  const module = await import('./schemas.js');
  expect(Object.keys(module).filter((key) => key.endsWith('Schema'))).toEqual(
    SCHEMA_EXPORTS,
  );
});

it('dado cada gate real quando recebe payload canônico válido e inválido então executa o schema', async () => {
  const module = await import('./gates.js');
  const gates = module.BOAT_GATES as readonly {
    name: string;
    check(input: unknown): boolean;
  }[];
  expect(gates.map((gate) => gate.name)).toEqual(GATES);
  expect(gates).toHaveLength(15);
  for (const gate of gates) {
    const payload = GATE_PAYLOADS[gate.name as (typeof GATES)[number]];
    expect.soft(gate.check(payload.valid), `${gate.name}: válido`).toBe(true);
    expect
      .soft(gate.check(payload.invalid), `${gate.name}: inválido`)
      .toBe(false);
  }
});

it('dado RENAEST quando corrige campos então exige motivo e lista de alterações', async () => {
  const { renaestSchema } = await import('./schemas.js');
  expect(
    renaestSchema.safeParse({
      natural_key: 'crash-001',
      final_dynamics: true,
      victims_complete_when_required: true,
      action: 'correct',
      reason: 'Correção auditada',
      changed_fields: ['location.reference'],
    }).success,
  ).toBe(true);
  expect(
    renaestSchema.safeParse({
      natural_key: 'crash-001',
      final_dynamics: true,
      victims_complete_when_required: true,
      action: 'correct',
    }).success,
  ).toBe(false);
});
