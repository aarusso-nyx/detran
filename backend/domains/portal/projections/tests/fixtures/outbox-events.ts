// Fixtures EM CÓDIGO dos eventos consumidos pelas projeções do Portal
// (R-0009 CTG-0002 §7.2, §7.5 e §12 — ids 00000000-0000-7000-8000-0070007000nn).
// Envelope de rait-events-sse-contract.md §1 / `TeatEventEnvelope` de
// `@detran/shared`; `data` só ids, tokens, datas e números. Os `type` de
// inf/notification e inf/collection seguem a forma mínima proposta em OD-P28
// (§7.5). Usado pelos specs `unit` (`applyEvent`) e pela integração de replay
// (C-0002-57), que grava estas linhas em `integration.outbox`.
import type { TeatEventEnvelope } from '@detran/shared';

export const FIXTURE_TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR = {
  kind: 'system' as const,
  id: '00000000-0000-4000-8000-0000b0000001',
};

export const AIT_F1 = '00000000-0000-7000-8000-0000f0000001';
export const AIT_F2 = '00000000-0000-7000-8000-0000f0000002';
export const AIT_F3 = '00000000-0000-7000-8000-0000f0000003';
export const AIT_F9 = '00000000-0000-7000-8000-0000f0000009';
export const INFRACTION_D1 = '00000000-0000-7000-8000-0000d0000001';
export const INFRACTION_D2 = '00000000-0000-7000-8000-0000d0000002';
export const INFRACTION_D9 = '00000000-0000-7000-8000-0000d0000009';
export const NOTICE_103 = '00000000-0000-7000-8000-007000700103';
export const CASE_207 = '00000000-0000-7000-8000-007000700207';
export const INQUIRY_308 = '00000000-0000-7000-8000-007000700308';
export const DECISION_409 = '00000000-0000-7000-8000-007000700409';
export const PAYMENT_105 = '00000000-0000-7000-8000-007000700105';
export const CRASH_FF3 = '00000000-0000-7000-8000-00007ff00003';
export const EXAM_FF2 = '00000000-0000-7000-8000-00007ff00002';

export const EVENT_IDS = {
  e1: '00000000-0000-7000-8000-007000700001',
  e2: '00000000-0000-7000-8000-007000700002',
  e3: '00000000-0000-7000-8000-007000700003',
  e4: '00000000-0000-7000-8000-007000700004',
  e5: '00000000-0000-7000-8000-007000700005',
  e6: '00000000-0000-7000-8000-007000700006',
  e7: '00000000-0000-7000-8000-007000700007',
  e8: '00000000-0000-7000-8000-007000700008',
  e9: '00000000-0000-7000-8000-007000700009',
  e10: '00000000-0000-7000-8000-007000700010',
  e11: '00000000-0000-7000-8000-007000700011',
  e12: '00000000-0000-7000-8000-007000700012',
} as const;

/** `type` técnicos consumidos (§7.2/§7.5) — em `tests/` para não virar literal em `src/`. */
export const CONSUMED_TYPES = {
  infractionChanged: 'inf.infraction.changed',
  penaltyFinal: 'inf.infraction.penalty-final',
  noticeDispatched: 'inf.notice.dispatched',
  noticeAcknowledged: 'inf.notice.acknowledged',
  paymentConfirmed: 'inf.payment.confirmed',
  raitCaseCreated: 'rait.case.created',
  raitCaseChanged: 'rait.case.changed',
  raitCaseAdmitted: 'rait.case.admitted',
  raitCaseReceived: 'rait.case.received',
  raitCaseTransited: 'rait.case.transited',
  raitCaseWithdrawn: 'rait.case.withdrawn',
  raitDecisionPublished: 'rait.decision.published',
  raitInquiryChanged: 'rait.inquiry.changed',
  crashChanged: 'est.crash.changed',
  examChanged: 'ch.exam.changed',
  /** publicado pelo PRÓPRIO Portal (§11) — nunca consumido (§7.3). */
  portalNotificationAcknowledged: 'portal.notification.acknowledged',
} as const;

export interface OutboxEventFixture extends TeatEventEnvelope {
  id: string;
}

function envelope(
  id: string,
  type: string,
  domainEvent: string | undefined,
  aggregate: { kind: string; id: string; version: number },
  data: Record<string, unknown>,
  occurredAt: string,
): OutboxEventFixture {
  return {
    id,
    type,
    ...(domainEvent ? { domainEvent } : {}),
    version: 1,
    occurredAt,
    tenantId: FIXTURE_TENANT_ID,
    actor: ACTOR,
    correlationId: `00000000-0000-4000-8000-0070007000${id.slice(-2)}`,
    aggregate,
    data,
  } as OutboxEventFixture;
}

