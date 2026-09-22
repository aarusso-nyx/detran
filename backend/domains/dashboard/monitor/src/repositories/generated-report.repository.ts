// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateGeneratedReportDto } from '../dto/create-generated-report.dto.js';
import type { GeneratedReport } from '../entities/generated-report.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'user_ref',
  'report_type',
  'filters_json',
  'layer',
  'purpose',
  'requested_at',
  'completed_at',
  'status',
  'file_uri',
  'file_hash',
  'watermark',
  'failure_code',
  'version',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class GeneratedReportRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<GeneratedReport[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<GeneratedReport & Record<string, unknown>>(
            'select * from dashboard.generated_report order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<GeneratedReport> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<GeneratedReport & Record<string, unknown>>(
        'select * from dashboard.generated_report where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('GeneratedReport ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateGeneratedReportDto,
    transaction?: Transaction,
  ): Promise<GeneratedReport> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateGeneratedReportDto>,
    transaction?: Transaction,
  ): Promise<GeneratedReport> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from dashboard.generated_report where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('GeneratedReport ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateGeneratedReportDto>,
    transaction?: Transaction,
  ): Promise<GeneratedReport> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid GeneratedReport write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into dashboard.generated_report (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update dashboard.generated_report set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<GeneratedReport & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('GeneratedReport ' + id + ' not found');
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
