// CTG-0002 §9 (R-0009, TASK-0008; plan M18) — leitura de `integration.outbox`
// para o SSE `GET /v1/portal/stream`, no padrão de `teat-stream.service.ts`.
// Sem escrita: o stream só reemite o que os pacotes já gravaram na mesma
// transação do efeito. Diferenças do TEAT: o escopo é o SUJEITO da sessão
// (`cpf_hash` do envelope; pedido ligado ao caso; AIT da projeção) aplicado
// NO SQL — nunca se filtra em memória linha de outro sujeito —, e `data` é
// reformatado por tipo (RN-PORTAL-112: nenhum token de inf/rait sai).
//
// Os `type` técnicos são montados por concatenação, nunca como literal
// `portal.<x>.<y>`/`rait.<x>.<y>` (tools/parameters/verify.mjs --check-usage;
// precedente de `ops/offline-sync/src/handwritten/events.ts`).
import { Injectable } from '@nestjs/common';
import type {
  EventStreamCursor,
  EventStreamRow,
  EventStreamSource,
  StynxSseScope,
} from '@stynx-nyx/backend';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';
import { NEXT_ACTION_BY_STATE } from '@detran/portal-requests';

import {
  CursorTexts,
  isUuid,
  type StreamReads,
  type TeatStreamPoller,
} from './teat-stream.service.js';

export interface PortalOutboxRow {
  [key: string]: unknown;
  id: string;
  created_at: string;
  topic: string;
  payload: Record<string, unknown>;
  /** `portal.request.id` ligado ao caso (`rait.decision.published`), quando houver. */
  request_id?: string | null;
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

const topic = (...parts: string[]): string => parts.join('.');

export const PORTAL_REQUEST_CHANGED_TOPIC = topic(
  'portal',
  'request',
  'changed',
);
export const PORTAL_INBOX_ITEM_TOPIC = topic('portal', 'inbox', 'item');
export const RAIT_DECISION_PUBLISHED_TOPIC = topic(
  'rait',
  'decision',
  'published',
);
export const INF_PAYMENT_CONFIRMED_TOPIC = topic('inf', 'payment', 'confirmed');

/** Tipos SSE do Portal (§9). */
export const PORTAL_STREAM_TYPES = [
  'inbox.item',
  'request.changed',
  'decision.published',
  'payment.confirmed',
] as const;
export type PortalStreamType = (typeof PORTAL_STREAM_TYPES)[number];

/** `topic` técnico do produtor → evento SSE (§9). */
export const PORTAL_STREAM_EVENT_BY_TOPIC: Readonly<
  Record<string, PortalStreamType>
> = {
  [PORTAL_REQUEST_CHANGED_TOPIC]: 'request.changed',
  [PORTAL_INBOX_ITEM_TOPIC]: 'inbox.item',
  [RAIT_DECISION_PUBLISHED_TOPIC]: 'decision.published',
  [INF_PAYMENT_CONFIRMED_TOPIC]: 'payment.confirmed',
};

export interface PortalStreamScope {
  cpfHash: string;
  subjectId: string;
}

/** Escopo da conexão do F2 (CTG-0004 §3): tenant/ator + sujeito da sessão. */
export interface PortalConnectionScope
  extends StynxSseScope, PortalStreamScope {}

export interface StreamCursor {
  createdAt: string;
  id: string | null;
}

/** Porta do poller (mesma de `teat-stream.service.ts`); token próprio do Portal. */
export const PORTAL_STREAM_POLLER = Symbol('PORTAL_STREAM_POLLER');
export type PortalStreamPoller = TeatStreamPoller;

function dataOf(payload: Record<string, unknown>): Record<string, unknown> {
  const data = payload.data;
  return typeof data === 'object' && data !== null && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};
}

