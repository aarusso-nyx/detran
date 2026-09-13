// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateBillingInvoiceItemDto } from '../dto/create-billing-invoice-item.dto.js';
import type { BillingInvoiceItem } from '../entities/billing-invoice-item.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>(['invoice_id', 'item_id']);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class BillingInvoiceItemRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<BillingInvoiceItem[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<BillingInvoiceItem & Record<string, unknown>>(
            'select * from ch.billing_invoice_item order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<BillingInvoiceItem> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<BillingInvoiceItem & Record<string, unknown>>(
        'select * from ch.billing_invoice_item where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('BillingInvoiceItem ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateBillingInvoiceItemDto,
    transaction?: Transaction,
  ): Promise<BillingInvoiceItem> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateBillingInvoiceItemDto>,
    transaction?: Transaction,
  ): Promise<BillingInvoiceItem> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from ch.billing_invoice_item where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('BillingInvoiceItem ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateBillingInvoiceItemDto>,
    transaction?: Transaction,
  ): Promise<BillingInvoiceItem> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid BillingInvoiceItem write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ch.billing_invoice_item (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ch.billing_invoice_item set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<BillingInvoiceItem & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('BillingInvoiceItem ' + id + ' not found');
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
