import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';

import { withTenantContext } from '@detran/shared';

import { asQueryable } from './runtime.js';

export * from './sync-applier.js';
export * from './applied-entity.js';
export * from './storage.js';
export * from './runtime.js';
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

  /**
   * `transaction` é a transação em curso do chamador: quando vem, a escrita
   * roda nela e nenhuma transação nova é aberta (CTG-0002 §4.3 passo 4).
   */
  update(
    id: string,
    patch: Record<string, unknown>,
    transaction?: unknown,
  ): Promise<Record<string, unknown> | undefined> {
    const entries = Object.entries(patch);
    if (entries.length === 0) throw new Error('An ops patch requires values');
    const columns = entries.map(([key]) => key);
    if (columns.some((key) => !/^[a-z_]+$/.test(key) || key === 'tenant_id'))
      throw new Error('Invalid ops write field');
    const assignments = columns
      .map((column, index) => `${column} = $${index + 2}`)
      .join(', ');
    const sql = `update ${this.table} set ${assignments}, updated_at = now() where id = $1 returning *`;
    const values = [id, ...entries.map(([, value]) => value)];
    const ongoing = asQueryable(transaction);
    if (ongoing)
      return ongoing
        .query(sql, values)
        .then(
          (result) => result.rows[0] as Record<string, unknown> | undefined,
        );
    return this.inTenant(async (tx) => {
      const result = await tx.query(sql, values);
      return result.rows[0];
    });
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

// O placeholder `OfflineSyncPort` desta fase foi substituído pelas portas
// reais do protocolo (`SyncEntityApplier`, `AppliedEntityPort`) — CTG-0002 §1.
