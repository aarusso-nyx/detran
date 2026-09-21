// SseService (spec §5.1/§8; `rait-events-sse-contract.md` §2/§3; plan.md M10; contrato CTG-0002a
// §6): assina `GET /v1/inf/rait/stream` por um transporte injetável (`RaitStreamTransport`) e
// publica eventos tipados já filtrados por `aggregate.version` (evento com versão ≤ à em cache
// do mesmo `kind:id` é descartado). `Last-Event-ID` = último `id` recebido; reabertura que o
// servidor fecha (204: cursor fora da janela) reabre sem cursor e emite `resync$` uma vez.
// Falha → `reconnecting` com backoff 1, 2, 4, 8, 16, 30, 30… s; duas falhas dentro de 60 s →
// `polling` (um `tick$` a cada 15 s; o banner `rait.states.stream_unavailable` é da página que
// lê `polling()`), mantendo as tentativas de reabertura no compasso do backoff; reabertura com
// sucesso (primeiro frame, inclusive `: heartbeat`) → `live`, backoff e contador zerados.
// Silêncio maior que `HEARTBEAT_STALE_FACTOR × HEARTBEAT_MS` (OD-R12-007) fecha o transporte e
// reabre com backoff: numa conexão viva conta como falha na janela de polling; numa conexão que
// nunca recebeu frame é tempo de conexão esgotado (reabre, não conta). `401`/`403` → `stopped`
// (sessão inválida; o kit trata); `429` com `Retry-After` → próxima tentativa em
// `max(backoff, retryAfter)`. Nenhum campo do envelope vira texto de tela; nada é sintetizado.
import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Observable, Subject, type Subscription } from 'rxjs';
import { classifyError } from './error-boundary';
import {
  RAIT_STREAM_TOPICS,
  RaitStreamTransport,
  type RaitStreamFrame,
  type RaitStreamOpenOptions,
  type RaitStreamTopic,
} from './stream-transport';

export { RAIT_STREAM_TOPICS, type RaitStreamTopic } from './stream-transport';

/** M10; contrato §3. */
export const RAIT_STREAM_URL = '/v1/inf/rait/stream';
/** Contrato §3: `event: rait.agenda-item.changed` (um ponto — o verificador de literais). */
export const RAIT_STREAM_EVENT_PREFIX = 'rait.';

/** Spec §8 (sem prefixo). */
export const RAIT_STREAM_TYPES = [
  'case.changed',
  'assignment.changed',
  'clock.flag-changed',
  'session.changed',
  'agenda-item.changed',
  'batch.changed',
] as const;

export type RaitStreamType = (typeof RAIT_STREAM_TYPES)[number];

/** Contrato §1. */
export type RaitAggregateKind =
  | 'case'
  | 'infraction'
  | 'session'
  | 'batch'
  | 'clock'
  | 'assignment'
  | 'agenda-item'
  | 'outbox';

/** Contrato §2.1–§2.3: só ids, tokens e datas; tudo opcional (nunca texto de tela). */
export interface RaitStreamData {
  'case.changed': {
    caseId: string;
    fromState?: string;
    toState?: string;
    instance?: string;
    reason?: string;
    decisionKind?: string;
  };
  'assignment.changed': {
    caseId: string;
    assignmentId?: string;
    memberId?: string;
    poolId?: string;
    active?: boolean;
    releaseReason?: string;
  };
  'clock.flag-changed': {
    caseId: string;
    clockId?: string;
    clockCode?: string;
    fromFlag?: string;
    toFlag?: string;
    daysRemaining?: number;
    ceilingOn?: string;
  };
  'session.changed': {
    sessionId: string;
    orgao?: string;
    fromState?: string;
    toState?: string;
    quorumRequired?: number;
    quorumObserved?: number;
    scheduledFor?: string;
  };
  'agenda-item.changed': {
    sessionId: string;
    agendaItemId: string;
    caseId?: string;
    itemState?: string;
    tally?: Record<string, number>;
    outcome?: string;
  };
  'batch.changed': {
    batchId: string;
    orgao?: string;
    state?: string;
    itemsPending?: number;
    claimDueAt?: string;
  };
}

