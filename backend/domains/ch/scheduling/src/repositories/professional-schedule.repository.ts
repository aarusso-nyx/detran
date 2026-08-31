// Generated from BP-CH-SCHEDULING-001 v1.0.0 sha256:fdbac09747b1d01ea1aa90821a792d537064443364d6a193ca6df5575d591513
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateProfessionalScheduleDto } from '../dto/create-professional-schedule.dto.js';
import type { ProfessionalSchedule } from '../entities/professional-schedule.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'professional_id',
  'clinic_id',
  'weekday',
  'start_time',
  'end_time',
  'valid_from',
  'valid_to',
  'is_active',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class ProfessionalScheduleRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<ProfessionalSchedule[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<ProfessionalSchedule & Record<string, unknown>>(
            'select * from ch.professional_schedule order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<ProfessionalSchedule> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<ProfessionalSchedule & Record<string, unknown>>(
        'select * from ch.professional_schedule where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('ProfessionalSchedule ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateProfessionalScheduleDto,
    transaction?: Transaction,
  ): Promise<ProfessionalSchedule> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateProfessionalScheduleDto>,
    transaction?: Transaction,
  ): Promise<ProfessionalSchedule> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from ch.professional_schedule where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('ProfessionalSchedule ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateProfessionalScheduleDto>,
    transaction?: Transaction,
  ): Promise<ProfessionalSchedule> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid ProfessionalSchedule write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ch.professional_schedule (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ch.professional_schedule set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<ProfessionalSchedule & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('ProfessionalSchedule ' + id + ' not found');
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
