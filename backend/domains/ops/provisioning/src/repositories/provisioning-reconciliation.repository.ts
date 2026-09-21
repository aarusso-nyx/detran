// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateProvisioningReconciliationDto } from '../dto/create-provisioning-reconciliation.dto.js';
import type { ProvisioningReconciliation } from '../entities/provisioning-reconciliation.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'grant_id',
  'device_id',
  'reconciliation_digest',
  'accepted_act_count',
  'rejected_act_count',
  'unresolved_act_count',
  'reconciled_by_subject',
  'reconciled_at',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class ProvisioningReconciliationRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<ProvisioningReconciliation[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<ProvisioningReconciliation & Record<string, unknown>>(
            'select * from ops.provisioning_reconciliation order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<ProvisioningReconciliation> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<ProvisioningReconciliation & Record<string, unknown>>(
        'select * from ops.provisioning_reconciliation where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'ProvisioningReconciliation ' + id + ' not found',
      );
    return row;
  }
  create(
    dto: CreateProvisioningReconciliationDto,
    transaction?: Transaction,
  ): Promise<ProvisioningReconciliation> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateProvisioningReconciliationDto>,
    transaction?: Transaction,
  ): Promise<ProvisioningReconciliation> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from ops.provisioning_reconciliation where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException(
        'ProvisioningReconciliation ' + id + ' not found',
      );
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateProvisioningReconciliationDto>,
    transaction?: Transaction,
  ): Promise<ProvisioningReconciliation> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid ProvisioningReconciliation write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ops.provisioning_reconciliation (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ops.provisioning_reconciliation set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<ProvisioningReconciliation & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'ProvisioningReconciliation ' + id + ' not found',
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
