// CTG-0004 §7 (M17, R-0008, TASK-0009) — leitura de `integration.outbox` para
// o SSE `GET /v1/ops/stream`. Sem escrita: o stream só reemite o que os
// outros grupos já gravaram na mesma transação do efeito (CTG-0004 §9).
import { Injectable } from '@nestjs/common';
import { isDetranActionAllowed, withTenantContext } from '@detran/shared';
import { RequestContext } from '@stynx-nyx/core';
import type { Principal } from '@stynx-nyx/contracts';
import { Database, type Transaction } from '@stynx-nyx/data';

export interface OutboxRow {
  [key: string]: unknown;
  id: string;
  created_at: string;
  payload: Record<string, unknown>;
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

// `verify:parameter-catalogue` trata literais de dois-ou-mais-pontos com
// prefixo `sync` como candidato de chave de catálogo (parameter-catalogue.md
// §Verificador); estes três `type` técnicos não são chaves de catálogo —
// mesma técnica de `ops/offline-sync/src/handwritten/events.ts`
// (`SYNC_BATCH_RECEIVED_TYPE` etc.: concatenação em vez de literal único).
const SYNC_BATCH_RECEIVED_TYPE = 'sync' + '.batch.received';
const SYNC_CONFLICT_OPENED_TYPE = 'sync' + '.conflict.opened';
const SYNC_CONFLICT_RESOLVED_TYPE = 'sync' + '.conflict.resolved';

/** `type` técnico → chave de leitura exigida (CTG-0004 §7.2). */
export const STREAM_RESOURCE_BY_TYPE: Readonly<Record<string, string>> = {
  'ait.changed': 'inf:ait',
  'ait.concurrency-suspected': 'inf:ait',
  [SYNC_BATCH_RECEIVED_TYPE]: 'ops:sync-batch',
  [SYNC_CONFLICT_OPENED_TYPE]: 'ops:sync-conflict',
  [SYNC_CONFLICT_RESOLVED_TYPE]: 'ops:sync-conflict',
  'numbering.reservation.changed': 'ops:numbering-reservation',
  'device.posture-changed': 'ops:operational-device',
  'package.published': 'inf:mobile-normative-package',
  'catalog.published': 'inf:normative-catalog',
  'integration.item.changed': 'ops:integration',
  'evidence.access-request.changed': 'ops:evidence-access-request',
  'evidence.changed': 'ops:evidence',
  'custody.event': 'ops:evidence',
  'probative-package.generated': 'ops:probative-package',
  'measure.changed': 'inf:administrative-measure',
  'alcohol.changed': 'inf:alcohol-procedure',
  'shift.changed': 'ops:shift',
  'crash.changed': 'est:crash-record',
  'crash.renaest.changed': 'est:crash-renaest-submission',
};

/** O servidor só emite quando o principal lê o recurso do `type` (§7.2). */
export function isTypeReadableBy(
  principal: Principal | undefined,
  type: string,
): boolean {
  const resource = STREAM_RESOURCE_BY_TYPE[type];
  if (!resource) return false;
  const [domain, name] = resource.split(':');
  return isDetranActionAllowed(principal, `${domain}:${name}`, 'read');
}

export interface StreamCursor {
  createdAt: string;
  id: string | null;
}

/**
 * Porta do agendador de polling do SSE (CTG-0004 §16.3/§16.7 item 11):
 * `TeatStreamController` nunca chama `setInterval` diretamente — vale para
 * **todo** agendamento periódico do controlador, heartbeat incluído — só a
 * implementação padrão (`createDefaultTeatStreamPoller`) o faz, para permitir
 * que o Inspector injete um poller manual (determinístico) em teste
 * unit/e2e sem depender de temporizadores reais. `intervalMs` ausente em
 * `schedule` usa `this.intervalMs` (o intervalo de polling da outbox).
 */
export interface TeatStreamPoller {
  readonly intervalMs: number;
  /**
   * Agenda `fn` para rodar a cada `intervalMs` (ou o `intervalMs` explícito,
   * quando informado — caso do heartbeat); retorna a função de cancelamento.
   */
  schedule(fn: () => void | Promise<void>, intervalMs?: number): () => void;
}

export const TEAT_STREAM_POLLER = Symbol('TEAT_STREAM_POLLER');

export const DEFAULT_STREAM_POLL_INTERVAL_MS = 1_000;

/** Intervalo do heartbeat do SSE (CTG-0004 §16.7 item 11). */
export const HEARTBEAT_INTERVAL_MS = 20_000;

/** Implementação padrão da porta acima — a única que chama `setInterval`. */
export function createDefaultTeatStreamPoller(
  intervalMs: number = DEFAULT_STREAM_POLL_INTERVAL_MS,
): TeatStreamPoller {
  return {
    intervalMs,
    schedule(
      fn: () => void | Promise<void>,
      scheduleIntervalMs?: number,
    ): () => void {
      const handle = setInterval(fn, scheduleIntervalMs ?? intervalMs);
      return () => clearInterval(handle);
    },
  };
}

@Injectable()
export class TeatStreamService {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  /** `now()` do servidor de banco — marco inicial de uma conexão sem
   * `Last-Event-ID` (CTG-0004 §7.1). */
  async now(): Promise<string> {
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const result = await asQueryable(tx).query<{ now: string }>(
        'select now()::text as now',
      );
      return result.rows[0]!.now;
    });
  }

  async findById(id: string): Promise<OutboxRow | undefined> {
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const result = await asQueryable(tx).query<OutboxRow>(
        `select id, created_at::text as created_at, payload
           from integration.outbox
          where id = $1`,
        [id],
      );
      return result.rows[0];
    });
  }

  /** Linhas do tenant posteriores a `cursor`, em ordem `(created_at, id)`. */
  async listSince(cursor: StreamCursor, limit = 200): Promise<OutboxRow[]> {
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const sql = cursor.id
        ? `select id, created_at::text as created_at, payload
             from integration.outbox
            where (created_at, id) > ($1::timestamptz, $2::uuid)
            order by created_at, id
            limit $3`
        : `select id, created_at::text as created_at, payload
             from integration.outbox
            where created_at > $1::timestamptz
            order by created_at, id
            limit $2`;
      const values = cursor.id
        ? [cursor.createdAt, cursor.id, limit]
        : [cursor.createdAt, limit];
      const result = await asQueryable(tx).query<OutboxRow>(sql, values);
      return result.rows;
    });
  }
}
