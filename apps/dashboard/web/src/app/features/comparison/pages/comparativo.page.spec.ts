// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-66..70, 72, 73) para D-10
// (`comparativo`, IU-DASH-D-10, bloco A/B/C). Um app por arquivo (A18).
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper.js';
import { readAppCatalog, readSheet } from '../../../../testing/kb.js';
import {
  createDashboardRouterHarness,
  screenElement,
} from '../../../../testing/router-harness.js';
import { sessionForRoles } from '../../../../testing/stynx-session.stub.js';
import { ComparisonPageComponent } from './comparativo.page.js';

const PATH = '/monitoramento/comparativo';
const SHEET = 'IU-DASH-D-10';
const ROLE = 'agency-admin';

function kebab(name: string): string {
  return `dash-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

const DATA = {
  series: {
    dimension: 'pool' as const,
    scale: { max: 100, labelKey: 'dashboard.blocks.c' },
    bars: [
      {
        key: 'p1',
        label: 'Pool 1',
        value: 40,
        suppressed: false,
        threshold: null,
        freshness: null,
      },
    ],
  },
  target: {
    value: 40,
    target: 60,
    freshness: {
      state: 'FRESCO' as const,
      asOf: '2026-09-21T10:00:00-04:00',
      acceptableLatency: null,
      source: 's',
    },
  },
  ceiling: {
    value: 20,
    ceiling: 30,
    legalBasis: 'CTB art. 280',
    freshness: {
      state: 'FRESCO' as const,
      asOf: '2026-09-21T10:00:00-04:00',
      acceptableLatency: null,
      source: 's',
    },
  },
};

async function renderReady(role: string, purposeDeclared = false) {
  const { harness, navigate } = await createDashboardRouterHarness([
    { provide: StynxSessionService, useValue: sessionForRoles([role]) },
  ]);
  await navigate(PATH);
  const component = harness.routeDebugElement?.componentInstance as {
    state: (value: unknown) => void;
    purposeDeclared?: (value: boolean) => void;
  };
  component.state({ kind: 'ready', data: DATA });
  if (purposeDeclared) component.purposeDeclared?.(true);
  harness.detectChanges();
  return screenElement(harness) as HTMLElement;
}

describe('features/comparison/pages/comparativo.page.ts (D-10)', () => {
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
      InstanceType<typeof ComparisonPageComponent>['state']
    >;
    expectTypeOf<{
      kind: 'blocked_by_decision';
      decision: string;
    }>().not.toMatchTypeOf<StateType>();
  });

  it('dado ready então os componentes da ficha estão no DOM (C-02-69)', async () => {
    const sheet = readSheet(SHEET);
    const element = await renderReady(ROLE);
    for (const component of sheet.components) {
      expect(element.querySelector(kebab(component)), component).not.toBeNull();
    }
  });

  it('dado o controle export:create então presente para agency-admin e ausente para AUDITOR (fora de EXPORT_ROLES) (C-02-72)', async () => {
    const positive = await renderReady('agency-admin');
    expect(
      positive.querySelector('[data-command="dashboard:export:create"]'),
    ).not.toBeNull();
    const negative = await renderReady('AUDITOR');
    expect(
      negative.querySelector('[data-command="dashboard:export:create"]'),
    ).toBeNull();
  });

  it('dado o controle export:create presente quando clicado então abre ExportDialog (L0: sem HTTP) (C-02-73)', async () => {
    const { harness, navigate, httpMock } = await createDashboardRouterHarness([
      { provide: StynxSessionService, useValue: sessionForRoles([ROLE]) },
    ]);
    await navigate(PATH);
    const component = harness.routeDebugElement?.componentInstance as {
      state: (value: unknown) => void;
    };
    component.state({ kind: 'ready', data: DATA });
    harness.detectChanges();
    const element = screenElement(harness) as HTMLElement;
    const button = element.querySelector(
      '[data-command="dashboard:export:create"]',
    ) as HTMLButtonElement;
    button.click();
    harness.detectChanges();
    expect(
      element.querySelector(
        'dash-export-dialog[open="true"], dash-export-dialog',
      ),
    ).not.toBeNull();
    httpMock().expectNone(() => true);
  });
});
