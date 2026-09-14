// Esquemas dos cinco eventos publicados do agregado
// (rait-events-sse-contract.md §1 envelope e §2.4 catálogo;
// work/rounds/R-0006/contracts/CTG-0001.md §6.1): cada
// INFRACTION_EVENT_SCHEMAS[type] aceita um envelope válido com ids de fixture,
// rejeita payload sem campo obrigatório e rejeita token fora do vocabulário.
// O mesmo exemplo é conferido contra docs/framework/schemas/events/*.schema.json
// (`ajv` não está em node_modules deste pacote: a conferência compara chaves
// obrigatórias, `const` e `enum` lendo o JSON, como manda a tarefa).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { INFRACTION_EVENT_SCHEMAS } from '../../src/handwritten/index.js';

const TENANT = '00000000-0000-7000-8000-00000000a001';
const infraction = (nnnn: string) => `00000000-0000-7000-8000-0000d000${nnnn}`;
const ait = (nnnn: string) => `00000000-0000-7000-8000-0000f000${nnnn}`;
const TIMER_0014_JUL = '00000000-0000-7000-8000-0000d1000079';
const CASE_08 = '00000000-0000-7000-8000-000010000008';
const SECRETARY = '00000000-0000-4000-8000-0000b0000005';
// `inf.payment` (BP-INF-COLLECTION-001) e `inf.rait_suspension_act` (DDL 39)
// nascem fora do CTG-0001 e não têm prefixo de id fixado no §7: uuid nulo como
// marcador explícito de pendência, nunca um id canônico inventado.
const PENDING_ID = '00000000-0000-0000-0000-000000000000';

interface JsonSchema {
  required?: string[];
  properties?: Record<string, JsonSchema>;
  const?: unknown;
  enum?: unknown[];
  type?: string | string[];
}

function jsonSchema(type: string): JsonSchema {
  return JSON.parse(
    readFileSync(
      fileURLToPath(
        new URL(
          `../../../../../../docs/framework/schemas/events/${type}.schema.json`,
          import.meta.url,
        ),
      ),
      'utf8',
    ),
  ) as JsonSchema;
}

// Conferência do exemplo contra o JSON Schema, sem ajv: presença de todo
// `required`, igualdade de todo `const`, pertinência a todo `enum` e ausência de
// chave fora de `properties` (additionalProperties: false ⇒ .strict()).
function schemaProblems(
  schema: JsonSchema,
  value: unknown,
  path = '',
): string[] {
  const problems: string[] = [];
  if (schema.const !== undefined && value !== schema.const) {
    problems.push(`${path}: const ${String(schema.const)} != ${String(value)}`);
  }
  if (schema.enum && !schema.enum.includes(value as never)) {
    problems.push(`${path}: ${String(value)} fora do enum`);
  }
  if (schema.properties && typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>;
    for (const key of schema.required ?? []) {
      if (!(key in record))
        problems.push(`${path}/${key}: obrigatório ausente`);
    }
    for (const key of Object.keys(record)) {
      const child = schema.properties[key];
      if (!child) {
        problems.push(`${path}/${key}: chave fora de properties`);
        continue;
      }
      problems.push(...schemaProblems(child, record[key], `${path}/${key}`));
    }
  }
  return problems;
}

let envelopeSeq = 0;
const envelope = (
  type: string,
  domainEvent: string,
  aggregate: { kind: string; id: string; version: number },
  actor: { kind: string; id: string; role?: string },
  data: Record<string, unknown>,
) => ({
  id: `01J8ZK000000000000000${(envelopeSeq += 1).toString().padStart(5, '0')}`,
  type,
  domainEvent,
  version: 1,
  occurredAt: '2026-09-10T16:00:00.000Z',
  tenantId: TENANT,
  actor,
  correlationId: '01J8ZK0000000000000000REQ0',
  aggregate,
  data,
});

// Um exemplo válido por evento, com as fixtures do CTG-0001 §7 e os tokens das
// linhas de inf.infraction_transition_ref / inf.infraction_timer_ref.
const EXAMPLES: Record<
  string,
  {
    example: ReturnType<typeof envelope>;
    missing: string;
    outOfVocabulary: [string, unknown];
  }
