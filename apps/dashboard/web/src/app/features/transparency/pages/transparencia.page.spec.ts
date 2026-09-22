// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-66..70, 72, 73) para D-12
// (`transparencia`, IU-DASH-D-12, bloco B). Um app por arquivo (A18).
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper.js';
import { readAppCatalog, readSheet } from '../../../../testing/kb.js';
import {
  createDashboardRouterHarness,
  screenElement,
} from '../../../../testing/router-harness.js';
import { sessionForRoles } from '../../../../testing/stynx-session.stub.js';
import { TransparencyAuditPageComponent } from './transparencia.page.js';

const PATH = '/monitoramento/transparencia';
const SHEET = 'IU-DASH-D-12';
const ROLE = 'technical-admin';

function kebab(name: string): string {
  return `dash-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

const DATA = {
  items: [
    {
      id: '1',
      label: 'Checklist LAI item 1',
      checked: true,
      blockedByDecision: null,
    },
    {
      id: '2',
      label: 'Item 14.129',
      checked: false,
      blockedByDecision: 'DT-066',
    },
  ],
  period: '2026-09',
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

describe('features/transparency/pages/transparencia.page.ts (D-12)', () => {
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

  it('dado o tipo do input state então a variante blocked_by_decision (da PÁGINA) não é assignável — só por item (C-02-68)', () => {
    type StateType = ReturnType<
      InstanceType<typeof TransparencyAuditPageComponent>['state']
    >;
    expectTypeOf<{
      kind: 'blocked_by_decision';
      decision: string;
    }>().not.toMatchTypeOf<StateType>();
  });

  it('dado item blockedByDecision DT-066 então esse item mostra blocked_by_decision com DT-066 e os demais ficam ativos (C-02-68)', async () => {
    const catalog = readAppCatalog();
    const element = await renderReady();
    const blocked = element.querySelector('[data-blocked]') as HTMLElement;
    // A7(5): compara a chave já com o {decision} renderizado (substituído), nunca o texto cru
    // da semente com o placeholder por substituir.
    expect(blocked.textContent).toContain(
      catalog['dashboard.states.blocked_by_decision'].replace(
        '{decision}',
        'DT-066',
      ),
    );
    expect(blocked.textContent).toContain('DT-066');
    const active = [
      ...element.querySelectorAll('li, [data-blocked-item]'),
    ].filter((item) => !item.hasAttribute('data-blocked'));
    expect(active.length).toBeGreaterThan(0);
  });

  it('dado ready então os componentes da ficha estão no DOM (C-02-69)', async () => {
    const sheet = readSheet(SHEET);
    const element = await renderReady();
    for (const component of sheet.components) {
      expect(element.querySelector(kebab(component)), component).not.toBeNull();
    }
  });

  it('dado o controle transparency-audit:audit então presente para technical-admin (positivo na matriz de comando) (C-02-72)', async () => {
    const positive = await renderReady();
    expect(
      positive.querySelector(
        '[data-command="dashboard:transparency-audit:audit"]',
      ),
    ).not.toBeNull();
  });

  it('dado o controle transparency-audit:audit então ausente para AUDITOR (tem acesso à rota mas não à matriz de comando) (C-02-72)', async () => {
    const { harness, navigate } = await createDashboardRouterHarness([
      { provide: StynxSessionService, useValue: sessionForRoles(['AUDITOR']) },
    ]);
    await navigate(PATH);
    const component = harness.routeDebugElement?.componentInstance as {
      state: (value: unknown) => void;
    };
    component.state({ kind: 'ready', data: DATA });
    harness.detectChanges();
    const negativeElement = screenElement(harness) as HTMLElement;
    expect(
      negativeElement.querySelector(
        '[data-command="dashboard:transparency-audit:audit"]',
      ),
    ).toBeNull();
  });

  it('dado o controle audit presente quando clicado então dash-error-banner unavailable_in_version com o command (C-02-73)', async () => {
    const element = await renderReady();
    const button = element.querySelector(
      '[data-command="dashboard:transparency-audit:audit"]',
    ) as HTMLButtonElement;
    button.click();
    expect(
      element.querySelector(
        'dash-error-banner[data-command="dashboard:transparency-audit:audit"]',
      ),
    ).not.toBeNull();
  });
});
