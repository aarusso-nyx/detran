// R-0014 TASK-0017 (Inspector). CTG-0003c §4.1 — `RealtimeService`; arquivo inteiramente novo
// (§1) — "Cannot find module" até TASK-0018 (esperado, §9). `PortalStreamTransport` é substituído
// por `useValue` (stub de `src/testing/portal-stream-transport.stub.ts`, `Subject<StreamFrame>`
// por chamada de `open()`); `SessionFacade` por `createSessionFacadeStub` (par 1). `vi.useFakeTimers()`
// para os 60 000 ms do polling (§4.1 e); `TestBed.tick()` flusha o `effect()` de
// `SessionFacade.active()` (zoneless — mesmo padrão de `session.facade.spec.ts` C-3a-43).
import { TestBed } from '@angular/core/testing';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RealtimeService,
  PortalStreamTransport,
  PORTAL_STREAM_URL,
  PORTAL_STREAM_TYPES,
  POLLING_INTERVAL_MS,
} from './realtime.service'; // §9: importação direta força "Cannot find module" (esperado até TASK-0018).
import { SessionFacade } from './session.facade';
import { createSessionFacadeStub } from '../../testing/session-facade.stub';
import {
  createPortalStreamTransportStub,
  streamFrame,
} from '../../testing/portal-stream-transport.stub';
import { portalErrorBody } from '../../testing/http-fixtures-pair3';

function setup(active = true) {
  const transport = createPortalStreamTransportStub();
  const sessionFacade = createSessionFacadeStub({ active });
  TestBed.configureTestingModule({
    providers: [
      RealtimeService,
      { provide: PortalStreamTransport, useValue: { open: transport.open } },
      { provide: SessionFacade, useValue: sessionFacade },
    ],
  });
  return {
    // RealtimeService ainda não existe (§9); cast documenta a assinatura assumida (§4.1).
    service: TestBed.inject(RealtimeService) as any,
    transport,
    sessionFacade,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('RealtimeService — start() (§4.1)', () => {
  it('dado start() com sessão ativa então o transporte é aberto em PORTAL_STREAM_URL com os quatro topics e sem Last-Event-ID; status connecting → live no primeiro frame/comentário', async () => {
    // C-3c-70
    const { service, transport } = setup(true);
    service.start();
    TestBed.tick();
    expect(transport.open).toHaveBeenCalledTimes(1);
    expect(transport.open.mock.calls[0]?.[0]).toBe(PORTAL_STREAM_URL);
    expect(transport.open.mock.calls[0]?.[1]).toEqual({
      lastEventId: null,
      topics: PORTAL_STREAM_TYPES,
    });
    expect(service.status()).toBe('connecting');
    transport.current()!.next(streamFrame(null, null, ''));
    await vi.waitFor(() => expect(service.status()).toBe('live'));
  });
});

describe('RealtimeService — on() (§4.1 a/c)', () => {
  it("dado um frame id 01A event request.changed data { data: { requestId: 'r1', situation: 'PROTOCOLADO' } } então on('request.changed') emite id 01A e data.requestId r1; lastEventId() 01A", async () => {
    // C-3c-71
    const { service, transport } = setup(true);
    const received: unknown[] = [];
    service
      .on('request.changed')
      .subscribe((event: unknown) => received.push(event));
    service.start();
    TestBed.tick();
    transport.current()!.next(
      streamFrame('01A', 'request.changed', {
        data: { requestId: 'r1', situation: 'PROTOCOLADO' },
      }),
    );
    await vi.waitFor(() => expect(received.length).toBe(1));
    expect((received[0] as { id: string }).id).toBe('01A');
    expect(
      (received[0] as { data: { requestId: string } }).data.requestId,
    ).toBe('r1');
    expect(service.lastEventId()).toBe('01A');
  });
});

describe('RealtimeService — frame desconhecido/inválido (§4.1 b) [negativo]', () => {
  it('dado um frame com event unknown.type e um com data não-JSON então nada é emitido e o serviço não lança', async () => {
    // C-3c-72
    const { service, transport } = setup(true);
    const receivedAny: unknown[] = [];
    for (const type of PORTAL_STREAM_TYPES) {
      service.on(type).subscribe((event: unknown) => receivedAny.push(event));
    }
    service.start();
    TestBed.tick();
    expect(() => {
      transport.current()!.next(streamFrame('x1', 'unknown.type', {}));
      transport.current()!.next({
        id: 'x2',
        event: 'inbox.item',
        data: '{not-json',
      });
    }).not.toThrow();
    // `vi.useFakeTimers()` está ativo neste arquivo (beforeEach) — um `setTimeout(0)` real nunca
    // dispara; `vi.advanceTimersByTimeAsync(0)` avança os timers falsos e drena microtasks.
    await vi.advanceTimersByTimeAsync(0);
    expect(receivedAny.length).toBe(0);
  });
});

describe('RealtimeService — queda do transporte → polling (§4.1 e)', () => {
  it('dado o transporte completar (status 0) então status polling e tick emite após 60 000 ms e a cada 60 000 ms; a cada tick uma nova open() com Last-Event-ID do último id', async () => {
    // C-3c-73
    const { service, transport } = setup(true);
    const ticks: unknown[] = [];
    service.tick.subscribe(() => ticks.push(null));
    service.start();
    TestBed.tick();
    transport.current()!.next(streamFrame('id-1', 'inbox.item', { data: {} }));
    await vi.waitFor(() => expect(service.status()).toBe('live'));
    transport.current()!.complete();
    await vi.waitFor(() => expect(service.status()).toBe('polling'));
    expect(ticks.length).toBe(0);

    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MS);
    expect(ticks.length).toBe(1);
    expect(transport.open).toHaveBeenCalledTimes(2);
    expect(transport.open.mock.calls[1]?.[1]).toEqual({
      lastEventId: 'id-1',
      topics: PORTAL_STREAM_TYPES,
    });

    // Segunda conexão cai sem nunca ter recebido frame algum (§4.1 d: modela o 204 na
    // reabertura — cursor fora da janela de 24h).
    transport.current()!.complete();
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MS);
    expect(ticks.length).toBe(2);
    expect(transport.open).toHaveBeenCalledTimes(3);
  });
});

