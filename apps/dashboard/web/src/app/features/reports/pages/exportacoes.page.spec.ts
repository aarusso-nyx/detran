// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-66..70, 72, 73) para D-17
// (`exportacoes`, IU-DASH-D-17, bloco A). Um app por arquivo (A18).
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper.js';
import { readAppCatalog, readSheet } from '../../../../testing/kb.js';
import {
  createDashboardRouterHarness,
  screenElement,
} from '../../../../testing/router-harness.js';
import { sessionForRoles } from '../../../../testing/stynx-session.stub.js';
import type { ExportRecordView } from '../../../shared/models.js';
import { ExportRegistryPageComponent } from './exportacoes.page.js';

const PATH = '/monitoramento/exportacoes';
const SHEET = 'IU-DASH-D-17';
const ROLE = 'agency-admin';

function kebab(name: string): string {
  return `dash-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

const PENDING_RECORD: ExportRecordView = {
  id: 'e1',
  who: 'bi-analyst',
  at: '2026-09-21T10:00:00-04:00',
  filters: {},
  rows: 6000,
  format: 'csv',
  purpose: 'auditoria',
  pendingApproval: true,
};

async function renderReady(role = ROLE) {
  const { harness, navigate } = await createDashboardRouterHarness([
    { provide: StynxSessionService, useValue: sessionForRoles([role]) },
  ]);
  await navigate(PATH);
  const component = harness.routeDebugElement?.componentInstance as {
    state: (value: unknown) => void;
  };
  component.state({ kind: 'ready', data: [PENDING_RECORD] });
  harness.detectChanges();
  return screenElement(harness) as HTMLElement;
}

describe('features/reports/pages/exportacoes.page.ts (D-17)', () => {
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
      InstanceType<typeof ExportRegistryPageComponent>['state']
    >;
    expectTypeOf<{
      kind: 'blocked_by_decision';
      decision: string;
    }>().not.toMatchTypeOf<StateType>();
  });

  it('dado ready com pendingApproval true então export_volume_approval_required com data-pending true (C-02-69)', async () => {
    const catalog = readAppCatalog();
    const sheet = readSheet(SHEET);
    const element = await renderReady();
    for (const component of sheet.components) {
      expect(element.querySelector(kebab(component)), component).not.toBeNull();
    }
    expect(element.textContent).toContain(
      catalog['dashboard.errors.export_volume_approval_required'],
    );
    expect(element.querySelector('[data-pending="true"]')).not.toBeNull();
  });

  it('dado o controle export:approve então presente para agency-admin (positivo na matriz de comando) (C-02-72)', async () => {
    const positive = await renderReady('agency-admin');
    expect(
      positive.querySelector('[data-command="dashboard:export:approve"]'),
    ).not.toBeNull();
  });

  it('dado o controle export:approve então ausente para AUDITOR (tem acesso à rota mas não à matriz de comando) (C-02-72)', async () => {
    const negative = await renderReady('AUDITOR');
    expect(
      negative.querySelector('[data-command="dashboard:export:approve"]'),
    ).toBeNull();
  });

  it('dado o controle approve presente quando clicado então dash-error-banner unavailable_in_version com o command (C-02-73)', async () => {
    const element = await renderReady();
    const button = element.querySelector(
      '[data-command="dashboard:export:approve"]',
    ) as HTMLButtonElement;
    button.click();
    expect(
      element.querySelector(
        'dash-error-banner[data-command="dashboard:export:approve"]',
      ),
    ).not.toBeNull();
  });
});
