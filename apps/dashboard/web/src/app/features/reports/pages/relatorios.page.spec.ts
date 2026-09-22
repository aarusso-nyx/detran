// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-66..70, 72, 73) para D-16
// (`relatorios`, IU-DASH-D-16, bloco A; mesma página serve a rota-filha §B com :id).
// Um app por arquivo (A18).
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
import type { ReportView } from '../../../shared/models.js';
import { GeneratedReportsPageComponent } from './relatorios.page.js';

const PATH = '/monitoramento/relatorios';
const CHILD_PATH = '/monitoramento/relatorios/:id';
const SHEET = 'IU-DASH-D-16';
const ROLE = 'bi-analyst';

function kebab(name: string): string {
  return `dash-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

const REPORT: ReportView = {
  id: 'r1',
  reportType: 'comparativo',
  status: 'processing',
  requestedAt: '2026-09-21T10:00:00-04:00',
  fileUri: null,
};

async function renderReady(path = PATH, role = ROLE) {
  const { harness, navigate } = await createDashboardRouterHarness([
    { provide: StynxSessionService, useValue: sessionForRoles([role]) },
  ]);
  await navigate(substituteRouteParams(path));
  const component = harness.routeDebugElement?.componentInstance as {
    state: (value: unknown) => void;
  };
  component.state({ kind: 'ready', data: [REPORT] });
  harness.detectChanges();
  return screenElement(harness) as HTMLElement;
}

describe('features/reports/pages/relatorios.page.ts (D-16)', () => {
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
      InstanceType<typeof GeneratedReportsPageComponent>['state']
    >;
    expectTypeOf<{
      kind: 'blocked_by_decision';
      decision: string;
    }>().not.toMatchTypeOf<StateType>();
  });

  it('dado ready então os componentes da ficha estão no DOM e o status vem em <code data-status> (C-02-69, OD-D16-012)', async () => {
    const sheet = readSheet(SHEET);
    const element = await renderReady();
    for (const component of sheet.components) {
      expect(element.querySelector(kebab(component)), component).not.toBeNull();
    }
    expect(element.querySelector('code[data-status]')?.textContent).toContain(
      'processing',
    );
  });

  it('dado a rota filha /:id então a mesma página renderiza (§B)', async () => {
    const element = await renderReady(CHILD_PATH);
    expect(element).not.toBeNull();
  });

  it('dado o controle generated-report:request então presente para bi-analyst (positivo na matriz de comando) (C-02-72)', async () => {
    const positive = await renderReady(PATH, 'bi-analyst');
    expect(
      positive.querySelector(
        '[data-command="dashboard:generated-report:request"]',
      ),
    ).not.toBeNull();
  });

  it('dado o controle generated-report:request então ausente para AUDITOR (tem acesso à rota mas não à matriz de comando) (C-02-72)', async () => {
    const negative = await renderReady(PATH, 'AUDITOR');
    expect(
      negative.querySelector(
        '[data-command="dashboard:generated-report:request"]',
      ),
    ).toBeNull();
  });

  it('dado o controle export:create então presente para bi-analyst (C-02-72)', async () => {
    const element = await renderReady();
    expect(
      element.querySelector('[data-command="dashboard:export:create"]'),
    ).not.toBeNull();
  });

  it('dado o controle request presente quando clicado então dash-error-banner unavailable_in_version com o command (C-02-73)', async () => {
    const element = await renderReady();
    const button = element.querySelector(
      '[data-command="dashboard:generated-report:request"]',
    ) as HTMLButtonElement;
    button.click();
    expect(
      element.querySelector(
        'dash-error-banner[data-command="dashboard:generated-report:request"]',
      ),
    ).not.toBeNull();
  });
});
