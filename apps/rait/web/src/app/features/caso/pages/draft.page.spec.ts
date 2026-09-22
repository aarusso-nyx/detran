// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6 linha 11, §6.2, §8 — C-2B-65/66/69/70/71/72/80.
// `DraftPageComponent` (IU-RAIT-011) ainda não existe (TASK-0015): falha de módulo esperada.
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { describe, expect, it } from 'vitest';
import {
  commandMethod,
  commandRunnerStub,
  listFacadeStub,
  pageProviders,
  readSlotStub,
  stubFacade,
} from '../../../../testing/facade.stub';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import { CASE_IDS, fixtureCase } from '../../../../testing/http-fixtures';
import { ROLE_PERMISSIONS_FIXTURE } from '../../../../testing/policy.fixture';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { RAIT_ALL_ROLES } from '../../../../testing/route-manifest.fixture';
import { CaseFacade } from '../../../data/facades/case.facade';
import { DraftPageComponent } from './draft.page';

const ACTION_KEY = 'inf:rait-case:submit-draft';

function caseFacadeStub() {
  const command = commandRunnerStub();
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
    submitDraft: commandMethod('rait-case:submit-draft', command),
    command,
  });
}

async function render(role: string, facade = caseFacadeStub()) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [{ provide: CaseFacade, useValue: facade }]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams('casos/:id/minuta')}`);
  return { harness, facade };
}

describe('DraftPage — estado e a11y (C-2B-65/80)', () => {
  it('dado a página em ready quando renderizada então <h1> e nenhuma violação a11y', async () => {
    const { harness } = await render('rait-analyst');
    const el = harness.fixture.debugElement.query(
      By.directive(DraftPageComponent),
    );
    expect(el.nativeElement.querySelector('h1')).not.toBeNull();
    await expectA11yStateInvariants(el.nativeElement);
  });
});

/** `casos/:id/minuta` é restrita a `rait-analyst`; a matriz monta o componente isolado, sem o
 * router, para exercitar os 13 papéis canônicos (adenda A14 do maestro). */
function renderIsolated(
  role: (typeof RAIT_ALL_ROLES)[number],
  facade = caseFacadeStub(),
) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [DraftPageComponent],
    providers: pageProviders(role, [{ provide: CaseFacade, useValue: facade }]),
  });
  const fixture = TestBed.createComponent(DraftPageComponent);
  fixture.detectChanges();
  return { fixture, facade };
}

describe('DraftPage — matriz §6.2 (C-2B-69/70): submit-draft', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(ACTION_KEY);
    it(`dado papel "${role}" quando renderizado então o botão submit ${granted ? 'existe' : 'NÃO existe [negativo]'}`, () => {
      const { fixture } = renderIsolated(role);
      const button = fixture.nativeElement.querySelector(
        '[data-action="submit"]',
      );
      if (granted) expect(button).not.toBeNull();
      else expect(button).toBeNull();
    });
  });
});

function clickSubmit(
  harness: Awaited<ReturnType<typeof render>>['harness'],
): StynxConfirmDialogComponent {
  const el = harness.fixture.debugElement.query(
    By.directive(DraftPageComponent),
  );
  (
    el.nativeElement.querySelector(
      '[data-action="submit"]',
    ) as HTMLButtonElement | null
  )?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo.
describe('DraftPage — C-2B-71 (confirmação de submit)', () => {
  it('dado rait-analyst quando o botão submit é clicado então stynx-confirm-dialog abre com message rait.screens.casos-id-minuta.confirm.submit', async () => {
    const { harness } = await render('rait-analyst');
    const dialog = clickSubmit(harness);
    expect(dialog.message).toBe('rait.screens.casos-id-minuta.confirm.submit');
  });

  it('dado o diálogo de submit confirmado então a facade é chamada uma vez com rait-case:submit-draft', async () => {
    const { harness, facade } = await render('rait-analyst');
    const dialog = clickSubmit(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-case:submit-draft',
    );
  });

  it('dado o diálogo de submit dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-analyst');
    const dialog = clickSubmit(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});
