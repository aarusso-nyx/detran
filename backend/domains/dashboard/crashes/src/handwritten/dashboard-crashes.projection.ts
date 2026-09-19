// Source events: canonical BOAT state events from integration.outbox.
// The only cross-domain read in this package is the replay below.

export const consumedEvents = [
  'SINISTRO_FECHADO',
  'SINISTRO_TRANSMITIDO',
  'SINISTRO_SITUACAO_NACIONAL',
] as const;

const PROJECTION_NAME = 'dashboard.crashes';
const CELL_THRESHOLD = 10;

type ConsumedEvent = (typeof consumedEvents)[number];

export interface DashboardCrashEvent {
  id: string;
  domainEvent: ConsumedEvent;
  schemaVersion: number;
  aggregate: { id: string; version: number };
  data: Record<string, unknown>;
}

export interface ProjectionQuery {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    statement: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

export type DashboardCrashCell = {
  periodStart: string;
  municipalityCode: string;
  severity: string;
  count: number | null;
  suppression: 'none' | 'primary' | 'secondary';
};

export type DashboardCrashesRead = {
  cells: readonly DashboardCrashCell[];
  total: number | null;
  totalSuppressed: boolean;
  publicationStatus: 'blocked';
};

interface AggregateRow extends Record<string, unknown> {
  period_start: string;
  municipality_code: string;
  severity: string;
  crash_count: number;
}

function requireText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`dashboard.crashes requires ${field}`);
  }
  return value;
}

function requirePositiveInteger(value: unknown, field: string): number {
  if (!Number.isInteger(value) || (value as number) < 1) {
    throw new TypeError(`dashboard.crashes requires ${field}`);
  }
  return value as number;
}

function secondarySuppression(rows: readonly AggregateRow[]): Set<number> {
  const primary = rows
    .map((row, index) => ({ index, count: row.crash_count }))
    .filter((row) => row.count < CELL_THRESHOLD);
  if (primary.length === 0) return new Set();

  // Each period/municipality row with one hidden cell must hide a second
  // available cell as well, otherwise a public total would reveal it.
  const secondary = rows
    .map((row, index) => ({ index, count: row.crash_count }))
    .filter((row) => row.count >= CELL_THRESHOLD)
    .sort((left, right) => left.count - right.count)[0];
  return secondary ? new Set([secondary.index]) : new Set();
}

export class DashboardCrashesProjection {
  constructor(private readonly sql: ProjectionQuery) {}

  async apply(event: DashboardCrashEvent): Promise<void> {
    if (!consumedEvents.includes(event.domainEvent)) return;
    const schemaVersion = requirePositiveInteger(
      event.schemaVersion,
      'schemaVersion',
    );
    const aggregateVersion = requirePositiveInteger(
      event.aggregate.version,
      'aggregate.version',
    );
    const periodStart = requireText(event.data.periodStart, 'data.periodStart');
    const municipalityCode = requireText(
      event.data.municipalityCode,
      'data.municipalityCode',
    );
    const severity = requireText(event.data.severity, 'data.severity');

    // Claiming the ledger and incrementing the aggregate happen in one SQL
    // statement. A constraint failure rolls back the claim as well.
    await this.sql.query(
      `with claimed as (
         insert into dashboard.crash_projection_applied_event
           (projection_name, event_id, event_schema_version, aggregate_version, applied_at)
         values ($1, $2, $3, $4, now())
         on conflict (tenant_id, projection_name, event_id) do nothing
         returning event_id
       )
       insert into dashboard.crash_aggregate
         (period_start, municipality_code, severity, crash_count, last_event_id,
          event_schema_version, aggregate_version)
       select $5::date, $6, $7, 1, $2, $3, $4 from claimed
       on conflict (tenant_id, period_start, municipality_code, severity)
       do update set crash_count = dashboard.crash_aggregate.crash_count + 1,
                     last_event_id = excluded.last_event_id,
                     event_schema_version = excluded.event_schema_version,
                     aggregate_version = excluded.aggregate_version,
                     updated_at = now()`,
      [
        PROJECTION_NAME,
        event.id,
        schemaVersion,
        aggregateVersion,
        periodStart,
        municipalityCode,
        severity,
      ],
    );
  }

  async replay(): Promise<void> {
    const rows = await this.sql.query<{ payload: DashboardCrashEvent }>(
      `select payload from integration.outbox
        where topic = any($1::text[])
        order by created_at, id`,
      [[...consumedEvents]],
    );
    for (const row of rows.rows) await this.apply(row.payload);
  }

  async readInternal(input: {
    periodStart: string;
    periodEnd: string;
  }): Promise<DashboardCrashesRead> {
    const result = await this.sql.query<AggregateRow>(
      `select period_start::text, municipality_code, severity, crash_count
         from dashboard.crash_aggregate
        where period_start >= $1::date and period_start <= $2::date
        order by period_start, municipality_code, severity`,
      [input.periodStart, input.periodEnd],
    );
    const secondary = secondarySuppression(result.rows);
    const cells = result.rows.map((row, index): DashboardCrashCell => {
      const primary = row.crash_count < CELL_THRESHOLD;
      const suppressed = primary || secondary.has(index);
      return {
        periodStart: row.period_start,
        municipalityCode: row.municipality_code,
        severity: row.severity,
        count: suppressed ? null : row.crash_count,
        suppression: primary
          ? 'primary'
          : secondary.has(index)
            ? 'secondary'
            : 'none',
      };
    });
    // P-09 is closed: the provider exposes no publication or export path, and
    // an aggregate total is never released while the read model is internal.
    return {
      cells,
      total: null,
      totalSuppressed: true,
      publicationStatus: 'blocked',
    };
  }
}
