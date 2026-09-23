// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "forms/<slug>.schema.spec.ts" (C-02-84).
import { describe, expect, it } from 'vitest';
import { AckAlertaSchema } from './ack-alerta.schema.js';

describe('forms/ack-alerta.schema.ts (C-02-84)', () => {
  it("dado { channel: 'origin' } então válido", () => {
    expect(AckAlertaSchema.safeParse({ channel: 'origin' }).success).toBe(true);
  });
  it("dado { channel: 'manual', note: 'x' } então válido", () => {
    expect(
      AckAlertaSchema.safeParse({ channel: 'manual', note: 'x' }).success,
    ).toBe(true);
  });
  it("dado { channel: 'manual' } (sem note) então inválido em ['note']", () => {
    const result = AckAlertaSchema.safeParse({ channel: 'manual' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.join('.') === 'note'),
      ).toBe(true);
    }
  });
  it("dado { channel: 'origin', extra: 1 } então inválido (strict)", () => {
    expect(
      AckAlertaSchema.safeParse({ channel: 'origin', extra: 1 }).success,
    ).toBe(false);
  });
  it("dado { channel: 'x' } então inválido", () => {
    expect(AckAlertaSchema.safeParse({ channel: 'x' }).success).toBe(false);
  });
});
