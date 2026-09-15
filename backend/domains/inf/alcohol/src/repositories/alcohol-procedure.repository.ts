// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:18decd0fa5855e93f40ce052c3ffb2ec4ad022530cd5da983fadf681a45bd246
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateAlcoholProcedureDto } from '../dto/create-alcohol-procedure.dto.js';
import type { AlcoholProcedure } from '../entities/alcohol-procedure.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'traffic_agency_id',
  'ait_id',
  'measure_id',
  'approach_id',
  'agent_id',
  'shift_id',
  'driver_person_id',
  'procedure_at',
  'location_json',
  'procedure_type',
  'outcome',
  'status',
  'notes',
  'ait_local_id',
  'sign_catalog_id',
  'sign_catalog_version',
  'driver_name',
  'driver_document',
  'vehicle_plate',
  'vehicle_make',
  'refused_procedures',
  'driver_statement_json',
  'witnesses_json',
  'source_local_id',
  'source_idempotency_key',
  'source_payload_hash',
  'location_geom',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class AlcoholProcedureRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<AlcoholProcedure[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<AlcoholProcedure & Record<string, unknown>>(
            'select * from inf.alcohol_procedure order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<AlcoholProcedure> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<AlcoholProcedure & Record<string, unknown>>(
        'select * from inf.alcohol_procedure where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('AlcoholProcedure ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateAlcoholProcedureDto,
    transaction?: Transaction,
  ): Promise<AlcoholProcedure> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateAlcoholProcedureDto>,
    transaction?: Transaction,
  ): Promise<AlcoholProcedure> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query('delete from inf.alcohol_procedure where id = $1 returning id', [
        id,
      ]),
    );
    if (!result.rows[0])
      throw new NotFoundException('AlcoholProcedure ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateAlcoholProcedureDto>,
    transaction?: Transaction,
  ): Promise<AlcoholProcedure> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid AlcoholProcedure write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.alcohol_procedure (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.alcohol_procedure set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<AlcoholProcedure & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('AlcoholProcedure ' + id + ' not found');
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
