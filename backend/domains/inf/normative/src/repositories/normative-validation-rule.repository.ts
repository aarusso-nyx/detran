// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:8f7f7c36486cc7f2062f87bdfda6722994b3aff5dc8e5b80183ffea196fad19f
import { NotFoundException } from '@nestjs/common';
import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateNormativeValidationRuleDto } from '../dto/create-normative-validation-rule.dto.js';
import type { NormativeValidationRule } from '../entities/normative-validation-rule.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'catalog_id',
  'framing_id',
  'rule_code',
  'description',
  'rule_type',
  'expression_json',
  'user_message',
  'severity',
  'status',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
export class NormativeValidationRuleRepository {
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
  findAll(transaction?: Transaction): Promise<NormativeValidationRule[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<NormativeValidationRule & Record<string, unknown>>(
            'select * from inf.normative_validation_rule order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<NormativeValidationRule> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<NormativeValidationRule & Record<string, unknown>>(
        'select * from inf.normative_validation_rule where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'NormativeValidationRule ' + id + ' not found',
      );
    return row;
  }
  create(
    dto: CreateNormativeValidationRuleDto,
    transaction?: Transaction,
  ): Promise<NormativeValidationRule> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateNormativeValidationRuleDto>,
    transaction?: Transaction,
  ): Promise<NormativeValidationRule> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from inf.normative_validation_rule where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException(
        'NormativeValidationRule ' + id + ' not found',
      );
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateNormativeValidationRuleDto>,
    transaction?: Transaction,
  ): Promise<NormativeValidationRule> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid NormativeValidationRule write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.normative_validation_rule (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.normative_validation_rule set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<NormativeValidationRule & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'NormativeValidationRule ' + id + ' not found',
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
