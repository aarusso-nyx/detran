// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6 linha 7, §8 — C-2B-65/66/80. Página sem tela
// própria (`screen: null` → data-screen ""); nenhuma ação de comando (só links às abas).
// `CaseSummaryPageComponent` (IU-RAIT-007, nome OD-R12-028) ainda não existe (TASK-0015): falha
// de módulo esperada.
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import {
  commandRunnerStub,
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
import { CaseFacade } from '../../../data/facades/case.facade';
import { CaseSummaryPageComponent } from './case-summary.page';

function sseServiceStub(status: 'live' | 'polling') {
  return {
    status: () => status,
    polling: () => status === 'polling',
    live: () => status === 'live',
    connect: () => {},
  } as unknown as SseService;
}

function caseFacadeStub(caseStatus: 'ready' | 'loading' = 'ready') {
  return stubFacade<CaseFacade>()({
    caso: readSlotStub(
      caseStatus === 'ready'
        ? { status: 'ready', value: fixtureCase(CASE_IDS.EM_INSTRUCAO) }
        : { status: 'loading' },
    ),
    partes: listFacadeStub([]),
    prazos: listFacadeStub([]),
    relogios: listFacadeStub([]),
    documentos: listFacadeStub([]),
    diligencias: listFacadeStub([]),
    minutas: listFacadeStub([]),
    admissibilidade: listFacadeStub([]),
    comunicacoes: listFacadeStub([]),
    eventos: listFacadeStub([]),
    impedimentos: listFacadeStub([]),
    decisao: listFacadeStub([]),
    provimentos: listFacadeStub([]),
    provimentosDecisao: (() => new Map()) as never,
    provimentosPrazo: (() => new Map()) as never,
    command: commandRunnerStub(),
  });
}

async function render(
  facade = caseFacadeStub(),
  sse: 'live' | 'polling' = 'live',
) {
  const harness = await createRaitRouterHarness(
    pageProviders('rait-secretary', [
      { provide: CaseFacade, useValue: facade },
      { provide: SseService, useValue: sseServiceStub(sse) },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams('casos/:id/resumo')}`);
  return harness;
}

describe('CaseSummaryPage — C-2B-65 (estados)', () => {
  it('dado caso em loading quando renderizada então detran-loading-state', async () => {
    const harness = await render(caseFacadeStub('loading'));
    const el = harness.fixture.debugElement.query(
      By.directive(CaseSummaryPageComponent),
    );
    expect(
      el.nativeElement.querySelector('detran-loading-state'),
    ).not.toBeNull();
  });
});

describe('CaseSummaryPage — C-2B-66 (banner) [presença + ausência]', () => {
  it('dado SseService "polling" então banner visível', async () => {
    const harness = await render(caseFacadeStub(), 'polling');
    const el = harness.fixture.debugElement.query(
      By.directive(CaseSummaryPageComponent),
    );
    expect(
      el.nativeElement.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).not.toBeNull();
  });

  it('dado SseService "live" então banner ausente [negativo]', async () => {
    const harness = await render(caseFacadeStub(), 'live');
    const el = harness.fixture.debugElement.query(
      By.directive(CaseSummaryPageComponent),
    );
    expect(
      el.nativeElement.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).toBeNull();
  });
});

describe('CaseSummaryPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const harness = await render();
    const el = harness.fixture.debugElement.query(
      By.directive(CaseSummaryPageComponent),
    );
    await expectA11yStateInvariants(el.nativeElement);
  });
});
