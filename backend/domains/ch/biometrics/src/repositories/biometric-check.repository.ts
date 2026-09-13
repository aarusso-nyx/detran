// Generated from BP-CH-BIOMETRICS-001 v1.1.0 sha256:23fc0416b68ed64cb3247e3a7945a7f7ae42043134403c34124d78f9a5dfd939
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateBiometricCheckDto } from '../dto/create-biometric-check.dto.js';
import type { BiometricCheck } from '../entities/biometric-check.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'appointment_id',
  'encounter_id',
  'clinic_id',
  'station_id',
  'subject_patient_id',
  'subject_professional_id',
  'kind',
  'modality',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class BiometricCheckRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<BiometricCheck[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<BiometricCheck & Record<string, unknown>>(
            'select * from ch.biometric_check order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<BiometricCheck> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<BiometricCheck & Record<string, unknown>>(
        'select * from ch.biometric_check where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('BiometricCheck ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateBiometricCheckDto,
    transaction?: Transaction,
  ): Promise<BiometricCheck> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateBiometricCheckDto>,
    transaction?: Transaction,
  ): Promise<BiometricCheck> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query('delete from ch.biometric_check where id = $1 returning id', [
        id,
      ]),
    );
    if (!result.rows[0])
      throw new NotFoundException('BiometricCheck ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateBiometricCheckDto>,
    transaction?: Transaction,
  ): Promise<BiometricCheck> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid BiometricCheck write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ch.biometric_check (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ch.biometric_check set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<BiometricCheck & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('BiometricCheck ' + id + ' not found');
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
