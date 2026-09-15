// Generated from BP-OPS-OFFLINE-SYNC-001 v1.1.0 sha256:fb2ab9cef5ee5621be533d83fd88a694912460d6fbe4cd446bc2c8d7f7bcfc3d
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateSyncReceiptDto } from '../dto/create-sync-receipt.dto.js';
import type { SyncReceipt } from '../entities/sync-receipt.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'sync_queue_item_id',
  'idempotency_key',
  'entity_type',
  'local_entity_id',
  'server_entity_id',
  'accepted_hash',
  'status',
  'reason_code',
  'applied_at',
  'details_json',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class SyncReceiptRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<SyncReceipt[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<SyncReceipt & Record<string, unknown>>(
            'select * from ops.sync_receipt order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(id: string, transaction?: Transaction): Promise<SyncReceipt> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<SyncReceipt & Record<string, unknown>>(
        'select * from ops.sync_receipt where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('SyncReceipt ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateSyncReceiptDto,
    transaction?: Transaction,
  ): Promise<SyncReceipt> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateSyncReceiptDto>,
    transaction?: Transaction,
  ): Promise<SyncReceipt> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query('delete from ops.sync_receipt where id = $1 returning id', [id]),
    );
    if (!result.rows[0])
      throw new NotFoundException('SyncReceipt ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateSyncReceiptDto>,
    transaction?: Transaction,
  ): Promise<SyncReceipt> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid SyncReceipt write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ops.sync_receipt (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ops.sync_receipt set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<SyncReceipt & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('SyncReceipt ' + id + ' not found');
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
