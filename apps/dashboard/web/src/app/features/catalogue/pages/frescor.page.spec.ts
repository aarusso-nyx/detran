// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 (C-02-66..69) para D-15 (`frescor`,
// IU-DASH-D-15, bloco D). "unavailable aqui é conteúdo" (ficha §5): a variante renderiza a
// tabela com o selo, não um estado vazio. Um app por arquivo (A18).
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper.js';
import { readAppCatalog, readSheet } from '../../../../testing/kb.js';
import {
  createDashboardRouterHarness,
  screenElement,
} from '../../../../testing/router-harness.js';
import { sessionForRoles } from '../../../../testing/stynx-session.stub.js';
import type { SourceStatusView } from '../../../shared/models.js';
import { FreshnessStatusPageComponent } from './frescor.page.js';

const PATH = '/monitoramento/frescor';
const SHEET = 'IU-DASH-D-15';
const ROLE = 'technical-admin';

function kebab(name: string): string {
  return `dash-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

const SOURCE: SourceStatusView = {
  source: 'renach-outbox',
  freshness: {
    state: 'INDISPONIVEL',
    asOf: null,
    acceptableLatency: null,
    source: 'renach-outbox',
  },
  acceptableLatency: null,
  lastHeartbeatAt: null,
};

async function renderReady() {
  const { harness, navigate } = await createDashboardRouterHarness([
    { provide: StynxSessionService, useValue: sessionForRoles([ROLE]) },
  ]);
  await navigate(PATH);
  const component = harness.routeDebugElement?.componentInstance as {
    state: (value: unknown) => void;
  };
  component.state({ kind: 'ready', data: [SOURCE] });
  harness.detectChanges();
  return screenElement(harness) as HTMLElement;
}

describe('features/catalogue/pages/frescor.page.ts (D-15)', () => {
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
      InstanceType<typeof FreshnessStatusPageComponent>['state']
    >;
    expectTypeOf<{
      kind: 'blocked_by_decision';
      decision: string;
    }>().not.toMatchTypeOf<StateType>();
  });

  it('dado ready com fonte INDISPONIVEL então os componentes da ficha e o selo aparecem (unavailable é conteúdo, não estado vazio) (C-02-69)', async () => {
    const sheet = readSheet(SHEET);
    const element = await renderReady();
    for (const component of sheet.components) {
      expect(element.querySelector(kebab(component)), component).not.toBeNull();
    }
    expect(
      element.querySelector(
        'dash-freshness-seal[data-freshness="INDISPONIVEL"]',
      ),
    ).not.toBeNull();
  });
});
