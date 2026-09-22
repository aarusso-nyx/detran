// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-66..70) para D-04 (`radar-pec`,
// IU-DASH-D-04, bloco A/C). Um app por arquivo (A18).
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
import { PecRadarPageComponent } from './radar-pec.page.js';

const PATH = '/monitoramento/radar/pec';
const SHEET = 'IU-DASH-D-04';
const ROLE = 'dash-operator';

function kebab(name: string): string {
  return `dash-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

function alert(overrides: Partial<AlertView> = {}): AlertView {
  return {
    id: '00000000-0000-7000-8000-0000000000aa',
    indicatorCode: 'IND-DASH-106',
    block: 'A',
    severity: 'N2',
    state: 'NOTIFICADO',
    track: 'irregularidade',
    legalBasis: 'CTB art. 280',
    owner: 'dash-operator',
    remaining: 'PT2H',
    clock: null,
    nextMilestoneAt: '2026-09-22T10:00:00-04:00',
    app: 'PEC',
    originRef: 'https://pec.example/exames/1',
    object: { reference: 'CD-1', app: 'PEC' },
    classification: 'P2',
    freshness: {
      state: 'FRESCO',
      asOf: '2026-09-21T10:00:00-04:00',
      acceptableLatency: null,
      source: 's',
    },
    version: 1,
    ...overrides,
  };
}

async function renderReady(
  data: readonly { alert: AlertView; candidateDeadline: boolean }[],
  purposeDeclared = false,
) {
  const { harness, navigate } = await createDashboardRouterHarness([
    { provide: StynxSessionService, useValue: sessionForRoles([ROLE]) },
  ]);
  await navigate(PATH);
  const component = harness.routeDebugElement?.componentInstance as {
    state: (value: unknown) => void;
    purposeDeclared?: (value: boolean) => void;
  };
  component.state({ kind: 'ready', data });
  if (purposeDeclared) component.purposeDeclared?.(true);
  harness.detectChanges();
  return screenElement(harness) as HTMLElement;
}

describe('features/radar/pages/radar-pec.page.ts (D-04)', () => {
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
      InstanceType<typeof PecRadarPageComponent>['state']
    >;
    expectTypeOf<{
      kind: 'blocked_by_decision';
      decision: string;
    }>().not.toMatchTypeOf<StateType>();
  });

  it('dado ready com candidateDeadline true então rótulo candidate_deadline_preclusive, data-deadline-kind candidate e NENHUM botão/deep-link (C-02-69, invariante 7)', async () => {
    const catalog = readAppCatalog();
    const element = await renderReady([
      { alert: alert(), candidateDeadline: true },
    ]);
    expect(element.textContent).toContain(
      catalog['dashboard.common.fixed.candidate_deadline_preclusive'],
    );
    const card = element.querySelector('[data-deadline-kind="candidate"]');
    expect(card).not.toBeNull();
    expect(card?.querySelector('dash-deep-link-button')).toBeNull();
    expect(card?.querySelector('button')).toBeNull();
  });

  it('dado ready com candidateDeadline false então data-deadline-kind organ com DeepLinkButton (C-02-69)', async () => {
    const element = await renderReady([
      { alert: alert(), candidateDeadline: false },
    ]);
    const card = element.querySelector('[data-deadline-kind="organ"]');
    expect(card).not.toBeNull();
    expect(card?.querySelector('dash-deep-link-button')).not.toBeNull();
  });

  it('dado ready sem purposeDeclared então objeto ausente e dash-layer-gate presente (C-02-70, C-01-09)', async () => {
    const element = await renderReady(
      [{ alert: alert(), candidateDeadline: false }],
      false,
    );
    expect(element.textContent).not.toContain('CD-1');
    expect(element.querySelector('dash-layer-gate')).not.toBeNull();
  });

  it('dado ready então os componentes da ficha estão no DOM (C-02-69)', async () => {
    const sheet = readSheet(SHEET);
    const element = await renderReady([
      { alert: alert(), candidateDeadline: false },
    ]);
    for (const component of sheet.components) {
      expect(element.querySelector(kebab(component)), component).not.toBeNull();
    }
  });
});
