// Generated from BP-INF-RAIT-INTEGRATION-001 v1.0.1 sha256:2d42a37638b7f6930d1b8ac07d6cd13218f965f5c2857948e0afeea8df277caf
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateRaitReconciliationDto } from '../dto/create-rait-reconciliation.dto.js';
import type { RaitReconciliation } from '../entities/rait-reconciliation.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'system',
  'window_from',
  'window_to',
  'requested_by',
  'requested_at',
  'status',
  'divergences_count',
  'report_document_id',
  'resolved_at',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class RaitReconciliationRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<RaitReconciliation[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<RaitReconciliation & Record<string, unknown>>(
            'select * from inf.rait_reconciliation order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<RaitReconciliation> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<RaitReconciliation & Record<string, unknown>>(
        'select * from inf.rait_reconciliation where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('RaitReconciliation ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateRaitReconciliationDto,
    transaction?: Transaction,
  ): Promise<RaitReconciliation> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateRaitReconciliationDto>,
    transaction?: Transaction,
  ): Promise<RaitReconciliation> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from inf.rait_reconciliation where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('RaitReconciliation ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateRaitReconciliationDto>,
    transaction?: Transaction,
  ): Promise<RaitReconciliation> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid RaitReconciliation write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.rait_reconciliation (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.rait_reconciliation set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<RaitReconciliation & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('RaitReconciliation ' + id + ' not found');
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