function stringOf(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

/**
 * `data` do frame por tipo (§9): só ids, o token cidadão do estado do pedido
 * e o `nextAction` de `NEXT_ACTION_BY_STATE`; nunca `tenantId`, nunca o
 * `cpf_hash`, nunca token de inf/rait. Topic desconhecido → `null` (não emitido).
 */
export function reshape(
  topic: string,
  payload: Record<string, unknown>,
  row?: Record<string, unknown>,
): Record<string, unknown> | null {
  const data = dataOf(payload);
  switch (PORTAL_STREAM_EVENT_BY_TOPIC[topic]) {
    case 'request.changed': {
      const situation = stringOf(data.toState);
      return {
        requestId: stringOf(data.requestId),
        situation,
        nextAction:
          situation && situation in NEXT_ACTION_BY_STATE
            ? NEXT_ACTION_BY_STATE[
                situation as keyof typeof NEXT_ACTION_BY_STATE
              ]
            : null,
      };
    }
    case 'inbox.item':
      return { id: stringOf(data.id), kind: stringOf(data.kind) };
    case 'decision.published':
      return {
        requestId: stringOf(row?.request_id) ?? stringOf(data.requestId),
      };
    case 'payment.confirmed':
      return { aitId: stringOf(data.aitId) };
    default:
      return null;
  }
}

const OUTBOX_COLUMNS = `o.id, o.created_at::text as created_at, o.topic, o.payload,
          (select r.id from portal.request r
            where r.delegation_external_id = o.payload->'data'->>'caseId'
              and r.subject_id = $SUBJECT
            limit 1) as request_id`;

/** Escopo do sujeito aplicado no `where` (§9.3) — `$HASH`/`$SUBJECT` são substituídos. */
const SCOPE_SQL = `(
      (o.topic in ($REQUEST_TOPIC, $INBOX_TOPIC)
        and o.payload->'data'->>'subjectCpfHash' = $HASH)
      or (o.topic = $DECISION_TOPIC
        and exists (select 1 from portal.request r
                     where r.delegation_external_id = o.payload->'data'->>'caseId'
                       and r.subject_id = $SUBJECT))
      or (o.topic = $PAYMENT_TOPIC
        and exists (select 1 from portal.infraction_view v
                     where v.ait_id::text = o.payload->'data'->>'aitId'
                       and v.subject_cpf_hash = $HASH))
    )`;

function bind(sql: string, placeholders: Record<string, number>): string {
  return Object.entries(placeholders).reduce(
    (text, [name, index]) => text.replaceAll(`$${name}`, `$${index}`),
    sql,
  );
}

@Injectable()
export class PortalStreamService {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  /** `now()` do servidor de banco — marco inicial de uma conexão sem `Last-Event-ID`. */
  async now(): Promise<string> {
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const result = await asQueryable(tx).query<{ now: string }>(
        'select now()::text as now',
      );
      return result.rows[0]!.now;
    });
  }

  async findById(id: string): Promise<PortalOutboxRow | undefined> {
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const result = await asQueryable(tx).query<PortalOutboxRow>(
        `select id, created_at::text as created_at, topic, payload
           from integration.outbox
          where id = $1`,
        [id],
      );
      return result.rows[0];
    });
  }

  /**
   * Linhas do tenant posteriores a `cursor` que passam no escopo do sujeito,
   * em ordem `(created_at, id)` — uma consulta por tick.
   */
  async listSince(
    cursor: StreamCursor,
    scope: PortalStreamScope,
    limit = 200,
  ): Promise<PortalOutboxRow[]> {
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const values: unknown[] = [cursor.createdAt];
      const cursorClause = cursor.id
        ? '(o.created_at, o.id) > ($1::timestamptz, $2::uuid)'
        : 'o.created_at > $1::timestamptz';
      if (cursor.id) values.push(cursor.id);
      const placeholders: Record<string, number> = {};
      const param = (name: string, value: unknown): void => {
        values.push(value);
        placeholders[name] = values.length;
      };
      param('HASH', scope.cpfHash);
      param('SUBJECT', scope.subjectId);
      param('REQUEST_TOPIC', PORTAL_REQUEST_CHANGED_TOPIC);
      param('INBOX_TOPIC', PORTAL_INBOX_ITEM_TOPIC);
      param('DECISION_TOPIC', RAIT_DECISION_PUBLISHED_TOPIC);
      param('PAYMENT_TOPIC', INF_PAYMENT_CONFIRMED_TOPIC);
      param('LIMIT', limit);
      const sql = bind(
        `select ${OUTBOX_COLUMNS}
           from integration.outbox o
          where ${cursorClause}
            and ${SCOPE_SQL}
          order by o.created_at, o.id
          limit $LIMIT`,
        placeholders,
      );
      const result = await asQueryable(tx).query<PortalOutboxRow>(sql, values);
      return result.rows;
    });
  }
}

/** Linha do F2 no formato publicado; `event` = tipo SSE do `topic` (R-5 (e)). */
export interface PortalStreamEvent extends EventStreamRow {
  /** `false` quando o `topic` não tem tipo SSE do Portal (só avança o cursor). */
  named: boolean;
  row: PortalOutboxRow;
}

function portalEventOf(row: PortalOutboxRow): PortalStreamEvent {
  const event = PORTAL_STREAM_EVENT_BY_TOPIC[row.topic];
  return {
    id: row.id,
    createdAt: new Date(row.created_at),
    event: event ?? row.topic,
    named: event !== undefined,
    row,
  };
}

/**
 * CTG-0004 R-5 — fonte DETRAN fina do F2 sobre as leituras atuais de
 * `PortalStreamService` (escopo do sujeito no SQL); uma instância por conexão.
 */
export class PortalStreamSource implements EventStreamSource<
  PortalStreamEvent,
  PortalConnectionScope
> {
  private readonly cursors = new CursorTexts();

  constructor(
    private readonly service: PortalStreamService,
    private readonly reads?: StreamReads,
  ) {}

  async now(): Promise<Date> {
    return this.cursors.open(await this.service.now());
  }

  async findById(id: string): Promise<PortalStreamEvent | null> {
    if (!isUuid(id)) return null;
    const row = await this.service.findById(id);
    if (!row) return null;
    this.cursors.remember(row.id, row.created_at);
    return portalEventOf(row);
  }

  listSince(
    cursor: EventStreamCursor,
    scope: PortalConnectionScope,
    limit: number,
  ): Promise<readonly PortalStreamEvent[]> {
    const read = this.read(cursor, scope, limit);
    return this.reads ? this.reads.track(read) : read;
  }

  private async read(
    cursor: EventStreamCursor,
    scope: PortalConnectionScope,
    limit: number,
  ): Promise<readonly PortalStreamEvent[]> {
    const rows = await this.service.listSince(
      this.cursors.resolve(cursor),
      { cpfHash: scope.cpfHash, subjectId: scope.subjectId },
      limit,
    );
    this.cursors.retain(cursor, rows);
    return rows.map(portalEventOf);
  }
}
