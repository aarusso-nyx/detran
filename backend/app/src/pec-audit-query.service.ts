import { BadRequestException, Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export interface PecAuditQuery {
  clinicId?: string;
  professionalId?: string;
  correlationId?: string;
  from?: string;
  to?: string;
  action?: string;
  entity?: string;
  page?: number;
  pageSize?: number;
}

export interface PecAuditEvent {
  eventId: string;
  occurredAt: string;
  correlationId?: string | null;
  actorId?: string | null;
  actorRole?: string | null;
  ipAddress?: string | null;
  stationId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details: Record<string, unknown>;
  previousHash?: string | null;
  selfHash: string;
}

const COLUMNS = `
  event_id::text as "eventId", occurred_at as "occurredAt",
  correlation_id::text as "correlationId", actor_id::text as "actorId",
  actor_role as "actorRole", host(ip_address)::text as "ipAddress",
  station_id::text as "stationId", action, entity,
  entity_id::text as "entityId", details,
  encode(prev_hash, 'hex') as "previousHash",
  encode(self_hash, 'hex') as "selfHash"`;

@Injectable()
export class PecAuditQueryService {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  async list(query: PecAuditQuery): Promise<PecAuditEvent[]> {
    return this.select(
      query,
      Math.min(Math.max(query.pageSize ?? 50, 1), 500),
      (Math.max(query.page ?? 1, 1) - 1) *
        Math.min(Math.max(query.pageSize ?? 50, 1), 500),
    );
  }

  async exportCsv(query: PecAuditQuery): Promise<string> {
    const rows = await this.select(query, 10_000, 0);
    const fields: Array<keyof PecAuditEvent> = [
      'eventId',
      'occurredAt',
      'correlationId',
      'actorId',
      'actorRole',
      'ipAddress',
      'stationId',
      'action',
      'entity',
      'entityId',
      'details',
      'previousHash',
      'selfHash',
    ];
    return [
      fields.join(','),
      ...rows.map((row) =>
        fields
          .map((field) =>
            this.csvCell(
              field === 'details' ? JSON.stringify(row[field]) : row[field],
            ),
          )
          .join(','),
      ),
    ].join('\n');
  }

  private select(
    query: PecAuditQuery,
    limit: number,
    offset: number,
  ): Promise<PecAuditEvent[]> {
    const tenantId = this.requestContext.snapshot().tenantId;
    if (!tenantId) throw new BadRequestException('Tenant context is required');
    if (
      query.from &&
      query.to &&
      Date.parse(query.from) > Date.parse(query.to)
    ) {
      throw new BadRequestException('Audit from must be before or equal to to');
    }
    const conditions = ['tenant_id = $1::uuid'];
    const values: unknown[] = [tenantId];
    const add = (sql: (index: number) => string, value: unknown) => {
      values.push(value);
      conditions.push(sql(values.length));
    };
    if (query.clinicId)
      add(
        (i) =>
          `(details ->> 'clinicId' = $${i} or details ->> 'clinic_id' = $${i})`,
        query.clinicId,
      );
    if (query.professionalId)
      add((i) => `actor_id = $${i}::uuid`, query.professionalId);
    if (query.correlationId)
      add((i) => `correlation_id = $${i}::uuid`, query.correlationId);
    if (query.from) add((i) => `occurred_at >= $${i}::timestamptz`, query.from);
    if (query.to) add((i) => `occurred_at <= $${i}::timestamptz`, query.to);
    if (query.action) add((i) => `action = $${i}`, query.action);
    if (query.entity) add((i) => `entity = $${i}`, query.entity);
    values.push(limit, offset);
    return this.database.tx(
      async (transaction) => {
        const result = await (transaction as SqlTransaction).query<
          PecAuditEvent & Record<string, unknown>
        >(
          `select ${COLUMNS} from audit.events
          where ${conditions.join(' and ')}
          order by occurred_at desc, event_id desc
          limit $${values.length - 1} offset $${values.length}`,
          values,
        );
        return result.rows;
      },
      { role: 'app', readonly: true },
    );
  }

  private csvCell(value: unknown): string {
    if (value === null || value === undefined) return '';
    let text = String(value);
    if (/^[=+\-@]/u.test(text)) text = `'${text}`;
    return `"${text.replace(/"/gu, '""')}"`;
  }
}
