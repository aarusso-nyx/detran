// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateCrashSubjectRequestDto } from '../dto/create-crash-subject-request.dto.js';
import type { CrashSubjectRequest } from '../entities/crash-subject-request.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'crash_record_id',
  'kind',
  'subject_cpf',
  'purpose',
  'status',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class CrashSubjectRequestRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<CrashSubjectRequest[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<CrashSubjectRequest & Record<string, unknown>>(
            'select * from est.crash_subject_request order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<CrashSubjectRequest> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<CrashSubjectRequest & Record<string, unknown>>(
        'select * from est.crash_subject_request where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('CrashSubjectRequest ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateCrashSubjectRequestDto,
    transaction?: Transaction,
  ): Promise<CrashSubjectRequest> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateCrashSubjectRequestDto>,
    transaction?: Transaction,
  ): Promise<CrashSubjectRequest> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from est.crash_subject_request where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('CrashSubjectRequest ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateCrashSubjectRequestDto>,
    transaction?: Transaction,
  ): Promise<CrashSubjectRequest> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid CrashSubjectRequest write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into est.crash_subject_request (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update est.crash_subject_request set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<CrashSubjectRequest & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('CrashSubjectRequest ' + id + ' not found');
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
