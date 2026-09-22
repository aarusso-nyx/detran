// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6 linha 6, §8 — C-2B-64 (complemento: CaseHeader
// alimentado pelo bundle, sse.connect com caseId). `CaseLayoutPageComponent` (IU-RAIT-006) ainda
// não existe (TASK-0015): falha de módulo esperada.
import { By } from '@angular/platform-browser';
import { describe, expect, it, vi } from 'vitest';
import {
  commandRunnerStub,
  listFacadeStub,
  pageProviders,
  readSlotStub,
  stubFacade,
} from '../../../../testing/facade.stub';
import { CASE_IDS, fixtureCase } from '../../../../testing/http-fixtures';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { SseService } from '../../../core/sse.service';
import { CaseFacade } from '../../../data/facades/case.facade';
import { CaseLayoutPageComponent } from './case-layout.page';

function caseFacadeStub() {
  return stubFacade<CaseFacade>()({
    caso: readSlotStub({
      status: 'ready',
      value: fixtureCase(CASE_IDS.EM_INSTRUCAO),
    }),
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

describe('CaseLayoutPage — CaseHeader e SSE (C-2B-64)', () => {
  it('dado o caso EM_INSTRUCAO quando o layout ativa então rait-case-header recebe o caso do bundle e sse.connect é chamado com { caseId }', async () => {
    const connect = vi.fn();
    const sse = {
      status: () => 'live' as const,
      polling: () => false,
      live: () => true,
      connect,
    };
    const harness = await createRaitRouterHarness(
      pageProviders('rait-analyst', [
        { provide: CaseFacade, useValue: caseFacadeStub() },
        { provide: SseService, useValue: sse },
      ]),
    );
    await harness.navigateByUrl(`/${substituteRouteParams('casos/:id')}`);
    const layout = harness.fixture.debugElement.query(
      By.directive(CaseLayoutPageComponent),
    );
    expect(layout).not.toBeNull();
    const header = layout.nativeElement.querySelector('rait-case-header');
    expect(header?.getAttribute('data-case-id')).toBe(CASE_IDS.EM_INSTRUCAO);
    expect(connect).toHaveBeenCalledWith(
      expect.objectContaining({ caseId: expect.any(String) }),
    );
  });
});