describe('RealtimeService — reabertura sem frame (204; §4.1 d) [negativo: nenhum evento sintetizado]', () => {
  it('dado a reabertura completar sem nenhum frame recebido então a PRÓXIMA open() vai SEM Last-Event-ID', async () => {
    // C-3c-74
    const { service, transport } = setup(true);
    service.start();
    TestBed.tick();
    transport.current()!.next(streamFrame('id-1', 'inbox.item', { data: {} }));
    await vi.waitFor(() => expect(service.status()).toBe('live'));
    transport.current()!.complete();
    await vi.waitFor(() => expect(service.status()).toBe('polling'));

    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MS);
    expect(transport.open.mock.calls[1]?.[1].lastEventId).toBe('id-1');
    // Reabertura #2: nenhum frame chega antes de completar (204 — cursor rejeitado).
    transport.current()!.complete();

    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MS);
    expect(transport.open).toHaveBeenCalledTimes(3);
    expect(transport.open.mock.calls[2]?.[1].lastEventId).toBeNull();
  });
});

describe('RealtimeService — 429 RATE_LIMITED (§4.1 e; OD-P45)', () => {
  it('dado open() errar 429 RATE_LIMITED{retryAfter:120} então lastError.messageKey rate_limited, status polling e a próxima open() só após 120 000 ms', async () => {
    // C-3c-75
    const { service, transport } = setup(true);
    service.start();
    TestBed.tick();
    transport.current()!.error(
      Object.assign(new Error('429'), {
        status: 429,
        error: portalErrorBody('PORTAL.RATE_LIMITED', 429, { retryAfter: 120 }),
      }),
    );
    await vi.waitFor(() => expect(service.status()).toBe('polling'));
    expect(service.lastError()?.messageKey).toBe('portal.errors.rate_limited');

    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MS);
    expect(transport.open).toHaveBeenCalledTimes(1); // ainda não: só após 120s (>= 60s)

    await vi.advanceTimersByTimeAsync(120_000 - POLLING_INTERVAL_MS);
    expect(transport.open).toHaveBeenCalledTimes(2);
  });
});

describe('RealtimeService — 401 (§4.1 f) [negativo: nenhuma nova tentativa]', () => {
  it('dado open() errar 401 então status stopped e nenhuma nova tentativa mesmo após 60 000 ms', async () => {
    // C-3c-76
    const { service, transport } = setup(true);
    service.start();
    TestBed.tick();
    transport.current()!.error(
      Object.assign(new Error('401'), {
        status: 401,
        error: portalErrorBody('PORTAL.AUTH_REQUIRED', 401),
      }),
    );
    await vi.waitFor(() => expect(service.status()).toBe('stopped'));
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MS * 2);
    expect(transport.open).toHaveBeenCalledTimes(1);
  });
});

describe('RealtimeService — SessionFacade.active() (§4.1 g)', () => {
  it('dado active() passar a false então stop() e status stopped; voltar a true com assinante ativo então start()', async () => {
    // C-3c-77
    const { service, transport, sessionFacade } = setup(true);
    service.on('inbox.item').subscribe(() => {});
    service.start();
    TestBed.tick();
    expect(transport.open).toHaveBeenCalledTimes(1);

    sessionFacade.activeSignal.set(false);
    TestBed.tick();
    await vi.waitFor(() => expect(service.status()).toBe('stopped'));

    sessionFacade.activeSignal.set(true);
    TestBed.tick();
    await vi.waitFor(() => expect(transport.open).toHaveBeenCalledTimes(2));
  });
});

describe('RealtimeService — análise estática (§4.1; [DIVERGE-1])', () => {
  it('dado o código de core/realtime.service.ts então não contém new EventSource nem outro número além de 60_000 para intervalo', async () => {
    // C-3c-78
    const dir = dirname(fileURLToPath(import.meta.url));
    const source = await readFile(join(dir, 'realtime.service.ts'), 'utf8');
    expect(source.includes('new EventSource')).toBe(false);
    // A12(g): POLLING_INTERVAL_SECONDS = POLLING_INTERVAL_MS / MS_PER_SECOND — o literal 1000 é
    // a constante de unidade `MS_PER_SECOND`, não um segundo intervalo; excluído da varredura por
    // linha (nunca pelo valor, para não mascarar um 1000 real usado como intervalo).
    const nonUnitLines = source
      .split('\n')
      .filter((line) => !/\bMS_PER_SECOND\s*=/.test(line));
    const numericLiterals =
      nonUnitLines.join('\n').match(/\b\d[\d_]*\b/g) ?? [];
    const intervalLiterals = numericLiterals.filter(
      (literal) => Number(literal.replace(/_/g, '')) > 1000,
    );
    expect(new Set(intervalLiterals)).toEqual(new Set(['60_000']));
  });
});
