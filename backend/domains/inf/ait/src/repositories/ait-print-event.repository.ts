// Generated from BP-INF-AIT-001 v1.0.0 sha256:ef69813e9ad97641c04b7bbbdb8110fe97446523d552fdf17da429d55de0b510
import { NotFoundException } from '@nestjs/common';
import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateAitPrintEventDto } from '../dto/create-ait-print-event.dto.js';
import type { AitPrintEvent } from '../entities/ait-print-event.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'ait_id',
  'event_type',
  'event_at',
  'device_id',
  'printer_identifier',
  'receipt_hash',
  'failure_reason',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
export class AitPrintEventRepository {
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
  findAll(transaction?: Transaction): Promise<AitPrintEvent[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<AitPrintEvent & Record<string, unknown>>(
            'select * from inf.ait_print_event order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(id: string, transaction?: Transaction): Promise<AitPrintEvent> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<AitPrintEvent & Record<string, unknown>>(
        'select * from inf.ait_print_event where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('AitPrintEvent ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateAitPrintEventDto,
    transaction?: Transaction,
  ): Promise<AitPrintEvent> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateAitPrintEventDto>,
    transaction?: Transaction,
  ): Promise<AitPrintEvent> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query('delete from inf.ait_print_event where id = $1 returning id', [
        id,
      ]),
    );
    if (!result.rows[0])
      throw new NotFoundException('AitPrintEvent ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateAitPrintEventDto>,
    transaction?: Transaction,
  ): Promise<AitPrintEvent> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid AitPrintEvent write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.ait_print_event (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.ait_print_event set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<AitPrintEvent & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('AitPrintEvent ' + id + ' not found');
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
