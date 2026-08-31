// Generated from BP-CH-BIOMETRICS-001 v1.0.0 sha256:918eef902a9909e28862909f968b34aade0b443ebe3741b3823b9b1761d3cdbb
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateBiometricReferenceDto } from '../dto/create-biometric-reference.dto.js';
import type { BiometricReference } from '../entities/biometric-reference.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'patient_id',
  'kind',
  'provider_code',
  'provider_reference',
  'storage_document_id',
  'sha256',
  'quality_score',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class BiometricReferenceRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<BiometricReference[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<BiometricReference & Record<string, unknown>>(
            'select * from ch.biometric_reference order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<BiometricReference> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<BiometricReference & Record<string, unknown>>(
        'select * from ch.biometric_reference where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('BiometricReference ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateBiometricReferenceDto,
    transaction?: Transaction,
  ): Promise<BiometricReference> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateBiometricReferenceDto>,
    transaction?: Transaction,
  ): Promise<BiometricReference> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from ch.biometric_reference where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('BiometricReference ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateBiometricReferenceDto>,
    transaction?: Transaction,
  ): Promise<BiometricReference> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid BiometricReference write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ch.biometric_reference (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ch.biometric_reference set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<BiometricReference & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('BiometricReference ' + id + ' not found');
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
