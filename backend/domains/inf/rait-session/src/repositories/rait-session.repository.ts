// Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateRaitSessionDto } from '../dto/create-rait-session.dto.js';
import type { RaitSession } from '../entities/rait-session.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'judging_body',
  'state',
  'scheduled_for',
  'agenda_closed_at',
  'convened_at',
  'opened_at',
  'closed_at',
  'quorum_required',
  'quorum_observed',
  'chair_member_id',
  'adjourned_reason',
  'extraordinary',
  'short_notice_ack_by',
  'modality',
  'short_notice_ack',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class RaitSessionRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<RaitSession[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<RaitSession & Record<string, unknown>>(
            'select * from inf.rait_session order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(id: string, transaction?: Transaction): Promise<RaitSession> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<RaitSession & Record<string, unknown>>(
        'select * from inf.rait_session where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('RaitSession ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateRaitSessionDto,
    transaction?: Transaction,
  ): Promise<RaitSession> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateRaitSessionDto>,
    transaction?: Transaction,
  ): Promise<RaitSession> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query('delete from inf.rait_session where id = $1 returning id', [id]),
    );
    if (!result.rows[0])
      throw new NotFoundException('RaitSession ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateRaitSessionDto>,
    transaction?: Transaction,
  ): Promise<RaitSession> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid RaitSession write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.rait_session (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.rait_session set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<RaitSession & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('RaitSession ' + id + ' not found');
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
