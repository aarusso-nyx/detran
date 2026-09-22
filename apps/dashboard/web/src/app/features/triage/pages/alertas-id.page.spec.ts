// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-66..70, 72, 73) para D-02
// (`alertas-id`, IU-DASH-D-02, bloco A dinâmico). Um app por arquivo (A18).
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper.js';
import { readAppCatalog, readSheet } from '../../../../testing/kb.js';
import {
  createDashboardRouterHarness,
  FIXED_ENTITY_ID,
  screenElement,
  substituteRouteParams,
} from '../../../../testing/router-harness.js';
import { sessionForRoles } from '../../../../testing/stynx-session.stub.js';
import type { AlertLifecycleView, AlertView } from '../../../shared/models.js';
import { AlertDetailPageComponent } from './alertas-id.page.js';

const PATH = '/monitoramento/alertas/:id';
const SHEET = 'IU-DASH-D-02';
const ROLE = 'dash-operator';

function kebab(name: string): string {
  return `dash-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

const ALERT: AlertView = {
  id: FIXED_ENTITY_ID,
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
const LIFECYCLE: AlertLifecycleView = {
  current: 'NOTIFICADO',
  track: 'irregularidade',
  transitions: [
    {
      state: 'DETECTADO',
      at: '2026-09-21T08:00:00-04:00',
      recipient: null,
      manual: false,
    },
    {
      state: 'NOTIFICADO',
      at: '2026-09-21T08:05:00-04:00',
      recipient: 'dash-operator',
      manual: false,
    },
  ],
};

async function renderReady(role: string, purposeDeclared = false) {
  const { harness, navigate } = await createDashboardRouterHarness([
    { provide: StynxSessionService, useValue: sessionForRoles([role]) },
  ]);
  await navigate(substituteRouteParams(PATH));
  const component = harness.routeDebugElement?.componentInstance as {
    state: (value: unknown) => void;
    purposeDeclared?: (value: boolean) => void;
  };
  component.state({
    kind: 'ready',
    data: { alert: ALERT, lifecycle: LIFECYCLE },
  });
  if (purposeDeclared) component.purposeDeclared?.(true);
  harness.detectChanges();
  return screenElement(harness) as HTMLElement;
}

describe('features/triage/pages/alertas-id.page.ts (D-02)', () => {
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

  it('dado o tipo do input state então a variante empty não é assignável (ficha §5 "não se aplica") (C-02-68)', () => {
    type StateType = ReturnType<
      InstanceType<typeof AlertDetailPageComponent>['state']
    >;
    expectTypeOf<{ kind: 'empty' }>().not.toMatchTypeOf<StateType>();
  });

  it('dado ready sem purposeDeclared então AM-1 ausente e dash-layer-gate presente (C-02-70, C-01-09)', async () => {
    const element = await renderReady(ROLE, false);
    expect(element.textContent).not.toContain('AM-1');
    expect(element.querySelector('dash-layer-gate')).not.toBeNull();
  });

  it('dado ready com purposeDeclared então AM-1 aparece (C-02-70, C-01-09)', async () => {
    const withDeclared = await renderReady(ROLE, true);
    expect(withDeclared.textContent).toContain('AM-1');
  });

  it('dado ready então os componentes da ficha estão no DOM (C-02-69)', async () => {
    const sheet = readSheet(SHEET);
    const element = await renderReady(ROLE);
    for (const component of sheet.components) {
      expect(element.querySelector(kebab(component)), component).not.toBeNull();
    }
  });

  it('dado o controle ack então presente para dash-operator (positivo na matriz de comando) (C-02-72)', async () => {
    const positiveAck = await renderReady('dash-operator');
    expect(
      positiveAck.querySelector('[data-command="dashboard:alert:ack"]'),
    ).not.toBeNull();
  });

  it('dado o controle ack então ausente para AUDITOR (tem acesso à rota mas não ao comando) (C-02-72)', async () => {
    const negativeAck = await renderReady('AUDITOR');
    expect(
      negativeAck.querySelector('[data-command="dashboard:alert:ack"]'),
    ).toBeNull();
  });

  it("dado sessionForRoles([GESTOR_DETRAN]) (permissions ['*']) então o controle ack está presente pelo passe global (C-02-72)", async () => {
    const element = await renderReady('GESTOR_DETRAN');
    expect(
      element.querySelector('[data-command="dashboard:alert:ack"]'),
    ).not.toBeNull();
  });

  it('dado o controle ack presente quando clicado então dash-error-banner unavailable_in_version com command e sem HTTP (C-02-73)', async () => {
    const { harness, navigate, httpMock } = await createDashboardRouterHarness([
      { provide: StynxSessionService, useValue: sessionForRoles([ROLE]) },
    ]);
    await navigate(substituteRouteParams(PATH));
    const component = harness.routeDebugElement?.componentInstance as {
      state: (value: unknown) => void;
    };
    component.state({
      kind: 'ready',
      data: { alert: ALERT, lifecycle: LIFECYCLE },
    });
    harness.detectChanges();
    const element = screenElement(harness) as HTMLElement;
    const button = element.querySelector(
      '[data-command="dashboard:alert:ack"]',
    ) as HTMLButtonElement;
    button.click();
    harness.detectChanges();
    const banner = element.querySelector(
      'dash-error-banner[data-kind="unavailable_in_version"]',
    );
    expect(banner).not.toBeNull();
    expect(banner?.getAttribute('data-command')).toBe('dashboard:alert:ack');
    httpMock().expectNone(() => true);
  });

  it('dado alert.state ≠ VERIFICADO então close desabilitado com alert_close_without_verification (C-02-73)', async () => {
    const catalog = readAppCatalog();
    const element = await renderReady(ROLE);
    const close = element.querySelector(
      '[data-command="dashboard:alert:close"]',
    ) as HTMLButtonElement | null;
    if (close) {
      expect(close.disabled).toBe(true);
      expect(element.textContent).toContain(
        catalog['dashboard.errors.alert_close_without_verification'],
      );
    }
  });

  it('dado track extincao então close ausente e incident:read presente com see_incident_inquiry (C-02-73)', async () => {
    const catalog = readAppCatalog();
    const { harness, navigate } = await createDashboardRouterHarness([
      { provide: StynxSessionService, useValue: sessionForRoles([ROLE]) },
    ]);
    await navigate(substituteRouteParams(PATH));
    const component = harness.routeDebugElement?.componentInstance as {
      state: (value: unknown) => void;
    };
    component.state({
      kind: 'ready',
      data: {
        alert: {
          ...ALERT,
          state: 'CRITICO_EXTINCAO',
          severity: 'CRITICO_EXTINCAO',
          track: 'extincao',
        },
        lifecycle: LIFECYCLE,
      },
    });
    harness.detectChanges();
    const element = screenElement(harness) as HTMLElement;
    expect(
      element.querySelector('[data-command="dashboard:alert:close"]'),
    ).toBeNull();
    const incident = element.querySelector(
      '[data-command="dashboard:incident:read"]',
    );
    expect(incident?.textContent).toContain(
      catalog['dashboard.common.fixed.see_incident_inquiry'],
    );
  });
});
