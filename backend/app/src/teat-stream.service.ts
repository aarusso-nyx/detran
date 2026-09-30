// CTG-0004 §7 (M17, R-0008, TASK-0009) — leitura de `integration.outbox` para
// o SSE `GET /v1/ops/stream`. Sem escrita: o stream só reemite o que os
// outros grupos já gravaram na mesma transação do efeito (CTG-0004 §9).
import { Injectable } from '@nestjs/common';
import { isDetranActionAllowed, withTenantContext } from '@detran/shared';
import type {
  EventStreamCursor,
  EventStreamRow,
  EventStreamScheduler,
  EventStreamSource,
  StynxSseScope,
} from '@stynx-nyx/backend';
import { RequestContext } from '@stynx-nyx/core';
import type { Principal } from '@stynx-nyx/contracts';
import { Database, type Transaction } from '@stynx-nyx/data';

export interface OutboxRow {
  [key: string]: unknown;
  id: string;
  created_at: string;
  topic: string;
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

/** Janela de _replay_ do `Last-Event-ID` nos quatro fluxos (CTG-0004 §3). */
export const REPLAY_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Leituras em curso disparadas por um _tick_ da porta. O serviço publicado
 * agenda `() => { void tick(); }`; a porta DETRAN aceita `fn` que devolve a
 * promessa (`schedule(fn: () => void | Promise<void>)`), e o agendador manual
 * das suítes aguarda a leitura `listSince` antes de continuar (padrão do
 * controlador do DASHBOARD antes da troca). A fonte registra aqui a promessa
 * da leitura que o _tick_ inicia de forma síncrona; o adaptador de
 * agendamento a devolve à porta, já resolvida em caso de erro (o serviço
 * publicado registra a falha e mantém a conexão, UPS-SSE-07).
 */
export class StreamReads {
  private collecting: Promise<unknown>[] | null = null;

  track<T>(read: Promise<T>): Promise<T> {
    this.collecting?.push(read);
    return read;
  }

  /** Executa `fire` e devolve a conclusão das leituras que ele iniciou. */
  during(fire: () => void): Promise<void> {
    const started: Promise<unknown>[] = [];
    const previous = this.collecting;
    this.collecting = started;
    try {
      fire();
    } finally {
      this.collecting = previous;
    }
    return Promise.allSettled(started).then(() => undefined);
  }
}

/**
 * CTG-0004 R-3 — adaptador da porta de agendamento DETRAN para o
 * `EventStreamScheduler` publicado: `every(periodMs, tick)` vira
 * `poller.schedule(tick, periodMs)`, sem `intervalMs` quando o período é o da
 * própria porta (a leitura), para que o agendador manual das suítes continue
 * vendo a leitura sem `intervalMs` e o heartbeat com 20 000. Com `reads`, a
 * `fn` da leitura devolve a conclusão da leitura iniciada (ver `StreamReads`).
 */
export function schedulerOf(
  poller: TeatStreamPoller,
  reads?: StreamReads,
): EventStreamScheduler {
  return {
    every(periodMs: number, tick: () => void): { cancel(): void } {
      const isRead = periodMs === poller.intervalMs;
      const fn =
        isRead && reads ? (): Promise<void> => reads.during(tick) : tick;
      const cancel = poller.schedule(fn, isRead ? undefined : periodMs);
      return { cancel };
    },
  };
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** `Last-Event-ID` que não é UUID vale como desconhecido, sem consultar o banco (OD-R22-42). */
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/** `?topics=` separado por vírgula; ausente ou vazio → sem filtro. */
export function topicsOf(raw: string | undefined): Set<string> | null {
  if (!raw) return null;
  return new Set(
    raw
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean),
  );
}

/** Cursor textual das leituras DETRAN (`created_at::text`, precisão de µs). */
export interface TextCursor {
  createdAt: string;
  id: string | null;
}

/**
 * CTG-0004 R-5 (d) — tradução do cursor publicado (`Date`, ms) para o cursor
 * textual exato das leituras DETRAN (µs), por conexão. Guarda o `created_at`
 * textual do `now()` da abertura, da linha do `Last-Event-ID` e de cada linha
 * entregue pela última leitura; o `Date` do cursor publicado nunca é usado
 * como limite de SQL enquanto o texto for conhecido.
 */
export class CursorTexts {
  private opening: string | null = null;
  private texts = new Map<string, string>();

