// R-0022 TASK-0019 (Inspector). Critérios C-05-09 e C-05-10 de
// `work/rounds/R-0022/contracts/CTG-0005.md` §6 para o TEAT web: o `SseService` fino sobre o
// `provideStynxEventStream` de `@stynx-nyx/angular` 1.5.0. VERMELHO ESPERADO até TASK-0008: hoje o
// serviço usa `EventSource`/`timer` próprios e nunca abre conexão pelo `HttpClient`, então nenhuma
// conexão chega ao transporte (a lista está em `work/rounds/R-0022/reports/TASK-0019.expected-red.txt`).
//
// Montagem só com símbolos publicados de 1.5.0: `FakeStynxEventStreamTransport`
// (`@stynx-nyx/angular/testing`) atrás do `HttpClient` que o `HttpStynxEventStreamTransport`
// publicado usa (`http.get(url, { headers: Last-Event-ID, context })`); sessão pelo
// `createStynxSessionStub` (`@stynx-nyx/angular-auth/testing`) e tenant pelo `TenantContextService`
// real (`provideTenancy`). O relógio é o do vitest: a configuração do fluxo é do app e o contrato
// não prevê um ponto de injeção do `FakeStynxEventStreamClock` (ver relatório da tarefa).
// Suposição de CTG-0005 §3: `sessionActive` do TEAT web = `StynxSessionService.active`.
import {
  HttpClient,
  type HttpContext,
  type HttpHeaders,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  createStynxSessionStub,
  provideStynxSessionStub,
} from '@stynx-nyx/angular-auth/testing';
import { FakeStynxEventStreamTransport } from '@stynx-nyx/angular/testing';
import {
  provideTenancy,
  TenantContextService,
} from '@stynx-nyx/angular-tenancy';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SseService } from './sse.service.js';

const STREAM_PATH = '/v1/ops/stream';
const TOPIC = 'ops.refresh';
// Tenants: canônico das fixtures (`rait-fixtures.md` §1) e o segundo tenant já usado nos specs
// de isolamento do backend (`…a002`).
const TENANT_A = '00000000-0000-7000-8000-00000000a001';
const TENANT_B = '00000000-0000-7000-8000-00000000a002';
const FIRST_FRAME = `id: evt-1\nevent: ${TOPIC}\ndata: {"kind":"${TOPIC}"}\n\n`;
const RECONNECT_WINDOW_MS = 30_000;

function pathOf(url: string): string {
  return url.split('?')[0] ?? url;
}

function setup() {
  const transport = new FakeStynxEventStreamTransport();
  const session = createStynxSessionStub({ active: true });
  const httpBridge = {
    get: (
      url: string,
      options: { headers: HttpHeaders; context: HttpContext },
    ) =>
      transport.connect({
        url,
        lastEventId: options.headers.get('Last-Event-ID'),
        context: options.context,
      }),
  };
  TestBed.configureTestingModule({
    providers: [
      provideTenancy(),
      provideStynxSessionStub(session),
      { provide: HttpClient, useValue: httpBridge },
    ],
  });
  const tenant = TestBed.inject(TenantContextService);
  tenant.setTenant(TENANT_A);
  return { transport, session, tenant, service: TestBed.inject(SseService) };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('C-05-09 — troca de tenant no fluxo do TEAT web (UPS-NGSSE-08)', () => {
  it('dado o fluxo aberto com cursor quando o tenant muda em TenantContextService então a conexão é cancelada e reaberta sem Last-Event-ID', async () => {
    const { transport, tenant, service } = setup();
    const received: unknown[] = [];
    service.stream({ topics: [TOPIC] }).subscribe((value) => {
      received.push(value);
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(transport.connections).toHaveLength(1);
    expect(pathOf(transport.connections[0]!.request.url)).toBe(STREAM_PATH);
    expect(transport.connections[0]!.request.lastEventId).toBeNull();

    // Controle: com cursor `evt-1`, uma queda do transporte sem troca de tenant reabre
    // levando `Last-Event-ID`; sem ele a asserção final poderia passar sem cursor algum.
    transport.emitProgress(FIRST_FRAME);
    expect(received).toHaveLength(1);
    transport.close();
    await vi.advanceTimersByTimeAsync(RECONNECT_WINDOW_MS);
    expect(transport.connections).toHaveLength(2);
    expect(transport.connections[1]!.request.lastEventId).toBe('evt-1');

    tenant.setTenant(TENANT_B);
    await vi.advanceTimersByTimeAsync(0);
    expect(transport.connections[1]!.cancelled).toBe(true);
    expect(transport.connections).toHaveLength(3);
    expect(pathOf(transport.connections[2]!.request.url)).toBe(STREAM_PATH);
    expect(transport.connections[2]!.request.lastEventId).toBeNull();
  });
});

describe('C-05-10 — logout no fluxo do TEAT web', () => {
  it('dado o fluxo aberto quando sessionActive passa a falso (logout) então a requisição é cancelada e nenhuma outra sai', async () => {
    const { transport, session, service } = setup();
    service.stream({ topics: [TOPIC] }).subscribe();
    await vi.advanceTimersByTimeAsync(0);
    expect(transport.connections).toHaveLength(1);
    expect(transport.connections[0]!.cancelled).toBe(false);

    session.deactivate();
    TestBed.tick();
    await vi.advanceTimersByTimeAsync(0);
    expect(transport.connections[0]!.cancelled).toBe(true);

    await vi.advanceTimersByTimeAsync(RECONNECT_WINDOW_MS * 4);
    expect(transport.connections).toHaveLength(1);
  });
});
