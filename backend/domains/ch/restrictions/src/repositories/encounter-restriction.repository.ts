// Generated from BP-CH-RESTRICTIONS-001 v1.0.0 sha256:05527c0aea012ece64e79955246e666899d444700b824e484f1800ff151769bf
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateEncounterRestrictionDto } from '../dto/create-encounter-restriction.dto.js';
import type { EncounterRestriction } from '../entities/encounter-restriction.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'encounter_id',
  'report_id',
  'restriction_code_id',
  'notes',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class EncounterRestrictionRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<EncounterRestriction[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<EncounterRestriction & Record<string, unknown>>(
            'select * from ch.encounter_restriction order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<EncounterRestriction> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<EncounterRestriction & Record<string, unknown>>(
        'select * from ch.encounter_restriction where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('EncounterRestriction ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateEncounterRestrictionDto,
    transaction?: Transaction,
  ): Promise<EncounterRestriction> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateEncounterRestrictionDto>,
    transaction?: Transaction,
  ): Promise<EncounterRestriction> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from ch.encounter_restriction where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('EncounterRestriction ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateEncounterRestrictionDto>,
    transaction?: Transaction,
  ): Promise<EncounterRestriction> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid EncounterRestriction write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ch.encounter_restriction (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ch.encounter_restriction set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<EncounterRestriction & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('EncounterRestriction ' + id + ' not found');
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
