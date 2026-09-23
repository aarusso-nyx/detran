// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-92).
import { describe, expect, it } from 'vitest';
import { AuditoriaTransparenciaSchema } from './auditoria-transparencia.schema.js';

describe('forms/auditoria-transparencia.schema.ts (C-02-92)', () => {
  it("dado { checklist: [{ item: 'i', checked: true }], evidences: [] } então válido", () => {
    expect(
      AuditoriaTransparenciaSchema.safeParse({
        checklist: [{ item: 'i', checked: true }],
        evidences: [],
      }).success,
    ).toBe(true);
  });
  it('dado checklist [] então inválido', () => {
    expect(
      AuditoriaTransparenciaSchema.safeParse({ checklist: [], evidences: [] })
        .success,
    ).toBe(false);
  });
  it('dado item sem checked então inválido', () => {
    expect(
      AuditoriaTransparenciaSchema.safeParse({
        checklist: [{ item: 'i' }],
        evidences: [],
      }).success,
    ).toBe(false);
  });
  it("dado evidences [''] então inválido", () => {
    expect(
      AuditoriaTransparenciaSchema.safeParse({
        checklist: [{ item: 'i', checked: true }],
        evidences: [''],
      }).success,
    ).toBe(false);
  });
});
