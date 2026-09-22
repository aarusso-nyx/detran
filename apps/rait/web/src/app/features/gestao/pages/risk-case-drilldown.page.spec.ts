// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6 linha 41, §6.2, §8 —
// C-2B-65/69/70/71/72/73/80. `RiskCaseDrilldownPageComponent` (IU-RAIT-040) ainda não existe
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
import { RadarFacade } from '../../../data/facades/radar.facade';
import type { RadarCaseBundle } from '../../../data/facades/bundles';
import { RiskCaseDrilldownPageComponent } from './risk-case-drilldown.page';

const BUNDLE: RadarCaseBundle = {
  case: fixtureCase(CASE_IDS.EM_INSTRUCAO),
  clocks: [],
  alerts: [],
  assignments: [],
  events: [],
};

function radarFacadeStub() {
  const command = commandRunnerStub();
  return stubFacade<RadarFacade>()({
    radar: listFacadeStub([]),
    drilldown: readSlotStub<RadarCaseBundle>({
      status: 'ready',
      value: BUNDLE,
    }),
    incidentes: listFacadeStub([]),
    radarCasos: (() => new Map()) as never,
    incidentesRelogio: (() => new Map()) as never,
    reassign: commandMethod('rait-assignment:reassign', command),
    command,
  });
}

async function render(role: string) {
  const facade = radarFacadeStub();
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [{ provide: RadarFacade, useValue: facade }]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('gestao/radar/:caseId')}`,
  );
  return { harness, facade };
}

/** `gestao/radar/:caseId` é restrita a `rait-manager`; a matriz monta o componente isolado, sem
 * o router, para exercitar os 13 papéis canônicos (adenda A14 do maestro). */
function renderIsolated(role: (typeof RAIT_ALL_ROLES)[number]) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [RiskCaseDrilldownPageComponent],
    providers: pageProviders(role, [
      { provide: RadarFacade, useValue: radarFacadeStub() },
    ]),
  });
  const fixture = TestBed.createComponent(RiskCaseDrilldownPageComponent);
  fixture.detectChanges();
  return fixture;
}

describe('RiskCaseDrilldownPage — matriz §6.2 (C-2B-69/70)', () => {
  const ACTIONS = [
    {
      key: 'inf:rait-assignment:reassign',
      selector: '[data-action="reassign"]',
    },
    {
      key: 'inf:rait-clock:acknowledge-alert',
      selector: '[data-action="acknowledge-alert"]',
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

describe('RiskCaseDrilldownPage — C-2B-73 (formulário reatribuicao vazio)', () => {
  it('dado o formulário enviado sem memberId/releaseReason quando submetido então nenhum comando é chamado [negativo]', async () => {
    const { harness, facade } = await render('rait-manager');
    const host = harness.routeNativeElement as HTMLElement;
    host.querySelector('form')?.dispatchEvent(new Event('submit'));
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

function clickReassign(
  harness: Awaited<ReturnType<typeof render>>['harness'],
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  host
    .querySelector<HTMLButtonElement>('[data-action="reassign"]')
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo.
describe('RiskCaseDrilldownPage — C-2B-71 (confirmação de reassign)', () => {
  it('dado rait-manager quando o botão reassign é clicado então stynx-confirm-dialog abre com message rait.screens.gestao-radar-caseId.confirm.reassign', async () => {
    const { harness } = await render('rait-manager');
    const dialog = clickReassign(harness);
    expect(dialog.message).toBe(
      'rait.screens.gestao-radar-caseId.confirm.reassign',
    );
  });

  it('dado o diálogo de reassign confirmado então a facade é chamada uma vez com rait-assignment:reassign', async () => {
    const { harness, facade } = await render('rait-manager');
    const dialog = clickReassign(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-assignment:reassign',
    );
  });

  it('dado o diálogo de reassign dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-manager');
    const dialog = clickReassign(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('RiskCaseDrilldownPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render('rait-manager');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
