// CTG-0001 §2 (M16) — `SqlTeatEventOutbox`, the SQL implementation of
// `TeatEventOutbox` over `integration.outbox` (DDL 04). Needs no constructor
// dependency: every write happens through the `Transaction` handed to
// `append`, so the port is safe to default-construct wherever a command
// transaction is already open (CODESTYLE "Concurrency: … evento(s) gravados
// na mesma transação").
import type { Transaction } from '@stynx-nyx/data';

import { outboxIdempotencyKey, type TeatEventEnvelope } from './outbox.js';

/** Minimal shape every real `Transaction` satisfies (see `AitRepository`). */
type QueryableTransaction = {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

function asQueryable(tx: Transaction): QueryableTransaction | undefined {
  const candidate = tx as unknown as Partial<QueryableTransaction>;
  return typeof candidate.query === 'function'
    ? (candidate as QueryableTransaction)
    : undefined;
}

export class SqlTeatEventOutbox {
  /**
   * Inserts `envelope` into `integration.outbox` and returns the real id of
   * the row (CTG-0001 §13 item 5): the id is generated in a CTE and embedded
   * into both the `id` column and `payload.id` in the same statement, so the
   * caller never invents one and the two never disagree. `tenant_id` is left
   * to the `auth.enforce_tenant_id` trigger (kernel pattern already used by
   * every generated repository) rather than trusted from the caller; the
   * resolved tenant also overwrites `envelope.tenantId` in the persisted
   * payload. On a replayed `(tenant_id, idempotency_key)` (`on conflict do
   * nothing`), the insert returns no row, so the existing row's id is looked
   * up instead. Silently no-ops (returns `{ id: '' }`) when `tx` cannot run
   * SQL (bare test doubles in guard-only unit specs, e.g.
   * `ait-state-transitions.matrix.spec.ts`) — a real `@stynx-nyx/data`
   * `Transaction` always exposes `.query`, so this only ever applies outside
   * production.
   */
  async append(
    tx: Transaction,
    envelope: TeatEventEnvelope,
  ): Promise<{ id: string }> {
    const queryable = asQueryable(tx);
    if (!queryable) return { id: '' };
    const tenantRow = await queryable.query<{ tenant_id: string | null }>(
      'select auth.current_tenant() as tenant_id',
    );
    const tenantId = tenantRow.rows[0]?.tenant_id ?? envelope.tenantId;
    const resolved: TeatEventEnvelope = { ...envelope, tenantId };
    const idempotencyKey = outboxIdempotencyKey(resolved);
    const inserted = await queryable.query<{ id: string }>(
      `with new_row as (select gen_random_uuid() as id)
       insert into integration.outbox
         (id, tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, available_at)
       select new_row.id, $1, $2, $3, $4,
              jsonb_set($5::jsonb, '{id}', to_jsonb(new_row.id::text)), $6, $7
         from new_row
       on conflict (tenant_id, idempotency_key) do nothing
       returning id`,
      [
        tenantId,
        resolved.type,
        resolved.aggregate.kind,
        resolved.aggregate.id,
        JSON.stringify(resolved),
        idempotencyKey,
        resolved.occurredAt,
      ],
    );
    if (inserted.rows[0]) return { id: inserted.rows[0].id };
    const existing = await queryable.query<{ id: string }>(
      'select id from integration.outbox where tenant_id = $1 and idempotency_key = $2',
      [tenantId, idempotencyKey],
    );
    return { id: existing.rows[0]?.id ?? '' };
  }
}
