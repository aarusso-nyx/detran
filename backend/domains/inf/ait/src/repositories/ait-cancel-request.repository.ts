// Generated from BP-INF-AIT-001 v1.2.0 sha256:7501ee3ae148ed392c384119fcce2158f0accb353d0ce4c4406b3863321a28ea
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateAitCancelRequestDto } from '../dto/create-ait-cancel-request.dto.js';
import type { AitCancelRequest } from '../entities/ait-cancel-request.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'ait_id',
  'kind',
  'target_local_act_id',
  'origin_status',
  'addressed_to',
  'idempotency_key',
  'justification',
  'requested_by',
  'version',
  'status',
  'decision',
  'requested_at',
  'decided_at',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class AitCancelRequestRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<AitCancelRequest[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<AitCancelRequest & Record<string, unknown>>(
            'select * from inf.ait_cancel_request order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<AitCancelRequest> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<AitCancelRequest & Record<string, unknown>>(
        'select * from inf.ait_cancel_request where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('AitCancelRequest ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateAitCancelRequestDto,
    transaction?: Transaction,
  ): Promise<AitCancelRequest> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateAitCancelRequestDto>,
    transaction?: Transaction,
  ): Promise<AitCancelRequest> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from inf.ait_cancel_request where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('AitCancelRequest ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateAitCancelRequestDto>,
    transaction?: Transaction,
  ): Promise<AitCancelRequest> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid AitCancelRequest write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.ait_cancel_request (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.ait_cancel_request set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<AitCancelRequest & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('AitCancelRequest ' + id + ' not found');
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
