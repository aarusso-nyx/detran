// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-91).
import { describe, expect, it } from 'vitest';
import { SolicitarRelatorioSchema } from './solicitar-relatorio.schema.js';

describe('forms/solicitar-relatorio.schema.ts (C-02-91)', () => {
  it("dado { reportType: 't', filters: {} } então válido", () => {
    expect(
      SolicitarRelatorioSchema.safeParse({ reportType: 't', filters: {} })
        .success,
    ).toBe(true);
  });
  it("dado reportType '' então inválido", () => {
    expect(
      SolicitarRelatorioSchema.safeParse({ reportType: '', filters: {} })
        .success,
    ).toBe(false);
  });
  it('dado sem filters então inválido', () => {
    expect(
      SolicitarRelatorioSchema.safeParse({ reportType: 't' }).success,
    ).toBe(false);
  });
});
