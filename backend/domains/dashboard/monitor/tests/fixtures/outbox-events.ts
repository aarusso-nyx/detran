// Fixtures EM CÓDIGO dos eventos consumidos pelos oito projetores de
// `@detran/dashboard-monitor` (CTG-0001 §4.1/§4.3 — "uma fixture de evento
// por projetor", C-0001-05). Forma de
// `backend/domains/portal/projections/tests/fixtures/outbox-events.ts`
// (envelope de `rait-events-sse-contract.md` §1, `data` só ids/tokens/datas,
// nunca dado pessoal). `type`/`domainEvent`/campos de `data` são transcritos
// literalmente de CTG-0001 §4.1 (nunca inventados); `aggregate.kind` segue,
// quando o contrato o cita explicitamente (`teat_measures`/`duty-evidence`/
// `source-freshness`/`pec-deadlines`), o valor de CTG-0001; nos demais
// (RAIT/INF), o enum de `rait-events-sse-contract.md` §1
// ("case|infraction|session|batch|clock|assignment|agenda-item|outbox").
// `id`s de teste (nunca os prefixos `80…`/`81…` reservados a
// `backend/database/seed/`, M8): `00000000-0000-7000-8000-0082000000nn`
// (agregados) e `…0082001000nn` (eventos), namespace só desta suíte.
import type { TeatEventEnvelope } from '@detran/shared';

export const FIXTURE_TENANT_ID = '00000000-0000-7000-8000-00000000a001';
/** Segundo tenant só para o caso `tenant_mismatch` (C-0001-05) — nunca usado
 * para escrever fora do `afterAll` que o limpa. */
export const OTHER_TENANT_ID = '00000000-0000-7000-8000-0082000000ff';

const ACTOR = {
  kind: 'system' as const,
  id: '00000000-0000-4000-8000-0000b0000001',
};

export const AGGREGATE_IDS = {
  case: '00000000-0000-7000-8000-008200000001',
  syncBatch: '00000000-0000-7000-8000-008200000002',
  pecCase: '00000000-0000-7000-8000-008200000003',
  measure: '00000000-0000-7000-8000-008200000004',
  manifestation: '00000000-0000-7000-8000-008200000005',
  dutyCycle: '00000000-0000-7000-8000-008200000006',
  source: '00000000-0000-7000-8000-008200000007',
} as const;

export const EVENT_IDS = {
  prescriptionRisk: '00000000-0000-7000-8000-008200100001',
  production: '00000000-0000-7000-8000-008200100002',
  integrationHealth: '00000000-0000-7000-8000-008200100003',
  pecDeadlines: '00000000-0000-7000-8000-008200100004',
  teatMeasures: '00000000-0000-7000-8000-008200100005',
  portalServiceMetrics: '00000000-0000-7000-8000-008200100006',
  dutyEvidence: '00000000-0000-7000-8000-008200100007',
  sourceFreshness: '00000000-0000-7000-8000-008200100008',
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
  tenantId: string = FIXTURE_TENANT_ID,
): OutboxEventFixture {
  return {
    id,
    type,
    ...(domainEvent ? { domainEvent } : {}),
    version: 1,
    occurredAt,
    tenantId,
    actor: ACTOR,
    correlationId: `00000000-0000-4000-8000-008200${id.slice(-6)}`,
    aggregate,
    data,
  } as OutboxEventFixture;
}

/** `prescription-risk` — IND-DASH-101…105 (CTG-0001 §4.1.1). `inf.timer.expired`
 * é o único evento do grupo com produtor em `main`; `T-DEC` → `clock_code A`. */
export const PRESCRIPTION_RISK_EVENT: OutboxEventFixture = envelope(
  EVENT_IDS.prescriptionRisk,
  'inf.timer.expired',
  'TIMER_VENCIDO',
  { kind: 'infraction', id: AGGREGATE_IDS.case, version: 3 },
  {
    ownerKind: 'case',
    ownerId: AGGREGATE_IDS.case,
    timerCode: 'T-DEC',
    dueOn: '2026-09-20',
    effect: 'transicao',
  },
  '2026-09-12T09:00:00.000Z',
);

/** `production` — IND-DASH-304/305 (CTG-0001 §4.1.2). */
export const PRODUCTION_EVENT: OutboxEventFixture = envelope(
  EVENT_IDS.production,
  'rait.case.changed',
  'RAIT_CASO_ESTADO_ALTERADO',
  { kind: 'case', id: AGGREGATE_IDS.case, version: 2 },
  {
    caseId: AGGREGATE_IDS.case,
    fromState: 'TRIAGEM_ADMISSIBILIDADE',
    toState: 'EM_JULGAMENTO',
    instance: 'jari',
  },
  '2026-09-12T09:05:00.000Z',
);

/** `integration-health` — IND-DASH-401…403 (CTG-0001 §4.1.3). */
export const INTEGRATION_HEALTH_EVENT: OutboxEventFixture = envelope(
  EVENT_IDS.integrationHealth,
  'sync.batch.received',
  'SYNC_ITEM_RECEBIDO',
  { kind: 'sync-batch', id: AGGREGATE_IDS.syncBatch, version: 1 },
  {
    batchId: AGGREGATE_IDS.syncBatch,
    deviceBatchId: 'DB-fixture-001',
    batchSequence: 1,
    itemId: '00000000-0000-7000-8000-008200000009',
    entityType: 'ait',
    receiptStatus: 'applied',
    errorCode: null,
  },
  '2026-09-12T09:10:00.000Z',
);

