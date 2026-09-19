// Source events: canonical BOAT receipts from integration.outbox.
// This is a consumer only: it never invokes SENATRAN or changes est.* state.

export const consumedEvents = [
  'SINISTRO_TRANSMITIDO',
  'SINISTRO_SITUACAO_NACIONAL',
  'SINISTRO_RETIFICADO',
] as const;

const PROJECTION_NAME = 'integration.renaest_mirror';

type ConsumedEvent = (typeof consumedEvents)[number];

export interface RenaestMirrorEvent {
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

function positiveInteger(value: unknown, field: string): number {
  if (!Number.isInteger(value) || (value as number) < 1) {
    throw new TypeError(`integration.renaest_mirror requires ${field}`);
  }
  return value as number;
}

function crashIdOf(event: RenaestMirrorEvent): string {
  const localEntityId = event.data.localEntityId;
  return typeof localEntityId === 'string' ? localEntityId : event.aggregate.id;
}

function textOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export class RenaestMirrorProjection {
  constructor(private readonly sql: ProjectionQuery) {}

  async apply(event: RenaestMirrorEvent): Promise<void> {
    if (!consumedEvents.includes(event.domainEvent)) return;
    const schemaVersion = positiveInteger(event.schemaVersion, 'schemaVersion');
    const aggregateVersion = positiveInteger(
      event.aggregate.version,
      'aggregate.version',
    );
    const protocol = textOrNull(event.data.protocol);
    const nationalStatus = textOrNull(event.data.nationalStatus);
    const rectification =
      event.domainEvent === 'SINISTRO_RETIFICADO'
        ? JSON.stringify({
            protocol,
            kind: textOrNull(event.data.kind),
          })
        : null;

    // The CTE makes the idempotency claim and the mirror upsert atomic. The
    // database constraint on national_status is deliberately the rejection
    // mechanism; no application flag can leave a ledger-only success behind.
    await this.sql.query(
      `with claimed as (
         insert into integration.renaest_mirror_applied_event
           (projection_name, event_id, event_schema_version, aggregate_version, applied_at)
         values ($1, $2, $3, $4, now())
         on conflict (tenant_id, projection_name, event_id) do nothing
         returning event_id
       )
       insert into integration.renaest_mirror
         (crash_id, protocol, national_status, rectifications_json, last_event_id,
          event_schema_version, aggregate_version)
       select $5::uuid, $6, $7,
              case when $8::jsonb is null then '[]'::jsonb else jsonb_build_array($8::jsonb) end,
              $2, $3, $4
         from claimed
       on conflict (tenant_id, crash_id)
       do update set protocol = coalesce(excluded.protocol, integration.renaest_mirror.protocol),
                     national_status = coalesce(excluded.national_status, integration.renaest_mirror.national_status),
                     rectifications_json = case
                       when $8::jsonb is null then integration.renaest_mirror.rectifications_json
                       else integration.renaest_mirror.rectifications_json || jsonb_build_array($8::jsonb)
                     end,
                     last_event_id = excluded.last_event_id,
                     event_schema_version = excluded.event_schema_version,
                     aggregate_version = excluded.aggregate_version,
                     updated_at = now()`,
      [
        PROJECTION_NAME,
        event.id,
        schemaVersion,
        aggregateVersion,
        crashIdOf(event),
        protocol,
        nationalStatus,
        rectification,
      ],
    );
  }

  async replay(): Promise<void> {
    const rows = await this.sql.query<{ payload: RenaestMirrorEvent }>(
      `select payload from integration.outbox
        where topic = any($1::text[])
        order by created_at, id`,
      [[...consumedEvents]],
    );
    for (const row of rows.rows) await this.apply(row.payload);
  }
}
