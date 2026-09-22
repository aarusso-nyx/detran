// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-66..69) para D-13 (`sinistros`,
// IU-DASH-D-13, bloco B/C; OD-D02/DT-029). Um app por arquivo (A18). D-13 é a única página
// cuja variante blocked_by_decision é admitida (estado residual, ficha §5).
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, it } from 'vitest';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper.js';
import { readAppCatalog, readSheet } from '../../../../testing/kb.js';
import {
  createDashboardRouterHarness,
  screenElement,
} from '../../../../testing/router-harness.js';
import { sessionForRoles } from '../../../../testing/stynx-session.stub.js';
import type { DistributionSeries } from '../../../shared/models.js';

const PATH = '/monitoramento/sinistros';
const SHEET = 'IU-DASH-D-13';
const ROLE = 'agency-admin';

function kebab(name: string): string {
  return `dash-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

const SERIES: DistributionSeries = {
  dimension: 'unit',
  scale: { max: 100, labelKey: 'dashboard.blocks.c' },
  bars: [
    {
      key: 'u1',
      label: 'Unidade 1',
      value: null,
      suppressed: true,
      threshold: 10,
      freshness: null,
    },
  ],
};

async function render(state: unknown) {
  const { harness, navigate } = await createDashboardRouterHarness([
    { provide: StynxSessionService, useValue: sessionForRoles([ROLE]) },
  ]);
  await navigate(PATH);
  const component = harness.routeDebugElement?.componentInstance as {
    state: (value: unknown) => void;
  };
  component.state(state);
  harness.detectChanges();
  return screenElement(harness) as HTMLElement;
}

describe('features/crashes/pages/sinistros.page.ts (D-13)', () => {
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

  it('dado a variante blocked_by_decision (admitida, ficha §5 residual) então renderiza estado bloqueado, nunca decision DT-029/DT-066 atribuída em L0 (C-02-68)', async () => {
    const catalog = readAppCatalog();
    const element = await render({
      kind: 'blocked_by_decision',
      decision: 'OD-D02',
    });
    expect(element.getAttribute('data-state')).toBe('blocked_by_decision');
    expect(element.textContent).toContain(
      catalog['dashboard.states.blocked_by_decision'],
    );
    expect(element.textContent).not.toContain('DT-029');
    expect(element.textContent).not.toContain('DT-066');
  });

  it('dado ready com barra suprimida então dash-suppressed-cell presente e os componentes da ficha estão no DOM (C-02-69)', async () => {
    const sheet = readSheet(SHEET);
    const element = await render({ kind: 'ready', data: SERIES });
    expect(element.querySelector('dash-suppressed-cell')).not.toBeNull();
    for (const component of sheet.components) {
      expect(element.querySelector(kebab(component)), component).not.toBeNull();
    }
  });
});
