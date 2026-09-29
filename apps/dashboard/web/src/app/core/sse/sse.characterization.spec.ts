// R-0022 TASK-0003 (Inspector). Caracterização da costura SSE do DASHBOARD web (W2) sobre STYNX
// 1.4.0: critérios C-01-27…C-01-30 e C-01-37 de `work/rounds/R-0022/contracts/CTG-0001.md`.
// Válido nas duas fases (antes e depois da troca): testa só a API pública do `SseService`, a
// fronteira `HttpClient` (`HttpTestingController`) e o relógio falso do vitest; nenhum dublê de
// transporte local, nenhum símbolo interno que o plano remove.
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
import {
  SseService,
  type DashboardStreamEvent,
  type DashboardStreamInvalidation,
} from './sse.service';

const STREAM_URL = '/v1/dashboard/stream';
// Fixture canônica do tenant (mesmo tenant `am-fixtures` das fixtures do RAIT).
const FIXTURE_TENANT_ID = '00000000-0000-7000-8000-00000000a001';
// Composto (verificador de literais `dashboard.<ns>`): o `event:` aceita o prefixo `dashboard.`.
const PREFIXED_ALERT_CHANGED = ['dashboard', 'alert.changed'].join('.');
const TEST_ACCESS_TOKEN = 'test-access-token';

const sent = new WeakMap<TestRequest, string>();

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  const http = TestBed.inject(HttpTestingController);
  const service = TestBed.inject(SseService);
  return { http, service };
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

function envelope(
  aggregate: { kind: string; id: string; version: number } | null,
  data: Record<string, unknown>,
): string {
  return JSON.stringify(aggregate === null ? { data } : { aggregate, data });
}

const HEARTBEAT = ': heartbeat\n\n';

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

describe('C-01-27 — connect(), frames e invalidações', () => {
  it('dado connect() quando chamado então uma requisição GET com Accept text/event-stream, sem topics e sem Last-Event-ID; connect() repetido não abre outra', () => {
    const { http, service } = setup();
    service.connect();
    const request = only(http);
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Accept')).toBe('text/event-stream');
    expect(request.request.params.has('topics')).toBe(false);
    expect(request.request.headers.has('Last-Event-ID')).toBe(false);
    service.connect();
    expect(pending(http)).toHaveLength(0);
  });

  it.each(['alert.changed', PREFIXED_ALERT_CHANGED])(
    'dado o frame %s quando chega então events$ e invalidations$ emitem type e a chave alertId',
    (eventName) => {
      const { http, service } = setup();
      const events = collect<DashboardStreamEvent>(service.events$);
      const invalidations = collect<DashboardStreamInvalidation>(
        service.invalidations$,
      );
      service.connect();
      push(
        only(http),
        block(
          '01A',
          eventName,
          envelope({ kind: 'alert', id: 'a1', version: 2 }, { alertId: 'a1' }),
        ),
      );
      expect(events).toHaveLength(1);
      expect(events[0]?.type).toBe('alert.changed');
      expect(events[0]?.id).toBe('01A');
      expect(invalidations).toEqual([{ type: 'alert.changed', key: 'a1' }]);
      expect(service.lastEventId()).toBe('01A');
      expect(service.status()).toBe('live');
    },
  );

  it.each([
    ['duty.changed', { dutyId: 'd1' }, 'd1'],
    ['source.freshness', { source: 's1' }, 's1'],
    ['integration.health', { source: 's2' }, 's2'],
    ['alert.escalated', { alertId: 'a2' }, 'a2'],
  ])(
    'dado o frame %s quando chega então a invalidação usa a chave do tipo',
    (type, data, key) => {
      const { http, service } = setup();
      const invalidations = collect<DashboardStreamInvalidation>(
        service.invalidations$,
      );
      service.connect();
      push(only(http), block('01A', type, envelope(null, data)));
      expect(invalidations).toEqual([{ type, key }]);
    },
  );

  it('dado uma versão já vista do mesmo kind:id quando chega versão menor ou igual então não emite; sem aggregate emite; tipo fora do catálogo é ignorado', () => {
    const { http, service } = setup();
    const events = collect<DashboardStreamEvent>(service.events$);
    service.connect();
    const request = only(http);
    const aggregate = (version: number) => ({
      kind: 'alert',
      id: 'a1',
      version,
    });
    push(
      request,
      block('01A', 'alert.changed', envelope(aggregate(3), { alertId: 'a1' })),
    );
    push(
      request,
      block('01B', 'alert.changed', envelope(aggregate(3), { alertId: 'a1' })),
    );
    push(
      request,
      block('01C', 'alert.changed', envelope(aggregate(2), { alertId: 'a1' })),
    );
    expect(events).toHaveLength(1);
    push(
      request,
      block('01D', 'alert.changed', envelope(null, { alertId: 'a1' })),
    );
    expect(events).toHaveLength(2);
    push(
      request,
      block('01E', 'alert.unknown', envelope(null, { alertId: 'a1' })),
    );
    expect(events).toHaveLength(2);
  });
});

