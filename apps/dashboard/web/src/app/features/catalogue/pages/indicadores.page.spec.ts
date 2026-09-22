// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-66..70, 72, 73) para D-14
// (`indicadores`, IU-DASH-D-14, bloco A/B/C/D; mesma página serve a rota-filha §B com :id).
// Um app por arquivo (A18).
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper.js';
import { readAppCatalog, readSheet } from '../../../../testing/kb.js';
import {
  createDashboardRouterHarness,
  screenElement,
  substituteRouteParams,
} from '../../../../testing/router-harness.js';
import { sessionForRoles } from '../../../../testing/stynx-session.stub.js';
import type { IndicatorView } from '../../../shared/models.js';
import { IndicatorCataloguePageComponent } from './indicadores.page.js';

const PATH = '/monitoramento/indicadores';
const CHILD_PATH = '/monitoramento/indicadores/:id';
const SHEET = 'IU-DASH-D-14';
const ROLE = 'bi-analyst';

function kebab(name: string): string {
  return `dash-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

const INDICATOR: IndicatorView = {
  code: 'IND-DASH-101',
  block: 'A',
  classification: 'P2',
  owner: 'dash-operator',
  threshold: 'sp',
  acceptableLatency: 'PT15M',
  connected: true,
  freshness: {
    state: 'FRESCO',
    asOf: '2026-09-21T10:00:00-04:00',
    acceptableLatency: null,
    source: 's',
  },
};

async function renderReady(path = PATH, role = ROLE) {
  const { harness, navigate } = await createDashboardRouterHarness([
    { provide: StynxSessionService, useValue: sessionForRoles([role]) },
  ]);
  await navigate(substituteRouteParams(path));
  const component = harness.routeDebugElement?.componentInstance as {
    state: (value: unknown) => void;
  };
  component.state({ kind: 'ready', data: [INDICATOR] });
  harness.detectChanges();
  return screenElement(harness) as HTMLElement;
}

describe('features/catalogue/pages/indicadores.page.ts (D-14)', () => {
  it('dado a página sem input então unavailable_in_version, sem HTTP (C-02-66)', async () => {
    const catalog = readAppCatalog();
    const { harness, navigate, httpMock } = await createDashboardRouterHarness([
      { provide: StynxSessionService, useValue: sessionForRoles([ROLE]) },
    ]);
    await navigate(PATH);
    const element = screenElement(harness) as HTMLElement;
    expect(element.getAttribute('data-state')).toBe('unavailable_in_version');
    httpMock().expectNone(() => true);
    await expectA11yStateInvariants(element, catalog);
  });

  it('dado o tipo do input state então a variante blocked_by_decision não é assignável (C-02-68)', () => {
    type StateType = ReturnType<
      InstanceType<typeof IndicatorCataloguePageComponent>['state']
    >;
    expectTypeOf<{
      kind: 'blocked_by_decision';
      decision: string;
    }>().not.toMatchTypeOf<StateType>();
  });

  it('dado ready então os componentes da ficha e as seções dashboard.blocks.b/deveres.title estão presentes (C-02-69, M4 dois conjuntos)', async () => {
    const catalog = readAppCatalog();
    const sheet = readSheet(SHEET);
    const element = await renderReady();
    for (const component of sheet.components) {
      expect(element.querySelector(kebab(component)), component).not.toBeNull();
    }
    expect(element.textContent).toContain(catalog['dashboard.blocks.b']);
    expect(element.textContent).toContain(
      catalog['dashboard.screens.deveres.title'],
    );
  });

  it('dado a rota filha /:id então a mesma página (ficha única) renderiza com o indicador em foco (C-02-69, §B)', async () => {
    const element = await renderReady(CHILD_PATH);
    expect(element).not.toBeNull();
  });

  it('dado o controle indicator-config:update então presente para bi-analyst (positivo na matriz de comando) (C-02-72)', async () => {
    const positive = await renderReady(PATH, 'bi-analyst');
    expect(
      positive.querySelector(
        '[data-command="dashboard:indicator-config:update"]',
      ),
    ).not.toBeNull();
  });

  it('dado o controle indicator-config:update então ausente para AUDITOR (tem acesso à rota mas não à matriz de comando) (C-02-72)', async () => {
    const negative = await renderReady(PATH, 'AUDITOR');
    expect(
      negative.querySelector(
        '[data-command="dashboard:indicator-config:update"]',
      ),
    ).toBeNull();
  });

  it('dado o controle update presente quando clicado então dash-error-banner unavailable_in_version com o command (C-02-73)', async () => {
    const element = await renderReady();
    const button = element.querySelector(
      '[data-command="dashboard:indicator-config:update"]',
    ) as HTMLButtonElement;
    button.click();
    expect(
      element.querySelector(
        'dash-error-banner[data-command="dashboard:indicator-config:update"]',
      ),
    ).not.toBeNull();
  });
});
