// Source events: SOLICITACAO_CRIADA (portal-route-contract §10; type portal.request.changed; portal/requests)
// Source events: SOLICITACAO_PROTOCOLADA (§10; portal.request.changed; portal/requests)
// Source events: SOLICITACAO_DESISTIDA (§10; portal.request.changed; portal/requests)
// Source events: SOLICITACAO_CONCLUIDA (§10; portal.request.changed; portal/requests)
// Source events: MANIFESTACAO_REGISTRADA (§10; portal.manifestation.changed; portal/citizen-service)
// Source events: MANIFESTACAO_ENCERRADA (§10; portal.manifestation.changed; portal/citizen-service)
// Source events: AVALIACAO_REGISTRADA (§10; portal.evaluation.registered; portal/requests)
//
// Projeção `dashboard.portal_service_metrics` (CTG-0001 §2.19, §4.1.6; IND-
// DASH-206…209, 301…303). Casada por `domainEvent` (precedente BOAT de
// R-0010). Uma célula por `(tenant_id, indicator_code, object_kind,
// object_ref)`, `object_ref` = `aggregate.id` (opaco; nunca CPF).
// `object_kind`/`indicator_code`: `MANIFESTACAO_*` → `manifestation`/301;
// `AVALIACAO_REGISTRADA` → `evaluation`/207; `SOLICITACAO_*` → `request`/303
// só quando `serviceKey` for o do pedido LAI — chave `source_pending` (OD-D21):
// enquanto a lista LAI_SERVICE_KEYS estiver vazia todo `SOLICITACAO_*` é
// `ignored: not_relevant`. `state` = `domainEvent` aplicado; `period_start` =
// mês de `opened_at` (primeiro evento da célula); `closed_at` = `occurredAt`
// de `*_CONCLUIDA`/`*_ENCERRADA`/`*_DESISTIDA`; `due_on` = `agencyDueOn` da
// manifestação (único prazo publicado pelo produtor); `score` fica nulo
// (`source_pending`). Campos de `data` transcritos de
// `backend/domains/portal/{requests,citizen-service}/src/handwritten/events.ts`
// (OD-D21): só ids de objeto, tokens e datas — nunca `subjectCpfHash`,
// `subjectId`/`citizenSubjectId` (pessoa), `protocol`/`protocolNumber`.
import {
  DashboardProjectorBase,
  monthStartOf,
  optionalText,
  pickPrimitives,
  requireText,
  type DashboardConsumedEvent,
  type DashboardEventVersions,
  type DashboardProjectionContext,
  type DashboardProjectionResult,
} from '../projection-contract.js';

export const consumedEvents = [
  'SOLICITACAO_CRIADA',
  'SOLICITACAO_PROTOCOLADA',
  'SOLICITACAO_DESISTIDA',
  'SOLICITACAO_CONCLUIDA',
  'MANIFESTACAO_REGISTRADA',
  'MANIFESTACAO_ENCERRADA',
  'AVALIACAO_REGISTRADA',
] as const;

export const PROJECTION_NAME = 'dashboard.portal_service_metrics' as const;

/** `serviceKey` do pedido LAI (IND-DASH-303) — `source_pending` (CTG-0001
 *  §4.1.6, §8 OD-D21): nenhum valor publicado; lista vazia até TASK-0006. */
export const LAI_SERVICE_KEYS: readonly string[] = [];

/** `domainEvent` terminal → `closed_at` (§4.1.6). */
const CLOSING_EVENTS: readonly string[] = [
  'SOLICITACAO_CONCLUIDA',
  'SOLICITACAO_DESISTIDA',
  'MANIFESTACAO_ENCERRADA',
];

type ObjectKind = 'request' | 'manifestation' | 'evaluation';

interface Parsed {
  objectKind: ObjectKind;
  indicatorCode: string;
  serviceKey: string | null;
  dueOn: string | null;
  detail: Record<string, string | number | boolean | null>;
  relevant: boolean;
}

interface CellRow extends Record<string, unknown> {
  id: string;
  last_event_id: string;
}

const SELECT_CELL = `select id, last_event_id
     from dashboard.portal_service_metrics
    where tenant_id = $1 and indicator_code = $2 and object_kind = $3 and object_ref = $4`;

