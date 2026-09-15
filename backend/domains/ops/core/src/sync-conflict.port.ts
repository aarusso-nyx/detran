// CTG-0001 §13 item 1 (Adenda, R-0008, TASK-0003 iteração 3) — the port
// `concurrency-review` (inf/ait) uses to resolve the canonical concurrency
// conflict row in `ops.sync_conflict`/`ops.sync_queue_item` (DDL 18). Lives
// in `@detran/ops-core` (not `inf/ait`) because the tables belong to the
// `ops` schema; `inf/ait` only ever sees this interface.
import type { Transaction } from '@stynx-nyx/data';

export interface SyncConflictRef {
  id: string;
  syncQueueItemId: string;
}

export interface ResolveSyncConflictOptions {
  action: 'accept_server' | 'reject';
  resolvedByUserRef?: string;
  description?: string;
}

export interface SyncConflictPort {
  /** Open `conflict_type='concurrency'` row for the AIT applied by
   * `sync_queue_item.server_entity_id = aitId`, or `null` when none is open
   * (CTG-0001 §13 item 1). */
  findOpenConcurrencyConflict(
    aitId: string,
    tx: Transaction,
  ): Promise<SyncConflictRef | null>;
  /** Marks the conflict `resolved` (`resolved_at`, `resolution_action`,
   * `resolved_by_user_ref`) in the caller's transaction. */
  resolve(
    conflictId: string,
    options: ResolveSyncConflictOptions,
    tx: Transaction,
  ): Promise<void>;
}

/** Minimal shape every real `Transaction` satisfies (see `AitRepository`,
 * `@detran/shared`'s `SqlTeatEventOutbox`). */
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

/**
 * SQL implementation over `ops.sync_conflict`/`ops.sync_queue_item` (DDL 18).
 * Needs no constructor dependency — every read/write happens through the
 * `Transaction` handed to each method, so it is safe to default-construct
 * wherever a command transaction is already open (same pattern as
 * `SqlTeatEventOutbox`). No-ops (returns `null` / does nothing) when `tx`
 * cannot run SQL — bare test doubles in guard-only unit specs never reach
 * this class in the first place (they inject a `syncConflicts` collaborator
 * instead), so this only ever applies outside production.
 */
export class SqlSyncConflictPort implements SyncConflictPort {
  async findOpenConcurrencyConflict(
    aitId: string,
    tx: Transaction,
  ): Promise<SyncConflictRef | null> {
    const queryable = asQueryable(tx);
    if (!queryable) return null;
    const result = await queryable.query<{
      id: string;
      sync_queue_item_id: string;
    }>(
      `select sc.id, sc.sync_queue_item_id
         from ops.sync_conflict sc
         join ops.sync_queue_item sqi on sqi.id = sc.sync_queue_item_id
        where sqi.server_entity_id = $1
          and sc.conflict_type = 'concurrency'
          and sc.status = 'open'
        order by sc.created_at desc
        limit 1`,
      [aitId],
    );
    const row = result.rows[0];
    if (!row) return null;
    return { id: row.id, syncQueueItemId: row.sync_queue_item_id };
  }

  async resolve(
    conflictId: string,
    options: ResolveSyncConflictOptions,
    tx: Transaction,
  ): Promise<void> {
    const queryable = asQueryable(tx);
    if (!queryable) return;
    await queryable.query(
      `update ops.sync_conflict
          set status = 'resolved',
              resolved_at = now(),
              resolution_action = $2,
              resolved_by_user_ref = $3,
              resolution_details_json = $4::jsonb
        where id = $1`,
      [
        conflictId,
        options.action,
        options.resolvedByUserRef ?? null,
        JSON.stringify({ description: options.description ?? null }),
      ],
    );
  }
}
