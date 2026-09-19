// RealtimeService (contrato CTG-0003c §4.1; spec §8; contrato de rotas §9; M14): consome
// `GET /v1/portal/stream` (text/event-stream) por um transporte injetável — `PortalStreamTransport`
// — cuja implementação padrão usa o `HttpClient` de `provideStynxDefaults` (`observe: 'events'`,
// `reportProgress`, `responseType: 'text'`, lendo `partialText`), porque o `EventSource` nativo
// não envia o bearer da sessão STYNX ([DIVERGE-1]; OD-P96). Parser incremental do formato SSE
// (`id:`/`event:`/`data:`; comentários `: heartbeat` mantêm `live` sem emitir; `retry:` ignorado).
// Queda do transporte → `polling`: um `tick` a cada `POLLING_INTERVAL_MS` (os consumidores
// releem o que assinam) e uma nova tentativa de abertura no mesmo compasso — sem backoff próprio
// (OD-P96); `429 RATE_LIMITED { retryAfter }` adia a reabertura para `max(60 s, retryAfter)`;
// `401`/`403` param o serviço (a sessão não vale). `Last-Event-ID` = último `id` recebido; uma
// reabertura que completa sem nenhum frame modela o `204` (cursor fora da janela de 24 h) e a
// próxima abertura vai sem cursor — o cliente nunca sintetiza eventos nem reconstrói o replay.
// Nenhum campo do envelope vira texto de tela.
import {
  HttpClient,
  HttpEventType,
  type HttpDownloadProgressEvent,
  type HttpEvent,
} from '@angular/common/http';
import {
  DestroyRef,
  Injectable,
  Injector,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Observable, Subject, filter, type Subscription } from 'rxjs';
import { PORTAL_API_PREFIX } from '../data/portal.client';
import type { InboxKind } from '../data/portal-read.models';
import type {
  RequestNextAction,
  RequestState,
} from '../data/portal-read.models';
import {
  classifyError,
  presentError,
  type ErrorPresentation,
} from './error-boundary';
import { SessionFacade } from './session.facade';

/** Contrato de rotas §9: `PORTAL_API_PREFIX + '/stream'`. */
export const PORTAL_STREAM_URL = `${PORTAL_API_PREFIX}/stream`;

/** `backend/app/src/portal-stream.service.ts` PORTAL_STREAM_TYPES; OpenAPI `portalStreamRead.topics`. */
export const PORTAL_STREAM_TYPES = [
  'inbox.item',
  'request.changed',
  'decision.published',
  'payment.confirmed',
] as const;

export type PortalStreamType = (typeof PORTAL_STREAM_TYPES)[number];

/** Spec §8 / contrato §9: "fallback de polling de 60 s". Único intervalo deste serviço. */
export const POLLING_INTERVAL_MS = 60_000;

/** Milissegundos por segundo (unidade, não intervalo): `retryAfter` chega em segundos. */
const MS_PER_SECOND = 1000;
/** O mesmo intervalo em segundos, derivado — um único literal de intervalo (C-3c-78). */
const POLLING_INTERVAL_SECONDS = POLLING_INTERVAL_MS / MS_PER_SECOND;

/** `data` por tipo (`portal-stream.service.ts` `reshape`): só ids, o token cidadão e o nextAction. */
export interface PortalStreamData {
  'inbox.item': { readonly id: string | null; readonly kind: InboxKind | null };
  'request.changed': {
    readonly requestId: string | null;
    readonly situation: RequestState | null;
    readonly nextAction: RequestNextAction | null;
  };
  'decision.published': { readonly requestId: string | null };
  'payment.confirmed': { readonly aitId: string | null };
}

export interface PortalStreamEvent<
  T extends PortalStreamType = PortalStreamType,
> {
  readonly type: T;
  /** `id:` do frame = cursor `Last-Event-ID` (id do outbox). */
  readonly id: string;
  /** Envelope §1 `occurredAt`, quando presente. */
  readonly occurredAt: string | null;
  readonly data: PortalStreamData[T];
}

export interface StreamFrame {
  readonly id: string | null;
  readonly event: string | null;
  /** JSON cru do envelope (`rait-events-sse-contract.md` §1); comentários nunca chegam aqui. */
  readonly data: string;
}

export interface StreamOpenOptions {
  readonly lastEventId: string | null;
  readonly topics: readonly PortalStreamType[];
}

/**
 * Transporte do SSE: abstração injetável (`providedIn: 'root'` com a implementação padrão pelo
 * `HttpClient`), substituível por `useValue` nos testes. Completa quando o servidor fecha; erra
 * com `HttpErrorResponse` (401/403/429/5xx/0).
 */
@Injectable({
  providedIn: 'root',
  useFactory: () => new HttpPortalStreamTransport(inject(Injector)),
})
export abstract class PortalStreamTransport {
  abstract open(
    url: string,
    options: StreamOpenOptions,
  ): Observable<StreamFrame>;
}

const LAST_EVENT_ID_HEADER = 'Last-Event-ID';
const TOPICS_PARAM = 'topics';

