// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:a000d19d0e307a2303ca60295e3ffcc514801b018c0d3b79821c19c2fcda1b35
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateProvisioningGrantReservationBindingDto } from '../dto/create-provisioning-grant-reservation-binding.dto.js';
import type { ProvisioningGrantReservationBinding } from '../entities/provisioning-grant-reservation-binding.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'grant_id',
  'reservation_id',
  'traffic_agency_id',
  'device_id',
  'authorized_agent_id',
  'bound_at',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class ProvisioningGrantReservationBindingRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(
    transaction?: Transaction,
  ): Promise<ProvisioningGrantReservationBinding[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<
            ProvisioningGrantReservationBinding & Record<string, unknown>
          >(
            'select * from ops.provisioning_grant_reservation_binding order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<ProvisioningGrantReservationBinding> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<ProvisioningGrantReservationBinding & Record<string, unknown>>(
        'select * from ops.provisioning_grant_reservation_binding where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'ProvisioningGrantReservationBinding ' + id + ' not found',
      );
    return row;
  }
  create(
    dto: CreateProvisioningGrantReservationBindingDto,
    transaction?: Transaction,
  ): Promise<ProvisioningGrantReservationBinding> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateProvisioningGrantReservationBindingDto>,
    transaction?: Transaction,
  ): Promise<ProvisioningGrantReservationBinding> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from ops.provisioning_grant_reservation_binding where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException(
        'ProvisioningGrantReservationBinding ' + id + ' not found',
      );
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateProvisioningGrantReservationBindingDto>,
    transaction?: Transaction,
  ): Promise<ProvisioningGrantReservationBinding> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error(
        'Invalid ProvisioningGrantReservationBinding write fields',
      );
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into ops.provisioning_grant_reservation_binding (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update ops.provisioning_grant_reservation_binding set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<ProvisioningGrantReservationBinding & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException(
        'ProvisioningGrantReservationBinding ' + id + ' not found',
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
