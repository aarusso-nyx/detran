// CTG-0001 §6.4 (M13, [WF-PORTAL-004]) — matriz de transições de `portal.manifestation.state`
// (9 tokens). Fica vermelho até TASK-0004 criar
// backend/domains/portal/citizen-service/src/handwritten/guards/manifestation.transitions.ts.
//
// Mesma convenção de chamada assumida de request.transitions.spec.ts (irmão desta tarefa):
// `assertTransition(current, trigger)` com `current = { state }`, `trigger = { command }` —
// modelo de backend/domains/inf/infraction/src/handwritten/guards/infraction.transitions.ts
// (leitura obrigatória). `acknowledge`/`evaluate` têm rota cidadã nesta rodada; os demais
// (`analyze`, `request_info`, `receive_info`, `decide`, `notify_user`) são internos, sem rota,
// mas "serviço interno testável" (§6.4) — cobertos aqui pela mesma tabela.
import { describe, expect, it } from 'vitest';

import {
  assertTransition,
  MANIFESTATION_TRANSITIONS,
} from './manifestation.transitions.js';

/** Os 9 tokens fixos de portal.manifestation.state (contrato §0/§6.4). */
const MANIFESTATION_STATES = [
  'MANIFESTACAO_REGISTRADA',
  'COMPROVANTE_EMITIDO',
  'EM_ANALISE',
  'INFORMACAO_SOLICITADA_AO_AGENTE',
  'DECISAO_FINAL_ELABORADA',
  'CIENCIA_AO_USUARIO',
  'ENCERRADA',
  'AVALIACAO_OFERECIDA',
  'AVALIADA',
] as const;

/** allowed[] por comando, copiado literalmente do contrato §6.4 "estados NÃO admitidos". */
const ALLOWED_BY_COMMAND: Record<string, readonly string[]> = {
  acknowledge: ['CIENCIA_AO_USUARIO'],
  evaluate: ['AVALIACAO_OFERECIDA'],
  analyze: ['COMPROVANTE_EMITIDO'],
  request_info: ['EM_ANALISE'],
  decide: ['EM_ANALISE'],
  receive_info: ['INFORMACAO_SOLICITADA_AO_AGENTE'],
  notify_user: ['DECISAO_FINAL_ELABORADA'],
};

describe('MANIFESTATION_TRANSITIONS (§6.4, M13) — cobertura dos 9 tokens (C-0001-26)', () => {
  it('C-0001-26 — dado MANIFESTATION_TRANSITIONS quando enumerada então os estados referenciados (from/to) cobrem exatamente os 9 tokens do §0 e nenhum outro', () => {
    const referenced = new Set<string>();
    for (const row of MANIFESTATION_TRANSITIONS) {
      if (row.from) referenced.add(row.from);
      referenced.add(row.to);
    }
    expect([...referenced].sort()).toEqual([...MANIFESTATION_STATES].sort());
  });
});

describe('assertTransition (§6.4) — allowed[] exato por comando × 9 estados', () => {
  for (const [command, allowed] of Object.entries(ALLOWED_BY_COMMAND)) {
    describe(`comando "${command}" — allowed = [${allowed.join(', ')}]`, () => {
      for (const state of MANIFESTATION_STATES) {
        const isAllowed = allowed.includes(state);
        it(`dado a manifestação em ${state} quando ${command} então ${isAllowed ? 'admitido' : '409 PORTAL.MANIFESTATION_STATE_INVALID { state, allowed }'}`, () => {
          if (isAllowed) {
            expect(() =>
              assertTransition({ state }, { command }),
            ).not.toThrow();
          } else {
            expect(() => assertTransition({ state }, { command })).toThrowError(
              expect.objectContaining({
                code: 'PORTAL.MANIFESTATION_STATE_INVALID',
                status: 409,
                context: { state, allowed },
              }),
            );
          }
        });
      }
    });
  }
});

describe('C-0001-27 — acknowledge só de CIENCIA_AO_USUARIO', () => {
  it('dado CIENCIA_AO_USUARIO quando acknowledge então admitido; para os outros 8 estados então 409 MANIFESTATION_STATE_INVALID { state, allowed: ["CIENCIA_AO_USUARIO"] }', () => {
    expect(() =>
      assertTransition(
        { state: 'CIENCIA_AO_USUARIO' },
        { command: 'acknowledge' },
      ),
    ).not.toThrow();
    for (const state of MANIFESTATION_STATES.filter(
      (candidate) => candidate !== 'CIENCIA_AO_USUARIO',
    )) {
      expect(() =>
        assertTransition({ state }, { command: 'acknowledge' }),
      ).toThrowError(
        expect.objectContaining({
          code: 'PORTAL.MANIFESTATION_STATE_INVALID',
          context: { state, allowed: ['CIENCIA_AO_USUARIO'] },
        }),
      );
    }
  });
});

describe('C-0001-28 — evaluate só de AVALIACAO_OFERECIDA; AVALIADA é terminal', () => {
  it('dado AVALIACAO_OFERECIDA quando evaluate então admitido; para os outros 8 estados então 409', () => {
    expect(() =>
      assertTransition(
        { state: 'AVALIACAO_OFERECIDA' },
        { command: 'evaluate' },
      ),
    ).not.toThrow();
    for (const state of MANIFESTATION_STATES.filter(
      (candidate) => candidate !== 'AVALIACAO_OFERECIDA',
    )) {
      expect(() =>
        assertTransition({ state }, { command: 'evaluate' }),
      ).toThrowError(
        expect.objectContaining({ code: 'PORTAL.MANIFESTATION_STATE_INVALID' }),
      );
    }
  });

  it('dado AVALIADA (terminal) quando qualquer um dos sete comandos então 409 MANIFESTATION_STATE_INVALID', () => {
    for (const command of Object.keys(ALLOWED_BY_COMMAND)) {
      expect(() =>
        assertTransition({ state: 'AVALIADA' }, { command }),
      ).toThrowError(
        expect.objectContaining({ code: 'PORTAL.MANIFESTATION_STATE_INVALID' }),
      );
    }
  });
});