/** Os 12 eventos do §12, na ordem de `created_at` do replay. */
export const OUTBOX_EVENTS: readonly OutboxEventFixture[] = [
  envelope(
    EVENT_IDS.e1,
    CONSUMED_TYPES.infractionChanged,
    'INFRACAO_ESTADO_ALTERADO',
    { kind: 'infraction', id: INFRACTION_D2, version: 2 },
    {
      infractionId: INFRACTION_D2,
      aitId: AIT_F2,
      fromState: 'AIT_LAVRADO',
      toState: 'NOTIFICADO_AUTUACAO',
      substate: 'PRAZO_DEFESA_ABERTO',
    },
    '2026-09-01T12:00:00.000Z',
  ),
  envelope(
    EVENT_IDS.e2,
    CONSUMED_TYPES.infractionChanged,
    'INFRACAO_ESTADO_ALTERADO',
    { kind: 'infraction', id: INFRACTION_D2, version: 3 },
    {
      infractionId: INFRACTION_D2,
      aitId: AIT_F2,
      fromState: 'NOTIFICADO_AUTUACAO',
      toState: 'DEFESA_EM_JULGAMENTO',
    },
    '2026-09-02T12:00:00.000Z',
  ),
  envelope(
    EVENT_IDS.e3,
    CONSUMED_TYPES.noticeDispatched,
    'NOTIFICACAO_EXPEDIDA',
    { kind: 'notice', id: NOTICE_103, version: 1 },
    {
      noticeId: NOTICE_103,
      infractionId: INFRACTION_D2,
      aitId: AIT_F2,
      kind: 'NA',
      channel: 'sne',
      dispatchedOn: '2026-09-01',
      printedDeadlineOn: '2026-10-01',
    },
    '2026-09-03T12:00:00.000Z',
  ),
  envelope(
    EVENT_IDS.e4,
    CONSUMED_TYPES.noticeAcknowledged,
    'NOTIFICACAO_CIENCIA',
    { kind: 'notice', id: NOTICE_103, version: 2 },
    {
      noticeId: NOTICE_103,
      infractionId: INFRACTION_D2,
      aitId: AIT_F2,
      effectiveOn: '2026-09-11',
      fictitious: false,
    },
    '2026-09-04T12:00:00.000Z',
  ),
  envelope(
    EVENT_IDS.e5,
    CONSUMED_TYPES.paymentConfirmed,
    'PAGAMENTO_CONFIRMADO',
    { kind: 'payment', id: PAYMENT_105, version: 1 },
    {
      paymentId: PAYMENT_105,
      documentId: '00000000-0000-7000-8000-007000700205',
      infractionId: INFRACTION_D9,
      aitId: AIT_F9,
      tier: 'desconto_80',
      paidOn: '2026-09-10',
      amount: 156.18,
    },
    '2026-09-05T12:00:00.000Z',
  ),
  envelope(
    EVENT_IDS.e6,
    CONSUMED_TYPES.penaltyFinal,
    'PENALIDADE_DEFINITIVA',
    { kind: 'infraction', id: INFRACTION_D9, version: 9 },
    {
      infractionId: INFRACTION_D9,
      aitId: AIT_F9,
      finalOn: '2026-07-15',
      points: 4,
      amountTier: 'integral_juros',
    },
    '2026-09-06T12:00:00.000Z',
  ),
  envelope(
    EVENT_IDS.e7,
    CONSUMED_TYPES.raitCaseCreated,
    'RAIT_CASO_PROTOCOLADO',
    { kind: 'case', id: CASE_207, version: 1 },
    {
      caseId: CASE_207,
      aitId: AIT_F3,
      instance: 'defesa_previa',
      protocolNumber: 'FIX',
      intakeChannel: 'portal',
      markOn: '2026-08-10',
    },
    '2026-09-07T12:00:00.000Z',
  ),
  envelope(
    EVENT_IDS.e8,
    CONSUMED_TYPES.raitInquiryChanged,
    undefined,
    { kind: 'case', id: CASE_207, version: 2 },
    {
      caseId: CASE_207,
      inquiryId: INQUIRY_308,
      addressee: 'cidadao',
      dueOn: '2026-09-30',
    },
    '2026-09-08T12:00:00.000Z',
  ),
  envelope(
    EVENT_IDS.e9,
    CONSUMED_TYPES.raitDecisionPublished,
    'RAIT_DECISAO_PUBLICADA',
    { kind: 'case', id: CASE_207, version: 3 },
    {
      caseId: CASE_207,
      decisionId: DECISION_409,
      decisionKind: 'indeferido',
      publishedOn: '2026-09-12',
      channel: 'portal',
    },
    '2026-09-09T12:00:00.000Z',
  ),
  envelope(
    EVENT_IDS.e10,
    CONSUMED_TYPES.infractionChanged,
    'INFRACAO_ESTADO_ALTERADO',
    { kind: 'infraction', id: INFRACTION_D1, version: 1 },
    {
      infractionId: INFRACTION_D1,
      aitId: AIT_F1,
      fromState: null,
      toState: 'AIT_LAVRADO',
    },
    '2026-09-10T12:00:00.000Z',
  ),
  envelope(
    EVENT_IDS.e11,
    CONSUMED_TYPES.crashChanged,
    'BAT_ESTADO_ALTERADO',
    { kind: 'crash', id: CRASH_FF3, version: 1 },
    {
      crashId: CRASH_FF3,
    },
    '2026-09-11T12:00:00.000Z',
  ),
  envelope(
    EVENT_IDS.e12,
    CONSUMED_TYPES.examChanged,
    'EXAME_ESTADO_ALTERADO',
    { kind: 'exam', id: EXAM_FF2, version: 1 },
    {
      examId: EXAM_FF2,
    },
    '2026-09-12T12:00:00.000Z',
  ),
];

export function eventById(id: string): OutboxEventFixture {
  const found = OUTBOX_EVENTS.find((event) => event.id === id);
  if (!found) throw new Error(`fixture de evento ${id} inexistente`);
  return found;
}