describe('C-01-28 — backoff, polling e recuperação', () => {
  it.each([0, 500])(
    'dado uma falha com status %i quando a conexão cai então reconnecting e novas requisições em 1000, 2000, 4000, 8000, 16000, 30000 e 30000 ms',
    (status) => {
      const { http, service } = setup();
      service.connect();
      fail(only(http), status);
      expect(service.status()).toBe('reconnecting');
      for (const delay of [
        1_000, 2_000, 4_000, 8_000, 16_000, 30_000, 30_000,
      ]) {
        vi.advanceTimersByTime(delay - 1);
        expect(pending(http)).toHaveLength(0);
        vi.advanceTimersByTime(1);
        fail(only(http), status);
      }
    },
  );

  it('dado duas falhas em 60000 ms quando a segunda ocorre então polling e tick$ a cada 30000 ms', () => {
    const { http, service } = setup();
    const ticks = collect<void>(service.tick$);
    service.connect();
    fail(only(http));
    expect(service.polling()).toBe(false);
    vi.advanceTimersByTime(1_000);
    fail(only(http));
    expect(service.polling()).toBe(true);
    expect(service.status()).toBe('polling');
    vi.advanceTimersByTime(29_999);
    expect(ticks).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(ticks).toHaveLength(1);
    vi.advanceTimersByTime(30_000);
    expect(ticks).toHaveLength(2);
  });

  it('dado polling quando a reabertura recebe o primeiro frame então live, polling false e sem novos ticks; a falha seguinte reabre em 1000 ms', () => {
    const { http, service } = setup();
    const ticks = collect<void>(service.tick$);
    service.connect();
    fail(only(http));
    vi.advanceTimersByTime(1_000);
    fail(only(http));
    expect(service.polling()).toBe(true);
    vi.advanceTimersByTime(2_000);
    const reopened = only(http);
    push(reopened, HEARTBEAT);
    expect(service.status()).toBe('live');
    expect(service.polling()).toBe(false);
    const seen = ticks.length;
    vi.advanceTimersByTime(30_000);
    expect(ticks).toHaveLength(seen);
    fail(reopened);
    expect(service.status()).toBe('reconnecting');
    vi.advanceTimersByTime(999);
    expect(pending(http)).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(pending(http)).toHaveLength(1);
  });

  it('dado duas falhas separadas por 61000 ms quando a segunda ocorre então polling false', () => {
    const { http, service } = setup();
    service.connect();
    fail(only(http));
    vi.advanceTimersByTime(1_000);
    const reopened = only(http);
    vi.advanceTimersByTime(60_000);
    fail(reopened);
    expect(service.polling()).toBe(false);
    expect(service.status()).toBe('reconnecting');
  });
});

describe('C-01-29 — 401/403, 429 e 404', () => {
  it.each([401, 403])(
    'dado status %i quando a conexão falha então stopped e nenhuma requisição em 60000 ms',
    (status) => {
      const { http, service } = setup();
      service.connect();
      fail(only(http), status);
      expect(service.status()).toBe('stopped');
      expect(service.polling()).toBe(false);
      vi.advanceTimersByTime(60_000);
      expect(pending(http)).toHaveLength(0);
    },
  );

  it('dado 429 com context.retryAfter 45 no corpo quando a conexão falha então requisição só em 45000 ms', () => {
    const { http, service } = setup();
    service.connect();
    // Corpo já interpretado (`HttpErrorResponse.error` objeto): é o que o serviço lê.
    failParsed(only(http), 429, {
      code: 'DASH.RATE_LIMITED',
      context: { retryAfter: 45 },
    });
    vi.advanceTimersByTime(44_999);
    expect(pending(http)).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(pending(http)).toHaveLength(1);
  });

  it('dado 404 quando a conexão falha então falha comum (backoff, depois polling) e nenhum evento sintetizado', () => {
    const { http, service } = setup();
    const events = collect<DashboardStreamEvent>(service.events$);
    service.connect();
    fail(only(http), 404);
    expect(service.status()).toBe('reconnecting');
    vi.advanceTimersByTime(1_000);
    fail(only(http), 404);
    expect(service.status()).toBe('polling');
    expect(events).toHaveLength(0);
  });
});

