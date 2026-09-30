// R-0022 TASK-0003 (Inspector). Caracterização da costura SSE do TEAT web (W4) sobre STYNX
// 1.4.0: critérios C-01-38 e C-01-39 de `work/rounds/R-0022/contracts/CTG-0001.md`.
// C-01-38 vale nas duas fases (modo homologação: porta `TEAT_WEB_HOMOLOGATION_EVENTS`, sem HTTP).
// C-01-39 é o único `it.fails` da frente: defeito conhecido do TEAT web (`new EventSource(url)`
// sem bearer nem `X-Tenant-Id`, `sse.service.ts:67`); TASK-0020 (Inspector) o inverte depois de
// TASK-0008. Relógio falso do vitest; nenhuma rede real.
import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  type TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideStynxDefaults } from '@stynx-nyx/angular';
import { TenantContextService } from '@stynx-nyx/angular-tenancy';
import { EMPTY, Subject, type Observable } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TEAT_WEB_HOMOLOGATION_EVENTS,
  type TeatWebHomologationEvents,
} from '../shared/homologation-events.port.js';
import { TEAT_WEB_HOMOLOGATION } from '../shared/homologation-http.interceptor.js';
import { SseService } from './sse.service.js';

const STREAM_URL = '/v1/ops/stream';
const POLLING_MS = 15_000;
// Tenant canônico das fixtures (`rait-fixtures.md` §1, `am-fixtures`).
const FIXTURE_TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const TEST_ACCESS_TOKEN = 'test-access-token';

function homologationSetup(port: TeatWebHomologationEvents | null) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: TEAT_WEB_HOMOLOGATION, useValue: true },
      ...(port === null
        ? []
        : [{ provide: TEAT_WEB_HOMOLOGATION_EVENTS, useValue: port }]),
    ],
  });
  return {
    http: TestBed.inject(HttpTestingController),
    service: TestBed.inject(SseService),
  };
}

// Robustez (OD-R22-56, P-05-2 (a)): o caminho é comparado sem a query e a query é lida de
// `urlWithParams`, seja ela `HttpParams` ou parte da string da URL; o spec não exige `Accept`.
function pathOf(url: string): string {
  return url.split('?')[0] ?? url;
}

function queryParam(request: TestRequest, name: string): string | null {
  return new URL(
    request.request.urlWithParams,
    'http://localhost',
  ).searchParams.get(name);
}

function streamRequests(http: HttpTestingController): TestRequest[] {
  return http.match((request) => pathOf(request.url) === STREAM_URL);
}

/** Cadeia STYNX montada como no bootstrap: bearer e `X-Tenant-Id` pelo `HttpClient`. */
function chainSetup() {
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
  return {
    http: TestBed.inject(HttpTestingController),
    service: TestBed.inject(SseService),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('C-01-38 — modo homologação', () => {
  it('dado o modo homologação com a porta quando stream(opts) é assinado então a porta recebe as opções e nenhuma requisição HTTP ao fluxo sai', () => {
    const subject = new Subject<unknown>();
    const port: TeatWebHomologationEvents = {
      stream: vi.fn(() => subject as Observable<unknown>),
    };
    const { http, service } = homologationSetup(port);
    const options = { topics: ['homologation.refresh'] };
    const received: unknown[] = [];
    service.stream(options).subscribe((value) => received.push(value));
    expect(port.stream).toHaveBeenCalledTimes(1);
    expect(port.stream).toHaveBeenCalledWith(options);
    subject.next({ type: 'homologation.refresh', synthetic: true });
    expect(received).toEqual([
      { type: 'homologation.refresh', synthetic: true },
    ]);
    expect(service.homologationFallbackActive()).toBe(false);
    expect(streamRequests(http)).toHaveLength(0);
    http.expectNone(() => true);
  });

  it('dado o modo homologação quando a porta erra então homologationFallbackActive e fallback(opts) aos 15000 ms e a cada 15000 ms', () => {
    const subject = new Subject<unknown>();
    const fallback = vi.fn(() => EMPTY as Observable<unknown>);
    const port: TeatWebHomologationEvents = {
      stream: () => subject as Observable<unknown>,
      fallback,
    };
    const { http, service } = homologationSetup(port);
    const options = { topics: ['homologation.refresh'] };
    service.stream(options).subscribe();
    subject.error(new Error('demo-stream-unavailable'));
    expect(service.homologationFallbackActive()).toBe(true);
    vi.advanceTimersByTime(POLLING_MS - 1);
    expect(fallback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fallback).toHaveBeenCalledTimes(1);
    expect(fallback).toHaveBeenLastCalledWith(options);
    vi.advanceTimersByTime(POLLING_MS);
    expect(fallback).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(POLLING_MS);
    expect(fallback).toHaveBeenCalledTimes(3);
    http.expectNone(() => true);
  });

  it('dado o modo homologação sem a porta quando stream(opts) é assinado então completa vazio e nenhuma requisição HTTP sai', () => {
    const { http, service } = homologationSetup(null);
    const received: unknown[] = [];
    let completed = false;
    service.stream({ topics: ['homologation.refresh'] }).subscribe({
      next: (value) => received.push(value),
      complete: () => {
        completed = true;
      },
    });
    expect(completed).toBe(true);
    expect(received).toHaveLength(0);
    vi.advanceTimersByTime(POLLING_MS * 2);
    http.expectNone(() => true);
  });
});

describe('C-01-39 — bearer e X-Tenant-Id no fluxo do TEAT web', () => {
  // Controle: prova que a cadeia montada acima aplica bearer e tenant a uma requisição do
  // `HttpClient`; sem ele o `it.fails` abaixo poderia passar por falha de montagem.
  it('dado a cadeia STYNX quando o HttpClient pede o fluxo então a requisição leva Authorization Bearer e X-Tenant-Id', async () => {
    const { http } = chainSetup();
    TestBed.inject(HttpClient).get(STREAM_URL).subscribe();
    await vi.advanceTimersByTimeAsync(0);
    const [request] = streamRequests(http);
    expect(request?.request.headers.get('Authorization')).toBe(
      `Bearer ${TEST_ACCESS_TOKEN}`,
    );
    expect(request?.request.headers.get('X-Tenant-Id')).toBe(FIXTURE_TENANT_ID);
  });

  it.fails(
    'C-01-39 defeito conhecido (sse.service.ts:67, EventSource sem bearer nem X-Tenant-Id; inversão em TASK-0020): dado fora do modo homologação e EventSource presente quando stream({ topics }) é assinado então uma requisição GET imediata pelo HttpClient com Authorization Bearer, X-Tenant-Id e topics',
    async () => {
      class EventSourceDouble {
        onmessage: unknown = null;
        onerror: unknown = null;
        addEventListener = vi.fn();
        removeEventListener = vi.fn();
        close = vi.fn();
      }
      vi.stubGlobal('EventSource', EventSourceDouble);
      const { http, service } = chainSetup();
      service.stream({ topics: ['ops.refresh'] }).subscribe();
      await vi.advanceTimersByTimeAsync(0);
      const requests = streamRequests(http);
      expect(requests).toHaveLength(1);
      const [request] = requests;
      expect(request?.request.method).toBe('GET');
      expect(request && queryParam(request, 'topics')).toBe('ops.refresh');
      expect(request?.request.headers.get('Authorization')).toBe(
        `Bearer ${TEST_ACCESS_TOKEN}`,
      );
      expect(request?.request.headers.get('X-Tenant-Id')).toBe(
        FIXTURE_TENANT_ID,
      );
    },
  );
});
