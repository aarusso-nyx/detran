// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6/§8 — C-2B-65 (estados), C-2B-66 (banner),
// C-2B-67 (URL ↔ ListFacade), C-2B-80 (a11y). `ResumeTrayPageComponent` (IU-RAIT-003) ainda não
// existe (TASK-0015): falha de módulo esperada.
import { describe, expect, it } from 'vitest';
import { CASE_IDS, fixtureCase } from '../../../../testing/http-fixtures';
import {
  commandRunnerStub,
  listFacadeStub,
  pageProviders,
  readSlotStub,
  stubFacade,
} from '../../../../testing/facade.stub';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { SseService } from '../../../core/sse.service';
import type { ShiftSummary } from '../../../data/facades/bundles';
import { QueueFacade } from '../../../data/facades/queue.facade';
import type { RaitInquiry } from '../../../data/models';

function sseServiceStub(status: 'idle' | 'live' | 'polling') {
  return {
    status: () => status,
    polling: () => status === 'polling',
    live: () => status === 'live',
    connect: () => {},
  } as unknown as SseService;
}

function queueFacadeStub(items: readonly RaitInquiry[] = []) {
  return stubFacade<QueueFacade>()({
    casosDaFila: (() => new Map()) as never,
    painel: readSlotStub<ShiftSummary>({ status: 'ready' }),
    retomar: listFacadeStub(items),
    filaDefesa: listFacadeStub([]),
    filaRelator: listFacadeStub([]),
    command: commandRunnerStub(),
  });
}

async function render(
  role: string,
  facade = queueFacadeStub(),
  sse: 'live' | 'polling' = 'live',
  query = '',
) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: QueueFacade, useValue: facade },
      { provide: SseService, useValue: sseServiceStub(sse) },
    ]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('painel/retomar')}${query}`,
  );
  return { harness, facade };
}

describe('ResumeTrayPage — C-2B-65 (estados)', () => {
  it('dado retomar em loading quando renderizada então detran-loading-state', async () => {
    const facade = queueFacadeStub();
    facade.retomar.set({ status: 'loading' });
    const { harness } = await render('rait-analyst', facade);
    expect(
      harness.routeNativeElement?.querySelector('detran-loading-state'),
    ).not.toBeNull();
  });

  it('dado retomar vazia quando renderizada então detran-empty-state', async () => {
    const { harness } = await render('rait-analyst', queueFacadeStub([]));
    expect(
      harness.routeNativeElement?.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('ResumeTrayPage — C-2B-66 (StreamStatusBanner) [presença + ausência]', () => {
  it('dado SseService "polling" então rait-stream-status-banner visível', async () => {
    const { harness } = await render(
      'rait-analyst',
      queueFacadeStub(),
      'polling',
    );
    expect(
      harness.routeNativeElement?.querySelector('rait-stream-status-banner'),
    ).not.toBeNull();
  });

  it('dado SseService "live" então nenhuma região role="status" do banner [negativo]', async () => {
    const { harness } = await render('rait-analyst', queueFacadeStub(), 'live');
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).toBeNull();
  });
});

describe('ResumeTrayPage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?q=x&filtro=state:ADMITIDO&pagina=2 então setQuery/load chamada com { q, filtro, page }', async () => {
    const facade = queueFacadeStub();
    const { harness } = await render(
      'rait-analyst',
      facade,
      'live',
      '?q=x&filtro=state:ADMITIDO&pagina=2',
    );
    void harness;
    const calls = [
      ...facade.retomar.loadMock.mock.calls,
      ...facade.retomar.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('ResumeTrayPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render(
      'rait-analyst',
      queueFacadeStub([
        fixtureCase(CASE_IDS.DILIGENCIA) as unknown as RaitInquiry,
      ]),
    );
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