/** `pec-deadlines` — IND-DASH-106/107/306…309 (CTG-0001 §4.1.4, proposta
 * WP-D3; o PEC não publica eventos em `main` — `connected = false` em todos). */
export const PEC_DEADLINES_EVENT: OutboxEventFixture = envelope(
  EVENT_IDS.pecDeadlines,
  'pec.deadline.changed',
  undefined,
  { kind: 'exam-process', id: AGGREGATE_IDS.pecCase, version: 1 },
  {
    indicadorId: 'IND-DASH-306',
    casoId: AGGREGATE_IDS.pecCase,
    estadoAnterior: 'AGUARDANDO_DESIGNACAO',
    estadoNovo: 'DESIGNADO',
    timestamp: '2026-09-12T09:15:00.000Z',
    baseLegal: 'RN-PEC-112 item 2',
  },
  '2026-09-12T09:15:00.000Z',
);

/** `teat-measures` — IND-DASH-108…111, 311…314, 404…407 (CTG-0001 §4.1.5).
 * `TERMO_EMITIDO` tem produtor em `main` (`connected = true` em 108/109). */
export const TEAT_MEASURES_EVENT: OutboxEventFixture = envelope(
  EVENT_IDS.teatMeasures,
  'measure.changed',
  'TERMO_EMITIDO',
  { kind: 'administrative-measure', id: AGGREGATE_IDS.measure, version: 1 },
  {
    measureId: AGGREGATE_IDS.measure,
    termId: 'TRM-fixture-001',
    termType: 'retencao',
    issuedAt: '2026-09-05T09:00:00.000Z',
    withdrawalDeadlineAt: '2026-10-05T09:00:00.000Z',
    ctbDeadlineAt: null,
  },
  '2026-09-12T09:20:00.000Z',
);

/** `portal-service-metrics` — IND-DASH-206…209, 301…303 (CTG-0001 §4.1.6).
 * O Portal ainda não publica o schema de `data` (`source_pending`, OD-D21):
 * o payload abaixo é reduzido de propósito (só o id do objeto), documentado
 * assim até TASK-0006. */
export const PORTAL_SERVICE_METRICS_EVENT: OutboxEventFixture = envelope(
  EVENT_IDS.portalServiceMetrics,
  'portal.manifestation.changed', // `type` técnico ainda não publicado (OD-D21); casado por domainEvent
  'MANIFESTACAO_REGISTRADA',
  { kind: 'manifestation', id: AGGREGATE_IDS.manifestation, version: 1 },
  {
    manifestationId: AGGREGATE_IDS.manifestation, // source_pending (OD-D21): nome exato do campo por vir de TASK-0006
  },
  '2026-09-12T09:25:00.000Z',
);

/** `duty-evidence` — IND-DASH-201…209 (CTG-0001 §4.1.7, proposta própria do
 * DASHBOARD, publicada só a partir do CTG-0002 — `connected = false`). */
export const DUTY_EVIDENCE_EVENT: OutboxEventFixture = envelope(
  EVENT_IDS.dutyEvidence,
  'dashboard.duty.changed',
  'DEVER_JANELA_ABERTA',
  { kind: 'duty-cycle', id: AGGREGATE_IDS.dutyCycle, version: 1 },
  {
    dutyCode: 'DUTY-01',
    period: '2026-09',
    fromState: null,
    toState: 'JANELA_ABERTA',
    deadlineOn: '2026-10-20',
    evidenceHash: null,
  },
  '2026-09-12T09:30:00.000Z',
);

/** `source_key` exclusivo desta suíte — A16: `'rait.outbox'` colide com a
 * linha semeada em `81-fixtures-dashboard-state.sql`
 * (`…0000810004…01`/`ux_dashboard_source_key (tenant_id, source_key)`); o
 * upsert do projetor então sobrescrevia a linha do seed e o `afterAll`
 * (filtro por `last_event_id`) a apagava, quebrando `seeds.integration.spec.ts`
 * (C-0001-04, `source` = 4) na 2ª execução consecutiva do tier. Nenhum outro
 * `source_key` de `81-fixtures-dashboard-state.sql` começa com `test.`. */
export const TEST_SOURCE_KEY = 'test.replay.source';

/** `source-freshness` — IND-DASH-408 (CTG-0001 §4.1.8, proposta OD-D07). */
export const SOURCE_FRESHNESS_EVENT: OutboxEventFixture = envelope(
  EVENT_IDS.sourceFreshness,
  'source.heartbeat',
  undefined,
  { kind: 'source', id: AGGREGATE_IDS.source, version: 1 },
  {
    sourceKey: TEST_SOURCE_KEY,
    app: 'rait',
    observedAt: '2026-09-12T09:35:00.000Z',
  },
  '2026-09-12T09:35:00.000Z',
);

export const ALL_FIXTURE_EVENTS: readonly OutboxEventFixture[] = [
  PRESCRIPTION_RISK_EVENT,
  PRODUCTION_EVENT,
  INTEGRATION_HEALTH_EVENT,
  PEC_DEADLINES_EVENT,
  TEAT_MEASURES_EVENT,
  PORTAL_SERVICE_METRICS_EVENT,
  DUTY_EVIDENCE_EVENT,
  SOURCE_FRESHNESS_EVENT,
];
