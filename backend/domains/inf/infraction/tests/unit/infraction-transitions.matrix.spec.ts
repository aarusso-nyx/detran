// Matriz de transições do agregado da infração: as 46 linhas de
// inf.infraction_transition_ref são lidas do bloco INSERT de
// backend/database/ddl/14-inf-lifecycle-vocabulary.sql (o DDL é a fonte, como em
// tools/check-lifecycle-vocabulary.ts) e cada `id` recebe um teste
// (rait-test-strategy.md §3; work/rounds/R-0006/contracts/CTG-0001.md §3.3).
// Guardas, gatilhos e qualificadores vêm de CTG-0001 §3 e §3.1; os códigos de
// erro e a precedência, de §4 (rait-error-catalog.md §3.12).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  assertTransition,
  INFRACTION_TRANSITIONS,
  resolveTransition,
} from '../../src/handwritten/index.js';

type TriggerKind = 'evento' | 'timer' | 'ato' | 'sistema';

interface DdlTransition {
  id: number;
  ruleRef: number;
  fromState: string | null;
  fromSubstate: string | null;
  toState: string;
  toSubstate: string | null;
  triggerKind: TriggerKind;
  triggerCode: string;
  status: 'vigente' | 'a_confirmar' | 'nao_modelada';
}

const ddl = readFileSync(
  fileURLToPath(
    new URL(
      '../../../../../database/ddl/14-inf-lifecycle-vocabulary.sql',
      import.meta.url,
    ),
  ),
  'utf8',
);

function insertBlock(table: string, terminator: string): string {
  const start = ddl.indexOf(`INSERT INTO ${table}`);
  const end = ddl.indexOf(terminator, start);
  return ddl.slice(start, end);
}

