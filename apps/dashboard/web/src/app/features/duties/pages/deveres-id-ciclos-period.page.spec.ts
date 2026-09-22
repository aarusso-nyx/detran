// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-66..69, 72, 73) para D-09
// (`deveres-id-ciclos-period`, IU-DASH-D-09, bloco B). Um app por arquivo (A18).
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
import type { DutyCycleView } from '../../../shared/models.js';
import { DutyCyclePageComponent } from './deveres-id-ciclos-period.page.js';

const PATH = '/monitoramento/deveres/:id/ciclos/:period';
const SHEET = 'IU-DASH-D-09';
const ROLE = 'dash-duty-owner';

function kebab(name: string): string {
  return `dash-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

const CYCLE: DutyCycleView = {
  dutyId: 'd1',
  period: '2026-09',
  state: 'JANELA_ABERTA',
  deadlineAt: null,
  transitions: [],
  lateHistory: [],
  version: 1,
};

async function renderReady(role: string) {
  const { harness, navigate } = await createDashboardRouterHarness([
    { provide: StynxSessionService, useValue: sessionForRoles([role]) },
  ]);
  await navigate(substituteRouteParams(PATH));
  const component = harness.routeDebugElement?.componentInstance as {
    state: (value: unknown) => void;
  };
  component.state({ kind: 'ready', data: CYCLE });
  harness.detectChanges();
  return screenElement(harness) as HTMLElement;
}

describe('features/duties/pages/deveres-id-ciclos-period.page.ts (D-09)', () => {
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
      InstanceType<typeof DutyCyclePageComponent>['state']
    >;
    expectTypeOf<{
      kind: 'blocked_by_decision';
      decision: string;
    }>().not.toMatchTypeOf<StateType>();
  });

  it('dado ready então os componentes da ficha e no_deadline_defined estão presentes (C-02-69)', async () => {
    const catalog = readAppCatalog();
    const sheet = readSheet(SHEET);
    const element = await renderReady(ROLE);
    for (const component of sheet.components) {
      expect(element.querySelector(kebab(component)), component).not.toBeNull();
    }
    expect(element.textContent).toContain(
      catalog['dashboard.common.fixed.no_deadline_defined'],
    );
  });

  it.each([
    'dashboard:duty-cycle:start',
    'dashboard:duty-cycle:prepare',
    'dashboard:duty-cycle:submit',
    'dashboard:duty-cycle:prove',
    'dashboard:duty-cycle:archive',
  ])(
    'dado o controle %s então presente para dash-duty-owner (positivo) independente do estado (C-02-72)',
    async (command) => {
      const element = await renderReady(ROLE);
      expect(
        element.querySelector(`[data-command="${command}"]`),
      ).not.toBeNull();
    },
  );

  it('dado o controle start ausente para AUDITOR (negativo na matriz de comando) (C-02-72)', async () => {
    const element = await renderReady('AUDITOR');
    expect(
      element.querySelector('[data-command="dashboard:duty-cycle:start"]'),
    ).toBeNull();
  });

  it('dado o controle start presente quando clicado então dash-error-banner unavailable_in_version com o command (C-02-73)', async () => {
    const element = await renderReady(ROLE);
    const button = element.querySelector(
      '[data-command="dashboard:duty-cycle:start"]',
    ) as HTMLButtonElement;
    button.click();
    expect(
      element.querySelector(
        'dash-error-banner[data-command="dashboard:duty-cycle:start"]',
      ),
    ).not.toBeNull();
  });
});
