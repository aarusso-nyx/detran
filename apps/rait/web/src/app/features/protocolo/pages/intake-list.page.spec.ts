// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 18, §8 —
// C-2B-65/66/67/80. Nenhuma ação de comando (só link para /protocolo/novo).
// `IntakeListPageComponent` (IU-RAIT-019) ainda não existe (TASK-0015): falha de módulo esperada.
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
import { CASE_IDS, fixtureCase } from '../../../../testing/http-fixtures';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { SseService } from '../../../core/sse.service';
import { ProtocolFacade } from '../../../data/facades/protocol.facade';
import type { RaitCase } from '../../../data/models';

function sseServiceStub(status: 'live' | 'polling') {
  return {
    status: () => status,
    polling: () => status === 'polling',
    live: () => status === 'live',
    connect: () => {},
  } as unknown as SseService;
}

function protocolFacadeStub(items: readonly RaitCase[] = []) {
  const intake = listFacadeStub(items);
  return stubFacade<ProtocolFacade>()({
    intake,
    loadIntake: delegateListLoad(intake),
    pendencias: listFacadeStub([]),
    remessas: listFacadeStub([]),
    redirecionamentos: listFacadeStub([]),
    desistenciaCaso: readSlotStub({ status: 'idle' }),
    pendenciasCaso: (() => new Map()) as never,
    remessasPrazo: (() => new Map()) as never,
    command: commandRunnerStub(),
  });
}

async function render(
  facade = protocolFacadeStub(),
  sse: 'live' | 'polling' = 'live',
  query = '',
) {
  const harness = await createRaitRouterHarness(
    pageProviders('rait-secretary', [
      { provide: ProtocolFacade, useValue: facade },
      { provide: SseService, useValue: sseServiceStub(sse) },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams('protocolo')}${query}`);
  return { harness, facade };
}

describe('IntakeListPage — C-2B-65 (estados)', () => {
  it('dado intake em loading quando renderizada então detran-loading-state', async () => {
    const facade = protocolFacadeStub();
    facade.intake.set({ status: 'loading' });
    const { harness } = await render(facade);
    expect(
      harness.routeNativeElement?.querySelector('detran-loading-state'),
    ).not.toBeNull();
  });

  it('dado intake vazia quando renderizada então detran-empty-state', async () => {
    const { harness } = await render(protocolFacadeStub([]));
    expect(
      harness.routeNativeElement?.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('IntakeListPage — C-2B-66 (banner) [presença + ausência]', () => {
  it('dado SseService "polling" então banner visível', async () => {
    const { harness } = await render(protocolFacadeStub(), 'polling');
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).not.toBeNull();
  });

  it('dado SseService "live" então banner ausente [negativo]', async () => {
    const { harness } = await render(protocolFacadeStub(), 'live');
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).toBeNull();
  });
});

describe('IntakeListPage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?q=RAIT-2026-000001&pagina=2 então setQuery/load chamada', async () => {
    const { facade } = await render(
      protocolFacadeStub(),
      'live',
      '?q=RAIT-2026-000001&pagina=2',
    );
    const calls = [
      ...facade.intake.loadMock.mock.calls,
      ...facade.intake.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('IntakeListPage — nenhuma ação de comando [negativo]', () => {
  it('dado a página renderizada quando lida então nenhum [data-action] (só link a /protocolo/novo)', async () => {
    const { harness } = await render(
      protocolFacadeStub([fixtureCase(CASE_IDS.PROTOCOLADO)]),
    );
    expect(
      harness.routeNativeElement?.querySelectorAll('[data-action]'),
    ).toHaveLength(0);
  });
});

describe('IntakeListPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render(
      protocolFacadeStub([fixtureCase(CASE_IDS.PROTOCOLADO)]),
    );
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
