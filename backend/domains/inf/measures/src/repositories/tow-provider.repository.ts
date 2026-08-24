// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
import { NotFoundException } from '@nestjs/common';
import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateTowProviderDto } from '../dto/create-tow-provider.dto.js';
import type { TowProvider } from '../entities/tow-provider.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'traffic_agency_id',
  'name',
  'document_number',
  'contact_json',
  'status',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
export class TowProviderRepository {
  constructor(
    private readonly database: Pick<Database, 'tx'>,
    private readonly requestContext: Pick<
      RequestContext,
      'hasActiveContext' | 'snapshot'
    >,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<TowProvider[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<TowProvider & Record<string, unknown>>(
            'select * from inf.tow_provider order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(id: string, transaction?: Transaction): Promise<TowProvider> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<TowProvider & Record<string, unknown>>(
        'select * from inf.tow_provider where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('TowProvider ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateTowProviderDto,
    transaction?: Transaction,
  ): Promise<TowProvider> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateTowProviderDto>,
    transaction?: Transaction,
  ): Promise<TowProvider> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query('delete from inf.tow_provider where id = $1 returning id', [id]),
    );
    if (!result.rows[0])
      throw new NotFoundException('TowProvider ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateTowProviderDto>,
    transaction?: Transaction,
  ): Promise<TowProvider> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid TowProvider write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.tow_provider (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.tow_provider set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<TowProvider & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('TowProvider ' + id + ' not found');
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
