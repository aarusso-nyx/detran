// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateRaitPendingContentDto } from '../dto/create-rait-pending-content.dto.js';
import type { RaitPendingContent } from '../entities/rait-pending-content.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'case_id',
  'missing_items',
  'due_on',
  'opened_at',
  'opened_by',
  'closed_at',
  'outcome',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class RaitPendingContentRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<RaitPendingContent[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<RaitPendingContent & Record<string, unknown>>(
            'select * from inf.rait_pending_content order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<RaitPendingContent> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<RaitPendingContent & Record<string, unknown>>(
        'select * from inf.rait_pending_content where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('RaitPendingContent ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateRaitPendingContentDto,
    transaction?: Transaction,
  ): Promise<RaitPendingContent> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateRaitPendingContentDto>,
    transaction?: Transaction,
  ): Promise<RaitPendingContent> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from inf.rait_pending_content where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('RaitPendingContent ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateRaitPendingContentDto>,
    transaction?: Transaction,
  ): Promise<RaitPendingContent> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid RaitPendingContent write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.rait_pending_content (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.rait_pending_content set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<RaitPendingContent & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('RaitPendingContent ' + id + ' not found');
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
