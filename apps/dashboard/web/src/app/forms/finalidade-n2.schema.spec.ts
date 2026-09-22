// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-88).
import { describe, expect, it } from 'vitest';
import {
  FINALIDADE_N2_GATE,
  FinalidadeN2Schema,
  PURPOSE_TOKENS,
} from './finalidade-n2.schema.js';

describe('forms/finalidade-n2.schema.ts (C-02-88)', () => {
  it.each(PURPOSE_TOKENS)(
    "dado purpose '%s' com reference 'r' então válido",
    (purpose) => {
      expect(
        FinalidadeN2Schema.safeParse({ purpose, reference: 'r' }).success,
      ).toBe(true);
    },
  );
  it("dado { purpose: 'outra', reference: 'r' } então inválido", () => {
    expect(
      FinalidadeN2Schema.safeParse({ purpose: 'outra', reference: 'r' })
        .success,
    ).toBe(false);
  });
  it("dado { purpose: 'auditoria', reference: '' } então inválido", () => {
    expect(
      FinalidadeN2Schema.safeParse({ purpose: 'auditoria', reference: '' })
        .success,
    ).toBe(false);
  });
  it('dado FINALIDADE_N2_GATE então policy null e command null', () => {
    expect(FINALIDADE_N2_GATE.policy).toBeNull();
    expect(FINALIDADE_N2_GATE.command).toBeNull();
  });
});
