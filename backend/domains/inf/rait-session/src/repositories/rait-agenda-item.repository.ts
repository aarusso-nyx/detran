// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
import { NotFoundException } from '@nestjs/common';
import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateRaitAgendaItemDto } from '../dto/create-rait-agenda-item.dto.js';
import type { RaitAgendaItem } from '../entities/rait-agenda-item.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'session_id',
  'case_id',
  'position',
  'priority',
  'rapporteur_member_id',
  'opinion_summary',
  'opinion_analysis',
  'opinion_vote',
  'opinion_registered_at',
  'read_at',
  'proclaimed_at',
  'outcome',
  'withdrawn',
  'withdrawn_reason',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
export class RaitAgendaItemRepository {
  constructor(
    private readonly database: Pick<Database, 'tx'>,
    private readonly requestContext: Pick<
      RequestContext,
      'hasActiveContext' | 'snapshot'
    >,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<RaitAgendaItem[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<RaitAgendaItem & Record<string, unknown>>(
            'select * from inf.rait_agenda_item order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<RaitAgendaItem> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<RaitAgendaItem & Record<string, unknown>>(
        'select * from inf.rait_agenda_item where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('RaitAgendaItem ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateRaitAgendaItemDto,
    transaction?: Transaction,
  ): Promise<RaitAgendaItem> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateRaitAgendaItemDto>,
    transaction?: Transaction,
  ): Promise<RaitAgendaItem> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query('delete from inf.rait_agenda_item where id = $1 returning id', [
        id,
      ]),
    );
    if (!result.rows[0])
      throw new NotFoundException('RaitAgendaItem ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateRaitAgendaItemDto>,
    transaction?: Transaction,
  ): Promise<RaitAgendaItem> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid RaitAgendaItem write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.rait_agenda_item (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.rait_agenda_item set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<RaitAgendaItem & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('RaitAgendaItem ' + id + ' not found');
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
