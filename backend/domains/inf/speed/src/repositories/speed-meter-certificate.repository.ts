// Generated from BP-INF-SPEED-001 v1.1.0 sha256:a7576a43ce5eca2a2e93dd79ac603a578aa6e7b0127a6dc276c749cd38b02411
import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import type { CreateSpeedMeterCertificateDto } from '../dto/create-speed-meter-certificate.dto.js';
import type { SpeedMeterCertificate } from '../entities/speed-meter-certificate.entity.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
const WRITABLE_FIELDS = new Set<string>([
  'meter_id',
  'kind',
  'certificate_number',
  'issuer',
  'issued_on',
  'valid_until',
]);

/** SQL-only repository. Tenant identity is injected by the kernel trigger. */
@Injectable()
export class SpeedMeterCertificateRepository {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
  findAll(transaction?: Transaction): Promise<SpeedMeterCertificate[]> {
    return this.execute(
      transaction,
      async (tx) =>
        (
          await tx.query<SpeedMeterCertificate & Record<string, unknown>>(
            'select * from inf.speed_meter_certificate order by created_at desc limit 500',
          )
        ).rows,
    );
  }
  async findOne(
    id: string,
    transaction?: Transaction,
  ): Promise<SpeedMeterCertificate> {
    const result = await this.execute(transaction, (tx) =>
      tx.query<SpeedMeterCertificate & Record<string, unknown>>(
        'select * from inf.speed_meter_certificate where id = $1 limit 1',
        [id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('SpeedMeterCertificate ' + id + ' not found');
    return row;
  }
  create(
    dto: CreateSpeedMeterCertificateDto,
    transaction?: Transaction,
  ): Promise<SpeedMeterCertificate> {
    return this.write('insert', undefined, dto, transaction);
  }
  update(
    id: string,
    dto: Partial<CreateSpeedMeterCertificateDto>,
    transaction?: Transaction,
  ): Promise<SpeedMeterCertificate> {
    return this.write('update', id, dto, transaction);
  }
  async remove(id: string, transaction?: Transaction): Promise<void> {
    const result = await this.execute(transaction, (tx) =>
      tx.query(
        'delete from inf.speed_meter_certificate where id = $1 returning id',
        [id],
      ),
    );
    if (!result.rows[0])
      throw new NotFoundException('SpeedMeterCertificate ' + id + ' not found');
  }
  private async write(
    operation: 'insert' | 'update',
    id: string | undefined,
    dto: Partial<CreateSpeedMeterCertificateDto>,
    transaction?: Transaction,
  ): Promise<SpeedMeterCertificate> {
    const entries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(([field]) => !WRITABLE_FIELDS.has(field))
    )
      throw new Error('Invalid SpeedMeterCertificate write fields');
    const columns = entries.map(([field]) => field);
    const values = entries.map(([, value]) => value);
    const insertSql =
      'insert into inf.speed_meter_certificate (' +
      columns.join(', ') +
      ') values (' +
      columns.map((_, index) => '$' + (index + 1)).join(', ') +
      ') returning *';
    const updateSql =
      'update inf.speed_meter_certificate set ' +
      columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') +
      ', updated_at = now() where id = $' +
      (columns.length + 1) +
      ' returning *';
    const result = await this.execute(transaction, (tx) =>
      tx.query<SpeedMeterCertificate & Record<string, unknown>>(
        operation === 'insert' ? insertSql : updateSql,
        operation === 'insert' ? values : [...values, id],
      ),
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException('SpeedMeterCertificate ' + id + ' not found');
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
