// Esquemas zod dos cinco eventos publicados do agregado
// (docs/framework/arch/rait-events-sse-contract.md §1 envelope e §2.4 catálogo;
// work/rounds/R-0006/contracts/CTG-0001.md §6.1). Cada schema é a tradução
// literal do JSON Schema de docs/framework/schemas/events/<type>.schema.json:
// mesmos campos, mesmos enums e `additionalProperties: false` ⇒ `strictObject`.
// Os vocabulários são os códigos de 14-inf-lifecycle-vocabulary.sql.
import { z } from 'zod';
import type { ZodType } from 'zod';

/** `inf.infraction_state_ref.code` (15 estados, ordem de `sort_order`). */
const STATES = [
  'AIT_LAVRADO',
  'NOTIFICADO_AUTUACAO',
  'DEFESA_EM_JULGAMENTO',
  'PENALIDADE_A_APLICAR',
  'NOTIFICADO_PENALIDADE',
  'RECURSO_1A_INSTANCIA',
  'AGUARDANDO_RECURSO_2A',
  'RECURSO_2A_INSTANCIA',
  'INSTANCIA_ENCERRADA',
  'ARQUIVADO',
  'CANCELADO_POS_INTEGRACAO',
  'AIT_CANCELADO',
  'EXTINTO_DECADENCIA',
  'EXTINTO_PRESCRICAO',
  'CANCELADO_DEFINITIVO',
] as const;

/** `inf.infraction_substate_ref.code` (12 sub-estados). */
const SUBSTATES = [
  'PRAZO_DEFESA_ABERTO',
  'INDICACAO_EM_PROCESSAMENTO',
  'EM_ADMISSIBILIDADE_1A',
  'EM_REMESSA_JARI',
  'EM_JULGAMENTO_JARI',
  'PROVIDO_1A',
  'NEGADO_1A',
  'EM_ADMISSIBILIDADE_2A',
  'EM_JULGAMENTO_CETRAN',
  'PENDENTE_PAGAMENTO',
  'QUITADA',
  'EM_COBRANCA',
] as const;

/** `inf.infraction_closure_motive_ref.code` (8 motivos). */
const CLOSURE_MOTIVES = [
  'nao_interposicao_1a',
  'nao_interposicao_2a',
  'julgamento_2a',
  'reconhecimento',
  'desistencia',
  'nao_conhecimento_intempestivo',
  'na_nao_expedida',
  'insubsistente',
] as const;

/** `inf.infraction_payment_tier_ref.code` (6 faixas). */
const PAYMENT_TIERS = [
  'nenhum',
  'desconto_80',
  'desconto_60_reconhecimento',
  'desconto_40_fora_sne',
  'integral_juros',
  'restituido',
] as const;

/** `inf.infraction_timer_ref.code` (18 timers). */
const TIMER_CODES = [
  'T-NA',
  'T-SNE-CIENCIA',
  'T-DEF',
  'T-IND',
  'T-NA-IND',
  'T-DEC',
  'T-NP-VENC',
  'T-REM10',
  'T-JUL-24M',
  'T-DIL',
  'T-R2',
  'T-PAR-3A',
  'T-PRESC-5A',
  'T-VOTO',
  'T-CONV',
  'T-ASS',
  'T-CLAIM',
  'SLA-30',
] as const;

/** `inf.infraction_transition_ref.trigger_kind`. */
const TRIGGER_KINDS = ['evento', 'timer', 'ato', 'sistema'] as const;

/** `expiry_kind` efetivo: `guarda` e `indicador` nunca vencem. */
const EXPIRY_EFFECTS = ['transicao', 'alerta', 'marco', 'regra'] as const;

const OWNER_KINDS = ['case', 'infraction', 'session'] as const;

/** `aggregate.kind` dos eventos de timer (esquemas §2.4). */
const TIMER_AGGREGATE_KINDS = [
  'case',
  'infraction',
  'session',
  'batch',
  'clock',
  'assignment',
  'agenda-item',
  'outbox',
] as const;

const actor = z.strictObject({
  kind: z.enum(['user', 'system', 'timer']),
  id: z.string(),
  role: z.string().optional(),
});