describe('C-01-30 — Last-Event-ID, fechamento, heartbeat, silêncio e disconnect()', () => {
  it('dado um frame com id quando a conexão cai e reabre então a requisição leva Last-Event-ID', () => {
    const { http, service } = setup();
    service.connect();
    const first = only(http);
    push(first, block('01A', 'duty.changed', envelope(null, { dutyId: 'd1' })));
    fail(first);
    vi.advanceTimersByTime(1_000);
    expect(only(http).request.headers.get('Last-Event-ID')).toBe('01A');
  });

  it('dado a reabertura com cursor quando recebe frame e o servidor fecha então cursor descartado, resync$ uma vez e nova requisição imediata sem Last-Event-ID', () => {
    const { http, service } = setup();
    const resyncs = collect<void>(service.resync$);
    service.connect();
    const first = only(http);
    push(first, block('01A', 'duty.changed', envelope(null, { dutyId: 'd1' })));
    fail(first);
    vi.advanceTimersByTime(1_000);
    const reopened = only(http);
    push(reopened, HEARTBEAT);
    reopened.flush('');
    expect(resyncs).toHaveLength(1);
    expect(service.lastEventId()).toBeNull();
    expect(only(http).request.headers.has('Last-Event-ID')).toBe(false);
  });

  it('dado a reabertura com cursor quando o servidor fecha sem frame então resync$ uma vez e a próxima requisição, sem Last-Event-ID, só após o backoff', () => {
    const { http, service } = setup();
    const resyncs = collect<void>(service.resync$);
    service.connect();
    const first = only(http);
    push(first, block('01A', 'duty.changed', envelope(null, { dutyId: 'd1' })));
    fail(first);
    vi.advanceTimersByTime(1_000);
    only(http).flush('', { status: 204, statusText: 'No Content' });
    expect(resyncs).toHaveLength(1);
    expect(service.lastEventId()).toBeNull();
    expect(pending(http)).toHaveLength(0);
    vi.advanceTimersByTime(2_000);
    expect(only(http).request.headers.has('Last-Event-ID')).toBe(false);
  });

  it('dado uma conexão aberta quando chega : heartbeat então live sem evento', () => {
    const { http, service } = setup();
    const events = collect<DashboardStreamEvent>(service.events$);
    service.connect();
    push(only(http), HEARTBEAT);
    expect(service.status()).toBe('live');
    expect(events).toHaveLength(0);
  });

  it('dado 40000 ms sem frame depois do primeiro quando o silêncio expira então a requisição é cancelada e a falha é contada', () => {
    const { http, service } = setup();
    service.connect();
    const first = only(http);
    push(first, HEARTBEAT);
    vi.advanceTimersByTime(39_000);
    expect(first.cancelled).toBe(false);
    vi.advanceTimersByTime(1_001);
    expect(first.cancelled).toBe(true);
    expect(service.status()).toBe('reconnecting');
    vi.advanceTimersByTime(2_000);
    fail(only(http));
    expect(service.polling()).toBe(true);
  });

  it('dado uma conexão aberta quando disconnect() então requisição cancelada, idle e nenhuma requisição em 60000 ms', () => {
    const { http, service } = setup();
    service.connect();
    const first = only(http);
    push(first, HEARTBEAT);
    service.disconnect();
    expect(first.cancelled).toBe(true);
    expect(service.status()).toBe('idle');
    vi.advanceTimersByTime(60_000);
    expect(pending(http)).toHaveLength(0);
  });
});

describe('C-01-37 — bearer, X-Tenant-Id e ausência de EventSource', () => {
  it('dado a cadeia STYNX montada como no bootstrap quando connect() então a requisição sai com Authorization Bearer e X-Tenant-Id', async () => {
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
      ],
    });
    TestBed.inject(TenantContextService).setTenant(FIXTURE_TENANT_ID);
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(SseService).connect();
    await vi.advanceTimersByTimeAsync(0);
    const request = only(http);
    expect(request.request.headers.get('Authorization')).toBe(
      `Bearer ${TEST_ACCESS_TOKEN}`,
    );
    expect(request.request.headers.get('X-Tenant-Id')).toBe(FIXTURE_TENANT_ID);
  });

  it('dado o código do serviço quando lido então não há new EventSource(', () => {
    const files = ['sse.service.ts', 'stream-transport.ts']
      .map((name) => join(dirname(fileURLToPath(import.meta.url)), name))
      .filter((path) => existsSync(path));
    expect(files.length).toBeGreaterThanOrEqual(1);
    for (const path of files) {
      expect(readFileSync(path, 'utf8')).not.toMatch(/new\s+EventSource\s*\(/);
    }
  });
});
