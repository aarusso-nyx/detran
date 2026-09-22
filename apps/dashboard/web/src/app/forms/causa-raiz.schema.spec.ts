// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-86).
import { describe, expect, it } from 'vitest';
import { CausaRaizSchema } from './causa-raiz.schema.js';

describe('forms/causa-raiz.schema.ts (C-02-86)', () => {
  it.each(['transport', 'acceptance', 'payload'])(
    "dado { category: '%s', description: 'd' } então válido",
    (category) => {
      expect(
        CausaRaizSchema.safeParse({ category, description: 'd' }).success,
      ).toBe(true);
    },
  );
  it("dado { category: 'x', description: 'd' } então inválido", () => {
    expect(
      CausaRaizSchema.safeParse({ category: 'x', description: 'd' }).success,
    ).toBe(false);
  });
  it("dado { category: 'payload', description: '' } então inválido", () => {
    expect(
      CausaRaizSchema.safeParse({ category: 'payload', description: '' })
        .success,
    ).toBe(false);
  });
});
