// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateRaitMinutesSignatureReceiptDto } from '../dto/create-rait-minutes-signature-receipt.dto.js';
import type { RaitMinutesSignatureReceipt } from '../entities/rait-minutes-signature-receipt.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class RaitMinutesSignatureReceiptRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<RaitMinutesSignatureReceipt[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<RaitMinutesSignatureReceipt & Record<string, unknown>>(
            'select * from inf.rait_minutes_signature_receipt order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<RaitMinutesSignatureReceipt> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<RaitMinutesSignatureReceipt & Record<string, unknown>>(
        'select * from inf.rait_minutes_signature_receipt where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'RaitMinutesSignatureReceipt ' + id + ' not found',
      );
    return row;
  }
  create(
    dto: CreateRaitMinutesSignatureReceiptDto,
    transaction?: Transaction,
  ): Promise<RaitMinutesSignatureReceipt> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateRaitMinutesSignatureReceiptDto>,
    transaction?: Transaction,
  ): Promise<RaitMinutesSignatureReceipt> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from inf.rait_minutes_signature_receipt where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException(
        'RaitMinutesSignatureReceipt ' + id + ' not found',
      );
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateRaitMinutesSignatureReceiptDto>,
    transaction?: Transaction,
  ): Promise<RaitMinutesSignatureReceipt> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid RaitMinutesSignatureReceipt write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.rait_minutes_signature_receipt (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.rait_minutes_signature_receipt set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<RaitMinutesSignatureReceipt & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'RaitMinutesSignatureReceipt ' + id + ' not found',
      );
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
