// CTG-0004 §7.3 (R-0008, TASK-0009, ADR-0020) — projeção de leitura e
// comando de `retry` sobre `integration.outbox`.
import { Injectable } from '@nestjs/common';
import { DetranError, withTenantContext } from '@detran/shared';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';

const SYSTEMS = ['renainf', 'renach', 'renaest', 'sne'] as const;
const STATUSES = ['pending', 'processing', 'acked', 'error'] as const;

export interface OutboxListItem {
  [key: string]: unknown;
  id: string;
  topic: string;
  aggregate_type: string;
  aggregate_id: string;
  status: string;
  attempts: number;
  last_error: string | null;
  available_at: string;
  dispatched_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface SqlQueryable {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

function asQueryable(tx: Transaction): SqlQueryable {
  return tx as unknown as SqlQueryable;
}

@Injectable()
export class TeatIntegrationsService {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  async list(params: {
    system?: string;
    status?: string;
  }): Promise<{ items: OutboxListItem[]; nextCursor: null }> {
    if (
      params.system &&
      !(SYSTEMS as readonly string[]).includes(params.system)
    )
      throw new DetranError('TEAT.ENUM_INVALID', {
        status: 400,
        context: { field: 'system', allowed: [...SYSTEMS] },
        message: 'Sistema de integração fora do vocabulário.',
      });
    if (
      params.status &&
      !(STATUSES as readonly string[]).includes(params.status)
    )
      throw new DetranError('TEAT.ENUM_INVALID', {
        status: 400,
        context: { field: 'status', allowed: [...STATUSES] },
        message: 'Status de integração fora do vocabulário.',
      });

    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const conditions: string[] = [];
      const values: unknown[] = [];
      if (params.system) {
        values.push(`${params.system}.%`);
        conditions.push(`topic like $${values.length}`);
      }
      if (params.status) {
        values.push(params.status);
        conditions.push(`status = $${values.length}`);
      }
      const where = conditions.length
        ? `where ${conditions.join(' and ')}`
        : '';
      const result = await asQueryable(tx).query<OutboxListItem>(
        `select id, topic, aggregate_type, aggregate_id, status, attempts,
                last_error, available_at::text as available_at,
                dispatched_at::text as dispatched_at,
                completed_at::text as completed_at,
                created_at::text as created_at
           from integration.outbox
           ${where}
          order by created_at desc, id
          limit 200`,
        values,
      );
      return { items: result.rows, nextCursor: null };
    });
  }

  async retry(
    id: string,
  ): Promise<{ id: string; status: string; attempts: number }> {
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const current = await asQueryable(tx).query<{
        id: string;
        status: string;
        attempts: number;
      }>(`select id, status, attempts from integration.outbox where id = $1`, [
        id,
      ]);
      const row = current.rows[0];
      if (!row || row.status !== 'error')
        throw new DetranError('TEAT.INTEGRATION_ITEM_NOT_FAILED', {
          status: 409,
          context: { outboxId: id, status: row?.status ?? 'unknown' },
          message: 'Só um item em erro pode ser reenviado.',
        });
      const updated = await asQueryable(tx).query<{
        id: string;
        status: string;
        attempts: number;
      }>(
        `update integration.outbox
            set status = 'pending', available_at = now(), last_error = null
          where id = $1
          returning id, status, attempts`,
        [id],
      );
      return updated.rows[0]!;
    });
  }

  async health(config: {
    provider: string;
    baseUrl: string;
  }): Promise<Record<string, unknown>> {
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const counts = await asQueryable(tx).query<{
        status: string;
        count: string;
      }>(
        `select status, count(*)::text as count
           from integration.outbox
          where status in ('pending','processing','error')
          group by status`,
      );
      const queue = { pending: 0, processing: 0, error: 0 };
      for (const row of counts.rows) {
        if (row.status === 'pending') queue.pending = Number(row.count);
        else if (row.status === 'processing')
          queue.processing = Number(row.count);
        else if (row.status === 'error') queue.error = Number(row.count);
      }
      return {
        provider: config.provider,
        baseUrl: config.baseUrl,
        systems: [...SYSTEMS],
        queue,
      };
    });
  }
}
