import { Injectable } from '@nestjs/common';
import type {
  EventStreamCursor,
  EventStreamRow,
  EventStreamSource,
  StynxSseScope,
} from '@stynx-nyx/backend';
import { RequestContext } from '@stynx-nyx/core';
import type { Principal } from '@stynx-nyx/contracts';
import { Database, type Transaction } from '@stynx-nyx/data';
import { isDetranActionAllowed, withTenantContext } from '@detran/shared';

import {
  CursorTexts,
  isUuid,
  type StreamReads,
} from '../../teat-stream.service.js';

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

/** Linhas por leitura (CTG-0004 §3: limite atual do SQL). */
export const RAIT_STREAM_BATCH_SIZE = 500;

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

/**
 * CTG-0004 §4 (OD-R22-04, OD-R22-52) — chave de leitura por `aggregate.kind`
 * (`rait-events-sse-contract.md` §1 e §3). `clock` → `inf:rait-case` e
 * `outbox` → `inf:rait-integration` (OD-R22-52). Kind fora do mapa não é
 * entregue (fail-closed, mesma regra do TEAT para tipo fora do mapa).
 */
export const RAIT_READ_RESOURCE_BY_KIND: Readonly<Record<string, string>> = {
  case: 'inf:rait-case',
  assignment: 'inf:rait-assignment',
  batch: 'inf:rait-batch',
  session: 'inf:rait-session',
  'agenda-item': 'inf:rait-agenda-item',
  clock: 'inf:rait-case',
  outbox: 'inf:rait-integration',
};

/** O servidor só entrega eventos de agregados que o papel lê (§3). */
export function isRaitKindReadableBy(
  principal: Principal | undefined,
  kind: unknown,
): boolean {
  if (typeof kind !== 'string') return false;
  const resource = RAIT_READ_RESOURCE_BY_KIND[kind];
  if (!resource) return false;
  return isDetranActionAllowed(principal, resource, 'read');
}

/** Filtro `?topics=` do F4: 2º segmento do `topic` (`rait.case.changed` → `case`). */
export function raitTopicOf(topic: string): string {
  return topic.split('.')[1] ?? 'outbox';
}

@Injectable()
export class RaitStreamService {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  listSince(
    createdAt: string,
    id: string | null,
    limit: number = RAIT_STREAM_BATCH_SIZE,
  ): Promise<RaitStreamRow[]> {
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
          order by created_at, id limit $3`,
            [createdAt, id, limit],
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

/** Escopo da conexão do F4 (CTG-0004 §3): tenant/ator + principal para o filtro. */
export interface RaitStreamScope extends StynxSseScope {
  principal: Principal | undefined;
}

/** Linha do F4 no formato publicado; `event` = `type` do envelope (OD-R22-04). */
export interface RaitStreamEvent extends EventStreamRow {
  /** `false` quando o envelope não tem `type` (a linha só avança o cursor). */
  named: boolean;
  row: RaitStreamRow;
}

function raitEventOf(row: RaitStreamRow): RaitStreamEvent {
  const type = typeof row.payload.type === 'string' ? row.payload.type : '';
  return {
    id: row.id,
    createdAt: new Date(row.created_at),
    event: type || row.topic,
    named: type.length > 0,
    row,
  };
}

/**
 * CTG-0004 R-5 — fonte DETRAN fina do F4 sobre as leituras atuais de
 * `RaitStreamService` (status `pending`/`processing`/`acked`, OD-R22-21 (a));
 * uma instância por conexão.
 */
export class RaitStreamSource implements EventStreamSource<
  RaitStreamEvent,
  RaitStreamScope
> {
  private readonly cursors = new CursorTexts();

  constructor(
    private readonly service: RaitStreamService,
    private readonly reads?: StreamReads,
  ) {}

  async now(): Promise<Date> {
    return this.cursors.open(await this.service.now());
  }

  async findById(id: string): Promise<RaitStreamEvent | null> {
    if (!isUuid(id)) return null;
    const row = await this.service.findById(id);
    if (!row) return null;
    this.cursors.remember(row.id, row.created_at);
    return raitEventOf(row);
  }

  listSince(
    cursor: EventStreamCursor,
    _scope: RaitStreamScope,
    limit: number,
  ): Promise<readonly RaitStreamEvent[]> {
    const read = this.read(cursor, limit);
    return this.reads ? this.reads.track(read) : read;
  }

  private async read(
    cursor: EventStreamCursor,
    limit: number,
  ): Promise<readonly RaitStreamEvent[]> {
    const resolved = this.cursors.resolve(cursor);
    const rows = await this.service.listSince(
      resolved.createdAt,
      resolved.id,
      limit,
    );
    this.cursors.retain(cursor, rows);
    return rows.map(raitEventOf);
  }
}
