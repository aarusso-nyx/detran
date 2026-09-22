// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "core/pages" (C-02-25).
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, it } from 'vitest';
import { expectA11yStateInvariants } from '../../../testing/a11y-state.spec-helper.js';
import {
  buildTestCatalog,
  markerI18nModule,
} from '../../../testing/i18n-test-catalog.js';
import {
  createDashboardRouterHarness,
  screenElement,
} from '../../../testing/router-harness.js';
import { sessionForRoles } from '../../../testing/stynx-session.stub.js';

const KEYS = [
  'dashboard.shell.title.sem_permissao',
  'dashboard.states.forbidden',
  'dashboard.errors.forbidden_action',
  'dashboard.common.action.back',
] as const;

describe('core/pages/forbidden.page.ts', () => {
  it('dado ForbiddenPageComponent em /monitoramento/sem-permissao?de=/monitoramento/auditoria quando renderizada então h1, detran-error-state, código com o "de", link de volta e data-screen vazio; a11y (C-02-25)', async () => {
    const catalog = buildTestCatalog([...KEYS]);
    const { harness, navigate, currentUrl } =
      await createDashboardRouterHarness([
        markerI18nModule([...KEYS]),
        {
          provide: StynxSessionService,
          useValue: sessionForRoles(['dash-operator']),
        },
      ]);
    await navigate('/monitoramento/sem-permissao?de=/monitoramento/auditoria');
    const element = screenElement(harness) as HTMLElement;
    expect(element).not.toBeNull();
    expect(element.querySelector('h1')?.textContent).toContain(
      catalog['dashboard.shell.title.sem_permissao'],
    );
    expect(element.textContent).toContain(
      catalog['dashboard.states.forbidden'],
    );
    expect(element.textContent).toContain(
      catalog['dashboard.errors.forbidden_action'],
    );
    expect(element.querySelector('code')?.textContent).toContain(
      '/monitoramento/auditoria',
    );
    const back = element.querySelector('a[href="/monitoramento"]');
    expect(back?.textContent).toContain(
      catalog['dashboard.common.action.back'],
    );
    expect(currentUrl()).toContain('sem-permissao');
    expect(element.getAttribute('data-screen')).toBe('');
    await expectA11yStateInvariants(element, catalog, { skipLiveRegion: true });
  });
});
