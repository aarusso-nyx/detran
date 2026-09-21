// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateProvisioningCommandIdempotencyDto } from '../dto/create-provisioning-command-idempotency.dto.js';
import type { ProvisioningCommandIdempotency } from '../entities/provisioning-command-idempotency.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'command_name',
  'idempotency_key',
  'request_digest',
  'response_body_json',
  'response_etag',
  'completed_at',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class ProvisioningCommandIdempotencyRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(
    transaction?: Transaction,
  ): Promise<ProvisioningCommandIdempotency[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<
            ProvisioningCommandIdempotency & Record<string, unknown>
          >(
            'select * from ops.provisioning_command_idempotency order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<ProvisioningCommandIdempotency> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<ProvisioningCommandIdempotency & Record<string, unknown>>(
        'select * from ops.provisioning_command_idempotency where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'ProvisioningCommandIdempotency ' + id + ' not found',
      );
    return row;
  }
  create(
    dto: CreateProvisioningCommandIdempotencyDto,
    transaction?: Transaction,
  ): Promise<ProvisioningCommandIdempotency> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateProvisioningCommandIdempotencyDto>,
    transaction?: Transaction,
  ): Promise<ProvisioningCommandIdempotency> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from ops.provisioning_command_idempotency where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException(
        'ProvisioningCommandIdempotency ' + id + ' not found',
      );
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateProvisioningCommandIdempotencyDto>,
    transaction?: Transaction,
  ): Promise<ProvisioningCommandIdempotency> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid ProvisioningCommandIdempotency write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ops.provisioning_command_idempotency (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ops.provisioning_command_idempotency set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<ProvisioningCommandIdempotency & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'ProvisioningCommandIdempotency ' + id + ' not found',
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
