// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-66..69) para D-08 (`deveres`,
// IU-DASH-D-08, bloco B). Um app por arquivo (A18).
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper.js';
import { readAppCatalog, readSheet } from '../../../../testing/kb.js';
import {
  createDashboardRouterHarness,
  screenElement,
} from '../../../../testing/router-harness.js';
import { sessionForRoles } from '../../../../testing/stynx-session.stub.js';
import type { DutyView } from '../../../shared/models.js';
import { DutyCalendarPageComponent } from './deveres.page.js';

const PATH = '/monitoramento/deveres';
const SHEET = 'IU-DASH-D-08';
const ROLE = 'agency-admin';

function kebab(name: string): string {
  return `dash-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

const DUTY: DutyView = {
  id: 'd1',
  indicatorCode: 'IND-DASH-202',
  label: null,
  cycleState: 'EM_APURACAO',
  period: '2026-09',
  deadlineAt: null,
  sanctioned: true,
  own: true,
  classification: 'P2',
  freshness: {
    state: 'FRESCO',
    asOf: '2026-09-21T10:00:00-04:00',
    acceptableLatency: null,
    source: 's',
  },
};

async function renderReady() {
  const { harness, navigate } = await createDashboardRouterHarness([
    { provide: StynxSessionService, useValue: sessionForRoles([ROLE]) },
  ]);
  await navigate(PATH);
  const component = harness.routeDebugElement?.componentInstance as {
    state: (value: unknown) => void;
  };
  component.state({ kind: 'ready', data: [DUTY] });
  harness.detectChanges();
  return screenElement(harness) as HTMLElement;
}

describe('features/duties/pages/deveres.page.ts (D-08)', () => {
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
      InstanceType<typeof DutyCalendarPageComponent>['state']
    >;
    expectTypeOf<{
      kind: 'blocked_by_decision';
      decision: string;
    }>().not.toMatchTypeOf<StateType>();
  });

  it('dado ready então os componentes da ficha e no_deadline_defined estão presentes (C-02-69)', async () => {
    const catalog = readAppCatalog();
    const sheet = readSheet(SHEET);
    const element = await renderReady();
    for (const component of sheet.components) {
      expect(element.querySelector(kebab(component)), component).not.toBeNull();
    }
    expect(element.textContent).toContain(
      catalog['dashboard.common.fixed.no_deadline_defined'],
    );
  });
});
