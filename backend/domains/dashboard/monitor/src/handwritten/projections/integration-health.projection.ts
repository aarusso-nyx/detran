// Source events: sync.batch.received (SYNC_ITEM_RECEBIDO; schemas/events/sync.batch.received.schema.json; ops/offline-sync)
//
// Projeção `dashboard.integration_health` (CTG-0001 §2.16, §4.1.3; IND-DASH-
// 401…403, todos `connected = false` — OD-D22: status da outbox, idade do lote
// e telemetria do adapter não são eventos publicados). Uma célula por
// `(tenant_id, period_start, system_key, metric)`: `period_start` = dia de
// `occurredAt`, `system_key = 'teat-offline-sync'`, `metric =
// 'receipt.<receiptStatus>'` (e uma segunda célula `'receipt.error'` quando
// `errorCode` não é nulo); `metric_value` += 1 e `sample_count` += 1 por
// evento aplicado; `last_error_code`, `last_seen_at` do evento.
import {
  DashboardProjectorBase,
  dateOf,
  optionalText,
  requireText,
  type DashboardConsumedEvent,
  type DashboardEventVersions,
  type DashboardProjectionContext,
  type DashboardProjectionResult,
} from '../projection-contract.js';

export const consumedEvents = ['sync.batch.received'] as const;

export const PROJECTION_NAME = 'dashboard.integration_health' as const;

export const INTEGRATION_HEALTH_SYSTEM_KEY = 'teat-offline-sync';

/** `receiptStatus` do schema (`received | applied | conflict | rejected`). */
export const RECEIPT_STATUSES = [
  'received',
  'applied',
  'conflict',
  'rejected',
] as const;

interface Parsed {
  receiptStatus: string;
  errorCode: string | null;
}

interface CellRow extends Record<string, unknown> {
  id: string;
  last_event_id: string;
}

const SELECT_CELL = `select id, last_event_id
     from dashboard.integration_health
    where tenant_id = $1 and period_start = $2 and system_key = $3 and metric = $4`;

export class IntegrationHealthProjection extends DashboardProjectorBase<Parsed> {
  readonly projection = PROJECTION_NAME;
  readonly consumedEvents = consumedEvents;

  protected validate(event: DashboardConsumedEvent): Parsed {
    const p = this.projection;
    const receiptStatus = requireText(p, event, 'receiptStatus');
    if (
      !RECEIPT_STATUSES.includes(
        receiptStatus as (typeof RECEIPT_STATUSES)[number],
      )
    ) {
      throw this.invalid(event, 'data.receiptStatus');
    }
    // `batchId`, `deviceBatchId`, `batchSequence`, `itemId`, `entityType`
    // (§4.1.3) só qualificam o recibo — a célula é agregada por dia/métrica.
    requireText(p, event, 'itemId');
    return { receiptStatus, errorCode: optionalText(p, event, 'errorCode') };
  }

  protected async project(
    event: DashboardConsumedEvent,
    eventKey: string,
    parsed: Parsed,
    versions: DashboardEventVersions,
    ctx: DashboardProjectionContext,
  ): Promise<DashboardProjectionResult> {
    const metrics = [`receipt.${parsed.receiptStatus}`];
    if (parsed.errorCode !== null) metrics.push('receipt.error');
    const periodStart = dateOf(event.occurredAt);
    let cells = 0;
    let stale = 0;
    for (const metric of metrics) {
      const existing = await ctx.tx.query<CellRow>(SELECT_CELL, [
        ctx.tenantId,
        periodStart,
        INTEGRATION_HEALTH_SYSTEM_KEY,
        metric,
      ]);
      const current = existing.rows[0];
      if (
        current &&
        (await this.stale(ctx, current.last_event_id, eventKey, event))
      ) {
        stale += 1;
        continue;
      }
      await ctx.tx.query(
        `insert into dashboard.integration_health
           (tenant_id, period_start, system_key, metric, metric_value, sample_count, last_error_code,
            last_seen_at, last_event_id, event_schema_version, aggregate_version)
         values ($1, $2, $3, $4, 1, 1, $5, $6, $7, $8, $9)
         on conflict (tenant_id, period_start, system_key, metric)
         do update set metric_value = dashboard.integration_health.metric_value + 1,
                       sample_count = dashboard.integration_health.sample_count + 1,
                       last_error_code = coalesce(excluded.last_error_code, dashboard.integration_health.last_error_code),
                       last_seen_at = excluded.last_seen_at,
                       last_event_id = excluded.last_event_id,
                       event_schema_version = excluded.event_schema_version,
                       aggregate_version = excluded.aggregate_version,
                       updated_at = $10`,
        [
          ctx.tenantId,
          periodStart,
          INTEGRATION_HEALTH_SYSTEM_KEY,
          metric,
          parsed.errorCode,
          event.occurredAt,
          event.id,
          versions.schemaVersion,
          versions.aggregateVersion,
          ctx.now.toISOString(),
        ],
      );
      cells += 1;
    }
    if (cells > 0) return this.applied(cells);
    return this.ignored(stale > 0 ? 'stale_version' : 'not_relevant');
  }
}
