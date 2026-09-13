// Generated from BP-CH-REPORTS-001 v1.3.0 sha256:223e3b4e60807d8ac51bcd6d9e1294a65ca305509b8ff1dc2f93649c7f3aa1a5
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateRegistrationBlockNoticeDto } from '../dto/create-registration-block-notice.dto.js';
import type { RegistrationBlockNotice } from '../entities/registration-block-notice.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class RegistrationBlockNoticeRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<RegistrationBlockNotice[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<RegistrationBlockNotice & Record<string, unknown>>(
            'select * from ch.registration_block_notice order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<RegistrationBlockNotice> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<RegistrationBlockNotice & Record<string, unknown>>(
        'select * from ch.registration_block_notice where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'RegistrationBlockNotice ' + id + ' not found',
      );
    return row;
  }
  create(
    dto: CreateRegistrationBlockNoticeDto,
    transaction?: Transaction,
  ): Promise<RegistrationBlockNotice> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateRegistrationBlockNoticeDto>,
    transaction?: Transaction,
  ): Promise<RegistrationBlockNotice> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from ch.registration_block_notice where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException(
        'RegistrationBlockNotice ' + id + ' not found',
      );
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateRegistrationBlockNoticeDto>,
    transaction?: Transaction,
  ): Promise<RegistrationBlockNotice> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid RegistrationBlockNotice write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ch.registration_block_notice (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ch.registration_block_notice set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<RegistrationBlockNotice & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'RegistrationBlockNotice ' + id + ' not found',
      );
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