function envelope(
  type: string,
  domainEvent: string,
  aggregateKind: ZodType,
  data: ZodType,
) {
  return z.strictObject({
    id: z.string(),
    type: z.literal(type),
    domainEvent: z.literal(domainEvent),
    version: z.int().min(1),
    occurredAt: z.iso.datetime(),
    tenantId: z.uuid(),
    actor,
    correlationId: z.string(),
    causationId: z.string().optional(),
    aggregate: z.strictObject({
      kind: aggregateKind,
      id: z.uuid(),
      version: z.int().min(1),
    }),
    data,
  });
}

const infractionChanged = envelope(
  'inf.infraction.changed',
  'INFRACAO_ESTADO_ALTERADO',
  z.literal('infraction'),
  z.strictObject({
    infractionId: z.uuid(),
    aitId: z.uuid(),
    // null na criação do agregado (linha 1 do DDL 14, from_state IS NULL).
    fromState: z.enum(STATES).nullable(),
    toState: z.enum(STATES),
    substate: z.enum(SUBSTATES).optional(),
    closureMotive: z.enum(CLOSURE_MOTIVES).optional(),
    triggerKind: z.enum(TRIGGER_KINDS),
    triggerCode: z.string(),
    ruleRef: z.int().min(1),
  }),
);

const penaltyFinal = envelope(
  'inf.infraction.penalty-final',
  'PENALIDADE_DEFINITIVA',
  z.literal('infraction'),
  z.strictObject({
    infractionId: z.uuid(),
    aitId: z.uuid(),
    finalOn: z.iso.date(),
    points: z.int().min(0),
    amountTier: z.enum(PAYMENT_TIERS),
  }),
);

const refundDue = envelope(
  'inf.infraction.refund-due',
  'RESTITUICAO_DEVIDA',
  z.literal('infraction'),
  z.strictObject({
    infractionId: z.uuid(),
    paymentId: z.uuid(),
    amount: z.number().gt(0),
    reason: z.string(),
  }),
);

const timerExpired = envelope(
  'inf.timer.expired',
  'TIMER_VENCIDO',
  z.enum(TIMER_AGGREGATE_KINDS),
  z.strictObject({
    ownerKind: z.enum(OWNER_KINDS),
    ownerId: z.uuid(),
    timerCode: z.enum(TIMER_CODES),
    dueOn: z.iso.date(),
    effect: z.enum(EXPIRY_EFFECTS),
  }),
);

const timerRescheduled = envelope(
  'inf.timer.rescheduled',
  'TIMER_REPROGRAMADO',
  z.enum(TIMER_AGGREGATE_KINDS),
  z.strictObject({
    ownerId: z.uuid(),
    timerCode: z.enum(TIMER_CODES),
    oldDueOn: z.iso.date(),
    newDueOn: z.iso.date(),
    // inf.rait_suspension_act (DDL 39); referência sem FK (M5). Obrigatório e
    // anulável: o ato existe na suspensão e é nulo na prorrogação (CTG-0001
    // §5.2, emenda decisão M14).
    suspensionActId: z.uuid().nullable(),
    // Origem da reprogramação: suspensão por ato ou prorrogação única de
    // T-DIL; tokens em português fixados pelo Owner em 2026-09-14 (decisão
    // M14, work/rounds/R-0006/plan.md).
    reason: z.enum(['suspensao', 'prorrogacao']),
  }),
);

/** Os cinco `type` publicados de rait-events-sse-contract.md §2.4. */
export interface InfractionEventSchemas extends Record<string, ZodType> {
  'inf.infraction.changed': ZodType;
  'inf.infraction.penalty-final': ZodType;
  'inf.infraction.refund-due': ZodType;
  'inf.timer.expired': ZodType;
  'inf.timer.rescheduled': ZodType;
}

export const INFRACTION_EVENT_SCHEMAS: InfractionEventSchemas = {
  'inf.infraction.changed': infractionChanged,
  'inf.infraction.penalty-final': penaltyFinal,
  'inf.infraction.refund-due': refundDue,
  'inf.timer.expired': timerExpired,
  'inf.timer.rescheduled': timerRescheduled,
};
