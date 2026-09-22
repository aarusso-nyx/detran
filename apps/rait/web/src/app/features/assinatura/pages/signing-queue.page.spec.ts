// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 24, §8 —
// C-2B-65/66/67/80. Nenhuma ação (decisão em /assinatura/:caseId). `SigningQueuePageComponent`
// (IU-RAIT-025) ainda não existe (TASK-0015): falha de módulo esperada.
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
import { SigningFacade } from '../../../data/facades/signing.facade';
import type { RaitCase } from '../../../data/models';

function sseServiceStub(status: 'live' | 'polling') {
  return {
    status: () => status,
    polling: () => status === 'polling',
    live: () => status === 'live',
    connect: () => {},
  } as unknown as SseService;
}

function signingFacadeStub(items: readonly RaitCase[] = []) {
  const fila = listFacadeStub(items);
  return stubFacade<SigningFacade>()({
    fila,
    loadSigningQueue: delegateListLoad(fila),
    caso: readSlotStub({ status: 'idle' }),
    command: commandRunnerStub(),
  });
}

async function render(
  facade = signingFacadeStub(),
  sse: 'live' | 'polling' = 'live',
  query = '',
) {
  const harness = await createRaitRouterHarness(
    pageProviders('rait-signing-authority', [
      { provide: SigningFacade, useValue: facade },
      { provide: SseService, useValue: sseServiceStub(sse) },
    ]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('assinatura')}${query}`,
  );
  return { harness, facade };
}

describe('SigningQueuePage — C-2B-65 (estados)', () => {
  it('dado fila vazia quando renderizada então detran-empty-state', async () => {
    const { harness } = await render(signingFacadeStub([]));
    expect(
      harness.routeNativeElement?.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('SigningQueuePage — C-2B-66 (banner) [presença + ausência]', () => {
  it('dado SseService "polling" então banner visível', async () => {
    const { harness } = await render(signingFacadeStub(), 'polling');
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).not.toBeNull();
  });

  it('dado SseService "live" então banner ausente [negativo]', async () => {
    const { harness } = await render(signingFacadeStub(), 'live');
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).toBeNull();
  });
});

describe('SigningQueuePage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?pagina=2 então setQuery/load chamada', async () => {
    const { facade } = await render(signingFacadeStub(), 'live', '?pagina=2');
    const calls = [
      ...facade.fila.loadMock.mock.calls,
      ...facade.fila.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('SigningQueuePage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render(
      signingFacadeStub([fixtureCase(CASE_IDS.PRONTO_P_DECISAO)]),
    );
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
