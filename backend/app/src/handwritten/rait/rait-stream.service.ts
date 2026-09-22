import { Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';

type Tx = Pick<Transaction, 'query'>;
export const RAIT_STREAM_POLLER = Symbol('RAIT_STREAM_POLLER');
export const RAIT_STREAM_TOPICS = [
  'case',
  'assignment',
  'clock',
  'session',
  'agenda-item',
  'batch',
  'outbox',
] as const;
export type RaitStreamTopic = (typeof RAIT_STREAM_TOPICS)[number];
export interface RaitStreamRow {
  id: string;
  created_at: string;
  topic: string;
  payload: Record<string, unknown>;
}

export function sanitizeRaitEvent(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeRaitEvent);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(
        ([key]) =>
          !['tenantId', 'tenant_id', 'cpf', 'cpf_hash', 'bankData'].includes(
            key,
          ),
      )
      .map(([key, item]) => [key, sanitizeRaitEvent(item)]),
  );
}

@Injectable()
export class RaitStreamService {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  listSince(createdAt: string, id: string | null): Promise<RaitStreamRow[]> {
    return withTenantContext(
      this.database,
      this.requestContext,
      async (rawTx) =>
        (
          await (rawTx as Tx).query<RaitStreamRow>(
            `select id, created_at::text as created_at, topic, payload
           from integration.outbox
          where status in ('pending','processing','acked')
            and (created_at, id) > ($1::timestamptz, coalesce($2::uuid, '00000000-0000-0000-0000-000000000000'))
          order by created_at, id limit 500`,
            [createdAt, id],
          )
        ).rows,
    );
  }
  async findById(id: string): Promise<RaitStreamRow | undefined> {
    return withTenantContext(
      this.database,
      this.requestContext,
      async (rawTx) =>
        (
          await (rawTx as Tx).query<RaitStreamRow>(
            'select id, created_at::text as created_at, topic, payload from integration.outbox where id = $1 limit 1',
            [id],
          )
        ).rows[0],
    );
  }
  async now(): Promise<string> {
    return withTenantContext(
      this.database,
      this.requestContext,
      async (rawTx) =>
        String(
          (
            await (rawTx as Tx).query<{ now: string }>(
              'select clock_timestamp()::text as now',
            )
          ).rows[0]?.now,
        ),
    );
  }
}
