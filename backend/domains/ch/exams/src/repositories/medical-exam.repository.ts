// Generated from BP-CH-EXAMS-001 v1.0.0 sha256:b8585266a2e5ca4734d9b60ec5bade83fc01a1b209d3b3dbd1729a16a6b03734
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateMedicalExamDto } from '../dto/create-medical-exam.dto.js';
import type { MedicalExam } from '../entities/medical-exam.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'encounter_id',
  'professional_id',
  'performed_at',
  'data',
  'result',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class MedicalExamRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<MedicalExam[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<MedicalExam & Record<string, unknown>>(
            'select * from ch.medical_exam order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(id: string, transaction?: Transaction): Promise<MedicalExam> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<MedicalExam & Record<string, unknown>>(
        'select * from ch.medical_exam where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('MedicalExam ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateMedicalExamDto,
    transaction?: Transaction,
  ): Promise<MedicalExam> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateMedicalExamDto>,
    transaction?: Transaction,
  ): Promise<MedicalExam> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query('delete from ch.medical_exam where id = $1 returning id', [id]),
    );
    if (!result.rows[0])
      throw new NotFoundException('MedicalExam ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateMedicalExamDto>,
    transaction?: Transaction,
  ): Promise<MedicalExam> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid MedicalExam write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ch.medical_exam (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ch.medical_exam set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<MedicalExam & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('MedicalExam ' + id + ' not found');
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
