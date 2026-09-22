// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-89).
import { describe, expect, it } from 'vitest';
import { ExportarSchema } from './exportar.schema.js';

describe('forms/exportar.schema.ts (C-02-89)', () => {
  it("dado { scope: 's', filters: {}, format: 'csv', rows: 10 } então válido", () => {
    expect(
      ExportarSchema.safeParse({
        scope: 's',
        filters: {},
        format: 'csv',
        rows: 10,
      }).success,
    ).toBe(true);
  });
  it('dado rows -1 então inválido', () => {
    expect(
      ExportarSchema.safeParse({
        scope: 's',
        filters: {},
        format: 'csv',
        rows: -1,
      }).success,
    ).toBe(false);
  });
  it('dado rows 1.5 então inválido', () => {
    expect(
      ExportarSchema.safeParse({
        scope: 's',
        filters: {},
        format: 'csv',
        rows: 1.5,
      }).success,
    ).toBe(false);
  });
  it("dado purpose 'auditoria' então válido", () => {
    expect(
      ExportarSchema.safeParse({
        scope: 's',
        filters: {},
        format: 'csv',
        rows: 10,
        purpose: 'auditoria',
      }).success,
    ).toBe(true);
  });
  it("dado purpose 'x' então inválido", () => {
    expect(
      ExportarSchema.safeParse({
        scope: 's',
        filters: {},
        format: 'csv',
        rows: 10,
        purpose: 'x',
      }).success,
    ).toBe(false);
  });
  it("dado format '' então inválido", () => {
    expect(
      ExportarSchema.safeParse({
        scope: 's',
        filters: {},
        format: '',
        rows: 10,
      }).success,
    ).toBe(false);
  });
  it('dado filters { a: 1 } então inválido (valor não string)', () => {
    expect(
      ExportarSchema.safeParse({
        scope: 's',
        filters: { a: 1 },
        format: 'csv',
        rows: 10,
      }).success,
    ).toBe(false);
  });
});
