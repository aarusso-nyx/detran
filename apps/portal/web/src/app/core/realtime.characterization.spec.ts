// R-0022 TASK-0003 (Inspector). Caracterização da costura SSE do Portal web (W3) sobre STYNX
// 1.4.0: critérios C-01-31…C-01-37 de `work/rounds/R-0022/contracts/CTG-0001.md`.
// Válido nas duas fases (antes e depois da troca): testa só a API pública do `RealtimeService`,
// a fronteira `HttpClient` (`HttpTestingController`), o dublê de sessão do app
// (`createSessionFacadeStub`) e o relógio falso do vitest; nenhum dublê de transporte local.
import {
  HttpEventType,
  provideHttpClient,
  withInterceptorsFromDi,
  type HttpDownloadProgressEvent,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  type TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideStynxDefaults } from '@stynx-nyx/angular';
import { TenantContextService } from '@stynx-nyx/angular-tenancy';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSessionFacadeStub } from '../../testing/session-facade.stub';
import { TENANT_ID } from '../../testing/http-fixtures';
import { REQUEST_ADESAO_SNE_ID } from '../../testing/http-fixtures-pair3';
import { RealtimeService, type PortalStreamEvent } from './realtime.service';
import { SessionFacade } from './session.facade';

const STREAM_URL = '/v1/portal/stream';
const TOPICS =
  'inbox.item,request.changed,decision.published,payment.confirmed';
const TEST_ACCESS_TOKEN = 'test-access-token';
const POLLING_MS = 60_000;

const sent = new WeakMap<TestRequest, string>();

function setup(active = true) {
  const session = createSessionFacadeStub({ active });
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: SessionFacade, useValue: session },
    ],
  });
  const http = TestBed.inject(HttpTestingController);
  const service = TestBed.inject(RealtimeService);
  return { http, service, session };
}

function pending(http: HttpTestingController): TestRequest[] {
  return http.match((request) => request.url === STREAM_URL);
}

function only(http: HttpTestingController): TestRequest {
  const requests = pending(http);
  expect(requests).toHaveLength(1);
  return requests[0] as TestRequest;
}

/** Entrega texto SSE acumulado como `partialText` (a fronteira que o `HttpClient` mantém). */
function push(request: TestRequest, text: string): void {
  const all = `${sent.get(request) ?? ''}${text}`;
  sent.set(request, all);
  request.event({
    type: HttpEventType.DownloadProgress,
    loaded: all.length,
    partialText: all,
  } as HttpDownloadProgressEvent);
}

function block(id: string, event: string, data: string): string {
  return `id: ${id}\nevent: ${event}\ndata: ${data}\n\n`;
}

const HEARTBEAT = ': heartbeat\n\n';

function requestChanged(id: string): string {
  return block(
    id,
    'request.changed',
    JSON.stringify({
      data: { requestId: REQUEST_ADESAO_SNE_ID, situation: 'PROTOCOLADO' },
    }),
  );
}

function fail(request: TestRequest, status = 500): void {
  if (status === 0) request.error(new ProgressEvent('error'));
  else request.flush('', { status, statusText: `HTTP ${status}` });
}

/** Erro com o corpo já interpretado em `HttpErrorResponse.error` (objeto, não texto). */
function failParsed(
  request: TestRequest,
  status: number,
  body: Record<string, unknown>,
): void {
  request.error(body as unknown as ProgressEvent, {
    status,
    statusText: `HTTP ${status}`,
  });
}

/** Assina `events` (o serviço só abre com assinante) e coleta o que chega. */
function subscribeEvents(service: RealtimeService): PortalStreamEvent[] {
  const events: PortalStreamEvent[] = [];
  service.events.subscribe((event) => events.push(event));
  return events;
}

