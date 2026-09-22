// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-87; OD-D16-011; [UC-DASH-003] AC-DASH-003-1).
import { describe, expect, it } from 'vitest';
import {
  AVANCAR_CICLO_GATES,
  AvancarCicloSchema,
} from './avancar-ciclo.schema.js';

const HASH = 'a'.repeat(64);

describe('forms/avancar-ciclo.schema.ts (C-02-87)', () => {
  it('dado targetState COMPROVADO com evidence { protocol } então válido', () => {
    expect(
      AvancarCicloSchema.safeParse({
        targetState: 'COMPROVADO',
        evidence: { protocol: 'P1' },
      }).success,
    ).toBe(true);
  });
  it('dado targetState COMPROVADO com evidence { captureUri } então válido', () => {
    expect(
      AvancarCicloSchema.safeParse({
        targetState: 'COMPROVADO',
        evidence: { captureUri: 'https://x/y.png' },
      }).success,
    ).toBe(true);
  });
  it('dado targetState COMPROVADO com evidence { hash } então válido (três casos isolados)', () => {
    expect(
      AvancarCicloSchema.safeParse({
        targetState: 'COMPROVADO',
        evidence: { hash: HASH },
      }).success,
    ).toBe(true);
  });
  it("dado targetState COMPROVADO com evidence {} então inválido em ['evidence'] com DASH.DUTY_EVIDENCE_REQUIRED", () => {
    const result = AvancarCicloSchema.safeParse({
      targetState: 'COMPROVADO',
      evidence: {},
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.path.join('.') === 'evidence',
      );
      expect(issue?.message).toBe('DASH.DUTY_EVIDENCE_REQUIRED');
    }
  });
  it('dado targetState COMPROVADO sem evidence (ausência total) então inválido', () => {
    expect(
      AvancarCicloSchema.safeParse({ targetState: 'COMPROVADO' }).success,
    ).toBe(false);
  });
  it("dado targetState PREPARADO com evidence.hash 'zz' então inválido em ['evidence','hash']", () => {
    const result = AvancarCicloSchema.safeParse({
      targetState: 'PREPARADO',
      evidence: { hash: 'zz' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.path.join('.') === 'evidence.hash'),
      ).toBe(true);
    }
  });
  it('dado targetState EM_APURACAO (sem evidence) então válido', () => {
    expect(
      AvancarCicloSchema.safeParse({ targetState: 'EM_APURACAO' }).success,
    ).toBe(true);
  });
  it('dado targetState SUBMETIDO_PUBLICADO com submittedAt e protocol então válido', () => {
    expect(
      AvancarCicloSchema.safeParse({
        targetState: 'SUBMETIDO_PUBLICADO',
        submittedAt: '2026-09-19T10:00:00-04:00',
        protocol: 'P',
      }).success,
    ).toBe(true);
  });
  it('dado submittedAt sem offset então inválido', () => {
    expect(
      AvancarCicloSchema.safeParse({
        targetState: 'SUBMETIDO_PUBLICADO',
        submittedAt: '2026-09-19T10:00:00',
      }).success,
    ).toBe(false);
  });
  it("dado targetState 'X' então inválido", () => {
    expect(AvancarCicloSchema.safeParse({ targetState: 'X' }).success).toBe(
      false,
    );
  });

  it('dado AVANCAR_CICLO_GATES então 8 chaves, command null exatamente em JANELA_ABERTA/ATRASADO/NAO_CUMPRIDO', () => {
    expect(Object.keys(AVANCAR_CICLO_GATES)).toHaveLength(8);
    for (const [state, gate] of Object.entries(AVANCAR_CICLO_GATES)) {
      const shouldBeNull = [
        'JANELA_ABERTA',
        'ATRASADO',
        'NAO_CUMPRIDO',
      ].includes(state);
      expect(gate.command === null, state).toBe(shouldBeNull);
    }
  });
});
