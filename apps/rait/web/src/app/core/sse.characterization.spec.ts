// R-0022 TASK-0003 (Inspector). Caracterização da costura SSE do RAIT web (W1) sobre STYNX
// 1.4.0: critérios C-01-20…C-01-26 e C-01-37 de `work/rounds/R-0022/contracts/CTG-0001.md`.
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
import { SseService, type RaitStreamEvent } from './sse.service';

const STREAM_URL = '/v1/inf/rait/stream';
const DEFAULT_TOPICS = 'case,assignment,clock,session,agenda-item,batch';
// `rait-fixtures.md` §1: tenant canônico `am-fixtures`.
const FIXTURE_TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const TEST_ACCESS_TOKEN = 'test-access-token';
const CASE_CHANGED = ['rait', 'case.changed'].join('.');
const OUTBOX_CHANGED = ['rait', 'outbox.changed'].join('.');

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
  kind: string,
  id: string,
  version: number,
  data: Record<string, unknown> = {},
): string {
  return JSON.stringify({ aggregate: { kind, id, version }, data });
}

const HEARTBEAT = ': heartbeat\n\n';

function fail(request: TestRequest, status = 500): void {
  if (status === 0) request.error(new ProgressEvent('error'));
  else request.flush('', { status, statusText: `HTTP ${status}` });
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

describe('C-01-20 — connect() abre uma requisição pela fronteira HttpClient', () => {
  it('dado connect() sem opções quando chamado então uma requisição GET com Accept text/event-stream, os seis topics e sem Last-Event-ID', () => {
    const { http, service } = setup();
    service.connect();
    const request = only(http);
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Accept')).toBe('text/event-stream');
    expect(request.request.params.get('topics')).toBe(DEFAULT_TOPICS);
    expect(request.request.params.has('caseId')).toBe(false);
    expect(request.request.headers.has('Last-Event-ID')).toBe(false);
  });

  it('dado connect({ caseId, topics }) quando chamado então topics e caseId na query', () => {
    const { http, service } = setup();
    service.connect({ caseId: 'c1', topics: ['case'] });
    const request = only(http);
    expect(request.request.params.get('topics')).toBe('case');
    expect(request.request.params.get('caseId')).toBe('c1');
  });

  it('dado uma conexão ativa quando connect() repete as mesmas opções então nenhuma requisição nova', () => {
    const { http, service } = setup();
    service.connect({ caseId: 'c1', topics: ['case'] });
    only(http);
    service.connect({ caseId: 'c1', topics: ['case'] });
    expect(pending(http)).toHaveLength(0);
  });

  it('dado uma conexão ativa quando connect() traz opções diferentes então a anterior é cancelada e uma nova sai', () => {
    const { http, service } = setup();
    service.connect({ caseId: 'c1', topics: ['case'] });
    const first = only(http);
    service.connect({ caseId: 'c2', topics: ['case', 'clock'] });
    expect(first.cancelled).toBe(true);
    const second = only(http);
    expect(second.request.params.get('caseId')).toBe('c2');
    expect(second.request.params.get('topics')).toBe('case,clock');
  });
});

describe('C-01-21 — frames, catálogo e deduplicação', () => {
  it('dado um frame rait.case.changed quando chega então events$ emite case.changed com id, versão e data; lastEventId e status live', () => {
    const { http, service } = setup();
    const events = collect<RaitStreamEvent>(service.events$);
    service.connect();
    push(
      only(http),
      block(
        '01A',
        CASE_CHANGED,
        envelope('case', 'c1', 3, { caseId: 'c1', toState: 'X' }),
      ),
    );
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe('case.changed');
    expect(events[0]?.id).toBe('01A');
    expect(events[0]?.aggregate).toEqual({
      kind: 'case',
      id: 'c1',
      version: 3,
    });
    expect(events[0]?.data).toEqual({ caseId: 'c1', toState: 'X' });
    expect(service.lastEventId()).toBe('01A');
    expect(service.status()).toBe('live');
    expect(service.live()).toBe(true);
  });

  it('dado uma versão já vista do mesmo kind:id quando chega versão menor ou igual então não emite; versão maior emite', () => {
    const { http, service } = setup();
    const events = collect<RaitStreamEvent>(service.events$);
    service.connect();
    const request = only(http);
    push(request, block('01A', CASE_CHANGED, envelope('case', 'c1', 3)));
    push(request, block('01B', CASE_CHANGED, envelope('case', 'c1', 3)));
    push(request, block('01C', CASE_CHANGED, envelope('case', 'c1', 2)));
    expect(events).toHaveLength(1);
    expect(service.versionOf('case', 'c1')).toBe(3);
    push(request, block('01D', CASE_CHANGED, envelope('case', 'c1', 4)));
    expect(events).toHaveLength(2);
    push(request, block('01E', CASE_CHANGED, envelope('case', 'c2', 1)));
    expect(events).toHaveLength(3);
  });

  it('dado event sem prefixo, fora do catálogo ou data não-JSON quando chega então não emite e não lança', () => {
    const { http, service } = setup();
    const events = collect<RaitStreamEvent>(service.events$);
    service.connect();
    const request = only(http);
    expect(() => {
      push(request, block('01A', 'case.changed', envelope('case', 'c1', 1)));
      push(request, block('01B', OUTBOX_CHANGED, envelope('outbox', 'o1', 1)));
      push(request, block('01C', CASE_CHANGED, 'isto-nao-e-json'));
    }).not.toThrow();
    expect(events).toHaveLength(0);
  });

  it('dado uma conexão aberta quando chega : heartbeat então status live sem evento', () => {
    const { http, service } = setup();
    const events = collect<RaitStreamEvent>(service.events$);
    service.connect();
    push(only(http), HEARTBEAT);
    expect(service.status()).toBe('live');
    expect(events).toHaveLength(0);
  });
});

describe('C-01-22 — backoff depois de falha', () => {
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
});

describe('C-01-23 — polling e recuperação', () => {
  it('dado duas falhas em 60000 ms quando a segunda ocorre então polling e tick$ a cada 15000 ms', () => {
    const { http, service } = setup();
    const ticks = collect<void>(service.tick$);
    service.connect();
    fail(only(http));
    expect(service.polling()).toBe(false);
    vi.advanceTimersByTime(1_000);
    fail(only(http));
    expect(service.polling()).toBe(true);
    expect(service.status()).toBe('polling');
    expect(ticks).toHaveLength(0);
    vi.advanceTimersByTime(14_999);
    expect(ticks).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(ticks).toHaveLength(1);
    vi.advanceTimersByTime(15_000);
    expect(ticks).toHaveLength(2);
  });

  it('dado polling quando a reabertura no compasso do backoff recebe o primeiro frame então live, polling false e sem novos ticks', () => {
    const { http, service } = setup();
    const ticks = collect<void>(service.tick$);
    service.connect();
    fail(only(http));
    vi.advanceTimersByTime(1_000);
    fail(only(http));
    expect(service.polling()).toBe(true);
    vi.advanceTimersByTime(2_000);
    push(only(http), HEARTBEAT);
    expect(service.status()).toBe('live');
    expect(service.polling()).toBe(false);
    const seen = ticks.length;
    vi.advanceTimersByTime(60_000);
    expect(ticks).toHaveLength(seen);
  });

  it('dado uma falha e um frame na reabertura quando nova falha ocorre então o atraso volta a 1000 ms (backoff zerado pelo frame)', () => {
    const { http, service } = setup();
    service.connect();
    fail(only(http));
    vi.advanceTimersByTime(1_000);
    fail(only(http)); // 2ª falha: polling; próximo atraso 2000 ms.
    vi.advanceTimersByTime(2_000);
    const live = only(http);
    push(live, HEARTBEAT); // live: backoff e contador zerados.
    fail(live);
    vi.advanceTimersByTime(999);
    expect(pending(http)).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(pending(http)).toHaveLength(1);
  });

  it('dado duas falhas separadas por 61000 ms quando a segunda ocorre então polling false', () => {
    const { http, service } = setup();
    service.connect();
    fail(only(http));
    // A reabertura fica sem resposta; a janela de 60 s da 1ª falha expira.
    vi.advanceTimersByTime(61_000);
    const open = pending(http);
    expect(open.length).toBeGreaterThanOrEqual(1);
    fail(open[open.length - 1] as TestRequest);
    expect(service.polling()).toBe(false);
    expect(service.status()).toBe('reconnecting');
  });
});

describe('C-01-24 — 401/403 param; 429 respeita Retry-After', () => {
  it.each([401, 403])(
    'dado status %i quando a conexão falha então stopped, polling false e nenhuma requisição em 60000 ms',
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

  it('dado 429 com Retry-After 45 quando a conexão falha então nenhuma requisição antes de 45000 ms e uma em 45000 ms', () => {
    const { http, service } = setup();
    service.connect();
    only(http).flush('', {
      status: 429,
      statusText: 'Too Many Requests',
      headers: { 'Retry-After': '45' },
    });
    vi.advanceTimersByTime(44_999);
    expect(pending(http)).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(pending(http)).toHaveLength(1);
  });
});

describe('C-01-25 — Last-Event-ID e fechamento pelo servidor', () => {
  it('dado um frame com id quando a conexão cai e reabre então a requisição leva Last-Event-ID igual ao último id', () => {
    const { http, service } = setup();
    service.connect();
    const first = only(http);
    push(first, block('01A', CASE_CHANGED, envelope('case', 'c1', 1)));
    push(first, block('01B', CASE_CHANGED, envelope('case', 'c1', 2)));
    fail(first);
    vi.advanceTimersByTime(1_000);
    expect(only(http).request.headers.get('Last-Event-ID')).toBe('01B');
  });

  it.each([
    ['200 sem frame', { status: 200, statusText: 'OK' }],
    ['204', { status: 204, statusText: 'No Content' }],
  ])(
    'dado a reabertura com cursor quando o servidor fecha (%s) então nova requisição imediata sem Last-Event-ID, resync$ uma vez e nenhum evento sintetizado',
    (_label, init) => {
      const { http, service } = setup();
      const events = collect<RaitStreamEvent>(service.events$);
      const resyncs = collect<void>(service.resync$);
      service.connect();
      const first = only(http);
      push(first, block('01A', CASE_CHANGED, envelope('case', 'c1', 1)));
      fail(first);
      vi.advanceTimersByTime(1_000);
      const reopened = only(http);
      expect(reopened.request.headers.get('Last-Event-ID')).toBe('01A');
      reopened.flush('', init);
      const next = only(http);
      expect(next.request.headers.has('Last-Event-ID')).toBe(false);
      expect(resyncs).toHaveLength(1);
      expect(events).toHaveLength(1);
    },
  );
});

describe('C-01-26 — silêncio e disconnect()', () => {
  it('dado uma conexão viva sem frame por mais de 40000 ms quando o silêncio expira então a requisição é cancelada, a falha é contada e a reabertura respeita o backoff', () => {
    const { http, service } = setup();
    service.connect();
    const first = only(http);
    push(first, HEARTBEAT);
    vi.advanceTimersByTime(39_000);
    expect(first.cancelled).toBe(false);
    expect(service.status()).toBe('live');
    vi.advanceTimersByTime(1_001);
    expect(first.cancelled).toBe(true);
    expect(service.status()).toBe('reconnecting');
    expect(pending(http)).toHaveLength(0);
    vi.advanceTimersByTime(2_000);
    const reopened = only(http);
    // A falha por silêncio contou na janela: mais uma falha leva a polling.
    fail(reopened);
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
