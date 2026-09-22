// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6 linha 16, §6.2, §8 — C-2B-65/69/70/71/72/80.
// `ImpedimentsPageComponent` (IU-RAIT-016) ainda não existe (TASK-0015): falha de módulo
// esperada. `decide` é de fonte só-ficha (OD-R12-027; ficha cita rait-chair, ausente da
// fixture) → só 13 negativos.
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
import { ImpedimentDialogComponent } from '../../../shared/impediment-dialog.component';
import { ImpedimentsPageComponent } from './impediments.page';

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
    declareImpediment: commandMethod('rait-impediment:declare', command),
    command,
  });
}

async function render(role: string, facade = caseFacadeStub()) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [{ provide: CaseFacade, useValue: facade }]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('casos/:id/impedimentos')}`,
  );
  return { harness, facade };
}

describe('ImpedimentsPage — estado e a11y (C-2B-65/80)', () => {
  it('dado a página em ready quando renderizada então <h1> e nenhuma violação a11y', async () => {
    const { harness } = await render('rait-rapporteur');
    const el = harness.fixture.debugElement.query(
      By.directive(ImpedimentsPageComponent),
    );
    expect(el.nativeElement.querySelector('h1')).not.toBeNull();
    await expectA11yStateInvariants(el.nativeElement);
  });
});

/** `casos/:id/impedimentos` é restrita a `rait-rapporteur`/`rait-chair`; a matriz monta o
 * componente isolado, sem o router, para exercitar os 13 papéis canônicos (adenda A14). */
function renderIsolated(role: (typeof RAIT_ALL_ROLES)[number]) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [ImpedimentsPageComponent],
    providers: pageProviders(role, [
      { provide: CaseFacade, useValue: caseFacadeStub() },
    ]),
  });
  const fixture = TestBed.createComponent(ImpedimentsPageComponent);
  fixture.detectChanges();
  return fixture;
}

describe('ImpedimentsPage — matriz §6.2 (C-2B-69/70)', () => {
  const ACTIONS = [
    { key: 'inf:rait-impediment:declare', selector: '[data-action="declare"]' },
    {
      key: 'inf:rait-impediment:suspicion',
      selector: '[data-action="suspicion"]',
    },
    { key: 'inf:rait-impediment:decide', selector: '[data-action="decide"]' },
  ] as const;

  ACTIONS.forEach(({ key, selector }) => {
    RAIT_ALL_ROLES.forEach((role) => {
      const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(key);
      it(`dado papel "${role}" e ação "${key}" quando renderizado então o botão ${granted ? 'existe' : 'NÃO existe [negativo]'}`, () => {
        const fixture = renderIsolated(role);
        const button = fixture.nativeElement.querySelector(selector);
        if (granted) expect(button).not.toBeNull();
        else expect(button).toBeNull();
      });
    });
  });
});

/** `declare` (§6.1 linha 16) encadeia dois diálogos: `stynx-confirm-dialog` (fila `confirm`,
 * mensagem da ficha) → confirmado → `rait-impediment-dialog` (`ImpedimentDialogComponent`,
 * tipo/fundamento) → confirmado → só então `facade.declareImpediment` (M8
 * `rait-impediment:declare`) é chamada. Dispensar o PRIMEIRO diálogo nunca abre o segundo. */
function openDeclareConfirm(
  harness: Awaited<ReturnType<typeof render>>['harness'],
): StynxConfirmDialogComponent {
  const el = harness.fixture.debugElement.query(
    By.directive(ImpedimentsPageComponent),
  );
  (
    el.nativeElement.querySelector(
      '[data-action="declare"]',
    ) as HTMLButtonElement | null
  )?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo.
describe('ImpedimentsPage — C-2B-71 (confirmação de declare)', () => {
  it('dado rait-rapporteur quando o botão declare é clicado então stynx-confirm-dialog abre com message rait.screens.casos-id-impedimentos.confirm.declare', async () => {
    const { harness } = await render('rait-rapporteur');
    const dialog = openDeclareConfirm(harness);
    expect(dialog.message).toBe(
      'rait.screens.casos-id-impedimentos.confirm.declare',
    );
  });

  it('dado o diálogo de declare confirmado e o rait-impediment-dialog subsequente confirmado então a facade é chamada uma vez com rait-impediment:declare', async () => {
    const { harness, facade } = await render('rait-rapporteur');
    const dialog = openDeclareConfirm(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    const impedimentDialog: ImpedimentDialogComponent =
      harness.fixture.debugElement.query(
        By.directive(ImpedimentDialogComponent),
      ).componentInstance;
    impedimentDialog.confirmed.emit({
      kind: 'impedimento',
      basis: 'fundamento',
      legalBasis: 'art. 1',
    });
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-impediment:declare',
    );
  });

  it('dado o diálogo de declare dispensado então o rait-impediment-dialog NÃO abre e a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-rapporteur');
    const dialog = openDeclareConfirm(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    const impedimentDialogDebug = harness.fixture.debugElement.query(
      By.directive(ImpedimentDialogComponent),
    );
    expect(impedimentDialogDebug?.componentInstance.open()).toBe(false);
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});
