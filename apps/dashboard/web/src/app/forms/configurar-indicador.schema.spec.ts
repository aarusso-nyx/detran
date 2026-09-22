// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-90).
import { describe, expect, it } from 'vitest';
import {
  CONFIGURAR_INDICADOR_GATES,
  ConfigurarIndicadorSchema,
} from './configurar-indicador.schema.js';

describe('forms/configurar-indicador.schema.ts (C-02-90)', () => {
  it.each(['P1', 'P2', 'P3'])(
    "dado classification '%s' e staleStrategy 'hide' então válido",
    (classification) => {
      expect(
        ConfigurarIndicadorSchema.safeParse({
          threshold: 't',
          owner: 'o',
          acceptableLatency: 'PT1H',
          classification,
          staleStrategy: 'hide',
        }).success,
      ).toBe(true);
    },
  );
  it("dado staleStrategy 'mark' então válido", () => {
    expect(
      ConfigurarIndicadorSchema.safeParse({
        threshold: 't',
        owner: 'o',
        acceptableLatency: 'PT1H',
        classification: 'P1',
        staleStrategy: 'mark',
      }).success,
    ).toBe(true);
  });
  it('dado sem classification então inválido', () => {
    expect(
      ConfigurarIndicadorSchema.safeParse({
        threshold: 't',
        owner: 'o',
        acceptableLatency: 'PT1H',
        staleStrategy: 'hide',
      }).success,
    ).toBe(false);
  });
  it("dado staleStrategy 'x' então inválido", () => {
    expect(
      ConfigurarIndicadorSchema.safeParse({
        threshold: 't',
        owner: 'o',
        acceptableLatency: 'PT1H',
        classification: 'P1',
        staleStrategy: 'x',
      }).success,
    ).toBe(false);
  });
  it('dado CONFIGURAR_INDICADOR_GATES então update e publish com as políticas de §11', () => {
    expect(CONFIGURAR_INDICADOR_GATES.update.policy).toBe(
      'dashboard:indicator-config:update',
    );
    expect(CONFIGURAR_INDICADOR_GATES.publish.policy).toBe(
      'dashboard:indicator-config:publish',
    );
  });
});
