// Generated from BP-CH-BILLING-001 v1.0.0 sha256:dbb379527f32d359e25dee36e8d7232af006c46466c5c86faef3d22de91db860
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateFederalExamPublicPriceDto } from '../dto/create-federal-exam-public-price.dto.js';
import type { FederalExamPublicPrice } from '../entities/federal-exam-public-price.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'exam_kind',
  'amount_cents',
  'effective_from',
  'effective_to',
  'ipca_reference_year',
  'index_name',
  'federal_source_reference',
  'published_at',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class FederalExamPublicPriceRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<FederalExamPublicPrice[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<FederalExamPublicPrice & Record<string, unknown>>(
            'select * from ch.federal_exam_public_price order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<FederalExamPublicPrice> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<FederalExamPublicPrice & Record<string, unknown>>(
        'select * from ch.federal_exam_public_price where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'FederalExamPublicPrice ' + id + ' not found',
      );
    return row;
  }
  create(
    dto: CreateFederalExamPublicPriceDto,
    transaction?: Transaction,
  ): Promise<FederalExamPublicPrice> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateFederalExamPublicPriceDto>,
    transaction?: Transaction,
  ): Promise<FederalExamPublicPrice> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from ch.federal_exam_public_price where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException(
        'FederalExamPublicPrice ' + id + ' not found',
      );
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateFederalExamPublicPriceDto>,
    transaction?: Transaction,
  ): Promise<FederalExamPublicPrice> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid FederalExamPublicPrice write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ch.federal_exam_public_price (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ch.federal_exam_public_price set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<FederalExamPublicPrice & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'FederalExamPublicPrice ' + id + ' not found',
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