function collect<T>(source: {
  subscribe(next: (value: T) => void): unknown;
}): T[] {
  const values: T[] = [];
  source.subscribe((value) => values.push(value));
  return values;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('C-01-31 — start()', () => {
  it('dado sessão ativa e assinante quando start() então GET com os quatro topics, sem Last-Event-ID, connecting; o primeiro frame de evento leva a live', () => {
    const { http, service } = setup(true);
    subscribeEvents(service);
    TestBed.tick();
    const request = only(http);
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Accept')).toBe('text/event-stream');
    expect(request.request.params.get('topics')).toBe(TOPICS);
    expect(request.request.headers.has('Last-Event-ID')).toBe(false);
    expect(service.status()).toBe('connecting');
    push(request, requestChanged('01A'));
    expect(service.status()).toBe('live');
  });

  it('dado a conexão aberta quando chega apenas comentário então o status segue connecting (comentários são descartados)', () => {
    const { http, service } = setup(true);
    subscribeEvents(service);
    TestBed.tick();
    push(only(http), HEARTBEAT);
    expect(service.status()).toBe('connecting');
  });

  it('dado sessão inativa quando start() então nenhuma requisição', () => {
    const { http, service } = setup(false);
    subscribeEvents(service);
    TestBed.tick();
    service.start();
    expect(pending(http)).toHaveLength(0);
  });
});

describe('C-01-32 — on() e frames inválidos', () => {
  it('dado o frame request.changed quando chega então on emite id e data; lastEventId é o id', () => {
    const { http, service } = setup(true);
    const received: PortalStreamEvent<'request.changed'>[] = [];
    service.on('request.changed').subscribe((event) => received.push(event));
    TestBed.tick();
    push(only(http), requestChanged('01A'));
    expect(received).toHaveLength(1);
    expect(received[0]?.id).toBe('01A');
    expect(received[0]?.data.requestId).toBe(REQUEST_ADESAO_SNE_ID);
    expect(service.lastEventId()).toBe('01A');
  });

  it('dado tipo desconhecido ou data não-JSON quando chega então nada é emitido e nada lança', () => {
    const { http, service } = setup(true);
    const events = subscribeEvents(service);
    TestBed.tick();
    const request = only(http);
    expect(() => {
      push(request, block('01A', 'request.unknown', '{"data":{}}'));
      push(request, block('01B', 'request.changed', 'isto-nao-e-json'));
    }).not.toThrow();
    expect(events).toHaveLength(0);
  });
});

describe('C-01-33 — queda leva a polling, sem backoff', () => {
  it.each([
    ['status 0', (request: TestRequest) => fail(request, 0)],
    ['status 500', (request: TestRequest) => fail(request, 500)],
    ['servidor fecha', (request: TestRequest) => request.flush('')],
  ])(
    'dado um frame com id quando a conexão cai (%s) então polling, tick a cada 60000 ms e a cada tick uma requisição com Last-Event-ID',
    (_label, drop) => {
      const { http, service } = setup(true);
      const ticks = collect<void>(service.tick);
      subscribeEvents(service);
      TestBed.tick();
      const first = only(http);
      push(first, requestChanged('01A'));
      drop(first);
      expect(service.status()).toBe('polling');
      vi.advanceTimersByTime(POLLING_MS - 1);
      expect(pending(http)).toHaveLength(0);
      expect(ticks).toHaveLength(0);
      vi.advanceTimersByTime(1);
      expect(ticks).toHaveLength(1);
      const second = only(http);
      expect(second.request.headers.get('Last-Event-ID')).toBe('01A');
      fail(second);
      vi.advanceTimersByTime(POLLING_MS - 1);
      expect(pending(http)).toHaveLength(0);
      vi.advanceTimersByTime(1);
      expect(ticks).toHaveLength(2);
      expect(only(http).request.headers.get('Last-Event-ID')).toBe('01A');
    },
  );
});

describe('C-01-34 — 204 com cursor e 401/403', () => {
  it('dado a reabertura com cursor quando o servidor fecha sem frame (204) então a próxima requisição vai sem Last-Event-ID', () => {
    const { http, service } = setup(true);
    subscribeEvents(service);
    TestBed.tick();
    const first = only(http);
    push(first, requestChanged('01A'));
    fail(first);
    vi.advanceTimersByTime(POLLING_MS);
    const reopened = only(http);
    expect(reopened.request.headers.get('Last-Event-ID')).toBe('01A');
    reopened.flush('', { status: 204, statusText: 'No Content' });
    expect(service.lastEventId()).toBeNull();
    vi.advanceTimersByTime(POLLING_MS);
    expect(only(http).request.headers.has('Last-Event-ID')).toBe(false);
  });

  // CONTRADIÇÃO CTG-0001 × código (registrada no relatório de TASK-0003; adenda do Architect
  // pendente): C-01-34 pede "nenhuma requisição nova em 60000 ms" depois de 401/403, mas com
  // sessão ativa e assinante o `effect()` do construtor relê `status()` (via `start()`), vê
  // `stopped` e reabre a conexão logo no primeiro flush de efeitos. Não se codifica o defeito
  // como "comportamento atual" nem se afrouxa o critério: só o que vale nas duas fases fica
  // asserido (o estado `stopped` e a interrupção dos ticks de polling logo após a falha).
  it.each([401, 403])(
    'dado status %i quando a conexão falha então stopped, sem polling e sem ticks',
    (status) => {
      const { http, service } = setup(true);
      const ticks = collect<void>(service.tick);
      subscribeEvents(service);
      TestBed.tick();
      fail(only(http), status);
      expect(service.status()).toBe('stopped');
      expect(ticks).toHaveLength(0);
    },
  );
});

describe('C-01-35 — 429 PORTAL.RATE_LIMITED', () => {
  it('dado 429 com retryAfter 120 quando a conexão falha então polling, lastError portal.errors.rate_limited, nenhuma requisição em 60000 ms e uma em 120000 ms', () => {
    const { http, service } = setup(true);
    subscribeEvents(service);
    TestBed.tick();
    failParsed(only(http), 429, {
      code: 'PORTAL.RATE_LIMITED',
      status: 429,
      context: { retryAfter: 120 },
    });
    expect(service.status()).toBe('polling');
    expect(service.lastError()?.messageKey).toBe('portal.errors.rate_limited');
    vi.advanceTimersByTime(POLLING_MS);
    expect(pending(http)).toHaveLength(0);
    vi.advanceTimersByTime(POLLING_MS);
    expect(pending(http)).toHaveLength(1);
  });
});

describe('C-01-36 — SessionFacade.active()', () => {
  it('dado uma conexão aberta quando a sessão fica inativa então stopped e requisição cancelada; quando volta a ativa com assinante então requisição nova', () => {
    const { http, service, session } = setup(true);
    subscribeEvents(service);
    TestBed.tick();
    const first = only(http);
    session.activeSignal.set(false);
    TestBed.tick();
    expect(service.status()).toBe('stopped');
    expect(first.cancelled).toBe(true);
    expect(pending(http)).toHaveLength(0);
    session.activeSignal.set(true);
    TestBed.tick();
    expect(pending(http)).toHaveLength(1);
  });
});

describe('C-01-37 — bearer, X-Tenant-Id e ausência de EventSource', () => {
  it('dado a cadeia STYNX montada como no bootstrap quando o serviço abre então a requisição sai com Authorization Bearer e X-Tenant-Id', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideStynxDefaults({
          angular: {
            apiBaseUrl: '',
            sessionMode: 'bearer',
            authProvider: {
              getAccessToken: () => Promise.resolve(TEST_ACCESS_TOKEN),
            } as never,
          },
        }),
        provideHttpClientTesting(),
        {
          provide: SessionFacade,
          useValue: createSessionFacadeStub({ active: true }),
        },
      ],
    });
    TestBed.inject(TenantContextService).setTenant(TENANT_ID);
    const http = TestBed.inject(HttpTestingController);
    const service = TestBed.inject(RealtimeService);
    subscribeEvents(service);
    TestBed.tick();
    await vi.advanceTimersByTimeAsync(0);
    const request = only(http);
    expect(request.request.headers.get('Authorization')).toBe(
      `Bearer ${TEST_ACCESS_TOKEN}`,
    );
    expect(request.request.headers.get('X-Tenant-Id')).toBe(TENANT_ID);
  });

  it('dado o código do serviço quando lido então não há new EventSource(', () => {
    const path = join(
      dirname(fileURLToPath(import.meta.url)),
      'realtime.service.ts',
    );
    expect(existsSync(path)).toBe(true);
    expect(readFileSync(path, 'utf8')).not.toMatch(/new\s+EventSource\s*\(/);
  });
});
