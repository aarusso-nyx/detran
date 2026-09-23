// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 33, §8 —
// C-2B-65/66/67/80. Nenhuma ação. `SessionsPageComponent` (IU-RAIT-033) ainda não existe
// (TASK-0015): falha de módulo esperada.
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
import { SessionFacade } from '../../../data/facades/session.facade';
import type { RaitSession } from '../../../data/models';

function sseServiceStub(status: 'live' | 'polling') {
  return {
    status: () => status,
    polling: () => status === 'polling',
    live: () => status === 'live',
    connect: () => {},
  } as unknown as SseService;
}

function sessionFacadeStub(items: readonly RaitSession[] = []) {
  const sessoes = listFacadeStub(items);
  return stubFacade<SessionFacade>()({
    sessoes,
    loadSessions: delegateListLoad(sessoes),
    sessao: readSlotStub({ status: 'idle' }),
    lotes: listFacadeStub([]),
    lote: readSlotStub({ status: 'idle' }),
    relatoria: listFacadeStub([]),
    pautaCandidatos: listFacadeStub([]),
    vistas: listFacadeStub([]),
    extraordinaria: listFacadeStub([]),
    semRelator: listFacadeStub([]),
    itemDoCaso: readSlotStub({ status: 'idle' }),
    suplentes: listFacadeStub([]),
    pautaCandidatosRelogios: (() => new Map()) as never,
    extraordinariaCasos: (() => new Map()) as never,
    command: commandRunnerStub(),
  });
}

async function render(
  facade = sessionFacadeStub(),
  sse: 'live' | 'polling' = 'live',
  query = '',
) {
  const harness = await createRaitRouterHarness(
    pageProviders('rait-chair', [
      { provide: SessionFacade, useValue: facade },
      { provide: SseService, useValue: sseServiceStub(sse) },
    ]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('colegiado/:orgao/sessoes')}${query}`,
  );
  return { harness, facade };
}

describe('SessionsPage — C-2B-65 (estados)', () => {
  it('dado sessoes vazio quando renderizada então detran-empty-state', async () => {
    const { harness } = await render(sessionFacadeStub([]));
    expect(
      harness.routeNativeElement?.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('SessionsPage — C-2B-66 (banner) [presença + ausência]', () => {
  it('dado SseService "polling" então banner visível', async () => {
    const { harness } = await render(sessionFacadeStub(), 'polling');
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).not.toBeNull();
  });

  it('dado SseService "live" então banner ausente [negativo]', async () => {
    const { harness } = await render(sessionFacadeStub(), 'live');
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).toBeNull();
  });
});

describe('SessionsPage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?pagina=2 então setQuery/load chamada', async () => {
    const { facade } = await render(sessionFacadeStub(), 'live', '?pagina=2');
    const calls = [
      ...facade.sessoes.loadMock.mock.calls,
      ...facade.sessoes.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('SessionsPage — nenhuma ação [negativo] e a11y (C-2B-80)', () => {
  it('dado a página renderizada quando lida então nenhum [data-action] e nenhuma violação a11y', async () => {
    const { harness } = await render();
    expect(
      harness.routeNativeElement?.querySelectorAll('[data-action]'),
    ).toHaveLength(0);
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
