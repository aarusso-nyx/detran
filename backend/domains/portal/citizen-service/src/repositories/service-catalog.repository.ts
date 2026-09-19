// Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.1 sha256:81c05ec48ec8ab36465ae1b250c4a59f59931b99835bfd1ef52f3b10520f9029
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateServiceCatalogDto } from '../dto/create-service-catalog.dto.js';
import type { ServiceCatalog } from '../entities/service-catalog.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'service_key',
  'route',
  'category',
  'title',
  'summary',
  'requirements_json',
  'delivery_channel',
  'legal_deadline',
  'cost',
  'accessibility_note',
  'responsible_party',
  'normative_reference',
  'availability',
  'unavailable_reason',
  'alternative_channel_note',
  'minimum_assurance',
  'version',
  'effective_from',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class ServiceCatalogRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<ServiceCatalog[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<ServiceCatalog & Record<string, unknown>>(
            'select * from portal.service_catalog order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<ServiceCatalog> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<ServiceCatalog & Record<string, unknown>>(
        'select * from portal.service_catalog where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('ServiceCatalog ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateServiceCatalogDto,
    transaction?: Transaction,
  ): Promise<ServiceCatalog> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateServiceCatalogDto>,
    transaction?: Transaction,
  ): Promise<ServiceCatalog> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from portal.service_catalog where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('ServiceCatalog ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateServiceCatalogDto>,
    transaction?: Transaction,
  ): Promise<ServiceCatalog> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid ServiceCatalog write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into portal.service_catalog (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update portal.service_catalog set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<ServiceCatalog & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('ServiceCatalog ' + id + ' not found');
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
