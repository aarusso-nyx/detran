// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6/§8 — C-2B-65/66/67/80. Nenhuma linha na matriz
// §6.2 para esta página (mérito fica em `/colegiado/:orgao`). `RapporteurQueuePageComponent`
// (IU-RAIT-005) ainda não existe (TASK-0015): falha de módulo esperada.
import { describe, expect, it } from 'vitest';
import {
  commandRunnerStub,
  delegateListLoad,
  listFacadeStub,
  pageProviders,
  stubFacade,
} from '../../../../testing/facade.stub';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { SseService } from '../../../core/sse.service';
import { QueueFacade } from '../../../data/facades/queue.facade';
import type { RaitAssignment } from '../../../data/models';

function sseServiceStub(status: 'live' | 'polling') {
  return {
    status: () => status,
    polling: () => status === 'polling',
    live: () => status === 'live',
    connect: () => {},
  } as unknown as SseService;
}

function queueFacadeStub(items: readonly RaitAssignment[] = []) {
  const filaRelator = listFacadeStub(items);
  return stubFacade<QueueFacade>()({
    casosDaFila: (() => new Map()) as never,
    filaDefesa: listFacadeStub([]),
    filaRelator,
    loadRapporteurQueue: delegateListLoad(filaRelator),
    retomar: listFacadeStub([]),
    command: commandRunnerStub(),
  });
}

async function render(
  facade = queueFacadeStub(),
  sse: 'live' | 'polling' = 'live',
  query = '',
) {
  const harness = await createRaitRouterHarness(
    pageProviders('rait-rapporteur', [
      { provide: QueueFacade, useValue: facade },
      { provide: SseService, useValue: sseServiceStub(sse) },
    ]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('fila/recurso/:orgao')}${query}`,
  );
  return { harness, facade };
}

describe('RapporteurQueuePage — C-2B-65 (estados)', () => {
  it('dado filaRelator vazia quando renderizada então detran-empty-state', async () => {
    const { harness } = await render();
    expect(
      harness.routeNativeElement?.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('RapporteurQueuePage — C-2B-66 (banner) [presença + ausência]', () => {
  it('dado SseService "polling" então banner visível', async () => {
    const { harness } = await render(queueFacadeStub(), 'polling');
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).not.toBeNull();
  });

  it('dado SseService "live" então banner ausente [negativo]', async () => {
    const { harness } = await render(queueFacadeStub(), 'live');
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).toBeNull();
  });
});

describe('RapporteurQueuePage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?filtro=state:DISTRIBUIDO&pagina=2 então setQuery/load chamada', async () => {
    const { facade } = await render(
      queueFacadeStub(),
      'live',
      '?filtro=state:DISTRIBUIDO&pagina=2',
    );
    const calls = [
      ...facade.filaRelator.loadMock.mock.calls,
      ...facade.filaRelator.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('RapporteurQueuePage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render();
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
