// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateHomologationDto } from '../dto/create-homologation.dto.js';
import type { Homologation } from '../entities/homologation.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'traffic_agency_id',
  'homologation_number',
  'scope',
  'issued_at',
  'valid_until',
  'document_uri',
  'status',
  'laudo_emitido_em',
  'laudo_valido_ate',
  'emissor_independente',
  'descricao_publicada_em',
  'descricao_publicacao_local',
  'senatran_notificado_em',
  'senatran_prazo_notificacao',
  'cancelled_reason',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class HomologationRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<Homologation[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<Homologation & Record<string, unknown>>(
            'select * from ops.ops_homologation order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(id: string, transaction?: Transaction): Promise<Homologation> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<Homologation & Record<string, unknown>>(
        'select * from ops.ops_homologation where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Homologation ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateHomologationDto,
    transaction?: Transaction,
  ): Promise<Homologation> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateHomologationDto>,
    transaction?: Transaction,
  ): Promise<Homologation> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query('delete from ops.ops_homologation where id = $1 returning id', [
        id,
      ]),
    );
    if (!result.rows[0])
      throw new NotFoundException('Homologation ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateHomologationDto>,
    transaction?: Transaction,
  ): Promise<Homologation> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid Homologation write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ops.ops_homologation (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ops.ops_homologation set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<Homologation & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Homologation ' + id + ' not found');
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