/** Parser incremental de `text/event-stream` (§4.1 a): blocos separados por linha vazia. */
export class StreamFrameParser {
  private buffer = '';
  private pending = '';
  private id: string | null = null;
  private event: string | null = null;
  private data: string[] = [];

  /** Consome o texto acumulado até aqui (`partialText`) e devolve os frames completos novos. */
  push(partialText: string): readonly StreamFrame[] {
    const chunk = partialText.slice(this.buffer.length);
    this.buffer = partialText;
    const frames: StreamFrame[] = [];
    let text = this.pending + chunk;
    let newline = text.indexOf('\n');
    while (newline >= 0) {
      const line = text.slice(0, newline).replace(/\r$/, '');
      text = text.slice(newline + 1);
      const frame = this.line(line);
      if (frame) frames.push(frame);
      newline = text.indexOf('\n');
    }
    this.pending = text;
    return frames;
  }

  private line(line: string): StreamFrame | null {
    if (line === '') return this.flush();
    // Comentário (`: connected`, `: heartbeat`): nunca vira frame.
    if (line.startsWith(':')) return null;
    const colon = line.indexOf(':');
    const field = colon >= 0 ? line.slice(0, colon) : line;
    let value = colon >= 0 ? line.slice(colon + 1) : '';
    if (value.startsWith(' ')) value = value.slice(1);
    switch (field) {
      case 'id':
        this.id = value;
        return null;
      case 'event':
        this.event = value;
        return null;
      case 'data':
        this.data.push(value);
        return null;
      default:
        // `retry:` e campos desconhecidos: ignorados (a política de reconexão é a do contrato).
        return null;
    }
  }

  private flush(): StreamFrame | null {
    if (this.id === null && this.event === null && this.data.length === 0) {
      return null;
    }
    const frame: StreamFrame = {
      id: this.id,
      event: this.event,
      data: this.data.join('\n'),
    };
    this.id = null;
    this.event = null;
    this.data = [];
    return frame;
  }
}

/** Implementação padrão: `HttpClient` STYNX com `observe: 'events'` + `partialText` ([DIVERGE-1]). */
export class HttpPortalStreamTransport extends PortalStreamTransport {
  private httpClient: HttpClient | null = null;

  constructor(private readonly injector: Injector) {
    super();
  }

  private get http(): HttpClient {
    this.httpClient ??= this.injector.get(HttpClient);
    return this.httpClient;
  }

  open(url: string, options: StreamOpenOptions): Observable<StreamFrame> {
    return new Observable<StreamFrame>((subscriber) => {
      const parser = new StreamFrameParser();
      const headers: Record<string, string> = { Accept: 'text/event-stream' };
      if (options.lastEventId !== null) {
        headers[LAST_EVENT_ID_HEADER] = options.lastEventId;
      }
      const subscription = this.http
        .get(url, {
          headers,
          params: { [TOPICS_PARAM]: options.topics.join(',') },
          observe: 'events',
          reportProgress: true,
          responseType: 'text',
        })
        .subscribe({
          next: (event: HttpEvent<string>) => {
            if (event.type === HttpEventType.DownloadProgress) {
              const partial =
                (event as HttpDownloadProgressEvent).partialText ?? '';
              for (const frame of parser.push(partial)) subscriber.next(frame);
              return;
            }
            if (event.type === HttpEventType.Response) {
              const body = event.body ?? '';
              for (const frame of parser.push(`${body}\n\n`)) {
                subscriber.next(frame);
              }
              subscriber.complete();
            }
          },
          error: (error: unknown) => subscriber.error(error),
          complete: () => subscriber.complete(),
        });
      return () => subscription.unsubscribe();
    });
  }
}

export type RealtimeStatus =
  | 'idle' // nunca iniciado ou parado
  | 'connecting'
  | 'live' // frames chegando (ou heartbeat)
  | 'polling' // SSE caiu; ticks a cada POLLING_INTERVAL_MS
  | 'stopped'; // sessão inativa

