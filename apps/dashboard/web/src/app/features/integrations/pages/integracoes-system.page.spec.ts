// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-66..69, 72, 73) para D-07
// (`integracoes-system`, IU-DASH-D-07, bloco D). Um app por arquivo (A18).
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
import type { SourceStatusView } from '../../../shared/models.js';
import { IntegrationDetailPageComponent } from './integracoes-system.page.js';

const PATH = '/monitoramento/integracoes/:system';
const SHEET = 'IU-DASH-D-07';
const ROLE = 'technical-admin';

function kebab(name: string): string {
  return `dash-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

const DATA = {
  source: {
    source: 'renach-outbox',
    freshness: {
      state: 'FRESCO',
      asOf: '2026-09-21T10:00:00-04:00',
      acceptableLatency: 'PT15M',
      source: 'renach-outbox',
    },
    acceptableLatency: 'PT15M',
    lastHeartbeatAt: '2026-09-21T10:00:00-04:00',
  } as SourceStatusView,
  isolated: [{ id: 'x1', category: 'transport' as const }],
};

async function renderReady(role: string) {
  const { harness, navigate } = await createDashboardRouterHarness([
    { provide: StynxSessionService, useValue: sessionForRoles([role]) },
  ]);
  await navigate(substituteRouteParams(PATH));
  const component = harness.routeDebugElement?.componentInstance as {
    state: (value: unknown) => void;
  };
  component.state({ kind: 'ready', data: DATA });
  harness.detectChanges();
  return screenElement(harness) as HTMLElement;
}

describe('features/integrations/pages/integracoes-system.page.ts (D-07)', () => {
  it('dado a página sem input então unavailable_in_version, sem HTTP (C-02-66)', async () => {
    const catalog = readAppCatalog();
    const { harness, navigate, httpMock } = await createDashboardRouterHarness([
      { provide: StynxSessionService, useValue: sessionForRoles([ROLE]) },
    ]);
    await navigate(substituteRouteParams(PATH));
    const element = screenElement(harness) as HTMLElement;
    expect(element.getAttribute('data-state')).toBe('unavailable_in_version');
    httpMock().expectNone(() => true);
    await expectA11yStateInvariants(element, catalog);
  });

  it('dado o tipo do input state então a variante blocked_by_decision não é assignável (C-02-68)', () => {
    type StateType = ReturnType<
      InstanceType<typeof IntegrationDetailPageComponent>['state']
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

  it('dado o controle annotate então presente para technical-admin (positivo) e ausente para dash-operator (negativo na matriz) (C-02-72)', async () => {
    const positive = await renderReady('technical-admin');
    expect(
      positive.querySelector('[data-command="dashboard:alert:annotate"]'),
    ).not.toBeNull();
    const negative = await renderReady('dash-operator');
    expect(
      negative.querySelector('[data-command="dashboard:alert:annotate"]'),
    ).toBeNull();
  });

  it('dado o controle annotate presente quando clicado então dash-error-banner unavailable_in_version com o command (C-02-73)', async () => {
    const element = await renderReady('technical-admin');
    const button = element.querySelector(
      '[data-command="dashboard:alert:annotate"]',
    ) as HTMLButtonElement;
    button.click();
    expect(
      element.querySelector(
        'dash-error-banner[data-command="dashboard:alert:annotate"]',
      ),
    ).not.toBeNull();
  });

  it('dado ready então rótulos causa_raiz.category_* presentes (C-02-69)', async () => {
    const catalog = readAppCatalog();
    const element = await renderReady(ROLE);
    expect(element.textContent).toContain(
      catalog['dashboard.forms.causa_raiz.category_transport'],
    );
  });
});
