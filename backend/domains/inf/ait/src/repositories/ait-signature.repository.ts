// Generated from BP-INF-AIT-001 v1.0.0 sha256:ef69813e9ad97641c04b7bbbdb8110fe97446523d552fdf17da429d55de0b510
import { NotFoundException } from '@nestjs/common';
import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateAitSignatureDto } from '../dto/create-ait-signature.dto.js';
import type { AitSignature } from '../entities/ait-signature.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'ait_id',
  'person_id',
  'signature_type',
  'signature_evidence_id',
  'signed_at',
  'location_json',
  'refusal_or_impossibility_reason',
  'location_geom',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
export class AitSignatureRepository {
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
  findAll(transaction?: Transaction): Promise<AitSignature[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<AitSignature & Record<string, unknown>>(
            'select * from inf.ait_signature order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(id: string, transaction?: Transaction): Promise<AitSignature> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<AitSignature & Record<string, unknown>>(
        'select * from inf.ait_signature where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('AitSignature ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateAitSignatureDto,
    transaction?: Transaction,
  ): Promise<AitSignature> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateAitSignatureDto>,
    transaction?: Transaction,
  ): Promise<AitSignature> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query('delete from inf.ait_signature where id = $1 returning id', [
        id,
      ]),
    );
    if (!result.rows[0])
      throw new NotFoundException('AitSignature ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateAitSignatureDto>,
    transaction?: Transaction,
  ): Promise<AitSignature> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid AitSignature write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.ait_signature (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.ait_signature set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<AitSignature & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('AitSignature ' + id + ' not found');
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
