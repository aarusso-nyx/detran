import { expect, it } from 'vitest';
import {
  AIT_FRAME_CASO_3,
  AIT_SIGNATURE_BRANCHES,
  ALCOHOL_REFUSAL_BRANCHES,
  FORM_CONTRACT_FIXTURES,
  SYNC_CONFLICT_ACTIONS,
} from '../testing/form-contract.fixture';
import { loadMobileRuntime } from '../testing/runtime-module';

interface ZodSchema {
  safeParse(input: unknown): { readonly success: boolean };
}

for (const expected of FORM_CONTRACT_FIXTURES) {
  it(`dado ${expected.modulePath} quando o payload canônico é validado então passa`, async () => {
    const runtime = await loadMobileRuntime(expected.modulePath);
    const schema = runtime[expected.exportName] as ZodSchema | undefined;
    expect(schema, `schema ausente: ${expected.exportName}`).toBeDefined();
    expect(schema?.safeParse(expected.validPayload).success).toBe(true);
  });

  for (const required of expected.required) {
    it(`dado ${expected.modulePath} sem ${required} quando validado então falha`, async () => {
      const runtime = await loadMobileRuntime(expected.modulePath);
      const schema = runtime[expected.exportName] as ZodSchema;
      const payload = { ...expected.validPayload };
      delete payload[required];
      expect(schema.safeParse(payload).success).toBe(false);
    });
  }
}

it('dado ait-frame quando approach_class é caso_3 sem justificativa então bloqueia; fora dele não aceita justificativa', async () => {
  const runtime = await loadMobileRuntime('data/local/ait-frame.schema');
  const schema = runtime['aitFrameSchema'] as ZodSchema;
  expect(schema.safeParse(AIT_FRAME_CASO_3).success).toBe(true);
  expect(
    schema.safeParse({ ...AIT_FRAME_CASO_3, justificativa: undefined }).success,
  ).toBe(false);
  expect(
    schema.safeParse({
      ...FORM_CONTRACT_FIXTURES[3].validPayload,
      justificativa: 'indevida',
    }).success,
  ).toBe(false);
});

it('dado cada ramo de assinatura quando validado então aceita somente seu motivo próprio', async () => {
  const runtime = await loadMobileRuntime('data/local/ait-signature.schema');
  const schema = runtime['aitSignatureSchema'] as ZodSchema;
  for (const branch of AIT_SIGNATURE_BRANCHES) {
    expect(schema.safeParse(branch).success).toBe(true);
  }
  expect(schema.safeParse({ resultado: 'recusa' }).success).toBe(false);
});

it('dados recusa e impossibilidade de alcoolemia quando validadas então os ramos exclusivos passam', async () => {
  const runtime = await loadMobileRuntime('data/local/alcohol-refusal.schema');
  const schema = runtime['alcoholRefusalSchema'] as ZodSchema;
  for (const branch of ALCOHOL_REFUSAL_BRANCHES) {
    expect(schema.safeParse(branch).success).toBe(true);
  }
  expect(
    schema.safeParse({
      ...ALCOHOL_REFUSAL_BRANCHES[0],
      impossibilidade: true,
    }).success,
  ).toBe(false);
});

it('dado o par medido e considerado quando um dos valores falta então alcohol-result falha', async () => {
  const runtime = await loadMobileRuntime('data/local/alcohol-result.schema');
  const schema = runtime['alcoholResultSchema'] as ZodSchema;
  const payload = FORM_CONTRACT_FIXTURES[10].validPayload;
  expect(schema.safeParse(payload).success).toBe(true);
  expect(schema.safeParse({ ...payload, medido: undefined }).success).toBe(
    false,
  );
  expect(schema.safeParse({ ...payload, considerado: undefined }).success).toBe(
    false,
  );
});

it('dada cada ação canônica de sync-conflict quando validada então passa', async () => {
  const runtime = await loadMobileRuntime('data/local/sync-conflict.schema');
  const schema = runtime['syncConflictSchema'] as ZodSchema;
  for (const action of SYNC_CONFLICT_ACTIONS) {
    expect(
      schema.safeParse({ action, description: 'resolver conflito' }).success,
    ).toBe(true);
  }
});

for (const [modulePath, exportName, invalid] of [
  [
    'data/local/ait-vehicle.schema',
    'aitVehicleSchema',
    { ...FORM_CONTRACT_FIXTURES[1].validPayload, placa: 'ABC12' },
  ],
  [
    'data/local/ait-driver.schema',
    'aitDriverSchema',
    {
      ...FORM_CONTRACT_FIXTURES[2].validPayload,
      condutor: '11111111111',
      identified_by: 'cpf',
    },
  ],
  [
    'data/local/ait-driver.schema',
    'aitDriverSchema',
    {
      ...FORM_CONTRACT_FIXTURES[2].validPayload,
      condutor: '00000000000',
      identified_by: 'cnh',
    },
  ],
  [
    'data/local/ait-frame.schema',
    'aitFrameSchema',
    { ...FORM_CONTRACT_FIXTURES[3].validPayload, requires_equipment: true },
  ],
  [
    'data/local/ait-evidence.schema',
    'aitEvidenceSchema',
    { ...FORM_CONTRACT_FIXTURES[5].validPayload, hash: 'not-a-content-hash' },
  ],
  [
    'data/local/ait-evidence.schema',
    'aitEvidenceSchema',
    { ...FORM_CONTRACT_FIXTURES[5].validPayload, tipo: '__outside_catalog__' },
  ],
  [
    'data/local/alcohol-device.schema',
    'alcoholDeviceSchema',
    { ...FORM_CONTRACT_FIXTURES[9].validPayload, verification_valid: false },
  ],
  [
    'data/local/alcohol-result.schema',
    'alcoholResultSchema',
    {
      ...FORM_CONTRACT_FIXTURES[10].validPayload,
      medido: 0.35,
      considerado: 0.04,
    },
  ],
] as const) {
  it(`dado ${modulePath} com validação técnica inválida quando safeParse executa então fecha antes de qualquer client`, async () => {
    const runtime = await loadMobileRuntime(modulePath);
    const schema = runtime[exportName] as ZodSchema;
    expect(schema.safeParse(invalid).success).toBe(false);
  });
}
