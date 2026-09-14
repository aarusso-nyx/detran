// Generated from BP-INF-NOTIFICATION-001 v1.1.1 sha256:4c103efb85b586bbe1d79e0fc7367ae2e566e53d551fa0e41fd4635207283be6
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateNoticeAcknowledgementDto } from '../dto/create-notice-acknowledgement.dto.js';
import type { NoticeAcknowledgement } from '../entities/notice-acknowledgement.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'notice_id',
  'effective_on',
  'fictitious',
  'evidence_kind',
  'evidence_ref',
  'registered_at',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class NoticeAcknowledgementRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<NoticeAcknowledgement[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<NoticeAcknowledgement & Record<string, unknown>>(
            'select * from inf.notice_acknowledgement order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<NoticeAcknowledgement> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<NoticeAcknowledgement & Record<string, unknown>>(
        'select * from inf.notice_acknowledgement where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('NoticeAcknowledgement ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateNoticeAcknowledgementDto,
    transaction?: Transaction,
  ): Promise<NoticeAcknowledgement> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateNoticeAcknowledgementDto>,
    transaction?: Transaction,
  ): Promise<NoticeAcknowledgement> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from inf.notice_acknowledgement where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('NoticeAcknowledgement ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateNoticeAcknowledgementDto>,
    transaction?: Transaction,
  ): Promise<NoticeAcknowledgement> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid NoticeAcknowledgement write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.notice_acknowledgement (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.notice_acknowledgement set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<NoticeAcknowledgement & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('NoticeAcknowledgement ' + id + ' not found');
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