export class PortalServiceMetricsProjection extends DashboardProjectorBase<Parsed> {
  readonly projection = PROJECTION_NAME;
  readonly consumedEvents = consumedEvents;

  protected validate(event: DashboardConsumedEvent, eventKey: string): Parsed {
    const p = this.projection;
    if (typeof event.aggregate?.id !== 'string' || !event.aggregate.id) {
      throw this.invalid(event, 'aggregate.id');
    }
    if (eventKey.startsWith('MANIFESTACAO_')) {
      requireText(p, event, 'manifestationId');
      return {
        objectKind: 'manifestation',
        indicatorCode: 'IND-DASH-301',
        serviceKey: null,
        dueOn: optionalText(p, event, 'agencyDueOn'),
        detail: pickPrimitives(event.data, [
          'kind',
          'anonymous',
          'receivedAt',
          'acknowledgedAt',
          'fromState',
          'toState',
        ]),
        relevant: true,
      };
    }
    if (eventKey === 'AVALIACAO_REGISTRADA') {
      requireText(p, event, 'evaluationId');
      return {
        objectKind: 'evaluation',
        indicatorCode: 'IND-DASH-207',
        serviceKey: null,
        dueOn: null,
        detail: pickPrimitives(event.data, [
          'subjectKind',
          'subjectId',
          'submittedAt',
        ]),
        relevant: true,
      };
    }
    requireText(p, event, 'requestId');
    const serviceKey = optionalText(p, event, 'serviceKey');
    return {
      objectKind: 'request',
      indicatorCode: 'IND-DASH-303',
      serviceKey,
      dueOn: null,
      detail: pickPrimitives(event.data, [
        'serviceKey',
        'targetKind',
        'fromState',
        'toState',
        'issuedAt',
        'withdrawnAt',
      ]),
      relevant: serviceKey !== null && LAI_SERVICE_KEYS.includes(serviceKey),
    };
  }

  protected async project(
    event: DashboardConsumedEvent,
    eventKey: string,
    parsed: Parsed,
    versions: DashboardEventVersions,
    ctx: DashboardProjectionContext,
  ): Promise<DashboardProjectionResult> {
    if (!parsed.relevant) return this.ignored('not_relevant');
    const objectRef = event.aggregate.id;
    const existing = await ctx.tx.query<CellRow>(SELECT_CELL, [
      ctx.tenantId,
      parsed.indicatorCode,
      parsed.objectKind,
      objectRef,
    ]);
    const current = existing.rows[0];
    if (
      current &&
      (await this.stale(ctx, current.last_event_id, eventKey, event))
    ) {
      return this.ignored('stale_version');
    }
    const closedAt = CLOSING_EVENTS.includes(eventKey)
      ? event.occurredAt
      : null;
    await ctx.tx.query(
      `insert into dashboard.portal_service_metrics
         (tenant_id, indicator_code, object_kind, object_ref, service_key, state, period_start, opened_at,
          closed_at, due_on, score, detail_json, last_event_id, event_schema_version, aggregate_version)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, null, $11, $12, $13, $14)
       on conflict (tenant_id, indicator_code, object_kind, object_ref)
       do update set service_key = coalesce(excluded.service_key, dashboard.portal_service_metrics.service_key),
                     state = excluded.state,
                     closed_at = coalesce(excluded.closed_at, dashboard.portal_service_metrics.closed_at),
                     due_on = coalesce(excluded.due_on, dashboard.portal_service_metrics.due_on),
                     detail_json = dashboard.portal_service_metrics.detail_json || excluded.detail_json,
                     last_event_id = excluded.last_event_id,
                     event_schema_version = excluded.event_schema_version,
                     aggregate_version = excluded.aggregate_version,
                     updated_at = $15`,
      [
        ctx.tenantId,
        parsed.indicatorCode,
        parsed.objectKind,
        objectRef,
        parsed.serviceKey,
        eventKey,
        monthStartOf(event.occurredAt),
        event.occurredAt,
        closedAt,
        parsed.dueOn,
        JSON.stringify(parsed.detail),
        event.id,
        versions.schemaVersion,
        versions.aggregateVersion,
        ctx.now.toISOString(),
      ],
    );
    return this.applied(1);
  }
}
