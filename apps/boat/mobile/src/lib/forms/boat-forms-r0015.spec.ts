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

it('dado o módulo real de forms BOAT quando carregado então exporta exatamente os quatorze schemas', async () => {
  const module = await import('./schemas.js');
  expect(Object.keys(module).filter((key) => key.endsWith('Schema'))).toEqual(
    SCHEMA_EXPORTS,
  );
});

it('dado cada gate real quando recebe double válido e inválido então aceita somente o válido', async () => {
  const module = await import('./gates.js');
  const gates = module.BOAT_GATES as readonly {
    name: string;
    check(input: unknown): boolean;
  }[];
  expect(gates.map((gate) => gate.name)).toEqual(GATES);
  expect(gates).toHaveLength(15);
  for (const gate of gates) {
    expect(gate.check({ valid: true })).toBe(true);
    expect(gate.check({ valid: false })).toBe(false);
  }
});
