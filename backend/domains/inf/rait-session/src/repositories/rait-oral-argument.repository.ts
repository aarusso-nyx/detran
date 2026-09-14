// Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateRaitOralArgumentDto } from '../dto/create-rait-oral-argument.dto.js';
import type { RaitOralArgument } from '../entities/rait-oral-argument.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'agenda_item_id',
  'requested_by_party_id',
  'requested_at',
  'granted',
  'denial_basis',
  'held_at',
  'duration_minutes',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class RaitOralArgumentRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<RaitOralArgument[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<RaitOralArgument & Record<string, unknown>>(
            'select * from inf.rait_oral_argument order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<RaitOralArgument> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<RaitOralArgument & Record<string, unknown>>(
        'select * from inf.rait_oral_argument where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('RaitOralArgument ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateRaitOralArgumentDto,
    transaction?: Transaction,
  ): Promise<RaitOralArgument> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateRaitOralArgumentDto>,
    transaction?: Transaction,
  ): Promise<RaitOralArgument> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from inf.rait_oral_argument where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('RaitOralArgument ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateRaitOralArgumentDto>,
    transaction?: Transaction,
  ): Promise<RaitOralArgument> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid RaitOralArgument write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.rait_oral_argument (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.rait_oral_argument set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<RaitOralArgument & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('RaitOralArgument ' + id + ' not found');
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
