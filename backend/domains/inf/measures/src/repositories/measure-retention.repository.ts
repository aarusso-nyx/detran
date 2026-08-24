// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
import { NotFoundException } from '@nestjs/common';
import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateMeasureRetentionDto } from '../dto/create-measure-retention.dto.js';
import type { MeasureRetention } from '../entities/measure-retention.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'measure_id',
  'vehicle_snapshot_id',
  'retention_reason',
  'regularized_at',
  'released_at',
  'release_user_ref',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
export class MeasureRetentionRepository {
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
  findAll(transaction?: Transaction): Promise<MeasureRetention[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<MeasureRetention & Record<string, unknown>>(
            'select * from inf.measure_retention order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<MeasureRetention> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<MeasureRetention & Record<string, unknown>>(
        'select * from inf.measure_retention where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('MeasureRetention ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateMeasureRetentionDto,
    transaction?: Transaction,
  ): Promise<MeasureRetention> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateMeasureRetentionDto>,
    transaction?: Transaction,
  ): Promise<MeasureRetention> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query('delete from inf.measure_retention where id = $1 returning id', [
        id,
      ]),
    );
    if (!result.rows[0])
      throw new NotFoundException('MeasureRetention ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateMeasureRetentionDto>,
    transaction?: Transaction,
  ): Promise<MeasureRetention> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid MeasureRetention write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.measure_retention (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.measure_retention set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<MeasureRetention & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('MeasureRetention ' + id + ' not found');
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
