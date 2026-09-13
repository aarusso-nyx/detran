// Generated from BP-CH-OPERATIONAL-CONTROLS-001 v1.0.0 sha256:41855aeaa3c52f966b5c30807e1fe3d821258e6c626a32b72238986d291880da
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateOperationalRecordDto } from '../dto/create-operational-record.dto.js';
import type { OperationalRecord } from '../entities/operational-record.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'record_kind',
  'subject_type',
  'subject_id',
  'clinic_id',
  'status',
  'payload',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class OperationalRecordRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<OperationalRecord[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<OperationalRecord & Record<string, unknown>>(
            'select * from ch.operational_record order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<OperationalRecord> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<OperationalRecord & Record<string, unknown>>(
        'select * from ch.operational_record where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('OperationalRecord ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateOperationalRecordDto,
    transaction?: Transaction,
  ): Promise<OperationalRecord> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateOperationalRecordDto>,
    transaction?: Transaction,
  ): Promise<OperationalRecord> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query('delete from ch.operational_record where id = $1 returning id', [
        id,
      ]),
    );
    if (!result.rows[0])
      throw new NotFoundException('OperationalRecord ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateOperationalRecordDto>,
    transaction?: Transaction,
  ): Promise<OperationalRecord> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid OperationalRecord write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ch.operational_record (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ch.operational_record set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<OperationalRecord & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('OperationalRecord ' + id + ' not found');
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
