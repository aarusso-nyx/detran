// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6 linha 45, §6.2, §8 —
// C-2B-65/67/69/70/71/72/80. `IncidentsPageComponent` (IU-RAIT-044) ainda não existe
// (TASK-0015): falha de módulo esperada.
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { describe, expect, it } from 'vitest';
import {
  commandMethod,
  commandRunnerStub,
  delegateListLoad,
  listFacadeStub,
  pageProviders,
  readSlotStub,
  stubFacade,
} from '../../../../testing/facade.stub';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import { ROLE_PERMISSIONS_FIXTURE } from '../../../../testing/policy.fixture';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { RAIT_ALL_ROLES } from '../../../../testing/route-manifest.fixture';
import { RadarFacade } from '../../../data/facades/radar.facade';
import type { RaitIncident } from '../../../data/models';
import { IncidentsPageComponent } from './incidents.page';

const ACTION_KEY = 'inf:rait-extinction:declare';

function radarFacadeStub(items: readonly RaitIncident[] = []) {
  const incidentes = listFacadeStub(items);
  const command = commandRunnerStub();
  return stubFacade<RadarFacade>()({
    radar: listFacadeStub([]),
    drilldown: readSlotStub({ status: 'idle' }),
    incidentes,
    loadIncidents: delegateListLoad(incidentes),
    radarCasos: (() => new Map()) as never,
    incidentesRelogio: (() => new Map()) as never,
    declareExtinction: commandMethod('rait-extinction:declare', command),
    command,
  });
}

async function render(role: string, facade = radarFacadeStub()) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [{ provide: RadarFacade, useValue: facade }]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams('gestao/incidentes')}`);
  return { harness, facade };
}

describe('IncidentsPage — C-2B-65 (estados)', () => {
  it('dado incidentes vazio quando renderizada então detran-empty-state', async () => {
    const { harness } = await render('rait-manager');
    expect(
      harness.routeNativeElement?.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('IncidentsPage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?pagina=2 então setQuery/load chamada', async () => {
    const facade = radarFacadeStub();
    const harness = await createRaitRouterHarness(
      pageProviders('rait-manager', [
        { provide: RadarFacade, useValue: facade },
      ]),
    );
    await harness.navigateByUrl(
      `/${substituteRouteParams('gestao/incidentes')}?pagina=2`,
    );
    const calls = [
      ...facade.incidentes.loadMock.mock.calls,
      ...facade.incidentes.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

/**
 * `gestao/incidentes` é restrita a `rait-manager`, mas a ação `declare-extinction` é concedida a
 * `rait-signing-authority`/`rait-chair` (nenhum dos dois acessa a rota) — a matriz e a
 * confirmação montam o componente isolado, sem o router (adenda A14 do maestro).
 */
function renderIsolated(
  role: (typeof RAIT_ALL_ROLES)[number],
  facade = radarFacadeStub(),
) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [IncidentsPageComponent],
    providers: pageProviders(role, [
      { provide: RadarFacade, useValue: facade },
    ]),
  });
  const fixture = TestBed.createComponent(IncidentsPageComponent);
  fixture.detectChanges();
  return { fixture, facade };
}

describe('IncidentsPage — matriz §6.2 (C-2B-69/70): rait-extinction:declare', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(ACTION_KEY);
    it(`dado papel "${role}" quando renderizado então o botão declare-extinction ${granted ? 'existe' : 'NÃO existe [negativo]'}`, () => {
      const { fixture } = renderIsolated(role);
      const button = fixture.nativeElement.querySelector(
        '[data-action="declare-extinction"]',
      );
      if (granted) expect(button).not.toBeNull();
      else expect(button).toBeNull();
    });
  });
});

function clickDeclareExtinction() {
  const facade = radarFacadeStub();
  const { fixture } = renderIsolated('rait-chair', facade);
  const host = fixture.nativeElement as HTMLElement;
  host
    .querySelector<HTMLButtonElement>('[data-action="declare-extinction"]')
    ?.dispatchEvent(new Event('click'));
  fixture.detectChanges();
  const dialog: StynxConfirmDialogComponent = fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
  return { fixture, facade, dialog };
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo.
describe('IncidentsPage — C-2B-71 (confirmação de declare-extinction)', () => {
  it('dado rait-chair quando o botão declare-extinction é clicado então stynx-confirm-dialog abre com message rait.screens.gestao-incidentes.confirm.declare-extinction', () => {
    const { dialog } = clickDeclareExtinction();
    expect(dialog.message).toBe(
      'rait.screens.gestao-incidentes.confirm.declare-extinction',
    );
  });

  it('dado o diálogo de declare-extinction confirmado então a facade é chamada uma vez com rait-extinction:declare', () => {
    const { facade, dialog, fixture } = clickDeclareExtinction();
    dialog.confirm.emit();
    fixture.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-extinction:declare',
    );
  });

  it('dado o diálogo de declare-extinction dispensado então a facade NÃO é chamada [negativo]', () => {
    const { facade, dialog, fixture } = clickDeclareExtinction();
    dialog.dismissed.emit();
    fixture.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('IncidentsPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render('rait-manager');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
