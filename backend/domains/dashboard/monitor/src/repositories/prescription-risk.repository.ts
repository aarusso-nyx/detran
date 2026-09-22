// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreatePrescriptionRiskDto } from '../dto/create-prescription-risk.dto.js';
import type { PrescriptionRisk } from '../entities/prescription-risk.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'case_id',
  'clock_code',
  'indicator_code',
  'clock_id',
  'instance',
  'flag',
  'days_remaining',
  'ceiling_on',
  'received_on',
  'case_state',
  'pool_id',
  'timer_code',
  'ceiling_effect',
  'ceiling_reached_on',
  'extinct_state',
  'flag_changed_at',
  'last_event_id',
  'event_schema_version',
  'aggregate_version',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class PrescriptionRiskRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<PrescriptionRisk[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<PrescriptionRisk & Record<string, unknown>>(
            'select * from dashboard.prescription_risk order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<PrescriptionRisk> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<PrescriptionRisk & Record<string, unknown>>(
        'select * from dashboard.prescription_risk where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('PrescriptionRisk ' + id + ' not found');
    return row;
  }
  create(
    dto: CreatePrescriptionRiskDto,
    transaction?: Transaction,
  ): Promise<PrescriptionRisk> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreatePrescriptionRiskDto>,
    transaction?: Transaction,
  ): Promise<PrescriptionRisk> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from dashboard.prescription_risk where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('PrescriptionRisk ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreatePrescriptionRiskDto>,
    transaction?: Transaction,
  ): Promise<PrescriptionRisk> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid PrescriptionRisk write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into dashboard.prescription_risk (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update dashboard.prescription_risk set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<PrescriptionRisk & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('PrescriptionRisk ' + id + ' not found');
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
