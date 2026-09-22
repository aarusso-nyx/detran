// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-66..70) para D-03 (`radar-rait`,
// IU-DASH-D-03, bloco A). Um app por arquivo (A18).
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper.js';
import { readAppCatalog, readSheet } from '../../../../testing/kb.js';
import {
  createDashboardRouterHarness,
  screenElement,
} from '../../../../testing/router-harness.js';
import { sessionForRoles } from '../../../../testing/stynx-session.stub.js';
import type { AlertView } from '../../../shared/models.js';
import { RaitRadarPageComponent } from './radar-rait.page.js';

const PATH = '/monitoramento/radar/rait';
const SHEET = 'IU-DASH-D-03';
const ROLE = 'dash-operator';

function kebab(name: string): string {
  return `dash-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

const ALERT: AlertView = {
  id: '00000000-0000-7000-8000-0000000000aa',
  indicatorCode: 'IND-DASH-101',
  block: 'A',
  severity: 'N2',
  state: 'NOTIFICADO',
  track: 'irregularidade',
  legalBasis: 'CTB art. 280',
  owner: 'dash-operator',
  remaining: 'PT2H',
  clock: 'B',
  nextMilestoneAt: '2026-09-22T10:00:00-04:00',
  app: 'RAIT',
  originRef: 'https://rait.example/casos/1',
  object: { reference: 'AM-1', app: 'RAIT' },
  classification: 'P2',
  freshness: {
    state: 'FRESCO',
    asOf: '2026-09-21T10:00:00-04:00',
    acceptableLatency: null,
    source: 's',
  },
  version: 1,
};

async function renderReady(purposeDeclared = false) {
  const { harness, navigate } = await createDashboardRouterHarness([
    { provide: StynxSessionService, useValue: sessionForRoles([ROLE]) },
  ]);
  await navigate(PATH);
  const component = harness.routeDebugElement?.componentInstance as {
    state: (value: unknown) => void;
    purposeDeclared?: (value: boolean) => void;
  };
  component.state({ kind: 'ready', data: [ALERT] });
  if (purposeDeclared) component.purposeDeclared?.(true);
  harness.detectChanges();
  return screenElement(harness) as HTMLElement;
}

describe('features/radar/pages/radar-rait.page.ts (D-03)', () => {
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
      InstanceType<typeof RaitRadarPageComponent>['state']
    >;
    expectTypeOf<{
      kind: 'blocked_by_decision';
      decision: string;
    }>().not.toMatchTypeOf<StateType>();
  });

  it('dado ready sem purposeDeclared então AM-1 ausente e dash-layer-gate presente; após declared então aparece (C-02-70, C-01-09)', async () => {
    const element = await renderReady(false);
    expect(element.textContent).not.toContain('AM-1');
    expect(element.querySelector('dash-layer-gate')).not.toBeNull();
    const withDeclared = await renderReady(true);
    expect(withDeclared.textContent).toContain('AM-1');
  });

  it('dado ready então os componentes da ficha estão no DOM (C-02-69)', async () => {
    const sheet = readSheet(SHEET);
    const element = await renderReady();
    for (const component of sheet.components) {
      expect(element.querySelector(kebab(component)), component).not.toBeNull();
    }
  });
});
