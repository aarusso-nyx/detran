// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 31, §6.2, §8 —
// C-2B-65/69/70/71/72/73/80. `OpinionPageComponent` (IU-RAIT-031) ainda não existe (TASK-0015):
// falha de módulo esperada.
import { By } from '@angular/platform-browser';
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
import { SessionFacade } from '../../../data/facades/session.facade';

const ACTION_KEY = 'inf:rait-opinion:register';

function caseFacadeStub() {
  return stubFacade<CaseFacade>()({
    caso: readSlotStub({
      status: 'ready',
      value: fixtureCase(CASE_IDS.DISTRIBUIDO),
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

function sessionFacadeStub() {
  const command = commandRunnerStub();
  return stubFacade<SessionFacade>()({
    sessoes: listFacadeStub([]),
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
    registerOpinion: commandMethod('rait-opinion:register', command),
    command,
  });
}

async function render(role: string) {
  const caseFacade = caseFacadeStub();
  const sessionFacade = sessionFacadeStub();
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: CaseFacade, useValue: caseFacade },
      { provide: SessionFacade, useValue: sessionFacade },
    ]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('colegiado/:orgao/relatoria/:caseId/voto')}`,
  );
  return { harness, sessionFacade, caseFacade };
}

describe('OpinionPage — matriz §6.2 (C-2B-69/70): rait-opinion:register', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(ACTION_KEY);
    it(`dado papel "${role}" quando renderizado então o botão register ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
      const { harness } = await render(role);
      const button = harness.routeNativeElement?.querySelector(
        '[data-action="register"]',
      );
      if (granted) expect(button).not.toBeNull();
      else expect(button).toBeNull();
    });
  });
});

describe('OpinionPage — C-2B-73 (formulário parecer-voto vazio)', () => {
  it('dado o formulário enviado sem vote quando submetido então nenhum comando é chamado [negativo]', async () => {
    const { harness, sessionFacade } = await render('rait-rapporteur');
    const host = harness.routeNativeElement as HTMLElement;
    host
      .querySelector<HTMLButtonElement>('[data-action="register"]')
      ?.dispatchEvent(new Event('click'));
    harness.detectChanges();
    expect(sessionFacade.command.runMock).not.toHaveBeenCalled();
  });
});

function fillAndClickRegister(
  harness: Awaited<ReturnType<typeof render>>['harness'],
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  const summary = host.querySelector<HTMLTextAreaElement>(
    'textarea[name="summary"]',
  );
  const analysis = host.querySelector<HTMLTextAreaElement>(
    'textarea[name="analysis"]',
  );
  const vote = host.querySelector<HTMLSelectElement>('select[name="vote"]');
  if (summary) {
    summary.value = 'resumo';
    summary.dispatchEvent(new Event('input'));
  }
  if (analysis) {
    analysis.value = 'análise';
    analysis.dispatchEvent(new Event('input'));
  }
  if (vote) {
    vote.value = 'provimento';
    vote.dispatchEvent(new Event('change'));
  }
  harness.detectChanges();
  host
    .querySelector<HTMLButtonElement>('[data-action="register"]')
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo.
describe('OpinionPage — C-2B-71 (confirmação de register)', () => {
  it('dado rait-rapporteur com summary/analysis/vote preenchidos quando o botão register é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-relatoria-caseId-voto.confirm.register', async () => {
    const { harness } = await render('rait-rapporteur');
    const dialog = fillAndClickRegister(harness);
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-relatoria-caseId-voto.confirm.register',
    );
  });

  it('dado o diálogo de register confirmado então a facade é chamada uma vez com rait-opinion:register', async () => {
    const { harness, sessionFacade } = await render('rait-rapporteur');
    const dialog = fillAndClickRegister(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(sessionFacade.command.runMock).toHaveBeenCalledTimes(1);
    expect(sessionFacade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-opinion:register',
    );
  });

  it('dado o diálogo de register dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, sessionFacade } = await render('rait-rapporteur');
    const dialog = fillAndClickRegister(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(sessionFacade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('OpinionPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render('rait-rapporteur');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