function ddlTransitions(): DdlTransition[] {
  const unquote = (value: string) =>
    value === 'NULL' ? null : value.slice(1, -1).replace(/''/g, "'");
  const rows: DdlTransition[] = [];
  for (const line of insertBlock(
    'inf.infraction_transition_ref (id,',
    'ON CONFLICT (id)',
  ).split('\n')) {
    const match =
      /^\s*\((\d+),\s*(\d+),\s*(NULL|'[^']*'),\s*(NULL|'[^']*'),\s*'([^']+)',\s*(NULL|'[^']*'),\s*'([^']+)',\s*'((?:[^']|'')*)',\s*'(?:[^']|'')*',\s*'(?:[^']|'')*',\s*'([a-z_]+)'/.exec(
        line,
      );
    if (!match) continue;
    rows.push({
      id: Number(match[1]),
      ruleRef: Number(match[2]),
      fromState: unquote(match[3] as string),
      fromSubstate: unquote(match[4] as string),
      toState: match[5] as string,
      toSubstate: unquote(match[6] as string),
      triggerKind: match[7] as TriggerKind,
      triggerCode: (match[8] as string).replace(/''/g, "'"),
      status: match[9] as DdlTransition['status'],
    });
  }
  return rows;
}

function ddlStates(): { code: string; sortOrder: number; terminal: boolean }[] {
  const rows: { code: string; sortOrder: number; terminal: boolean }[] = [];
  for (const line of insertBlock(
    'inf.infraction_state_ref',
    'ON CONFLICT (code)',
  ).split('\n')) {
    const match =
      /^\s*\('([A-Z_0-9]+)',\s*(\d+),\s*'[^']*',\s*(true|false),/.exec(line);
    if (!match) continue;
    rows.push({
      code: match[1] as string,
      sortOrder: Number(match[2]),
      terminal: match[3] === 'true',
    });
  }
  return rows.sort((left, right) => left.sortOrder - right.sortOrder);
}

const DDL_TRANSITIONS = ddlTransitions();
const DDL_STATES = ddlStates();

// Gatilho verificável por `id`, transcrito de CTG-0001 §3 (colunas kind e
// trigger_code) e §3.1 (guarda adicional). `qualifier` é o discriminante da
// §6.1: decisionKind, instance, kind do aviso, `reconhecimento` e, nas duplas
// 21/22, 23/24 e 34/35, o estado do prazo ('prazo_aberto' | 'prazo_vencido').
// `state`/`substate` são os da própria linha; onde `from_state` é nulo a linha
// casa qualquer estado (§3.1) e o teste usa o `to_state` como representante.
const TRIGGER_BY_ID: Record<number, { qualifier?: string }> = {
  1: {},
  2: {},
  3: {},
  4: { qualifier: 'NA' },
  5: {},
  6: {},
  7: { qualifier: 'defesa_previa' },
  8: {},
  9: { qualifier: 'acolhida' },
  10: { qualifier: 'indeferida' },
  11: {},
  12: {},
  13: { qualifier: 'NP' },
  14: { qualifier: 'reconhecimento' },
  15: {},
  16: { qualifier: 'jari' },
  17: {},
  18: { qualifier: 'reconhecimento' },
  19: {},
  20: {},
  21: { qualifier: 'prazo_aberto' },
  22: { qualifier: 'prazo_vencido' },
  23: { qualifier: 'prazo_aberto' },
  24: { qualifier: 'prazo_vencido' },
  25: { qualifier: 'provido' },
  26: {},
  27: {},
  28: {},
  29: {},
  30: { qualifier: 'cetran' },
  31: {},
  32: {},
  33: { qualifier: 'negado' },
  34: { qualifier: 'prazo_aberto' },
  35: { qualifier: 'prazo_vencido' },
  36: { qualifier: 'provido' },
  37: {},
  38: {},
  39: {},
  40: {},
  41: {},
  42: {},
  43: {},
  44: {},
  45: {},
  46: {},
};

// O `trigger_code` da tabela carrega o qualificador entre parênteses e, em
// algumas linhas, prosa da guarda ("na triagem", "(penalidade mantida)"): o
// gatilho canônico é o token do evento/timer/ato, e o discriminante vai em
// `qualifier` (§6.1).
function canonicalCode(triggerCode: string): string {
  const token = /^[A-Z0-9_-]+/.exec(triggerCode);
  return token ? token[0] : triggerCode;
}

// Linhas como 10 e 34/35 listam gatilhos alternativos
// ("RAIT_DECISAO_PUBLICADA(nao_conhecido) | ENCERRADO_DESISTENCIA"): todos são
// modelados naquele estado e nenhum deles é um negativo.
function modelledCodes(triggerCode: string): string[] {
  const withoutQualifiers = triggerCode.replace(/\([^)]*\)/g, ' ');
  return [...withoutQualifiers.matchAll(/[A-Z0-9][A-Z0-9_-]{2,}/g)].map(
    (match) => match[0],
  );
}

const currentOf = (row: DdlTransition) => ({
  state: row.fromState ?? row.toState,
  substate: row.fromSubstate,
});
const triggerOf = (row: DdlTransition) => ({
  kind: row.triggerKind,
  code: canonicalCode(row.triggerCode),
  ...(TRIGGER_BY_ID[row.id]?.qualifier
    ? { qualifier: TRIGGER_BY_ID[row.id]?.qualifier }
    : {}),
});

const TERMINAL_STATES = DDL_STATES.filter((state) => state.terminal).map(
  (state) => state.code,
);
const CLOSED_TRIGGERS = ['PAGAMENTO_CONFIRMADO', 'HANDOFF_DIVIDA_ATIVA'];
const DISTINCT_TRIGGERS = [
  ...new Map(
    DDL_TRANSITIONS.map((row) => [
      canonicalCode(row.triggerCode),
      { kind: row.triggerKind, code: canonicalCode(row.triggerCode) },
    ]),
  ).values(),
];

