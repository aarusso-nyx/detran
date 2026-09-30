// Generated from BP-CH-BILLING-001 v1.0.0 sha256:dbb379527f32d359e25dee36e8d7232af006c46466c5c86faef3d22de91db860
import { Injectable } from '@nestjs/common';
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
  async create(
    dto: CreateBillingInvoiceItemDto,
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
    const result = await this.execute(transaction, (tx) =>
      tx.query<BillingInvoiceItem & Record<string, unknown>>(insertSql, values),
    );
    const row = result.rows[0];
    if (!row) throw new Error('BillingInvoiceItem insert returned no row');
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