> = {
  // Infração 0006 entrando em RECURSO_1A_INSTANCIA pela linha 16 do DDL 14.
  'inf.infraction.changed': {
    example: envelope(
      'inf.infraction.changed',
      'INFRACAO_ESTADO_ALTERADO',
      { kind: 'infraction', id: infraction('0006'), version: 1 },
      { kind: 'user', id: SECRETARY, role: 'rait-secretary' },
      {
        infractionId: infraction('0006'),
        aitId: ait('0006'),
        fromState: 'NOTIFICADO_PENALIDADE',
        toState: 'RECURSO_1A_INSTANCIA',
        substate: 'EM_ADMISSIBILIDADE_1A',
        triggerKind: 'evento',
        triggerCode: 'RAIT_CASO_PROTOCOLADO(jari)',
        ruleRef: 14,
      },
    ),
    missing: 'toState',
    outOfVocabulary: ['toState', 'RECURSO_3A_INSTANCIA'],
  },
  // Infração 0009 (INSTANCIA_ENCERRADA, points_registered=true, linha 17);
  // `finalOn` = due_on de T-NP-VENC (§7.2). `points` não tem fonte na lista
  // fechada desta tarefa: 0 é o mínimo do esquema e só a forma é exercitada.
  'inf.infraction.penalty-final': {
    example: envelope(
      'inf.infraction.penalty-final',
      'PENALIDADE_DEFINITIVA',
      { kind: 'infraction', id: infraction('0009'), version: 1 },
      { kind: 'user', id: SECRETARY, role: 'rait-secretary' },
      {
        infractionId: infraction('0009'),
        aitId: ait('0009'),
        finalOn: '2026-07-15',
        points: 0,
        amountTier: 'nenhum',
      },
    ),
    missing: 'amountTier',
    outOfVocabulary: ['amountTier', 'desconto_50'],
  },
  // Infração 0015 (CANCELADO_DEFINITIVO com paid=true, payment_tier
  // 'restituido', linha 29). `amount` não tem fonte canônica (nenhuma fixture
  // carrega valor de multa): o exemplo usa o limite do esquema.
  'inf.infraction.refund-due': {
    example: envelope(
      'inf.infraction.refund-due',
      'RESTITUICAO_DEVIDA',
      { kind: 'infraction', id: infraction('0015'), version: 1 },
      { kind: 'user', id: SECRETARY, role: 'rait-secretary' },
      {
        infractionId: infraction('0015'),
        paymentId: PENDING_ID,
        amount: 1,
        reason: 'CANCELADO_DEFINITIVO',
      },
    ),
    missing: 'paymentId',
    outOfVocabulary: ['amount', 0],
  },
  // T-JUL-24M da infração 0014, vencido em 2026-09-10 (§7.2), expiry_kind
  // 'transicao' no catálogo de timers.
  'inf.timer.expired': {
    example: envelope(
      'inf.timer.expired',
      'TIMER_VENCIDO',
      { kind: 'infraction', id: infraction('0014'), version: 1 },
      { kind: 'timer', id: TIMER_0014_JUL },
      {
        ownerKind: 'infraction',
        ownerId: infraction('0014'),
        timerCode: 'T-JUL-24M',
        dueOn: '2026-09-10',
        effect: 'transicao',
      },
    ),
    missing: 'timerCode',
    outOfVocabulary: ['effect', 'indicador'],
  },
  // Caso 10 de CTG-0001 §5.1: T-DIL do caso RAIT 08 reprogramado por ato de
  // suspensão de 10 dias úteis (2026-12-07 → 2026-12-22). `reason` e a
  // anulabilidade de `suspensionActId` são a emenda §5.2 (decisão M14).
  'inf.timer.rescheduled': {
    example: envelope(
      'inf.timer.rescheduled',
      'TIMER_REPROGRAMADO',
      { kind: 'case', id: CASE_08, version: 1 },
      { kind: 'user', id: SECRETARY, role: 'rait-secretary' },
      {
        ownerId: CASE_08,
        timerCode: 'T-DIL',
        oldDueOn: '2026-12-07',
        newDueOn: '2026-12-22',
        suspensionActId: PENDING_ID,
        reason: 'suspensao',
      },
    ),
    missing: 'newDueOn',
    outOfVocabulary: ['timerCode', 'T-DIL-30'],
  },
};

