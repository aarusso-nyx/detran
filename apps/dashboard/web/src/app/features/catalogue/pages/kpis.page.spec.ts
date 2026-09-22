// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-66..69) para D-18 (`kpis`,
// IU-DASH-D-18, bloco C). Um app por arquivo (A18).
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper.js';
import { readAppCatalog, readSheet } from '../../../../testing/kb.js';
import {
  createDashboardRouterHarness,
  screenElement,
} from '../../../../testing/router-harness.js';
import { sessionForRoles } from '../../../../testing/stynx-session.stub.js';
import { SelfKpiPageComponent } from './kpis.page.js';

const PATH = '/monitoramento/kpis';
const SHEET = 'IU-DASH-D-18';
const ROLE = 'agency-admin';

function kebab(name: string): string {
  return `dash-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

const DATA = {
  kpis: [
    {
      key: 'coverage' as const,
      value: 92,
      freshness: {
        state: 'FRESCO' as const,
        asOf: '2026-09-21T10:00:00-04:00',
        acceptableLatency: null,
        source: 's',
      },
    },
  ],
  target: null,
  ceiling: null,
};

async function renderReady() {
  const { harness, navigate } = await createDashboardRouterHarness([
    { provide: StynxSessionService, useValue: sessionForRoles([ROLE]) },
  ]);
  await navigate(PATH);
  const component = harness.routeDebugElement?.componentInstance as {
    state: (value: unknown) => void;
  };
  component.state({ kind: 'ready', data: DATA });
  harness.detectChanges();
  return screenElement(harness) as HTMLElement;
}

describe('features/catalogue/pages/kpis.page.ts (D-18)', () => {
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
      InstanceType<typeof SelfKpiPageComponent>['state']
    >;
    expectTypeOf<{
      kind: 'blocked_by_decision';
      decision: string;
    }>().not.toMatchTypeOf<StateType>();
  });

  it('dado ready então os componentes da ficha estão no DOM e cada KPI vem por data-kpi (C-02-69, OD-D16-012)', async () => {
    const sheet = readSheet(SHEET);
    const element = await renderReady();
    for (const component of sheet.components) {
      expect(element.querySelector(kebab(component)), component).not.toBeNull();
    }
    expect(element.querySelector('[data-kpi="coverage"]')).not.toBeNull();
  });
});
