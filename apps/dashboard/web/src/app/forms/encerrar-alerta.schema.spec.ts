// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-85).
import { describe, expect, it } from 'vitest';
import { EncerrarAlertaSchema } from './encerrar-alerta.schema.js';

describe('forms/encerrar-alerta.schema.ts (C-02-85)', () => {
  it('dado { confirmation: true } então válido', () => {
    expect(EncerrarAlertaSchema.safeParse({ confirmation: true }).success).toBe(
      true,
    );
  });
  it('dado { confirmation: false } então inválido', () => {
    expect(
      EncerrarAlertaSchema.safeParse({ confirmation: false }).success,
    ).toBe(false);
  });
  it("dado { confirmation: true, note: 'n' } então válido", () => {
    expect(
      EncerrarAlertaSchema.safeParse({ confirmation: true, note: 'n' }).success,
    ).toBe(true);
  });
  it('dado {} então inválido', () => {
    expect(EncerrarAlertaSchema.safeParse({}).success).toBe(false);
  });
});
