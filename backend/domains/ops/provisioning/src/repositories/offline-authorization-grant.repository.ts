// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateOfflineAuthorizationGrantDto } from '../dto/create-offline-authorization-grant.dto.js';
import type { OfflineAuthorizationGrant } from '../entities/offline-authorization-grant.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'traffic_agency_id',
  'device_id',
  'device_key_fingerprint',
  'authorized_agents_json',
  'valid_from',
  'valid_until',
  'maximum_offline_seconds',
  'maximum_acts',
  'revocation_epoch',
  'policy_version',
  'normative_package_id',
  'numbering_reservation_ids_json',
  'issued_at',
  'issued_by_subject',
  'key_id',
  'schema_version',
  'manifest_digest',
  'status',
  'version',
  'revoked_at',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class OfflineAuthorizationGrantRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<OfflineAuthorizationGrant[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<OfflineAuthorizationGrant & Record<string, unknown>>(
            'select * from ops.offline_authorization_grant order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<OfflineAuthorizationGrant> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<OfflineAuthorizationGrant & Record<string, unknown>>(
        'select * from ops.offline_authorization_grant where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'OfflineAuthorizationGrant ' + id + ' not found',
      );
    return row;
  }
  create(
    dto: CreateOfflineAuthorizationGrantDto,
    transaction?: Transaction,
  ): Promise<OfflineAuthorizationGrant> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateOfflineAuthorizationGrantDto>,
    transaction?: Transaction,
  ): Promise<OfflineAuthorizationGrant> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from ops.offline_authorization_grant where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException(
        'OfflineAuthorizationGrant ' + id + ' not found',
      );
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateOfflineAuthorizationGrantDto>,
    transaction?: Transaction,
  ): Promise<OfflineAuthorizationGrant> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid OfflineAuthorizationGrant write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ops.offline_authorization_grant (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ops.offline_authorization_grant set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<OfflineAuthorizationGrant & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'OfflineAuthorizationGrant ' + id + ' not found',
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
