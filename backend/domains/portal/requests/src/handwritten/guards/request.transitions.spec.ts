// CTG-0001 §6.1 (M7, [WF-PORTAL-001], OD-P13 fechado) — matriz de transições de
// `portal.request.state` (13 tokens fixos em código). Fica vermelho até TASK-0004 criar
// backend/domains/portal/requests/src/handwritten/guards/request.transitions.ts (M24: "tabela
// REQUEST_TRANSITIONS ... tabelas puras + função assertTransition").
//
// Convenção de chamada assumida (não fixada literalmente pelo contrato para este arquivo,
// diferente de identity.service.ts §12): `assertTransition(current, trigger)` /
// `resolveTransition(current, trigger)` com `current = { state }` e `trigger = { command }` —
// mesmo padrão de
// backend/domains/inf/infraction/src/handwritten/guards/infraction.transitions.ts (o "padrão de
// teste de matriz de transições" da leitura obrigatória desta tarefa), substituindo
// `{kind, code}` por `{command}` (portal.request não tem substate nem gatilho de evento externo
// nos quatro comandos citados pelo contrato §11 C-0001-24). Se TASK-0004 escolher uma assinatura
// diferente, é este arquivo que se ajusta — as asserções abaixo (allowed[]/código/status) são o
// comportamento fixado pelo contrato, não a assinatura.
import { describe, expect, it } from 'vitest';

import {
  assertTransition,
  REQUEST_TRANSITIONS,
} from './request.transitions.js';

/** Os 13 tokens fixos de portal.request.state (contrato §0/§6.1). */
const REQUEST_STATES = [
  'IDENTIFICADO',
  'SERVICO_SELECIONADO',
  'ELEGIBILIDADE_VERIFICADA',
  'INELEGIVEL',
  'PEDIDO_EM_COMPOSICAO',
  'AGUARDANDO_NIVEL_ASSINATURA',
  'AGUARDANDO_PAGAMENTO',
  'PROTOCOLADO',
  'EM_ANDAMENTO_NO_ORGAO',
  'RESULTADO_DISPONIVEL',
  'AVALIACAO_OFERECIDA',
  'CONCLUIDO',
  'DESISTIDO',
] as const;

/** allowed[] por comando, copiado literalmente do contrato §6.1 "estados NÃO admitidos". */
const ALLOWED_BY_COMMAND: Record<string, readonly string[]> = {
  draft: ['PEDIDO_EM_COMPOSICAO'],
  submit: ['PEDIDO_EM_COMPOSICAO', 'AGUARDANDO_NIVEL_ASSINATURA'],
  withdraw: [
    'PEDIDO_EM_COMPOSICAO',
    'AGUARDANDO_NIVEL_ASSINATURA',
    'AGUARDANDO_PAGAMENTO',
  ],
  evaluate: ['AVALIACAO_OFERECIDA'],
};

const TERMINAL_STATES = ['CONCLUIDO', 'DESISTIDO'];

describe('REQUEST_TRANSITIONS (§6.1, M7) — cobertura dos 13 tokens', () => {
  it('C-0001-23 — dado REQUEST_TRANSITIONS quando enumerada então os estados referenciados (from/to) cobrem exatamente os 13 tokens do §0 e nenhum outro', () => {
    const referenced = new Set<string>();
    for (const row of REQUEST_TRANSITIONS) {
      if (row.from) referenced.add(row.from);
      referenced.add(row.to);
    }
    expect([...referenced].sort()).toEqual([...REQUEST_STATES].sort());
  });
});

describe('assertTransition (§6.1) — allowed[] exato por comando × 13 estados (C-0001-24)', () => {
  for (const [command, allowed] of Object.entries(ALLOWED_BY_COMMAND)) {
    describe(`comando "${command}" — allowed = [${allowed.join(', ')}]`, () => {
      for (const state of REQUEST_STATES) {
        const isAllowed = allowed.includes(state);
        it(`dado o pedido em ${state} quando ${command} então ${isAllowed ? 'admitido' : '409 PORTAL.REQUEST_STATE_INVALID { state, allowed }'}`, () => {
          if (isAllowed) {
            expect(() =>
              assertTransition({ state }, { command }),
            ).not.toThrow();
          } else {
            expect(() => assertTransition({ state }, { command })).toThrowError(
              expect.objectContaining({
                code: 'PORTAL.REQUEST_STATE_INVALID',
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

describe('estados terminais — CONCLUIDO e DESISTIDO não admitem nenhum comando (C-0001-25)', () => {
  for (const state of TERMINAL_STATES) {
    for (const command of Object.keys(ALLOWED_BY_COMMAND)) {
      it(`dado o pedido em ${state} (terminal) quando ${command} então 409 PORTAL.REQUEST_STATE_INVALID`, () => {
        expect(() => assertTransition({ state }, { command })).toThrowError(
          expect.objectContaining({
            code: 'PORTAL.REQUEST_STATE_INVALID',
            status: 409,
          }),
        );
      });
    }
  }
});
