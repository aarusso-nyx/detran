// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6 linha 14, §8 — C-2B-65/80 (só leitura; nenhuma
// ação). `PartiesPageComponent` (IU-RAIT-014) ainda não existe (TASK-0015): falha de módulo
// esperada.
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
import { CaseFacade } from '../../../data/facades/case.facade';
import { PartiesPageComponent } from './parties.page';

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

async function render() {
  const harness = await createRaitRouterHarness(
    pageProviders('rait-secretary', [
      { provide: CaseFacade, useValue: caseFacadeStub() },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams('casos/:id/partes')}`);
  return harness;
}

describe('PartiesPage — nenhuma ação [negativo] e a11y (C-2B-80)', () => {
  it('dado a página renderizada quando lida então nenhum botão de comando e nenhuma violação a11y', async () => {
    const harness = await render();
    const el = harness.fixture.debugElement.query(
      By.directive(PartiesPageComponent),
    );
    expect(el.nativeElement.querySelectorAll('[data-action]')).toHaveLength(0);
    await expectA11yStateInvariants(el.nativeElement);
  });
});
