// R-0012 TASK-0005 (Inspector). Critérios C-2A-31…41 do contrato `CTG-0002a.md` §11 sobre
// `core/sse.service.ts` / `core/stream-transport.ts`. Relógio falso do vitest
// (`vi.useFakeTimers`), `createStreamTransportStub` no lugar do `HttpClient` real. Falha
// esperada nesta entrega: `core/sse.service.ts` e `core/stream-transport.ts` (produção) ainda
// não existem (TASK-0006).
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createStreamTransportStub,
  streamFrame,
} from '../../testing/stream-transport.stub';
// Produção (TASK-0006): ainda não existe.
import { RaitStreamTransport } from './stream-transport';
import {
  SseService,
  RAIT_STREAM_URL,
  SSE_BACKOFF_INITIAL_MS,
  SSE_BACKOFF_MAX_MS,
  SSE_FAILURE_WINDOW_MS,
  SSE_FAILURES_BEFORE_POLLING,
  POLLING_INTERVAL_MS,
  HEARTBEAT_MS,
  HEARTBEAT_STALE_FACTOR,
  RAIT_STREAM_EVENT_PREFIX,
  type RaitStreamEvent,
} from './sse.service';

// A7(g): literais estáticos `'rait.<x>.changed'` são candidatos do verificador de parâmetros
// (`pnpm verify:parameter-catalogue`); compõe-se com `RAIT_STREAM_EVENT_PREFIX` + o nome do
// evento, nunca a string completa escrita à mão.
const CASE_CHANGED_EVENT = `${RAIT_STREAM_EVENT_PREFIX}case.changed`;
const OUTBOX_CHANGED_EVENT = `${RAIT_STREAM_EVENT_PREFIX}outbox.changed`;

