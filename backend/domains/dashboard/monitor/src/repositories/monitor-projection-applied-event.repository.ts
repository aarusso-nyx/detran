// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateMonitorProjectionAppliedEventDto } from '../dto/create-monitor-projection-applied-event.dto.js';
import type { MonitorProjectionAppliedEvent } from '../entities/monitor-projection-applied-event.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'projection_name',
  'event_id',
  'event_type',
  'event_schema_version',
  'aggregate_version',
  'occurred_at',
  'applied_at',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class MonitorProjectionAppliedEventRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<MonitorProjectionAppliedEvent[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<
            MonitorProjectionAppliedEvent & Record<string, unknown>
          >(
            'select * from dashboard.monitor_projection_applied_event order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<MonitorProjectionAppliedEvent> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<MonitorProjectionAppliedEvent & Record<string, unknown>>(
        'select * from dashboard.monitor_projection_applied_event where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'MonitorProjectionAppliedEvent ' + id + ' not found',
      );
    return row;
  }
  create(
    dto: CreateMonitorProjectionAppliedEventDto,
    transaction?: Transaction,
  ): Promise<MonitorProjectionAppliedEvent> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateMonitorProjectionAppliedEventDto>,
    transaction?: Transaction,
  ): Promise<MonitorProjectionAppliedEvent> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from dashboard.monitor_projection_applied_event where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException(
        'MonitorProjectionAppliedEvent ' + id + ' not found',
      );
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateMonitorProjectionAppliedEventDto>,
    transaction?: Transaction,
  ): Promise<MonitorProjectionAppliedEvent> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid MonitorProjectionAppliedEvent write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into dashboard.monitor_projection_applied_event (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update dashboard.monitor_projection_applied_event set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<MonitorProjectionAppliedEvent & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'MonitorProjectionAppliedEvent ' + id + ' not found',
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
