// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateMeasurementInstrumentDto } from '../dto/create-measurement-instrument.dto.js';
import type { MeasurementInstrument } from '../entities/measurement-instrument.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'traffic_agency_id',
  'instrument_type',
  'serial_number',
  'brand',
  'model',
  'inmetro_model_approval',
  'verification_certificate_number',
  'initial_verification_at',
  'last_verification_at',
  'verification_valid_until',
  'status',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class MeasurementInstrumentRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<MeasurementInstrument[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<MeasurementInstrument & Record<string, unknown>>(
            'select * from ops.ops_measurement_instrument order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<MeasurementInstrument> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<MeasurementInstrument & Record<string, unknown>>(
        'select * from ops.ops_measurement_instrument where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('MeasurementInstrument ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateMeasurementInstrumentDto,
    transaction?: Transaction,
  ): Promise<MeasurementInstrument> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateMeasurementInstrumentDto>,
    transaction?: Transaction,
  ): Promise<MeasurementInstrument> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from ops.ops_measurement_instrument where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('MeasurementInstrument ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateMeasurementInstrumentDto>,
    transaction?: Transaction,
  ): Promise<MeasurementInstrument> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid MeasurementInstrument write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ops.ops_measurement_instrument (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ops.ops_measurement_instrument set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<MeasurementInstrument & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('MeasurementInstrument ' + id + ' not found');
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