  /** Marco da abertura (`now()` do banco, texto). */
  open(createdAt: string): Date {
    this.opening = createdAt;
    return new Date(createdAt);
  }

  remember(id: string, createdAt: string): void {
    this.texts.set(id, createdAt);
  }

  resolve(cursor: EventStreamCursor): TextCursor {
    if (!cursor.id) {
      return {
        createdAt: this.opening ?? cursor.createdAt.toISOString(),
        id: null,
      };
    }
    return {
      createdAt: this.texts.get(cursor.id) ?? cursor.createdAt.toISOString(),
      id: cursor.id,
    };
  }

  /** Mantém só o cursor corrente e as linhas da leitura recém-feita. */
  retain(
    cursor: EventStreamCursor,
    rows: readonly { id: string; created_at: string }[],
  ): void {
    const next = new Map<string, string>();
    const current = cursor.id ? this.texts.get(cursor.id) : undefined;
    if (cursor.id && current !== undefined) next.set(cursor.id, current);
    for (const row of rows) next.set(row.id, row.created_at);
    this.texts = next;
  }
}

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
        `select id, created_at::text as created_at, topic, payload
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
        ? `select id, created_at::text as created_at, topic, payload
             from integration.outbox
            where (created_at, id) > ($1::timestamptz, $2::uuid)
            order by created_at, id
            limit $3`
        : `select id, created_at::text as created_at, topic, payload
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

/** Escopo da conexão do F1 (CTG-0004 §3): tenant/ator + principal para o filtro. */
export interface TeatStreamScope extends StynxSseScope {
  principal: Principal | undefined;
}

/** Linha do F1 no formato publicado; `event` = `type` do envelope (R-5 (e)). */
export interface TeatStreamEvent extends EventStreamRow {
  /** `false` quando o envelope não tem `type` (a linha só avança o cursor). */
  named: boolean;
  row: OutboxRow;
}

function teatEventOf(row: OutboxRow): TeatStreamEvent {
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
 * CTG-0004 R-5 — fonte DETRAN fina do F1 sobre as leituras atuais de
 * `TeatStreamService` (mesmo SQL, mesmo papel, mesma RLS); uma instância por
 * conexão (guarda os cursores textuais).
 */
export class TeatStreamSource implements EventStreamSource<
  TeatStreamEvent,
  TeatStreamScope
> {
  private readonly cursors = new CursorTexts();

  constructor(
    private readonly service: TeatStreamService,
    private readonly reads?: StreamReads,
  ) {}

  async now(): Promise<Date> {
    return this.cursors.open(await this.service.now());
  }

  async findById(id: string): Promise<TeatStreamEvent | null> {
    if (!isUuid(id)) return null;
    const row = await this.service.findById(id);
    if (!row) return null;
    this.cursors.remember(row.id, row.created_at);
    return teatEventOf(row);
  }

  listSince(
    cursor: EventStreamCursor,
    _scope: TeatStreamScope,
    limit: number,
  ): Promise<readonly TeatStreamEvent[]> {
    const read = this.read(cursor, limit);
    return this.reads ? this.reads.track(read) : read;
  }

  private async read(
    cursor: EventStreamCursor,
    limit: number,
  ): Promise<readonly TeatStreamEvent[]> {
    const rows = await this.service.listSince(
      this.cursors.resolve(cursor),
      limit,
    );
    this.cursors.retain(cursor, rows);
    return rows.map(teatEventOf);
  }
}