export interface RaitStreamEvent<T extends RaitStreamType = RaitStreamType> {
  readonly type: T;
  /** `id:` do frame = cursor `Last-Event-ID`. */
  readonly id: string;
  readonly aggregate: {
    readonly kind: RaitAggregateKind;
    readonly id: string;
    readonly version: number;
  };
  readonly data: RaitStreamData[T];
}

export const SSE_BACKOFF_INITIAL_MS = 1_000;
export const SSE_BACKOFF_MAX_MS = 30_000;
/** Contrato §3 "duas vezes em 60 s". */
export const SSE_FAILURE_WINDOW_MS = 60_000;
export const SSE_FAILURES_BEFORE_POLLING = 2;
/** Contrato §3 / spec §8 "polling de 15 s". */
export const POLLING_INTERVAL_MS = 15_000;
/** Contrato §3. */
export const HEARTBEAT_MS = 20_000;
/** Sem fonte: OD-R12-007 (silêncio > 2 × heartbeat = falha). */
export const HEARTBEAT_STALE_FACTOR = 2;

export type SseStatus =
  'idle' | 'live' | 'reconnecting' | 'polling' | 'stopped';

export interface SseConnectOptions {
  readonly topics?: readonly RaitStreamTopic[];
  readonly caseId?: string;
  readonly sessionId?: string;
}