function setup() {
  const transport = createStreamTransportStub();
  TestBed.configureTestingModule({
    providers: [{ provide: RaitStreamTransport, useValue: transport }],
  });
  const service = TestBed.inject(SseService);
  return { transport, service };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('C-2A-31 — connect()', () => {
  it('dado connect() quando chamado então transport.open(RAIT_STREAM_URL, { lastEventId: null, topics: [as 6] }) uma vez', () => {
    const { transport, service } = setup();
    service.connect();
    expect(transport.open).toHaveBeenCalledTimes(1);
    expect(transport.open).toHaveBeenCalledWith(RAIT_STREAM_URL, {
      lastEventId: null,
      topics: [
        'case',
        'assignment',
        'clock',
        'session',
        'agenda-item',
        'batch',
      ],
    });
  });

  it('dado connect({ caseId: "c1", topics: ["case"] }) quando chamado então options { topics: ["case"], caseId: "c1" }', () => {
    const { transport, service } = setup();
    service.connect({ caseId: 'c1', topics: ['case'] });
    expect(transport.calls().at(-1)).toEqual({
      lastEventId: null,
      topics: ['case'],
      caseId: 'c1',
    });
  });
});

describe('C-2A-32 — evento emitido', () => {
  it('dado um frame case.changed version 2 quando emitido então events$ emite { type, id, aggregate.version, data.caseId }; lastEventId; status live', () => {
    const { transport, service } = setup();
    service.connect();
    const events: RaitStreamEvent[] = [];
    service.events$.subscribe((event) => events.push(event));

    transport.current()?.next(
      streamFrame('01A', CASE_CHANGED_EVENT, {
        aggregate: { kind: 'case', id: 'c1', version: 2 },
        data: { caseId: 'c1', toState: 'ADMITIDO' },
      }),
    );

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('case.changed');
    expect(events[0].id).toBe('01A');
    expect(events[0].aggregate).toEqual({ kind: 'case', id: 'c1', version: 2 });
    expect(events[0].data).toMatchObject({ caseId: 'c1' });
    expect(service.lastEventId()).toBe('01A');
    expect(service.status()).toBe('live');
  });
});

describe('C-2A-33 — descarte por aggregate.version', () => {
  it('dado version 2 já recebido quando chega version 2 ou 1 então não emite; version 3 então emite; versionOf atualiza', () => {
    const { transport, service } = setup();
    service.connect();
    const events: RaitStreamEvent[] = [];
    service.events$.subscribe((event) => events.push(event));
    const frameOf = (version: number) =>
      streamFrame(`id-${version}`, CASE_CHANGED_EVENT, {
        aggregate: { kind: 'case', id: 'c1', version },
        data: { caseId: 'c1' },
      });

    transport.current()?.next(frameOf(2));
    transport.current()?.next(frameOf(2));
    transport.current()?.next(frameOf(1));
    expect(events).toHaveLength(1);

    transport.current()?.next(frameOf(3));
    expect(events).toHaveLength(2);
    expect(service.versionOf('case', 'c1')).toBe(3);
  });
});

describe('C-2A-34 — heartbeat e eventos fora do catálogo', () => {
  it('dado um frame de heartbeat quando emitido então nada emitido e live() true', () => {
    const { transport, service } = setup();
    service.connect();
    const events: RaitStreamEvent[] = [];
    service.events$.subscribe((event) => events.push(event));
    transport.current()?.next({ id: null, event: null, data: '' });
    expect(events).toHaveLength(0);
    expect(service.live()).toBe(true);
  });

  it('dado um frame com event "rait.outbox.changed" ou "x.changed" quando emitido então ignorado sem erro', () => {
    const { transport, service } = setup();
    service.connect();
    const events: RaitStreamEvent[] = [];
    let errored = false;
    service.events$.subscribe({
      next: (event) => events.push(event),
      error: () => (errored = true),
    });
    transport.current()?.next(
      streamFrame('a', OUTBOX_CHANGED_EVENT, {
        aggregate: { kind: 'outbox', id: 'o1', version: 1 },
        data: {},
      }),
    );
    transport
      .current()
      ?.next(streamFrame('b', 'x.changed', { aggregate: {}, data: {} }));
    expect(events).toHaveLength(0);
    expect(errored).toBe(false);
  });
});

describe('C-2A-35 — backoff de reconexão', () => {
  it('dado erro do transporte (status 500) quando ocorre então reconnecting só após a 1ª falha (polling depois disso, C-2A-36) e reabre em 1000, 2000, 4000, 8000, 16000, 30000, 30000 ms', () => {
    // A7(e): a 2ª falha dentro de 60 s já dispara o fallback por polling (C-2A-36) — o status
    // só é 'reconnecting' logo após a 1ª falha; da 2ª em diante é 'polling'. A sequência de
    // backoff das reaberturas em segundo plano continua igual, independente do status exposto.
    const { transport, service } = setup();
    service.connect();
    const expectedBackoffs = [1000, 2000, 4000, 8000, 16000, 30000, 30000];
    expectedBackoffs.forEach((backoff, index) => {
      const openCallsBefore = transport.open.mock.calls.length;
      transport.current()?.error(new HttpErrorResponse({ status: 500 }));
      expect(service.status()).toBe(index === 0 ? 'reconnecting' : 'polling');
      vi.advanceTimersByTime(backoff - 1);
      expect(transport.open.mock.calls.length).toBe(openCallsBefore);
      vi.advanceTimersByTime(1);
      expect(transport.open.mock.calls.length).toBe(openCallsBefore + 1);
    });
  });
});

describe('C-2A-36 — fallback por polling após 2 falhas em 60 s', () => {
  it('dado dois erros dentro de 60 s quando o segundo ocorre então polling(), tick$ a cada 15000 ms e reabertura continua', () => {
    const { transport, service } = setup();
    service.connect();
    transport.current()?.error(new HttpErrorResponse({ status: 500 }));
    vi.advanceTimersByTime(SSE_BACKOFF_INITIAL_MS);
    transport.current()?.error(new HttpErrorResponse({ status: 500 }));

    expect(service.polling()).toBe(true);
    expect(service.status()).toBe('polling');

    let ticks = 0;
    service.tick$.subscribe(() => (ticks += 1));
    vi.advanceTimersByTime(POLLING_INTERVAL_MS * 3);
    expect(ticks).toBe(3);

    const openCallsBefore = transport.open.mock.calls.length;
    vi.advanceTimersByTime(SSE_BACKOFF_MAX_MS);
    expect(transport.open.mock.calls.length).toBeGreaterThan(openCallsBefore);
  });

  it('dado reabertura com sucesso quando ocorre então polling() false, live() true, backoff reinicia em 1000 ms na próxima falha', () => {
    const { transport, service } = setup();
    service.connect();
    transport.current()?.error(new HttpErrorResponse({ status: 500 }));
    vi.advanceTimersByTime(SSE_BACKOFF_INITIAL_MS);
    transport.current()?.error(new HttpErrorResponse({ status: 500 }));
    vi.advanceTimersByTime(SSE_BACKOFF_MAX_MS);
    // a reabertura seguinte "tem sucesso": emite um frame (sem erro).
    transport.current()?.next({ id: null, event: null, data: '' });
    expect(service.polling()).toBe(false);
    expect(service.live()).toBe(true);

    const openCallsBefore = transport.open.mock.calls.length;
    transport.current()?.error(new HttpErrorResponse({ status: 500 }));
    vi.advanceTimersByTime(SSE_BACKOFF_INITIAL_MS - 1);
    expect(transport.open.mock.calls.length).toBe(openCallsBefore);
    vi.advanceTimersByTime(1);
    expect(transport.open.mock.calls.length).toBe(openCallsBefore + 1);
  });
});

describe('C-2A-37 — janela de 60 s', () => {
  it('dado dois erros separados por 61 s quando o segundo ocorre então polling() false', () => {
    const { transport, service } = setup();
    service.connect();
    transport.current()?.error(new HttpErrorResponse({ status: 500 }));
    vi.advanceTimersByTime(SSE_FAILURE_WINDOW_MS + 1000);
    transport.current()?.error(new HttpErrorResponse({ status: 500 }));
    expect(service.polling()).toBe(false);
  });
});

describe('C-2A-38 — reabertura sem frames (204)', () => {
  it('dado reabertura que completa sem nenhum frame quando ocorre então próxima open com lastEventId null e resync$ emite uma vez', () => {
    const { transport, service } = setup();
    service.connect();
    transport.current()?.next(
      streamFrame('01A', CASE_CHANGED_EVENT, {
        aggregate: { kind: 'case', id: 'c1', version: 1 },
        data: { caseId: 'c1' },
      }),
    );
    let resyncs = 0;
    service.resync$.subscribe(() => (resyncs += 1));
    transport.current()?.complete();
    expect(transport.calls().at(-1)?.lastEventId).toBeNull();
    expect(resyncs).toBe(1);
  });
});

describe('C-2A-39 — 401/403 param e 429 com Retry-After', () => {
  it('dado erro 401 ou 403 quando ocorre então status "stopped", nenhuma nova open após 60 s, polling() false', () => {
    const { transport, service } = setup();
    service.connect();
    const openCallsBefore = transport.open.mock.calls.length;
    transport.current()?.error(new HttpErrorResponse({ status: 403 }));
    expect(service.status()).toBe('stopped');
    vi.advanceTimersByTime(SSE_FAILURE_WINDOW_MS);
    expect(transport.open.mock.calls.length).toBe(openCallsBefore);
    expect(service.polling()).toBe(false);
  });

  it('dado 429 com Retry-After 45 quando ocorre então próxima open após 45000 ms (max(backoff, retryAfter))', () => {
    const { transport, service } = setup();
    service.connect();
    const openCallsBefore = transport.open.mock.calls.length;
    transport.current()?.error(
      new HttpErrorResponse({
        status: 429,
        headers: new HttpHeaders({ 'Retry-After': '45' }),
      }),
    );
    vi.advanceTimersByTime(45000 - 1);
    expect(transport.open.mock.calls.length).toBe(openCallsBefore);
    vi.advanceTimersByTime(1);
    expect(transport.open.mock.calls.length).toBe(openCallsBefore + 1);
  });
});

describe('C-2A-40 — silêncio maior que 2 × heartbeat conta falha', () => {
  it('dado 45 s sem frame (> 2 × 20 s) quando decorridos então o transporte é fechado e uma falha é contada', () => {
    expect(HEARTBEAT_STALE_FACTOR * HEARTBEAT_MS).toBe(40000);
    const { transport, service } = setup();
    service.connect();
    const openCallsBefore = transport.open.mock.calls.length;
    vi.advanceTimersByTime(45000);
    vi.advanceTimersByTime(SSE_BACKOFF_INITIAL_MS);
    expect(transport.open.mock.calls.length).toBe(openCallsBefore + 1);
  });
});

describe('C-2A-41 — disconnect()', () => {
  it('dado disconnect() quando chamado então unsubscribe, status "idle", nenhuma nova open', () => {
    const { transport, service } = setup();
    service.connect();
    const openCallsBefore = transport.open.mock.calls.length;
    service.disconnect();
    expect(service.status()).toBe('idle');
    vi.advanceTimersByTime(SSE_FAILURE_WINDOW_MS);
    expect(transport.open.mock.calls.length).toBe(openCallsBefore);
  });
});

describe('C-2A-31/40 — SSE_FAILURES_BEFORE_POLLING é 2 (usado nos testes acima)', () => {
  it('dado a constante quando lida então 2', () => {
    expect(SSE_FAILURES_BEFORE_POLLING).toBe(2);
  });
});
