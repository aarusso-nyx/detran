// Generated from BP-INF-INFRACTION-001 v1.1.2 sha256:59e421dbbb90b291b45408217601e9d6a86b992d9c75c00e5f73b17c5b2e21dd
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateInfractionTimerDto } from '../dto/create-infraction-timer.dto.js';
import type { InfractionTimer } from '../entities/infraction-timer.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'infraction_id',
  'timer_code',
  'instance',
  'start_basis',
  'started_on',
  'raw_due_on',
  'due_on',
  'ceiling_on',
  'business_days',
  'status',
  'satisfied_at',
  'expired_at',
  'cancel_reason',
  'suspended_by_act_id',
  'suspended_days',
  'extension_count',
  'legal_basis',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class InfractionTimerRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<InfractionTimer[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<InfractionTimer & Record<string, unknown>>(
            'select * from inf.infraction_timer order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<InfractionTimer> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<InfractionTimer & Record<string, unknown>>(
        'select * from inf.infraction_timer where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('InfractionTimer ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateInfractionTimerDto,
    transaction?: Transaction,
  ): Promise<InfractionTimer> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateInfractionTimerDto>,
    transaction?: Transaction,
  ): Promise<InfractionTimer> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query('delete from inf.infraction_timer where id = $1 returning id', [
        id,
      ]),
    );
    if (!result.rows[0])
      throw new NotFoundException('InfractionTimer ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateInfractionTimerDto>,
    transaction?: Transaction,
  ): Promise<InfractionTimer> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid InfractionTimer write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.infraction_timer (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.infraction_timer set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<InfractionTimer & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('InfractionTimer ' + id + ' not found');
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
