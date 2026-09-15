// Generated from BP-INF-COLLECTION-001 v1.0.1 sha256:eb2537783873c7670d66ebe362abad2fe79a9d8e834a0fd30145389f995741d6
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateDebtHandoffDto } from '../dto/create-debt-handoff.dto.js';
import type { DebtHandoff } from '../entities/debt-handoff.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'infraction_id',
  'fazenda_reference',
  'dossier_document_id',
  'status',
  'prepared_at',
  'sent_at',
  'acknowledged_at',
  'cancel_reason',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class DebtHandoffRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<DebtHandoff[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<DebtHandoff & Record<string, unknown>>(
            'select * from inf.debt_handoff order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(id: string, transaction?: Transaction): Promise<DebtHandoff> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<DebtHandoff & Record<string, unknown>>(
        'select * from inf.debt_handoff where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('DebtHandoff ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateDebtHandoffDto,
    transaction?: Transaction,
  ): Promise<DebtHandoff> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateDebtHandoffDto>,
    transaction?: Transaction,
  ): Promise<DebtHandoff> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query('delete from inf.debt_handoff where id = $1 returning id', [id]),
    );
    if (!result.rows[0])
      throw new NotFoundException('DebtHandoff ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateDebtHandoffDto>,
    transaction?: Transaction,
  ): Promise<DebtHandoff> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid DebtHandoff write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.debt_handoff (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.debt_handoff set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<DebtHandoff & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('DebtHandoff ' + id + ' not found');
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
