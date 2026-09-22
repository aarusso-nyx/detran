// SseService (CTG-0002.md §6): visão viva das projeções, nunca segunda fonte de verdade. Cada
// evento só diz "releia" (`invalidations$`); nenhum evento altera estado local, nenhum campo do
// envelope vira texto de tela. Queda do stream → backoff 1…30 s; duas falhas em 60 s → polling
// de 30 s com banner na região `aria-live` do shell. Em L0 nenhuma feature assina `events$`
// (não há facade): o shell conecta e desconecta com a sessão.
import {
  Injectable,
  computed,
  inject,
  signal,
  type Signal,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { classifyError } from '../error-boundary';
import {
  DashboardStreamTransport,
  type DashboardStreamFrame,
} from './stream-transport';

export const DASHBOARD_STREAM_URL = '/v1/dashboard/stream';

/** Contrato de rotas §5, literal. */
export const DASHBOARD_STREAM_TYPES = [
  'alert.changed',
  'alert.escalated',
  'duty.changed',
  'source.freshness',
  'integration.health',
] as const;

export type DashboardStreamType = (typeof DASHBOARD_STREAM_TYPES)[number];

/** OD-D16-013: o `event:` é aceito com ou sem este prefixo. */
export const DASHBOARD_STREAM_EVENT_PREFIX = 'dashboard.';

/** Só ids/tokens/datas (forma `source_pending` até `BP-DASH-MONITOR-001`; OD-D16-013). */
export interface DashboardStreamData {
  'alert.changed': {
    alertId: string;
    state?: string;
    severity?: string;
    indicator?: string;
    app?: string;
  };
  'alert.escalated': {
    alertId: string;
    severity?: string;
    escalatedAt?: string;
  };
  'duty.changed': { dutyId: string; period?: string; state?: string };
  'source.freshness': { source: string; state?: string; asOf?: string };
  'integration.health': { source: string; state?: string };
}

export interface DashboardStreamEvent<
  T extends DashboardStreamType = DashboardStreamType,
> {
  readonly type: T;
  /** Cursor `Last-Event-ID`. */
  readonly id: string;
  readonly aggregate: {
    readonly kind: string;
    readonly id: string;
    readonly version: number;
  } | null;
  readonly data: DashboardStreamData[T];
}

export interface DashboardStreamInvalidation {
  readonly type: DashboardStreamType;
  readonly key: string;
}

/** Contrato §1/§5: único intervalo de polling. */
export const POLLING_INTERVAL_MS = 30_000;
export const SSE_BACKOFF_INITIAL_MS = 1_000;
export const SSE_BACKOFF_MAX_MS = 30_000;
export const SSE_FAILURE_WINDOW_MS = 60_000;
export const SSE_FAILURES_BEFORE_POLLING = 2;
export const HEARTBEAT_MS = 20_000;
export const HEARTBEAT_STALE_FACTOR = 2;

export type SseStatus =
  'idle' | 'live' | 'reconnecting' | 'polling' | 'stopped';

const MS_PER_SECOND = 1000;
const STOPPED_STATUSES: readonly number[] = [401, 403];
const INVALIDATION_KEY_FIELDS: Readonly<Record<DashboardStreamType, string>> = {
  'alert.changed': 'alertId',
  'alert.escalated': 'alertId',
  'duty.changed': 'dutyId',
  'source.freshness': 'source',
  'integration.health': 'source',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function streamTypeOf(event: string | null): DashboardStreamType | null {
  if (event === null) return null;
  const name = event.startsWith(DASHBOARD_STREAM_EVENT_PREFIX)
    ? event.slice(DASHBOARD_STREAM_EVENT_PREFIX.length)
    : event;
  return (DASHBOARD_STREAM_TYPES as readonly string[]).includes(name)
    ? (name as DashboardStreamType)
    : null;
}

@Injectable({ providedIn: 'root' })
export class SseService {
  private readonly transport = inject(DashboardStreamTransport);

  private readonly eventsSubject = new Subject<DashboardStreamEvent>();
  private readonly invalidationsSubject =
    new Subject<DashboardStreamInvalidation>();
  private readonly tickSubject = new Subject<void>();
  private readonly resyncSubject = new Subject<void>();

  private readonly statusState = signal<SseStatus>('idle');
  private readonly pollingState = signal(false);
  private readonly lastEventIdState = signal<string | null>(null);

  private connection: { unsubscribe(): void } | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  private staleTimer: ReturnType<typeof setTimeout> | null = null;
  private backoffMs = SSE_BACKOFF_INITIAL_MS;
  private failures: number[] = [];
  private framesReceived = 0;
  private readonly versions = new Map<string, number>();

  readonly events$: Observable<DashboardStreamEvent> =
    this.eventsSubject.asObservable();
  readonly invalidations$: Observable<DashboardStreamInvalidation> =
    this.invalidationsSubject.asObservable();
  /** Um tick a cada `POLLING_INTERVAL_MS` enquanto `polling()`. */
  readonly tick$: Observable<void> = this.tickSubject.asObservable();
  /** Reabertura sem cursor: os consumidores recarregam. */
  readonly resync$: Observable<void> = this.resyncSubject.asObservable();

  readonly status: Signal<SseStatus> = this.statusState.asReadonly();
  readonly polling: Signal<boolean> = this.pollingState.asReadonly();
  readonly lastEventId: Signal<string | null> =
    this.lastEventIdState.asReadonly();
  readonly live: Signal<boolean> = computed(
    () => this.statusState() === 'live',
  );

  /** Idempotente. */
  connect(): void {
    if (this.connection || this.reconnectTimer !== null) return;
    this.open();
  }

  disconnect(): void {
    this.closeConnection();
    this.clearReconnect();
    this.clearPolling();
    this.pollingState.set(false);
    this.statusState.set('idle');
  }

  private open(): void {
    this.closeConnection();
    this.clearReconnect();
    this.framesReceived = 0;
    const lastEventId = this.lastEventIdState();
    const subscription = this.transport
      .open(DASHBOARD_STREAM_URL, { lastEventId })
      .subscribe({
        next: (frame) => this.onFrame(frame),
        error: (error: unknown) => this.onFailure(error),
        complete: () => this.onComplete(),
      });
    this.connection = subscription;
  }

  private onFrame(frame: DashboardStreamFrame): void {
    this.framesReceived += 1;
    this.armStaleTimer();
    this.statusState.set('live');
    if (this.pollingState()) {
      this.pollingState.set(false);
      this.clearPolling();
    }
    this.failures = [];
    this.backoffMs = SSE_BACKOFF_INITIAL_MS;
    if (frame.id !== null && frame.id.length > 0) {
      this.lastEventIdState.set(frame.id);
    }
    const type = streamTypeOf(frame.event);
    if (type === null) return;
    let envelope: unknown;
    try {
      envelope = JSON.parse(frame.data);
    } catch {
      return;
    }
    if (!isRecord(envelope)) return;
    const aggregate = this.aggregateOf(envelope['aggregate']);
    if (aggregate) {
      const key = `${aggregate.kind}:${aggregate.id}`;
      const seen = this.versions.get(key);
      if (seen !== undefined && aggregate.version <= seen) return;
      this.versions.set(key, aggregate.version);
    }
    // OD-D16-013: a forma do `data` é `source_pending`; um envelope sem a chave `data` é
    // lido como o próprio dado (só ids/tokens são usados, nunca texto de tela).
    const data = isRecord(envelope['data']) ? envelope['data'] : envelope;
    this.eventsSubject.next({
      type,
      id: frame.id ?? '',
      aggregate,
      data,
    } as DashboardStreamEvent);
    const keyField = data[INVALIDATION_KEY_FIELDS[type]];
    if (typeof keyField === 'string' && keyField.length > 0) {
      this.invalidationsSubject.next({ type, key: keyField });
    }
  }

  private aggregateOf(
    value: unknown,
  ): { kind: string; id: string; version: number } | null {
    if (!isRecord(value)) return null;
    const kind = value['kind'];
    const id = value['id'];
    const version = value['version'];
    if (
      typeof kind !== 'string' ||
      typeof id !== 'string' ||
      typeof version !== 'number'
    ) {
      return null;
    }
    return { kind, id, version };
  }

  /** Servidor fechou: o cursor é descartado (204) e os consumidores recarregam. */
  private onComplete(): void {
    this.connection = null;
    this.clearStale();
    this.lastEventIdState.set(null);
    this.resyncSubject.next();
    if (this.framesReceived > 0) {
      this.open();
      return;
    }
    this.scheduleReopen(this.backoffMs);
  }

  private onFailure(error: unknown): void {
    this.connection = null;
    this.clearStale();
    const classified = classifyError(error);
    const status = classified.status ?? 0;
    if (STOPPED_STATUSES.includes(status)) {
      this.clearReconnect();
      this.clearPolling();
      this.pollingState.set(false);
      this.statusState.set('stopped');
      return;
    }
    this.registerFailure();
    const retryAfter = classified.retryAfter;
    const retryAfterMs =
      typeof retryAfter === 'number' ? retryAfter * MS_PER_SECOND : 0;
    const delay = Math.max(this.backoffMs, retryAfterMs);
    this.scheduleReopen(delay);
    this.backoffMs = Math.min(this.backoffMs * 2, SSE_BACKOFF_MAX_MS);
  }

  /** Silêncio maior que `HEARTBEAT_STALE_FACTOR × HEARTBEAT_MS` conta como falha. */
  private armStaleTimer(): void {
    this.clearStale();
    this.staleTimer = setTimeout(() => {
      this.staleTimer = null;
      this.closeConnection();
      this.registerFailure();
      this.scheduleReopen(this.backoffMs);
      this.backoffMs = Math.min(this.backoffMs * 2, SSE_BACKOFF_MAX_MS);
    }, HEARTBEAT_MS * HEARTBEAT_STALE_FACTOR);
  }

  private registerFailure(): void {
    const now = Date.now();
    this.failures = [
      ...this.failures.filter((at) => now - at < SSE_FAILURE_WINDOW_MS),
      now,
    ];
    if (this.failures.length >= SSE_FAILURES_BEFORE_POLLING) {
      this.enterPolling();
      return;
    }
    this.statusState.set('reconnecting');
  }

  private enterPolling(): void {
    this.pollingState.set(true);
    this.statusState.set('polling');
    if (this.pollingTimer !== null) return;
    this.pollingTimer = setInterval(
      () => this.tickSubject.next(),
      POLLING_INTERVAL_MS,
    );
  }

  private scheduleReopen(delay: number): void {
    this.clearReconnect();
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.open();
    }, delay);
  }

  private closeConnection(): void {
    this.connection?.unsubscribe();
    this.connection = null;
    this.clearStale();
  }

  private clearReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearPolling(): void {
    if (this.pollingTimer !== null) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private clearStale(): void {
    if (this.staleTimer !== null) {
      clearTimeout(this.staleTimer);
      this.staleTimer = null;
    }
  }
}
