// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-66..70, 72, 73) para D-11
// (`auditoria`, IU-DASH-D-11, bloco A/B/C/D). Um app por arquivo (A18).
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper.js';
import { readAppCatalog, readSheet } from '../../../../testing/kb.js';
import {
  createDashboardRouterHarness,
  screenElement,
} from '../../../../testing/router-harness.js';
import { sessionForRoles } from '../../../../testing/stynx-session.stub.js';
import { AuditTrailPageComponent } from './auditoria.page.js';

const PATH = '/monitoramento/auditoria';
const SHEET = 'IU-DASH-D-11';
const ROLE = 'AUDITOR';

function kebab(name: string): string {
  return `dash-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

const ITEMS = [
  {
    at: '2026-09-21T10:00:00-04:00',
    kind: 'alert' as const,
    ref: 'a1',
    state: 'NOTIFICADO',
    recipient: 'dash-operator',
  },
  {
    at: '2026-09-21T10:05:00-04:00',
    kind: 'gap' as const,
    ref: 'g1',
    state: null,
    recipient: null,
  },
];

async function renderReady(role: string, purposeDeclared = false) {
  const { harness, navigate } = await createDashboardRouterHarness([
    { provide: StynxSessionService, useValue: sessionForRoles([role]) },
  ]);
  await navigate(PATH);
  const component = harness.routeDebugElement?.componentInstance as {
    state: (value: unknown) => void;
    purposeDeclared?: (value: boolean) => void;
  };
  component.state({ kind: 'ready', data: ITEMS });
  if (purposeDeclared) component.purposeDeclared?.(true);
  harness.detectChanges();
  return screenElement(harness) as HTMLElement;
}

describe('features/audit/pages/auditoria.page.ts (D-11)', () => {
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
      InstanceType<typeof AuditTrailPageComponent>['state']
    >;
    expectTypeOf<{
      kind: 'blocked_by_decision';
      decision: string;
    }>().not.toMatchTypeOf<StateType>();
  });

  it('dado ready sem purposeDeclared então o conteúdo fica oculto e o gate aberto (C-02-70, C-01-09, "LayerGate na entrada")', async () => {
    const withoutDeclared = await renderReady(ROLE, false);
    expect(withoutDeclared.textContent).not.toContain('a1');
    expect(withoutDeclared.querySelector('dash-layer-gate')).not.toBeNull();
  });

  it('dado ready com purposeDeclared então o conteúdo aparece (C-02-70, C-01-09, "LayerGate na entrada")', async () => {
    const withDeclared = await renderReady(ROLE, true);
    expect(withDeclared.textContent).toContain('a1');
  });

  it('dado item kind gap então renderiza dashboard.states.empty no lugar do conteúdo (C-02-69, "lacuna como lacuna")', async () => {
    const catalog = readAppCatalog();
    const element = await renderReady(ROLE, true);
    expect(element.textContent).toContain(catalog['dashboard.states.empty']);
  });

  it('dado ready então os componentes da ficha estão no DOM (C-02-69)', async () => {
    const sheet = readSheet(SHEET);
    const element = await renderReady(ROLE, true);
    for (const component of sheet.components) {
      expect(element.querySelector(kebab(component)), component).not.toBeNull();
    }
  });

  // A7(3): `DASH_EXPORT_ROLES` (`policy.ts` 1532-1540) não inclui `AUDITOR` — o controle é
  // ausente para AUDITOR (e para DPO) em D-11; o positivo real é um papel de
  // `DASH_EXPORT_ROLES`, aqui `agency-admin`.
  it('dado o controle export:create então presente para agency-admin (positivo em DASH_EXPORT_ROLES) (C-02-72, A7(3))', async () => {
    const positive = await renderReady('agency-admin', true);
    expect(
      positive.querySelector('[data-command="dashboard:export:create"]'),
    ).not.toBeNull();
  });

  it('dado o controle export:create então ausente para AUDITOR (tem acesso à rota mas está fora de DASH_EXPORT_ROLES) (C-02-72, A7(3))', async () => {
    const negative = await renderReady('AUDITOR', true);
    expect(
      negative.querySelector('[data-command="dashboard:export:create"]'),
    ).toBeNull();
  });

  it('dado o controle export:create então ausente para DPO (tem acesso à rota mas está fora de DASH_EXPORT_ROLES) (C-02-72, A7(3))', async () => {
    const negative = await renderReady('DPO', true);
    expect(
      negative.querySelector('[data-command="dashboard:export:create"]'),
    ).toBeNull();
  });

  it('dado o controle export:create presente quando clicado então nenhuma requisição HTTP (L0) (C-02-73)', async () => {
    const { harness, navigate, httpMock } = await createDashboardRouterHarness([
      {
        provide: StynxSessionService,
        useValue: sessionForRoles(['agency-admin']),
      },
    ]);
    await navigate(PATH);
    const component = harness.routeDebugElement?.componentInstance as {
      state: (value: unknown) => void;
      purposeDeclared?: (value: boolean) => void;
    };
    component.state({ kind: 'ready', data: ITEMS });
    component.purposeDeclared?.(true);
    harness.detectChanges();
    const element = screenElement(harness) as HTMLElement;
    const button = element.querySelector(
      '[data-command="dashboard:export:create"]',
    ) as HTMLButtonElement;
    button.click();
    httpMock().expectNone(() => true);
  });
});
