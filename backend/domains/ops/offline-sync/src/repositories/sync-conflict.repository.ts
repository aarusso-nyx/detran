// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:c35fb9b7cf739cf06c18b8cc02b1ec4cd968c63916ffd149c79d29937faa2c67
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateSyncConflictDto } from '../dto/create-sync-conflict.dto.js';
import type { SyncConflict } from '../entities/sync-conflict.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'sync_queue_item_id',
  'conflict_type',
  'reason_code',
  'safe_message',
  'correlation_id',
  'local_hash',
  'server_hash',
  'retryable',
  'allowed_resolution_actions',
  'description',
  'status',
  'resolved_by_user_ref',
  'resolved_at',
  'resolution_action',
  'resolution_details_json',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class SyncConflictRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<SyncConflict[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<SyncConflict & Record<string, unknown>>(
            'select * from ops.sync_conflict order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(id: string, transaction?: Transaction): Promise<SyncConflict> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<SyncConflict & Record<string, unknown>>(
        'select * from ops.sync_conflict where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('SyncConflict ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateSyncConflictDto,
    transaction?: Transaction,
  ): Promise<SyncConflict> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateSyncConflictDto>,
    transaction?: Transaction,
  ): Promise<SyncConflict> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query('delete from ops.sync_conflict where id = $1 returning id', [
        id,
      ]),
    );
    if (!result.rows[0])
      throw new NotFoundException('SyncConflict ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateSyncConflictDto>,
    transaction?: Transaction,
  ): Promise<SyncConflict> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid SyncConflict write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ops.sync_conflict (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ops.sync_conflict set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<SyncConflict & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('SyncConflict ' + id + ' not found');
    return row;
  }
  private execute<T>(
    transaction: Transaction | undefined,
    work: (transaction: SqlTransaction) => Promise<T>,
  ): Promise<T> {
    if (transaction) return work(transaction as SqlTransaction);
    return withTenantContext(this.database, this.requestContext, (tx) =>
      work(tx as SqlTransaction),
    );
  }
}
