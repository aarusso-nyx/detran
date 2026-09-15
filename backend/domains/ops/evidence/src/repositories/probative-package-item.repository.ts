// Generated from BP-OPS-EVIDENCE-001 v1.0.0 sha256:a8692e7ee4171aea45d3aa6a8ca457251f3005b1dc05d1b03e2aa5ebc8f1923f
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateProbativePackageItemDto } from '../dto/create-probative-package-item.dto.js';
import type { ProbativePackageItem } from '../entities/probative-package-item.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'package_id',
  'item_type',
  'evidence_id',
  'entity_type',
  'entity_id',
  'item_hash',
  'sequence',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class ProbativePackageItemRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<ProbativePackageItem[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<ProbativePackageItem & Record<string, unknown>>(
            'select * from ops.evidence_probative_package_item order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<ProbativePackageItem> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<ProbativePackageItem & Record<string, unknown>>(
        'select * from ops.evidence_probative_package_item where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('ProbativePackageItem ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateProbativePackageItemDto,
    transaction?: Transaction,
  ): Promise<ProbativePackageItem> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateProbativePackageItemDto>,
    transaction?: Transaction,
  ): Promise<ProbativePackageItem> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from ops.evidence_probative_package_item where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('ProbativePackageItem ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateProbativePackageItemDto>,
    transaction?: Transaction,
  ): Promise<ProbativePackageItem> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid ProbativePackageItem write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ops.evidence_probative_package_item (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ops.evidence_probative_package_item set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<ProbativePackageItem & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('ProbativePackageItem ' + id + ' not found');
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
