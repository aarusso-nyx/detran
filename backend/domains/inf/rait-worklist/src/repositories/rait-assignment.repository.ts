// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:2297f42351909b6ac68f4a18e7c8b535508fa219dfdaa0f9b087f1ca3b745234
import { NotFoundException } from '@nestjs/common';
import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateRaitAssignmentDto } from '../dto/create-rait-assignment.dto.js';
import type { RaitAssignment } from '../entities/rait-assignment.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'case_id',
  'pool_id',
  'member_id',
  'assigned_at',
  'assigned_by',
  'released_at',
  'release_reason',
  'active',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
export class RaitAssignmentRepository {
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
  findAll(transaction?: Transaction): Promise<RaitAssignment[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<RaitAssignment & Record<string, unknown>>(
            'select * from inf.rait_assignment order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<RaitAssignment> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<RaitAssignment & Record<string, unknown>>(
        'select * from inf.rait_assignment where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('RaitAssignment ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateRaitAssignmentDto,
    transaction?: Transaction,
  ): Promise<RaitAssignment> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateRaitAssignmentDto>,
    transaction?: Transaction,
  ): Promise<RaitAssignment> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query('delete from inf.rait_assignment where id = $1 returning id', [
        id,
      ]),
    );
    if (!result.rows[0])
      throw new NotFoundException('RaitAssignment ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateRaitAssignmentDto>,
    transaction?: Transaction,
  ): Promise<RaitAssignment> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid RaitAssignment write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.rait_assignment (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.rait_assignment set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<RaitAssignment & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('RaitAssignment ' + id + ' not found');
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