const MS_PER_SECOND = 1_000;
const STALE_MS = HEARTBEAT_STALE_FACTOR * HEARTBEAT_MS;
/** Sessão inválida: o serviço para (o interceptor do kit trata o login). */
const STOP_STATUSES: ReadonlySet<number> = new Set([401, 403]);
const AGGREGATE_KINDS: ReadonlySet<string> = new Set<RaitAggregateKind>([
  'case',
  'infraction',
  'session',
  'batch',
  'clock',
  'assignment',
  'agenda-item',
  'outbox',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStreamType(value: string): value is RaitStreamType {
  return (RAIT_STREAM_TYPES as readonly string[]).includes(value);
}

/** `event: rait.case.changed` → `case.changed`; sem o prefixo ou fora do catálogo → `null`. */
export function streamTypeOf(event: string | null): RaitStreamType | null {
  if (event === null || !event.startsWith(RAIT_STREAM_EVENT_PREFIX))
    return null;
  const type = event.slice(RAIT_STREAM_EVENT_PREFIX.length);
  return isStreamType(type) ? type : null;
}

function retryAfterMs(value: number | string | undefined): number {
  const seconds = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * MS_PER_SECOND : 0;
}

function versionKey(kind: RaitAggregateKind, id: string): string {
  return `${kind}:${id}`;
}

@Injectable({ providedIn: 'root' })
export class SseService {
  private readonly transport = inject(RaitStreamTransport);

  private readonly statusState = signal<SseStatus>('idle');
  private readonly topicsState =
    signal<readonly RaitStreamTopic[]>(RAIT_STREAM_TOPICS);
  private readonly lastEventIdState = signal<string | null>(null);
  private readonly eventsSubject = new Subject<RaitStreamEvent>();
  private readonly tickSubject = new Subject<void>();
  private readonly resyncSubject = new Subject<void>();
  private readonly versions = new Map<string, number>();

  private scope: Pick<SseConnectOptions, 'caseId' | 'sessionId'> = {};
  private connection: Subscription | null = null;
  private connectionLive = false;
  private reopenTimer: ReturnType<typeof setTimeout> | null = null;
  private staleTimer: ReturnType<typeof setTimeout> | null = null;
  private windowTimer: ReturnType<typeof setTimeout> | null = null;
  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  private backoffMs = SSE_BACKOFF_INITIAL_MS;
  private failuresInWindow = 0;

  /** Eventos do fio, já filtrados por versão. */
  readonly events$: Observable<RaitStreamEvent> =
    this.eventsSubject.asObservable();
  /** Um tick a cada `POLLING_INTERVAL_MS` enquanto `polling()`. */
  readonly tick$: Observable<void> = this.tickSubject.asObservable();
  /** Cursor fora da janela (reabertura sem frames = 204): consumidores recarregam. */
  readonly resync$: Observable<void> = this.resyncSubject.asObservable();
  readonly status = this.statusState.asReadonly();
  readonly topics = this.topicsState.asReadonly();
  /** Cursor; só do servidor (nunca gerado no cliente). */
  readonly lastEventId = this.lastEventIdState.asReadonly();

  /** `status() === 'polling'`. */
  readonly polling = computed(() => this.statusState() === 'polling');
  /** `status() === 'live'`. */
  readonly live = computed(() => this.statusState() === 'live');

  constructor() {
    inject(DestroyRef).onDestroy(() => this.disconnect());
  }

  /** Idempotente por (topics, escopo): mesma assinatura ativa → nada; outra → reabre. */
  connect(options: SseConnectOptions = {}): void {
    const topics = options.topics ?? RAIT_STREAM_TOPICS;
    const scope = {
      ...(options.caseId !== undefined ? { caseId: options.caseId } : {}),
      ...(options.sessionId !== undefined
        ? { sessionId: options.sessionId }
        : {}),
    };
    const status = this.statusState();
    const same =
      status !== 'idle' &&
      status !== 'stopped' &&
      sameTopics(this.topicsState(), topics) &&
      this.scope.caseId === scope.caseId &&
      this.scope.sessionId === scope.sessionId;
    if (same) return;
    this.reset();
    this.topicsState.set(topics);
    this.scope = scope;
    this.open();
  }

  /** Fecha o transporte e cancela timers → `idle`. */
  disconnect(): void {
    this.reset();
    this.statusState.set('idle');
  }

  versionOf(kind: RaitAggregateKind, id: string): number | null {
    return this.versions.get(versionKey(kind, id)) ?? null;
  }

  private open(): void {
    this.closeConnection();
    this.connectionLive = false;
    if (this.statusState() !== 'polling') this.statusState.set('reconnecting');
    const options: RaitStreamOpenOptions = {
      lastEventId: this.lastEventIdState(),
      topics: this.topicsState(),
      ...this.scope,
    };
    this.armStaleTimer();
    this.connection = this.transport.open(RAIT_STREAM_URL, options).subscribe({
      next: (frame) => this.onFrame(frame),
      error: (error: unknown) => this.onError(error),
      complete: () => this.onComplete(),
    });
  }

  private onFrame(frame: RaitStreamFrame): void {
    this.connectionLive = true;
    this.armStaleTimer();
    this.markLive();
    if (frame.id !== null && frame.id.length > 0) {
      this.lastEventIdState.set(frame.id);
    }
    const type = streamTypeOf(frame.event);
    if (type === null) return;
    const event = this.parse(type, frame);
    if (event === null) return;
    const key = versionKey(event.aggregate.kind, event.aggregate.id);
    const cached = this.versions.get(key);
    if (cached !== undefined && event.aggregate.version <= cached) return;
    this.versions.set(key, event.aggregate.version);
    this.eventsSubject.next(event);
  }

  /** Envelope do contrato §1; `data` que não seja JSON válido é descartado (nunca lança). */
  private parse(
    type: RaitStreamType,
    frame: RaitStreamFrame,
  ): RaitStreamEvent | null {
    let envelope: unknown;
    try {
      envelope = JSON.parse(frame.data);
    } catch {
      return null;
    }
    if (!isRecord(envelope) || !isRecord(envelope['aggregate'])) return null;
    const aggregate = envelope['aggregate'];
    const kind = aggregate['kind'];
    const id = aggregate['id'];
    const version = aggregate['version'];
    if (
      typeof kind !== 'string' ||
      !AGGREGATE_KINDS.has(kind) ||
      typeof id !== 'string' ||
      typeof version !== 'number'
    ) {
      return null;
    }
    const data = isRecord(envelope['data']) ? envelope['data'] : {};
    return {
      type,
      id: frame.id ?? '',
      aggregate: { kind: kind as RaitAggregateKind, id, version },
      data: data as RaitStreamData[typeof type],
    } as RaitStreamEvent;
  }

  /** Primeiro frame da conexão: `live`, backoff e contador de falhas zerados, polling encerrado. */
  private markLive(): void {
    if (this.statusState() === 'live') return;
    this.statusState.set('live');
    this.backoffMs = SSE_BACKOFF_INITIAL_MS;
    this.failuresInWindow = 0;
    this.clearTimer('windowTimer');
    this.clearPolling();
  }

  private onError(error: unknown): void {
    this.connection = null;
    this.clearTimer('staleTimer');
    const classified = classifyError(error);
    if (STOP_STATUSES.has(classified.status ?? -1)) {
      this.reset();
      this.statusState.set('stopped');
      return;
    }
    this.failure(true, retryAfterMs(classified.retryAfter));
  }

  /** Servidor fechou: com cursor = 204 (fora da janela) → recarrega sem cursor; sem cursor = queda. */
  private onComplete(): void {
    this.connection = null;
    this.clearTimer('staleTimer');
    if (this.lastEventIdState() !== null) {
      this.lastEventIdState.set(null);
      this.resyncSubject.next();
      this.open();
      return;
    }
    this.failure(this.connectionLive, 0);
  }

  /** Silêncio > `STALE_MS`: fecha; conta como falha só se a conexão chegou a ficar viva. */
  private onStale(): void {
    const live = this.connectionLive;
    this.closeConnection();
    this.failure(live, 0);
  }

  private failure(counts: boolean, minDelayMs: number): void {
    const delay = Math.max(this.backoffMs, minDelayMs);
    this.backoffMs = Math.min(this.backoffMs * 2, SSE_BACKOFF_MAX_MS);
    if (counts) this.registerFailure();
    if (this.statusState() !== 'polling') this.statusState.set('reconnecting');
    this.clearTimer('reopenTimer');
    this.reopenTimer = setTimeout(() => {
      this.reopenTimer = null;
      this.open();
    }, delay);
  }

  /** Janela de 60 s ancorada na primeira falha; ≥ 2 dentro dela → polling. */
  private registerFailure(): void {
    if (this.windowTimer === null) {
      this.failuresInWindow = 1;
      this.windowTimer = setTimeout(() => {
        this.windowTimer = null;
        this.failuresInWindow = 0;
      }, SSE_FAILURE_WINDOW_MS);
    } else {
      this.failuresInWindow += 1;
    }
    if (this.failuresInWindow >= SSE_FAILURES_BEFORE_POLLING)
      this.enterPolling();
  }

  private enterPolling(): void {
    this.statusState.set('polling');
    if (this.pollingTimer !== null) return;
    this.pollingTimer = setInterval(() => {
      if (this.statusState() !== 'polling') {
        this.clearPolling();
        return;
      }
      this.tickSubject.next();
    }, POLLING_INTERVAL_MS);
  }

  private armStaleTimer(): void {
    this.clearTimer('staleTimer');
    this.staleTimer = setTimeout(() => {
      this.staleTimer = null;
      this.onStale();
    }, STALE_MS);
  }

  private closeConnection(): void {
    this.connection?.unsubscribe();
    this.connection = null;
    this.clearTimer('staleTimer');
  }

  private clearPolling(): void {
    if (this.pollingTimer !== null) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private clearTimer(name: 'reopenTimer' | 'staleTimer' | 'windowTimer'): void {
    const timer = this[name];
    if (timer !== null) {
      clearTimeout(timer);
      this[name] = null;
    }
  }

  /** Fecha tudo e zera backoff/janela (sem tocar em `versions` nem no cursor). */
  private reset(): void {
    this.closeConnection();
    this.clearTimer('reopenTimer');
    this.clearTimer('windowTimer');
    this.clearPolling();
    this.connectionLive = false;
    this.backoffMs = SSE_BACKOFF_INITIAL_MS;
    this.failuresInWindow = 0;
  }
}

function sameTopics(
  a: readonly RaitStreamTopic[],
  b: readonly RaitStreamTopic[],
): boolean {
  return a.length === b.length && a.every((topic, index) => topic === b[index]);
}
