// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "features/<m>/pages/<slug>.page.spec.ts"
// (C-02-66..70) para D-01 (`triagem`, IU-DASH-D-01, bloco A). Um app por arquivo (A18).
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
import { ShiftTriagePageComponent } from './triagem.page.js';

const PATH = '/monitoramento';
const SHEET = 'IU-DASH-D-01';
const ROLE = 'dash-operator';

function kebab(name: string): string {
  return `dash-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

const ALERT: AlertView = {
  id: '00000000-0000-7000-8000-0000000000aa',
  indicatorCode: 'IND-DASH-101',
  block: 'A',
  severity: 'CRITICO_EXTINCAO',
  state: 'CRITICO_EXTINCAO',
  track: 'extincao',
  legalBasis: 'CTB art. 280',
  owner: 'dash-operator',
  remaining: 'PT1H',
  clock: 'B',
  nextMilestoneAt: '2026-09-22T10:00:00-04:00',
  app: 'RAIT',
  originRef: 'https://rait.example/casos/1',
  object: null,
  classification: 'P2',
  freshness: {
    state: 'FRESCO',
    asOf: '2026-09-21T10:00:00-04:00',
    acceptableLatency: null,
    source: 's',
  },
  version: 1,
};

async function renderReady(data: readonly AlertView[]) {
  const { harness, navigate } = await createDashboardRouterHarness([
    { provide: StynxSessionService, useValue: sessionForRoles([ROLE]) },
  ]);
  await navigate(PATH);
  const component = harness.routeDebugElement?.componentInstance as {
    state: (value: unknown) => void;
  };
  component.state({ kind: 'ready', data });
  harness.detectChanges();
  return screenElement(harness) as HTMLElement;
}

describe('features/triage/pages/triagem.page.ts (D-01)', () => {
  it('dado a página sem input então unavailable_in_version, h1/intro, dependência citada, sem HTTP (C-02-66)', async () => {
    const catalog = readAppCatalog();
    const { harness, navigate, httpMock } = await createDashboardRouterHarness([
      { provide: StynxSessionService, useValue: sessionForRoles([ROLE]) },
    ]);
    await navigate(PATH);
    const element = screenElement(harness) as HTMLElement;
    expect(element.getAttribute('data-state')).toBe('unavailable_in_version');
    expect(element.querySelector('h1')?.textContent).toContain(
      catalog['dashboard.screens.triagem.title'],
    );
    expect(element.textContent).toContain(
      catalog['dashboard.screens.triagem.intro'],
    );
    expect(
      element.querySelector('code[data-dependency]')?.textContent,
    ).toContain('R-0011 BP-DASH-MONITOR-001');
    httpMock().expectNone(() => true);
    await expectA11yStateInvariants(element, catalog);
  });

  it.each(['loading', 'empty', 'error', 'unavailable', 'stale'] as const)(
    'dado a variante %s (das admitidas pela ficha §5) então texto/estrutura esperados (C-02-67)',
    async (kind) => {
      const catalog = readAppCatalog();
      const { harness, navigate } = await createDashboardRouterHarness([
        { provide: StynxSessionService, useValue: sessionForRoles([ROLE]) },
      ]);
      await navigate(PATH);
      const component = harness.routeDebugElement?.componentInstance as {
        state: (value: unknown) => void;
      };
      const value =
        kind === 'error'
          ? {
              kind,
              error: {
                kind: 'server',
                presentation: 'error_state',
                code: 'DASH.INTERNAL',
                messageKey: null,
                stateKey: 'dashboard.states.error',
                stateParams: {},
                status: 500,
                requestId: 'r1',
                fields: [],
                missing: [],
                retryAfter: null,
                source: null,
                command: null,
                context: {},
              },
            }
          : kind === 'unavailable' || kind === 'stale'
            ? {
                kind,
                freshness: {
                  state:
                    kind === 'unavailable'
                      ? 'INDISPONIVEL'
                      : 'DESATUALIZADO_MARCADO',
                  asOf: '2026-09-21T10:00:00-04:00',
                  acceptableLatency: null,
                  source: 's',
                },
              }
            : { kind };
      component.state(value);
      harness.detectChanges();
      const element = screenElement(harness) as HTMLElement;
      expect(element.getAttribute('data-state')).toBe(kind);
      if (kind === 'empty') {
        expect(element.textContent).toContain(
          catalog['dashboard.screens.triagem.empty'],
        );
      }
      await expectA11yStateInvariants(element, catalog);
    },
  );

  it('dado ready com um AlertView em track extincao então os componentes da ficha estão no DOM e see_incident_inquiry aparece (C-02-69)', async () => {
    const catalog = readAppCatalog();
    const sheet = readSheet(SHEET);
    const element = await renderReady([ALERT]);
    for (const component of sheet.components) {
      expect(element.querySelector(kebab(component)), component).not.toBeNull();
    }
    expect(element.textContent).toContain(
      catalog['dashboard.common.fixed.see_incident_inquiry'],
    );
  });

  it('dado o tipo do input state então a variante blocked_by_decision não é assignável (ficha §5 "não se aplica") (C-02-68)', () => {
    type StateType = ReturnType<
      InstanceType<typeof ShiftTriagePageComponent>['state']
    >;
    expectTypeOf<{
      kind: 'blocked_by_decision';
      decision: string;
    }>().not.toMatchTypeOf<StateType>();
  });
});