describe('esquemas dos eventos publicados do agregado (§2.4)', () => {
  it('dado o catálogo §2.4 quando INFRACTION_EVENT_SCHEMAS é lido então tem exatamente os cinco tipos publicados', () => {
    expect(Object.keys(INFRACTION_EVENT_SCHEMAS).sort()).toEqual(
      Object.keys(EXAMPLES).sort(),
    );
  });

  for (const [type, { example, missing, outOfVocabulary }] of Object.entries(
    EXAMPLES,
  )) {
    describe(type, () => {
      it(`dado um envelope de ${type} com ids de fixture quando parse então é aceito`, () => {
        expect(() =>
          INFRACTION_EVENT_SCHEMAS[type].parse(example),
        ).not.toThrow();
      });

      it(`dado um envelope de ${type} sem o campo obrigatório ${missing} quando parse então é rejeitado`, () => {
        const data = { ...(example.data as Record<string, unknown>) };
        delete data[missing];

        expect(() =>
          INFRACTION_EVENT_SCHEMAS[type].parse({ ...example, data }),
        ).toThrow();
      });

      it(`dado um envelope de ${type} com ${outOfVocabulary[0]} fora do vocabulário quando parse então é rejeitado`, () => {
        const data = {
          ...(example.data as Record<string, unknown>),
          [outOfVocabulary[0]]: outOfVocabulary[1],
        };

        expect(() =>
          INFRACTION_EVENT_SCHEMAS[type].parse({ ...example, data }),
        ).toThrow();
      });

      it(`dado o mesmo envelope de ${type} quando conferido contra ${type}.schema.json então não há divergência de obrigatórios, const e enums`, () => {
        expect(schemaProblems(jsonSchema(type), example)).toEqual([]);
      });
    });
  }

  // Emenda CTG-0001 §5.2 (decisão M14): `reason` obrigatório
  // (`suspensao`/`prorrogacao`) e `suspensionActId` obrigatório e anulável —
  // nulo só na prorrogação, ausência sempre rejeitada. O espelho zod de
  // `inf.timer.rescheduled` ainda não conhece `reason` nem aceita
  // `suspensionActId` nulo (TASK-0011); estes `it` ficam vermelhos até lá.
  describe('inf.timer.rescheduled — emenda §5.2 (reason e suspensionActId anulável)', () => {
    const rescheduledExample = EXAMPLES['inf.timer.rescheduled'].example;

    it('dado um envelope de inf.timer.rescheduled com suspensionActId nulo e reason prorrogacao (caso 20) quando parse então é aceito', () => {
      const data = {
        ...(rescheduledExample.data as Record<string, unknown>),
        suspensionActId: null,
        reason: 'prorrogacao',
      };

      expect(() =>
        INFRACTION_EVENT_SCHEMAS['inf.timer.rescheduled'].parse({
          ...rescheduledExample,
          data,
        }),
      ).not.toThrow();
    });

    it('dado um envelope de inf.timer.rescheduled sem o campo reason quando parse então é rejeitado', () => {
      const data = { ...(rescheduledExample.data as Record<string, unknown>) };
      delete data.reason;

      expect(() =>
        INFRACTION_EVENT_SCHEMAS['inf.timer.rescheduled'].parse({
          ...rescheduledExample,
          data,
        }),
      ).toThrow();
    });

    it('dado um envelope de inf.timer.rescheduled com reason fora de suspensao/prorrogacao quando parse então é rejeitado', () => {
      const data = {
        ...(rescheduledExample.data as Record<string, unknown>),
        reason: 'reprogramacao',
      };

      expect(() =>
        INFRACTION_EVENT_SCHEMAS['inf.timer.rescheduled'].parse({
          ...rescheduledExample,
          data,
        }),
      ).toThrow();
    });

    it('dado um envelope de inf.timer.rescheduled sem suspensionActId (ausência, não nulo) quando parse então é rejeitado', () => {
      const data = { ...(rescheduledExample.data as Record<string, unknown>) };
      delete data.suspensionActId;

      expect(() =>
        INFRACTION_EVENT_SCHEMAS['inf.timer.rescheduled'].parse({
          ...rescheduledExample,
          data,
        }),
      ).toThrow();
    });
  });
});
