// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6 linha 13, §8 — C-2B-65/77/80 (só leitura,
// [RN-RAIT-005]: nenhuma ação). `DeadlinesPageComponent` (IU-RAIT-013) ainda não existe
// (TASK-0015): falha de módulo esperada.
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
import {
  CASE_IDS,
  fixtureCase,
  FIXTURE_FILLERS,
} from '../../../../testing/http-fixtures';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { CaseFacade } from '../../../data/facades/case.facade';
import type { RaitDeadline } from '../../../data/models';
import { DeadlinesPageComponent } from './deadlines.page';

// "prazo nunca sem base legal" (C-2B-77/80): as 3 fixtures trazem `legal_basis` — nenhum
// `RaitDeadline` real é emitido sem o campo (obrigatório no contrato §2, `legal_basis: string`).
const DEADLINES: readonly Partial<RaitDeadline>[] = [
  { timer_code: 'T-DEC', legal_basis: FIXTURE_FILLERS.legal_basis },
  { timer_code: 'T-DIL', legal_basis: FIXTURE_FILLERS.legal_basis },
  { timer_code: 'T-REM10', legal_basis: FIXTURE_FILLERS.legal_basis },
];

function caseFacadeStub() {
  return stubFacade<CaseFacade>()({
    caso: readSlotStub({
      status: 'ready',
      value: fixtureCase(CASE_IDS.EM_INSTRUCAO),
    }),
    partes: listFacadeStub([]),
    prazos: listFacadeStub(DEADLINES as RaitDeadline[]),
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
    pageProviders('rait-analyst', [
      { provide: CaseFacade, useValue: caseFacadeStub() },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams('casos/:id/prazos')}`);
  return harness;
}

describe('DeadlinesPage — C-2B-77 (classificação legal/operacional)', () => {
  it('dado 3 deadlines (T-DEC, T-DIL, T-REM10) quando renderizada então 3 rait-deadline-chip com data-kind legal/operacional/legal e um rait-clocks-panel', async () => {
    const harness = await render();
    const el = harness.fixture.debugElement.query(
      By.directive(DeadlinesPageComponent),
    );
    const chips = el.nativeElement.querySelectorAll('rait-deadline-chip');
    expect(chips).toHaveLength(3);
    expect(chips[0].getAttribute('data-kind')).toBe('legal');
    expect(chips[1].getAttribute('data-kind')).toBe('operacional');
    expect(chips[2].getAttribute('data-kind')).toBe('legal');
    expect(el.nativeElement.querySelector('rait-clocks-panel')).not.toBeNull();
  });
});

describe('DeadlinesPage — nenhuma ação (RN-RAIT-005) [negativo]', () => {
  it('dado a página renderizada quando lida então nenhum botão de comando', async () => {
    const harness = await render();
    const el = harness.fixture.debugElement.query(
      By.directive(DeadlinesPageComponent),
    );
    expect(el.nativeElement.querySelectorAll('[data-action]')).toHaveLength(0);
  });
});

describe('DeadlinesPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const harness = await render();
    const el = harness.fixture.debugElement.query(
      By.directive(DeadlinesPageComponent),
    );
    await expectA11yStateInvariants(el.nativeElement);
  });
});
