import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';

import { withTenantContext } from '@detran/shared';

export {
  SqlSyncConflictPort,
  type ResolveSyncConflictOptions,
  type SyncConflictPort,
  type SyncConflictRef,
} from './sync-conflict.port.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

/** SQL-only repository base: no memory fallback exists by design (ADR-0002). */
export class OpsTenantRepository {
  constructor(
    private readonly database: Pick<Database, 'tx'>,
    private readonly requestContext: Pick<
      RequestContext,
      'hasActiveContext' | 'snapshot'
    >,
    private readonly table: string,
  ) {
    if (!/^ops\.[a-z_]+$/.test(table))
      throw new Error(`Unsafe ops table: ${table}`);
  }

  list(): Promise<Record<string, unknown>[]> {
    return this.inTenant((tx) =>
      tx
        .query(`select * from ${this.table} order by created_at desc`)
        .then((result) => result.rows),
    );
  }

  find(id: string): Promise<Record<string, unknown> | undefined> {
    return this.inTenant((tx) =>
      tx
        .query(`select * from ${this.table} where id = $1`, [id])
        .then((result) => result.rows[0]),
    );
  }

  create(values: Record<string, unknown>): Promise<Record<string, unknown>> {
    const entries = Object.entries(values);
    if (entries.length === 0) throw new Error('An ops record requires values');
    const columns = entries.map(([key]) => key);
    if (columns.some((key) => !/^[a-z_]+$/.test(key) || key === 'tenant_id'))
      throw new Error('Invalid ops write field');
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    return this.inTenant(async (tx) => {
      const result = await tx.query(
        `insert into ${this.table} (${columns.join(', ')}) values (${placeholders}) returning *`,
        entries.map(([, value]) => value),
      );
      return result.rows[0] as Record<string, unknown>;
    });
  }

  private inTenant<T>(work: (tx: SqlTransaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, (tx) =>
      work(tx as SqlTransaction),
    );
  }
}

/** Phase 5 integration seam; this domain must consume the promoted STYNX runtime. */
export interface OfflineSyncPort {
  // TODO(Phase 5): bind @stynx-nyx/offline-sync after feat/p1-mobile-runtime publishes.
  submitBatch(): never;
}