// (estado, gatilho) já modelados por alguma linha — inclusive as linhas
// `a_confirmar` (27, 38: o vencimento de T-PAR-3A é alerta do motor, §3.2) e a
// linha `nao_modelada` 41, que têm desfecho próprio e não são negativos.
const MODELLED = new Set(
  DDL_TRANSITIONS.flatMap((row) => {
    const states = row.fromState
      ? [row.fromState]
      : DDL_STATES.map((state) => state.code);
    return states.flatMap((state) =>
      modelledCodes(row.triggerCode).map((code) => `${state}|${code}`),
    );
  }),
);

describe('inf.infraction_transition_ref — matriz de transições', () => {
  it('dado o bloco INSERT do DDL 14 quando comparado a INFRACTION_TRANSITIONS então são as mesmas 46 linhas com os mesmos ids', () => {
    expect(DDL_TRANSITIONS).toHaveLength(46);
    expect(INFRACTION_TRANSITIONS).toHaveLength(DDL_TRANSITIONS.length);
    expect(INFRACTION_TRANSITIONS.map((row) => row.id)).toEqual(
      DDL_TRANSITIONS.map((row) => row.id),
    );
    expect(
      INFRACTION_TRANSITIONS.map((row) => ({
        id: row.id,
        ruleRef: row.ruleRef,
        fromState: row.fromState,
        fromSubstate: row.fromSubstate,
        toState: row.toState,
        toSubstate: row.toSubstate,
        triggerKind: row.triggerKind,
        triggerCode: row.triggerCode,
        status: row.status,
      })),
    ).toEqual(
      DDL_TRANSITIONS.map((row) => ({
        id: row.id,
        ruleRef: row.ruleRef,
        fromState: row.fromState,
        fromSubstate: row.fromSubstate,
        toState: row.toState,
        toSubstate: row.toSubstate,
        triggerKind: row.triggerKind,
        triggerCode: row.triggerCode,
        status: row.status,
      })),
    );
  });

  describe('linhas vigentes — resolveTransition devolve a linha', () => {
    for (const row of DDL_TRANSITIONS.filter(
      (candidate) => candidate.status === 'vigente',
    )) {
      const current = currentOf(row);
      it(`dado ${current.state}${current.substate ? `/${current.substate}` : ''} quando ${triggerOf(row).kind} ${triggerOf(row).code}${TRIGGER_BY_ID[row.id]?.qualifier ? `(${TRIGGER_BY_ID[row.id]?.qualifier})` : ''} então a transição ${row.id} leva a ${row.toState}${row.toSubstate ? `/${row.toSubstate}` : ''}`, () => {
        const resolved = resolveTransition(current, triggerOf(row));

        expect(resolved).not.toBeNull();
        expect(resolved).toMatchObject({
          id: row.id,
          toState: row.toState,
          toSubstate: row.toSubstate,
        });
        expect(assertTransition(current, triggerOf(row)).id).toBe(row.id);
      });
    }
  });

  describe('linhas a_confirmar — alerta, não transição (OD-301)', () => {
    for (const row of DDL_TRANSITIONS.filter(
      (candidate) => candidate.status === 'a_confirmar',
    )) {
      it(`dado ${row.fromState} quando o timer ${row.triggerCode} vence então a linha ${row.id} não transiciona (alerta; OD-301, CTG-0001 §3.2)`, () => {
        expect(resolveTransition(currentOf(row), triggerOf(row))).toBeNull();
        // A linha continua no espelho para a matriz ser auditável (§3.2).
        expect(
          INFRACTION_TRANSITIONS.find((entry) => entry.id === row.id)?.status,
        ).toBe('a_confirmar');
      });
    }
  });

  it('dado INSTANCIA_ENCERRADA quando REVISAO_POS_ENCERRAMENTO (linha 41, nao_modelada) então RAIT.INFRACTION_CLOSED_NO_REVISION 409', () => {
    const row = DDL_TRANSITIONS.find((candidate) => candidate.id === 41);
    expect(row?.status).toBe('nao_modelada');

    expect(
      resolveTransition(
        currentOf(row as DdlTransition),
        triggerOf(row as DdlTransition),
      ),
    ).toBeNull();
    expect(() =>
      assertTransition(
        currentOf(row as DdlTransition),
        triggerOf(row as DdlTransition),
      ),
    ).toThrowError(
      expect.objectContaining({
        code: 'RAIT.INFRACTION_CLOSED_NO_REVISION',
        status: 409,
      }),
    );
  });

  describe('negativos exaustivos — estado × gatilho sem linha correspondente', () => {
    for (const state of DDL_STATES.filter((candidate) => !candidate.terminal)) {
      const missing = DISTINCT_TRIGGERS.filter(
        (trigger) => !MODELLED.has(`${state.code}|${trigger.code}`),
      );
      it(`dado ${state.code} quando um dos ${missing.length} gatilhos sem linha então RAIT.INFRACTION_STATE_INVALID 409`, () => {
        expect(missing.length).toBeGreaterThan(0);
        for (const trigger of missing) {
          expect(() =>
            assertTransition({ state: state.code, substate: null }, trigger),
          ).toThrowError(
            expect.objectContaining({
              code: 'RAIT.INFRACTION_STATE_INVALID',
              status: 409,
            }),
          );
        }
      });
    }
  });

  describe('estados terminais — RAIT.INFRACTION_TERMINAL antes de qualquer gatilho (§4 precedência 1)', () => {
    for (const state of TERMINAL_STATES.filter(
      (code) => code !== 'INSTANCIA_ENCERRADA',
    )) {
      it(`dado ${state} (is_terminal=true) quando qualquer gatilho então RAIT.INFRACTION_TERMINAL 409`, () => {
        for (const trigger of DISTINCT_TRIGGERS) {
          expect(() =>
            assertTransition({ state, substate: null }, trigger),
          ).toThrowError(
            expect.objectContaining({
              code: 'RAIT.INFRACTION_TERMINAL',
              status: 409,
            }),
          );
        }
      });
    }

    it('dado INSTANCIA_ENCERRADA quando gatilho fora de pagamento e cobrança então RAIT.INFRACTION_CLOSED_NO_REVISION 409 (§4 precedência 2)', () => {
      const revisionTriggers = DISTINCT_TRIGGERS.filter(
        (trigger) => !CLOSED_TRIGGERS.includes(trigger.code),
      );
      expect(revisionTriggers.length).toBeGreaterThan(0);
      for (const trigger of revisionTriggers) {
        expect(() =>
          assertTransition(
            { state: 'INSTANCIA_ENCERRADA', substate: 'PENDENTE_PAGAMENTO' },
            trigger,
          ),
        ).toThrowError(
          expect.objectContaining({
            code: 'RAIT.INFRACTION_CLOSED_NO_REVISION',
            status: 409,
          }),
        );
      }
    });

    it('dado INSTANCIA_ENCERRADA/PENDENTE_PAGAMENTO quando PAGAMENTO_CONFIRMADO ou HANDOFF_DIVIDA_ATIVA então as linhas 39 e 40 são admitidas', () => {
      expect(
        resolveTransition(
          { state: 'INSTANCIA_ENCERRADA', substate: 'PENDENTE_PAGAMENTO' },
          { kind: 'evento', code: 'PAGAMENTO_CONFIRMADO' },
        ),
      ).toMatchObject({ id: 39, toSubstate: 'QUITADA' });
      expect(
        resolveTransition(
          { state: 'INSTANCIA_ENCERRADA', substate: 'PENDENTE_PAGAMENTO' },
          { kind: 'sistema', code: 'HANDOFF_DIVIDA_ATIVA' },
        ),
      ).toMatchObject({ id: 40, toSubstate: 'EM_COBRANCA' });
    });
  });
});
