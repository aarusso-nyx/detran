// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateAdministrativeMeasureDto } from '../dto/create-administrative-measure.dto.js';
import type { AdministrativeMeasure } from '../entities/administrative-measure.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'traffic_agency_id',
  'measure_type_id',
  'ait_id',
  'crash_record_id',
  'approach_id',
  'agent_id',
  'shift_id',
  'device_id',
  'started_at',
  'ended_at',
  'location_json',
  'reason',
  'current_status',
  'notes',
  'location_geom',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class AdministrativeMeasureRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<AdministrativeMeasure[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<AdministrativeMeasure & Record<string, unknown>>(
            'select * from inf.administrative_measure order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<AdministrativeMeasure> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<AdministrativeMeasure & Record<string, unknown>>(
        'select * from inf.administrative_measure where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('AdministrativeMeasure ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateAdministrativeMeasureDto,
    transaction?: Transaction,
  ): Promise<AdministrativeMeasure> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateAdministrativeMeasureDto>,
    transaction?: Transaction,
  ): Promise<AdministrativeMeasure> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from inf.administrative_measure where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('AdministrativeMeasure ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateAdministrativeMeasureDto>,
    transaction?: Transaction,
  ): Promise<AdministrativeMeasure> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid AdministrativeMeasure write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.administrative_measure (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.administrative_measure set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<AdministrativeMeasure & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('AdministrativeMeasure ' + id + ' not found');
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
