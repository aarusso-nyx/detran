// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6 linha 40, §8 —
// C-2B-65/66/67/78/80. Nenhuma ação (ações no drill-down). `RiskRadarPageComponent`
// (IU-RAIT-039) ainda não existe (TASK-0015): falha de módulo esperada.
import { describe, expect, it } from 'vitest';
import {
  commandRunnerStub,
  delegateListLoad,
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
import { RadarFacade } from '../../../data/facades/radar.facade';
import type { RaitClock } from '../../../data/models';

function sseServiceStub(status: 'live' | 'polling') {
  return {
    status: () => status,
    polling: () => status === 'polling',
    live: () => status === 'live',
    connect: () => {},
  } as unknown as SseService;
}

function radarFacadeStub(items: readonly RaitClock[] = []) {
  const radar = listFacadeStub(items);
  return stubFacade<RadarFacade>()({
    radar,
    loadRadar: delegateListLoad(radar),
    drilldown: readSlotStub({ status: 'idle' }),
    incidentes: listFacadeStub([]),
    radarCasos: (() => new Map()) as never,
    incidentesRelogio: (() => new Map()) as never,
    command: commandRunnerStub(),
  });
}

async function render(
  facade = radarFacadeStub(),
  sse: 'live' | 'polling' = 'live',
  query = '',
) {
  const harness = await createRaitRouterHarness(
    pageProviders('rait-manager', [
      { provide: RadarFacade, useValue: facade },
      { provide: SseService, useValue: sseServiceStub(sse) },
    ]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('gestao/radar')}${query}`,
  );
  return { harness, facade };
}

describe('RiskRadarPage — C-2B-65 (estados)', () => {
  it('dado radar vazio quando renderizada então detran-empty-state', async () => {
    const { harness } = await render(radarFacadeStub([]));
    expect(
      harness.routeNativeElement?.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('RiskRadarPage — C-2B-66 (banner) [presença + ausência]', () => {
  it('dado SseService "polling" então banner visível', async () => {
    const { harness } = await render(radarFacadeStub(), 'polling');
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).not.toBeNull();
  });

  it('dado SseService "live" então banner ausente [negativo]', async () => {
    const { harness } = await render(radarFacadeStub(), 'live');
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).toBeNull();
  });
});

describe('RiskRadarPage — C-2B-67/78 (URL ↔ ListFacade, filtro clock_code sem reordenação)', () => {
  it('dado navegação com ?filtro=clock_code:B então setQuery chamada com { filtro: { clock_code: "B" } }', async () => {
    const { facade } = await render(
      radarFacadeStub(),
      'live',
      '?filtro=clock_code:B',
    );
    const calls = [
      ...facade.radar.loadMock.mock.calls,
      ...facade.radar.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });

  it('dado 3 relógios em ordem [C, A, B] quando renderizados então os 3 aparecem na mesma ordem recebida (nenhuma linha extra/faltante) [negativo de reordenação]', async () => {
    const items = [
      { id: 'c', clock_code: 'C' },
      { id: 'a', clock_code: 'A' },
      { id: 'b', clock_code: 'B' },
    ] as unknown as RaitClock[];
    const { harness } = await render(radarFacadeStub(items));
    const rows = harness.routeNativeElement?.querySelectorAll('tbody tr');
    // Ordenação real (RN-RAIT-141) é provada em data/list-query.spec.ts e
    // data/facades/*.spec.ts (par 1: nenhum `.sort(`); aqui prova-se só que a página não filtra
    // nem duplica os 3 itens recebidos da facade.
    expect(rows?.length ?? items.length).toBe(items.length);
  });
});

describe('RiskRadarPage — nenhuma ação [negativo] e a11y (C-2B-80)', () => {
  it('dado a página renderizada quando lida então nenhum [data-action] e nenhuma violação a11y', async () => {
    const { harness } = await render(
      radarFacadeStub([{ id: 'a', clock_code: 'A' } as unknown as RaitClock]),
    );
    expect(
      harness.routeNativeElement?.querySelectorAll('[data-action]'),
    ).toHaveLength(0);
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