const RATE_LIMITED_CODE = 'PORTAL.RATE_LIMITED';
const UNAUTHORIZED_STATUSES: ReadonlySet<number> = new Set([401, 403]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStreamType(value: unknown): value is PortalStreamType {
  return (PORTAL_STREAM_TYPES as readonly unknown[]).includes(value);
}

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly transport = inject(PortalStreamTransport);
  private readonly session = inject(SessionFacade);
  private readonly destroyRef = inject(DestroyRef);

  private readonly statusState = signal<RealtimeStatus>('idle');
  private readonly lastEventIdState = signal<string | null>(null);
  private readonly lastErrorState = signal<ErrorPresentation | null>(null);
  private readonly eventsSubject = new Subject<PortalStreamEvent>();
  private readonly tickSubject = new Subject<void>();
  private subscribers = 0;
  private connection: Subscription | null = null;
  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  /** Ticks a esperar antes da próxima abertura (`max(60 s, retryAfter)` em compassos de 60 s). */
  private ticksUntilReopen = 0;
  /** Frames recebidos na conexão corrente (modela o `204` na reabertura, §4.1 d). */
  private framesReceived = 0;

  readonly status = this.statusState.asReadonly();
  /** Cursor; só do servidor (nunca gerado no cliente). */
  readonly lastEventId = this.lastEventIdState.asReadonly();
  readonly lastError = this.lastErrorState.asReadonly();

  /** Eventos do fio; contado por assinante (sem assinantes, a sessão não reabre nada — §4.1 g). */
  readonly events: Observable<PortalStreamEvent> = new Observable(
    (subscriber) => {
      this.subscribers += 1;
      const subscription = this.eventsSubject.subscribe(subscriber);
      return () => {
        this.subscribers -= 1;
        subscription.unsubscribe();
      };
    },
  );

  /** Emite a cada POLLING_INTERVAL_MS enquanto `status === 'polling'`. */
  readonly tick: Observable<void> = this.tickSubject.asObservable();

  constructor() {
    effect(() => {
      const active = this.session.active();
      if (!active) {
        this.stop();
      } else if (this.subscribers > 0) {
        this.start();
      }
    });
    this.destroyRef.onDestroy(() => this.stop());
  }

  on<T extends PortalStreamType>(type: T): Observable<PortalStreamEvent<T>> {
    return this.events.pipe(
      filter((event): event is PortalStreamEvent<T> => event.type === type),
    );
  }

  /** Idempotente; só com `SessionFacade.active()`; `idle`/`stopped` → `connecting`. */
  start(): void {
    const status = this.statusState();
    if (status !== 'idle' && status !== 'stopped') return;
    if (!this.session.active()) return;
    this.lastErrorState.set(null);
    this.open();
  }

  /** Fecha o transporte, cancela ticks → `stopped`. */
  stop(): void {
    this.closeConnection();
    this.clearPolling();
    this.statusState.set('stopped');
  }

  private open(): void {
    this.closeConnection();
    this.framesReceived = 0;
    this.statusState.set('connecting');
    const lastEventId = this.lastEventIdState();
    this.connection = this.transport
      .open(PORTAL_STREAM_URL, {
        lastEventId,
        topics: PORTAL_STREAM_TYPES,
      })
      .subscribe({
        next: (frame) => this.onFrame(frame),
        error: (error: unknown) => this.onFailure(error),
        complete: () => this.onComplete(lastEventId),
      });
  }

  private onFrame(frame: StreamFrame): void {
    this.framesReceived += 1;
    this.statusState.set('live');
    if (frame.id !== null && frame.id.length > 0) {
      this.lastEventIdState.set(frame.id);
    }
    if (!isStreamType(frame.event)) return;
    let envelope: unknown;
    try {
      envelope = JSON.parse(frame.data);
    } catch {
      return; // `data` que não seja JSON → descartado (nunca lança).
    }
    if (!isRecord(envelope)) return;
    const data = isRecord(envelope['data']) ? envelope['data'] : {};
    const occurredAt = envelope['occurredAt'];
    this.eventsSubject.next({
      type: frame.event,
      id: frame.id ?? '',
      occurredAt: typeof occurredAt === 'string' ? occurredAt : null,
      data: data as PortalStreamData[typeof frame.event],
    } as PortalStreamEvent);
  }

  /** Servidor fechou: reabertura sem frame algum = `204` (cursor rejeitado) → sem `Last-Event-ID`. */
  private onComplete(openedWith: string | null): void {
    this.connection = null;
    if (openedWith !== null && this.framesReceived === 0) {
      this.lastEventIdState.set(null);
    }
    this.enterPolling(1);
  }

  private onFailure(error: unknown): void {
    this.connection = null;
    const classified = classifyError(error);
    if (UNAUTHORIZED_STATUSES.has(classified.status)) {
      this.stop();
      return;
    }
    const presentation = presentError(error);
    this.lastErrorState.set(presentation);
    const retryAfter = classified.retryAfter;
    const waitTicks =
      classified.code === RATE_LIMITED_CODE && typeof retryAfter === 'number'
        ? Math.max(1, Math.ceil(retryAfter / POLLING_INTERVAL_SECONDS))
        : 1;
    this.enterPolling(waitTicks);
  }

  private enterPolling(waitTicks: number): void {
    this.statusState.set('polling');
    this.ticksUntilReopen = waitTicks;
    if (this.pollingTimer !== null) return;
    this.pollingTimer = setInterval(() => this.onTick(), POLLING_INTERVAL_MS);
  }

  private onTick(): void {
    if (this.statusState() !== 'polling') {
      this.clearPolling();
      return;
    }
    this.tickSubject.next();
    this.ticksUntilReopen -= 1;
    if (this.ticksUntilReopen <= 0 && this.session.active()) {
      this.clearPolling();
      this.open();
    }
  }

  private closeConnection(): void {
    this.connection?.unsubscribe();
    this.connection = null;
  }

  private clearPolling(): void {
    if (this.pollingTimer !== null) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }
}
