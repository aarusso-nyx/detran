// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6 linha 12, §6.2, §8 — C-2B-65/66/69/70/71/72/80.
// `CaseDecisionPageComponent` (IU-RAIT-012, nome OD-R12-028) ainda não existe (TASK-0015): falha
// de módulo esperada. Nota A11/OD-R12-026: `inf:rait-impediment:declare` positivo é
// `rait-rapporteur` na fixture (a ficha diverge, dando `rait-signing-authority`) — a matriz segue
// `ROLE_PERMISSIONS_FIXTURE`, nunca a ficha.
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
import { CaseDecisionPageComponent } from './case-decision.page';

function caseFacadeStub() {
  const command = commandRunnerStub();
  return stubFacade<CaseFacade>()({
    caso: readSlotStub({
      status: 'ready',
      value: fixtureCase(CASE_IDS.PRONTO_P_DECISAO),
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
    signDecision: commandMethod('rait-decision:sign', command),
    returnDraft: commandMethod('rait-decision:return-draft', command),
    declareImpediment: commandMethod('rait-impediment:declare', command),
    command,
  });
}

async function render(role: string, facade = caseFacadeStub()) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [{ provide: CaseFacade, useValue: facade }]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams('casos/:id/decisao')}`);
  return { harness, facade };
}

describe('CaseDecisionPage — estado e a11y (C-2B-65/80)', () => {
  it('dado a página em ready quando renderizada então <h1> e nenhuma violação a11y', async () => {
    const { harness } = await render('rait-signing-authority');
    const el = harness.fixture.debugElement.query(
      By.directive(CaseDecisionPageComponent),
    );
    expect(el.nativeElement.querySelector('h1')).not.toBeNull();
    await expectA11yStateInvariants(el.nativeElement);
  });
});

/** `casos/:id/decisao` é restrita a `rait-signing-authority`; a matriz monta o componente
 * isolado, sem o router, para exercitar os 13 papéis canônicos (adenda A14 do maestro). */
function renderIsolated(
  role: (typeof RAIT_ALL_ROLES)[number],
  facade = caseFacadeStub(),
) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [CaseDecisionPageComponent],
    providers: pageProviders(role, [{ provide: CaseFacade, useValue: facade }]),
  });
  const fixture = TestBed.createComponent(CaseDecisionPageComponent);
  fixture.detectChanges();
  return { fixture, facade };
}

describe('CaseDecisionPage — matriz §6.2 (C-2B-69/70)', () => {
  const ACTIONS = [
    { key: 'inf:rait-decision:sign', selector: '[data-action="sign"]' },
    {
      key: 'inf:rait-decision:return-draft',
      selector: '[data-action="return-draft"]',
    },
    {
      key: 'inf:rait-impediment:declare',
      selector: '[data-action="declare-impediment"]',
    },
  ] as const;

  ACTIONS.forEach(({ key, selector }) => {
    RAIT_ALL_ROLES.forEach((role) => {
      const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(key);
      it(`dado papel "${role}" e ação "${key}" quando renderizado então o botão ${granted ? 'existe' : 'NÃO existe [negativo]'}`, () => {
        const { fixture } = renderIsolated(role);
        const button = fixture.nativeElement.querySelector(selector);
        if (granted) expect(button).not.toBeNull();
        else expect(button).toBeNull();
      });
    });
  });
});

/**
 * Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 4 chaves desta página.
 * `accept`/`reject` são emitidos pelo `<rait-decision-panel>` (mesmo botão `data-action="sign"`
 * do painel, `decide.emit({kind, grounds})`; `kind` vem do radio `AUTHORITY_DECISION_KINDS`:
 * índice 0 = 'acolhida' → confirm.accept, índice 1 = 'indeferida' → confirm.reject — ambos com o
 * mesmo M8 `rait-decision:sign`, §6.1). `return-draft` abre a guidance do painel e emite
 * `returnDraft` via `data-action="return-draft-confirm"`. `declare-impediment` é o botão PRÓPRIO
 * da página (não o `impede` do painel) e abre o `rait-impediment-dialog` diretamente, sem
 * `stynx-confirm-dialog` (adaptação fiel ao código real).
 */
function selectKindAndSign(
  harness: Awaited<ReturnType<typeof render>>['harness'],
  kindIndex: 0 | 1,
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  const radios = host.querySelectorAll<HTMLInputElement>('input[type="radio"]');
  const radio = radios.item(kindIndex);
  radio.checked = true;
  radio.dispatchEvent(new Event('change'));
  const grounds = host.querySelector<HTMLTextAreaElement>(
    'textarea[name="grounds"]',
  );
  if (grounds) {
    grounds.value = 'fundamentação';
    grounds.dispatchEvent(new Event('input'));
  }
  harness.detectChanges();
  host
    .querySelector<HTMLButtonElement>('[data-action="sign"]')
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

describe('CaseDecisionPage — C-2B-71 (confirmação de accept)', () => {
  it('dado rait-signing-authority com kind "acolhida" quando o painel decide então stynx-confirm-dialog abre com message rait.screens.casos-id-decisao.confirm.accept', async () => {
    const { harness } = await render('rait-signing-authority');
    const dialog = selectKindAndSign(harness, 0);
    expect(dialog.message).toBe('rait.screens.casos-id-decisao.confirm.accept');
  });

  it('dado o diálogo de accept confirmado então a facade é chamada uma vez com rait-decision:sign', async () => {
    const { harness, facade } = await render('rait-signing-authority');
    const dialog = selectKindAndSign(harness, 0);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-decision:sign',
    );
  });

  it('dado o diálogo de accept dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-signing-authority');
    const dialog = selectKindAndSign(harness, 0);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('CaseDecisionPage — C-2B-71 (confirmação de reject)', () => {
  it('dado rait-signing-authority com kind "indeferida" quando o painel decide então stynx-confirm-dialog abre com message rait.screens.casos-id-decisao.confirm.reject', async () => {
    const { harness } = await render('rait-signing-authority');
    const dialog = selectKindAndSign(harness, 1);
    expect(dialog.message).toBe('rait.screens.casos-id-decisao.confirm.reject');
  });

  it('dado o diálogo de reject confirmado então a facade é chamada uma vez com rait-decision:sign', async () => {
    const { harness, facade } = await render('rait-signing-authority');
    const dialog = selectKindAndSign(harness, 1);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-decision:sign',
    );
  });

  it('dado o diálogo de reject dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-signing-authority');
    const dialog = selectKindAndSign(harness, 1);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

function openGuidanceAndConfirm(
  harness: Awaited<ReturnType<typeof render>>['harness'],
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  host
    .querySelector<HTMLButtonElement>('[data-action="return-draft"]')
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  const guidance = host.querySelector<HTMLTextAreaElement>(
    'textarea[name="guidance"]',
  );
  if (guidance) {
    guidance.value = 'orientação';
    guidance.dispatchEvent(new Event('input'));
  }
  harness.detectChanges();
  host
    .querySelector<HTMLButtonElement>('[data-action="return-draft-confirm"]')
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

describe('CaseDecisionPage — C-2B-71 (confirmação de return-draft)', () => {
  it('dado rait-signing-authority com orientação preenchida quando o painel emite returnDraft então stynx-confirm-dialog abre com message rait.screens.casos-id-decisao.confirm.return-draft', async () => {
    const { harness } = await render('rait-signing-authority');
    const dialog = openGuidanceAndConfirm(harness);
    expect(dialog.message).toBe(
      'rait.screens.casos-id-decisao.confirm.return-draft',
    );
  });

  it('dado o diálogo de return-draft confirmado então a facade é chamada uma vez com rait-decision:return-draft', async () => {
    const { harness, facade } = await render('rait-signing-authority');
    const dialog = openGuidanceAndConfirm(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-decision:return-draft',
    );
  });

  it('dado o diálogo de return-draft dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-signing-authority');
    const dialog = openGuidanceAndConfirm(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

// `casos/:id/decisao` é restrita a `rait-signing-authority` (route-manifest.md); `rait-rapporteur`
// (concedido `inf:rait-impediment:declare` pela fixture — nota A11/OD-R12-026 no topo do
// arquivo) não acessa a rota, então o componente é montado isolado (`renderIsolated`, adenda A14).
describe('CaseDecisionPage — C-2B-71 (confirmação de declare-impediment)', () => {
  it('dado rait-rapporteur quando o botão declare-impediment é clicado então rait-impediment-dialog abre com messageKey rait.screens.casos-id-decisao.confirm.declare-impediment', () => {
    const { fixture } = renderIsolated('rait-rapporteur');
    const host = fixture.nativeElement as HTMLElement;
    host
      .querySelector<HTMLButtonElement>('[data-action="declare-impediment"]')
      ?.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    const dialog: ImpedimentDialogComponent = fixture.debugElement.query(
      By.directive(ImpedimentDialogComponent),
    ).componentInstance;
    expect(dialog.open()).toBe(true);
    expect(dialog.messageKey()).toBe(
      'rait.screens.casos-id-decisao.confirm.declare-impediment',
    );
  });

  it('dado o rait-impediment-dialog confirmado então a facade é chamada uma vez com rait-impediment:declare', () => {
    const { fixture, facade } = renderIsolated('rait-rapporteur');
    const host = fixture.nativeElement as HTMLElement;
    host
      .querySelector<HTMLButtonElement>('[data-action="declare-impediment"]')
      ?.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    const dialog: ImpedimentDialogComponent = fixture.debugElement.query(
      By.directive(ImpedimentDialogComponent),
    ).componentInstance;
    dialog.confirmed.emit({
      kind: 'impedimento',
      basis: 'fundamento',
      legalBasis: 'art. 1',
    });
    fixture.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-impediment:declare',
    );
  });

  it('dado o rait-impediment-dialog dispensado então a facade NÃO é chamada [negativo]', () => {
    const { fixture, facade } = renderIsolated('rait-rapporteur');
    const host = fixture.nativeElement as HTMLElement;
    host
      .querySelector<HTMLButtonElement>('[data-action="declare-impediment"]')
      ?.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    const dialog: ImpedimentDialogComponent = fixture.debugElement.query(
      By.directive(ImpedimentDialogComponent),
    ).componentInstance;
    dialog.dismissed.emit();
    fixture.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});
