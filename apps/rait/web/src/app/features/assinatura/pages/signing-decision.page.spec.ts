// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 25, §6.2, §8 —
// C-2B-65/69/70/71/72/73/80. `SigningDecisionPageComponent` (IU-RAIT-026) ainda não existe
// (TASK-0015): falha de módulo esperada.
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
import { SigningFacade } from '../../../data/facades/signing.facade';
import type { SigningBundle } from '../../../data/facades/bundles';
import { ImpedimentDialogComponent } from '../../../shared/impediment-dialog.component';
import { SigningDecisionPageComponent } from './signing-decision.page';

const BUNDLE: SigningBundle = {
  case: fixtureCase(CASE_IDS.PRONTO_P_DECISAO),
  drafts: [],
  documents: [],
  admissibility: [],
  deadlines: [],
  decision: null,
};

function signingFacadeStub() {
  const command = commandRunnerStub();
  return stubFacade<SigningFacade>()({
    fila: listFacadeStub([]),
    caso: readSlotStub<SigningBundle>({ status: 'ready', value: BUNDLE }),
    signDecision: commandMethod('rait-decision:sign', command),
    returnDraft: commandMethod('rait-decision:return-draft', command),
    declareImpediment: commandMethod('rait-impediment:declare', command),
    command,
  });
}

async function render(role: string) {
  const facade = signingFacadeStub();
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: SigningFacade, useValue: facade },
    ]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('assinatura/:caseId')}`,
  );
  return { harness, facade };
}

/** `assinatura/:caseId` é restrita a `rait-signing-authority`; a matriz monta o componente
 * isolado, sem o router, para exercitar os 13 papéis canônicos (adenda A14 do maestro). */
function renderIsolated(role: (typeof RAIT_ALL_ROLES)[number]) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [SigningDecisionPageComponent],
    providers: pageProviders(role, [
      { provide: SigningFacade, useValue: signingFacadeStub() },
    ]),
  });
  const fixture = TestBed.createComponent(SigningDecisionPageComponent);
  fixture.detectChanges();
  return fixture;
}

describe('SigningDecisionPage — matriz §6.2 (C-2B-69/70)', () => {
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
        const fixture = renderIsolated(role);
        const button = fixture.nativeElement.querySelector(selector);
        if (granted) expect(button).not.toBeNull();
        else expect(button).toBeNull();
      });
    });
  });
});

describe('SigningDecisionPage — C-2B-73 (formulário decisao-autoridade vazio)', () => {
  it('dado o formulário enviado sem fundamentos quando submetido então nenhum comando é chamado [negativo]', async () => {
    const { harness, facade } = await render('rait-signing-authority');
    const host = harness.routeNativeElement as HTMLElement;
    host
      .querySelector<HTMLButtonElement>('button[type="submit"]')
      ?.dispatchEvent(new Event('click'));
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

function clickAction(
  harness: Awaited<ReturnType<typeof render>>['harness'],
  selector: string,
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  host
    .querySelector<HTMLButtonElement>(selector)
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo —
// as três desta página (`sign`, `return_draft`, `declare_impediment`), 3 `it` cada.
describe('SigningDecisionPage — C-2B-71 (confirmação de sign)', () => {
  it('dado rait-signing-authority quando o botão sign é clicado então stynx-confirm-dialog abre com message rait.screens.assinatura-caseId.confirm.sign', async () => {
    const { harness } = await render('rait-signing-authority');
    const dialog = clickAction(harness, '[data-action="sign"]');
    expect(dialog.message).toBe('rait.screens.assinatura-caseId.confirm.sign');
  });

  it('dado o diálogo de sign confirmado então a facade é chamada uma vez com rait-decision:sign', async () => {
    const { harness, facade } = await render('rait-signing-authority');
    const dialog = clickAction(harness, '[data-action="sign"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-decision:sign',
    );
  });

  it('dado o diálogo de sign dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-signing-authority');
    const dialog = clickAction(harness, '[data-action="sign"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('SigningDecisionPage — C-2B-71 (confirmação de return_draft)', () => {
  it('dado rait-signing-authority quando o botão return-draft é clicado então stynx-confirm-dialog abre com message rait.screens.assinatura-caseId.confirm.return_draft', async () => {
    const { harness } = await render('rait-signing-authority');
    const dialog = clickAction(harness, '[data-action="return-draft"]');
    expect(dialog.message).toBe(
      'rait.screens.assinatura-caseId.confirm.return_draft',
    );
  });

  it('dado o diálogo de return_draft confirmado então a facade é chamada uma vez com rait-decision:return-draft', async () => {
    const { harness, facade } = await render('rait-signing-authority');
    const dialog = clickAction(harness, '[data-action="return-draft"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-decision:return-draft',
    );
  });

  it('dado o diálogo de return_draft dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-signing-authority');
    const dialog = clickAction(harness, '[data-action="return-draft"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

/** `declare_impediment` não passa pela fila `confirm` compartilhada: o botão abre diretamente o
 * `rait-impediment-dialog` (`ImpedimentDialogComponent`) — adaptação fiel ao código real (nunca
 * um `StynxConfirmDialogComponent` inexistente), preservando a intenção do padrão (a)/(b)/(c). */
describe('SigningDecisionPage — C-2B-71 (confirmação de declare_impediment)', () => {
  it('dado rait-signing-authority quando o botão declare-impediment é clicado então rait-impediment-dialog abre com messageKey rait.screens.assinatura-caseId.confirm.declare_impediment', async () => {
    const { harness } = await render('rait-signing-authority');
    const host = harness.routeNativeElement as HTMLElement;
    host
      .querySelector<HTMLButtonElement>('[data-action="declare-impediment"]')
      ?.dispatchEvent(new Event('click'));
    harness.detectChanges();
    const dialog: ImpedimentDialogComponent =
      harness.fixture.debugElement.query(
        By.directive(ImpedimentDialogComponent),
      ).componentInstance;
    expect(dialog.open()).toBe(true);
    expect(dialog.messageKey()).toBe(
      'rait.screens.assinatura-caseId.confirm.declare_impediment',
    );
  });

  it('dado o rait-impediment-dialog confirmado então a facade é chamada uma vez com rait-impediment:declare', async () => {
    const { harness, facade } = await render('rait-signing-authority');
    const host = harness.routeNativeElement as HTMLElement;
    host
      .querySelector<HTMLButtonElement>('[data-action="declare-impediment"]')
      ?.dispatchEvent(new Event('click'));
    harness.detectChanges();
    const dialog: ImpedimentDialogComponent =
      harness.fixture.debugElement.query(
        By.directive(ImpedimentDialogComponent),
      ).componentInstance;
    dialog.confirmed.emit({
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

  it('dado o rait-impediment-dialog dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-signing-authority');
    const host = harness.routeNativeElement as HTMLElement;
    host
      .querySelector<HTMLButtonElement>('[data-action="declare-impediment"]')
      ?.dispatchEvent(new Event('click'));
    harness.detectChanges();
    const dialog: ImpedimentDialogComponent =
      harness.fixture.debugElement.query(
        By.directive(ImpedimentDialogComponent),
      ).componentInstance;
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('SigningDecisionPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render('rait-signing-authority');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
