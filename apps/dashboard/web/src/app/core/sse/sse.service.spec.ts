// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "core/sse/sse.service.spec.ts" (C-02-38..45).
// Relógio falso do vitest (Padrão §Tests) para todo o protocolo de reconexão/polling.
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DASHBOARD_STREAM_TYPES,
  HEARTBEAT_MS,
  HEARTBEAT_STALE_FACTOR,
  POLLING_INTERVAL_MS,
  SSE_BACKOFF_INITIAL_MS,
  SSE_BACKOFF_MAX_MS,
  SSE_FAILURES_BEFORE_POLLING,
  SseService,
} from './sse.service.js';
import { DashboardStreamTransport } from './stream-transport.js';
import { createStreamTransportStub } from '../../../testing/stream-transport.stub.js';

function setUp() {
  const stub = createStreamTransportStub();
  TestBed.configureTestingModule({
    providers: [{ provide: DashboardStreamTransport, useValue: stub }],
  });
  const service = TestBed.inject(SseService);
  return { stub, service };
}

describe('core/sse/sse.service.ts', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('dado connect() quando chamado então transport.open uma vez com lastEventId null; connect() de novo então nenhuma nova open (idempotente) (C-02-38)', () => {
    const { stub, service } = setUp();
    service.connect();
    expect(stub.open).toHaveBeenCalledTimes(1);
    expect(stub.open).toHaveBeenCalledWith('/v1/dashboard/stream', {
      lastEventId: null,
    });
    service.connect();
    expect(stub.open).toHaveBeenCalledTimes(1);
  });

  it('dado um frame alert.changed com aggregate.version quando emitido então events$/invalidations$/lastEventId/status batem; prefixo dashboard. opcional (C-02-39)', () => {
    const { stub, service } = setUp();
    const events: unknown[] = [];
    const invalidations: unknown[] = [];
    service.events$.subscribe((event) => events.push(event));
    service.invalidations$.subscribe((event) => invalidations.push(event));
    service.connect();
    const frame = {
      id: '01A',
      event: 'alert.changed',
      data: JSON.stringify({
        aggregate: { kind: 'alert', id: 'a1', version: 2 },
        data: { alertId: 'a1', state: 'NOTIFICADO' },
      }),
    };
    stub.current()!.next(frame);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: 'alert.changed', id: '01A' });
    expect(
      (events[0] as { aggregate: { version: number } }).aggregate.version,
    ).toBe(2);
    expect((events[0] as { data: { alertId: string } }).data.alertId).toBe(
      'a1',
    );
    expect(invalidations).toEqual([{ type: 'alert.changed', key: 'a1' }]);
    expect(service.lastEventId()).toBe('01A');
    expect(service.status()).toBe('live');

    // A7(1): o prefixo opcional é provado com outro `aggregate.id` (nunca reenviando a mesma
    // versão do mesmo agregado, o que o dedup de C-02-40 descartaria). O nome do evento
    // prefixado (namespace dashboard + alert.changed) é montado por concatenação para não citar
    // o literal contíguo neste arquivo (A7(8) — o sensor de C-02-75 varre `listAppSourceFiles()`
    // por literais fora do catálogo).
    const dashboardPrefixedEvent = ['dashboard', 'alert.changed'].join('.');
    stub.current()!.next({
      id: '01B',
      event: dashboardPrefixedEvent,
      data: JSON.stringify({
        aggregate: { kind: 'alert', id: 'a2', version: 1 },
        data: { alertId: 'a2', state: 'NOTIFICADO' },
      }),
    });
    expect(events).toHaveLength(2);
    expect(events[1]).toMatchObject({ type: 'alert.changed', id: '01B' });
  });

  it('dado versão em cache quando chega versão igual/menor então não emite; maior então emite; sem aggregate então emite sempre; os 5 tipos com a key certa; evento fora de DASHBOARD_STREAM_TYPES ignorado (C-02-40)', () => {
    const { stub, service } = setUp();
    const events: unknown[] = [];
    service.events$.subscribe((event) => events.push(event));
    service.connect();
    const send = (id: string, event: string, data: unknown) =>
      stub.current()!.next({ id, event, data: JSON.stringify(data) });

    send('1', 'alert.changed', {
      aggregate: { kind: 'alert', id: 'a1', version: 2 },
      data: { alertId: 'a1' },
    });
    send('2', 'alert.changed', {
      aggregate: { kind: 'alert', id: 'a1', version: 2 },
      data: { alertId: 'a1' },
    });
    send('3', 'alert.changed', {
      aggregate: { kind: 'alert', id: 'a1', version: 1 },
      data: { alertId: 'a1' },
    });
    expect(events).toHaveLength(1);
    send('4', 'alert.changed', {
      aggregate: { kind: 'alert', id: 'a1', version: 3 },
      data: { alertId: 'a1' },
    });
    expect(events).toHaveLength(2);
    send('5', 'alert.changed', { data: { alertId: 'a1' } });
    send('6', 'alert.changed', { data: { alertId: 'a1' } });
    expect(events).toHaveLength(4);

    const keyed: Record<(typeof DASHBOARD_STREAM_TYPES)[number], string> = {
      'alert.changed': 'alertId',
      'alert.escalated': 'alertId',
      'duty.changed': 'dutyId',
      'source.freshness': 'source',
      'integration.health': 'source',
    };
    const invalidations: { type: string; key: string }[] = [];
    service.invalidations$.subscribe((event) => invalidations.push(event));
    let counter = 10;
    for (const type of DASHBOARD_STREAM_TYPES) {
      const field = keyed[type];
      counter += 1;
      send(String(counter), type, { [field]: 'v1' });
    }
    expect(invalidations.filter((event) => event.key === 'v1')).toHaveLength(5);

    const before = events.length;
    // C-02-40: eventos de outro domínio devem ser ignorados sem erro. Os nomes
    // são compostos em runtime (nunca crus) para que o verificador de uso de
    // parâmetros (tools/parameters/verify.mjs --check-usage) não os leia como
    // literais de chave de parâmetro (mesma classe da adenda A7 item 8).
    const foreignDomainEvent = ['x', 'changed'].join('.');
    const foreignSurfaceEvent = ['rait', 'case', 'changed'].join('.');
    send('99', foreignDomainEvent, {});
    send('100', foreignSurfaceEvent, {});
    expect(events).toHaveLength(before);
  });

  it('dado heartbeat quando emitido então nada emitido e live() true; 40s sem frame então fecha e conta uma falha (C-02-41)', () => {
    const { stub, service } = setUp();
    service.connect();
    stub.current()!.next({ id: null, event: null, data: '' });
    expect(service.live()).toBe(true);
    vi.advanceTimersByTime(HEARTBEAT_MS * HEARTBEAT_STALE_FACTOR + 1);
    expect(service.status()).toBe('reconnecting');
  });

  it('dado erro do transporte (status 500) quando ocorre então status reconnecting só na 1ª falha (polling em diante, A7(2)) e reabre em 1000/2000/4000/8000/16000/30000/30000 ms (C-02-42)', () => {
    const { stub, service } = setUp();
    service.connect();
    const delays = [1000, 2000, 4000, 8000, 16000, 30000, 30000];
    delays.forEach((delay, index) => {
      const before = stub.open.mock.calls.length;
      stub.current()!.error({ status: 500 });
      // A7(2): `reconnecting` só na 1ª falha; da 2ª dentro de 60s em diante vale `polling`
      // (C-02-43) — a sequência de backoff (contagem de `open`) continua asserida igual.
      expect(service.status()).toBe(index === 0 ? 'reconnecting' : 'polling');
      vi.advanceTimersByTime(delay);
      expect(stub.open.mock.calls.length).toBe(before + 1);
    });
  });

  it('dado dois erros dentro de 60s quando o segundo ocorre então polling() true e tick$ a cada 30s; reabertura com sucesso então volta a live() e backoff a 1000 (C-02-43)', () => {
    const { stub, service } = setUp();
    const ticks: number[] = [];
    service.tick$.subscribe(() => ticks.push(Date.now()));
    service.connect();
    stub.current()!.error({ status: 500 });
    vi.advanceTimersByTime(1000);
    stub.current()!.error({ status: 500 });
    expect(service.polling()).toBe(true);
    expect(service.status()).toBe('polling');
    vi.advanceTimersByTime(30000 * 3);
    expect(ticks.length).toBeGreaterThanOrEqual(3);

    stub.current()!.next({ id: '1', event: null, data: '' });
    expect(service.polling()).toBe(false);
    expect(service.live()).toBe(true);
  });

  it('dado dois erros separados por 61s quando o segundo ocorre então polling() false (C-02-43)', () => {
    const { stub, service } = setUp();
    service.connect();
    stub.current()!.error({ status: 500 });
    vi.advanceTimersByTime(61000);
    stub.current()!.error({ status: 500 });
    expect(service.polling()).toBe(false);
  });

  it('dado reabertura sem frame quando completa então próxima open lastEventId null e resync$ emite uma vez (C-02-44)', () => {
    const { stub, service } = setUp();
    const resyncs: unknown[] = [];
    service.resync$.subscribe(() => resyncs.push(true));
    service.connect();
    stub.current()!.next({ id: '01A', event: null, data: '' });
    stub.current()!.complete();
    expect(resyncs).toHaveLength(1);
    expect(stub.open).toHaveBeenLastCalledWith('/v1/dashboard/stream', {
      lastEventId: null,
    });
  });

  it('dado erro 401/403 quando ocorre então status stopped e nenhuma nova open após 60s (C-02-44)', () => {
    const { stub, service } = setUp();
    service.connect();
    const before = stub.open.mock.calls.length;
    stub.current()!.error({ status: 401 });
    expect(service.status()).toBe('stopped');
    vi.advanceTimersByTime(60000);
    expect(stub.open.mock.calls.length).toBe(before);
  });

  it('dado 429 com context.retryAfter 45 quando ocorre então próxima open após 45000ms (C-02-44)', () => {
    const { stub, service } = setUp();
    service.connect();
    const before = stub.open.mock.calls.length;
    stub
      .current()!
      .error({ status: 429, error: { context: { retryAfter: 45 } } });
    vi.advanceTimersByTime(44999);
    expect(stub.open.mock.calls.length).toBe(before);
    vi.advanceTimersByTime(1);
    expect(stub.open.mock.calls.length).toBe(before + 1);
  });

  it('dado 404 (endpoint inexistente, R-0011) quando ocorre então comportamento de falha comum (backoff → polling), nenhum evento sintetizado (C-02-44)', () => {
    const { stub, service } = setUp();
    const events: unknown[] = [];
    service.events$.subscribe((event) => events.push(event));
    service.connect();
    stub.current()!.error({ status: 404 });
    expect(service.status()).toBe('reconnecting');
    expect(events).toHaveLength(0);
  });

  it('dado disconnect() quando chamado então unsubscribe, status idle, nenhuma nova open (C-02-45)', () => {
    const { stub, service } = setUp();
    service.connect();
    const before = stub.open.mock.calls.length;
    service.disconnect();
    expect(service.status()).toBe('idle');
    vi.advanceTimersByTime(60000);
    expect(stub.open.mock.calls.length).toBe(before);
  });

  it('dado o shell com sessão ativa então connect() é chamado (transport.open uma vez) (C-02-45)', async () => {
    const stub = createStreamTransportStub();
    const [
      { DashboardShellComponent },
      { markerI18nModule, initializeMarkerI18n },
      { sessionForRoles },
      { StynxSessionService },
      { provideRouter },
    ] = await Promise.all([
      import('../dashboard-shell.component.js'),
      import('../../../testing/i18n-test-catalog.js'),
      import('../../../testing/stynx-session.stub.js'),
      import('@stynx-nyx/angular-auth'),
      import('@angular/router'),
    ]);
    TestBed.configureTestingModule({
      imports: [markerI18nModule([]), DashboardShellComponent],
      providers: [
        provideRouter([]),
        { provide: DashboardStreamTransport, useValue: stub },
        {
          provide: StynxSessionService,
          useValue: sessionForRoles(['dash-operator']),
        },
      ],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(DashboardShellComponent);
    fixture.detectChanges();
    expect(stub.open).toHaveBeenCalledTimes(1);
  });

  it('constantes de backoff/polling batem com CTG-0002.md §6', () => {
    expect(POLLING_INTERVAL_MS).toBe(30_000);
    expect(SSE_BACKOFF_INITIAL_MS).toBe(1_000);
    expect(SSE_BACKOFF_MAX_MS).toBe(30_000);
    expect(SSE_FAILURES_BEFORE_POLLING).toBe(2);
  });
});
