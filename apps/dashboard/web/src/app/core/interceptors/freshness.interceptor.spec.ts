// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "core/interceptors/freshness.interceptor.spec.ts"
// (C-02-33..37).
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { freshnessInterceptor } from './freshness.interceptor.js';
import { FreshnessStore } from '../freshness.store.js';

function setUp(): {
  http: HttpClient;
  mock: HttpTestingController;
  store: FreshnessStore;
} {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([freshnessInterceptor])),
      provideHttpClientTesting(),
    ],
  });
  return {
    http: TestBed.inject(HttpClient),
    mock: TestBed.inject(HttpTestingController),
    store: TestBed.inject(FreshnessStore),
  };
}

describe('core/interceptors/freshness.interceptor.ts', () => {
  it('dado GET /v1/dashboard/alerts respondido 200 com meta.freshness quando flushado então FreshnessStore publica e o corpo passa inalterado (C-02-33)', () => {
    const { http, mock, store } = setUp();
    const body = {
      data: [],
      meta: {
        freshness: {
          state: 'FRESCO',
          asOf: '2026-09-21T10:00:00-04:00',
          acceptableLatency: 'PT15M',
          source: 'prescription_risk',
        },
      },
    };
    let received: unknown;
    http.get('/v1/dashboard/alerts').subscribe((res) => (received = res));
    mock.expectOne('/v1/dashboard/alerts').flush(body);
    expect(store.freshnessOf('prescription_risk')()).toEqual(
      body.meta.freshness,
    );
    expect(store.violations()).toEqual([]);
    expect(received).toEqual(body);
    mock.verify();
  });

  it('dado GET /v1/dashboard/duties respondido 200 sem meta.freshness quando flushado então violação registrada e o corpo passa inalterado; nenhum console.* (C-02-34)', () => {
    const { http, mock, store } = setUp();
    let received: unknown;
    http.get('/v1/dashboard/duties').subscribe((res) => (received = res));
    mock
      .expectOne('/v1/dashboard/duties')
      .flush({ data: [] }, { headers: { 'x-request-id': 'req-1' } });
    expect(store.violations()).toHaveLength(1);
    expect(store.violations()[0].url).toContain('/v1/dashboard/duties');
    expect(store.violations()[0].requestId).toBe('req-1');
    expect(received).toEqual({ data: [] });
    mock.verify();
  });

  it('dado GET /v1/dashboard/duties respondido 200 sem header x-request-id quando flushado então violação com requestId null (C-02-34)', () => {
    const { http, mock, store } = setUp();
    http.get('/v1/dashboard/duties').subscribe();
    mock.expectOne('/v1/dashboard/duties').flush({ data: [] });
    expect(store.violations()[0].requestId).toBeNull();
    mock.verify();
  });

  it('dado GET /v1/dashboard/alerts respondido 503 DASH.SOURCE_UNAVAILABLE quando flushado então freshnessOf publica INDISPONIVEL e o erro é relançado (C-02-35, catálogo §7 linha 1)', () => {
    const { http, mock, store } = setUp();
    let error: unknown;
    http
      .get('/v1/dashboard/alerts')
      .subscribe({ error: (err) => (error = err) });
    mock.expectOne('/v1/dashboard/alerts').flush(
      {
        code: 'DASH.SOURCE_UNAVAILABLE',
        context: {
          source: 'pec_deadlines',
          lastSeenAt: '2026-09-21T09:00:00-04:00',
        },
      },
      { status: 503, statusText: 'Service Unavailable' },
    );
    expect(store.freshnessOf('pec_deadlines')()).toEqual({
      state: 'INDISPONIVEL',
      asOf: '2026-09-21T09:00:00-04:00',
      acceptableLatency: null,
      source: 'pec_deadlines',
    });
    expect(error).toBeDefined();
    expect((error as { status: number }).status).toBe(503);
    mock.verify();
  });

  it('dado POST /v1/dashboard/alerts/x/ack 200 sem meta, GET /v1/portal/x 200 sem meta e GET /v1/dashboard/stream quando flushados então nenhuma publicação/violação (C-02-36)', () => {
    const { http, mock, store } = setUp();
    http.post('/v1/dashboard/alerts/x/ack', {}).subscribe();
    mock.expectOne('/v1/dashboard/alerts/x/ack').flush({});
    http.get('/v1/portal/x').subscribe();
    mock.expectOne('/v1/portal/x').flush({});
    http.get('/v1/dashboard/stream', { responseType: 'text' }).subscribe();
    mock.expectOne('/v1/dashboard/stream').flush('');
    expect(store.violations()).toEqual([]);
    expect(store.sources()).toEqual([]);
    mock.verify();
  });

  it('dado 503 com outro código quando flushado então nada publicado e erro relançado (C-02-36)', () => {
    const { http, mock, store } = setUp();
    let error: unknown;
    http
      .get('/v1/dashboard/alerts')
      .subscribe({ error: (err) => (error = err) });
    mock
      .expectOne('/v1/dashboard/alerts')
      .flush({ code: 'DASH.INTERNAL' }, { status: 503, statusText: 'x' });
    expect(store.sources()).toEqual([]);
    expect(error).toBeDefined();
    mock.verify();
  });

  it('dado FreshnessStore quando publish duas metas da mesma source então devolve a última e o mesmo Signal; sources() sem repetição; reset() zera (C-02-37)', () => {
    TestBed.configureTestingModule({});
    const store = TestBed.inject(FreshnessStore);
    const signalA = store.freshnessOf('s1');
    store.publish({
      state: 'FRESCO',
      asOf: '2026-01-01T00:00:00-04:00',
      acceptableLatency: null,
      source: 's1',
    });
    store.publish({
      state: 'ATRASADO',
      asOf: '2026-01-02T00:00:00-04:00',
      acceptableLatency: null,
      source: 's1',
    });
    expect(store.freshnessOf('s1')).toBe(signalA);
    expect(signalA()?.state).toBe('ATRASADO');
    store.publish({
      state: 'FRESCO',
      asOf: '2026-01-01T00:00:00-04:00',
      acceptableLatency: null,
      source: 's2',
    });
    expect(store.sources()).toEqual(['s1', 's2']);
    store.reset();
    expect(store.sources()).toEqual([]);
    expect(store.violations()).toEqual([]);
    expect(store.freshnessOf('s1')()).toBeNull();
  });
});
