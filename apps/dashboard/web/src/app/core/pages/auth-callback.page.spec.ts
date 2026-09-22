// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "core/pages" (C-02-26).
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, it, vi } from 'vitest';
import {
  buildTestCatalog,
  markerI18nModule,
} from '../../../testing/i18n-test-catalog.js';
import {
  createDashboardRouterHarness,
  screenElement,
} from '../../../testing/router-harness.js';
import {
  createStynxSessionStub,
  permissionsForRolesFixture,
} from '../../../testing/stynx-session.stub.js';

// D-01 (`/monitoramento`, route-manifest.md §A #1): policy `dashboard:alert:read`, camada N1,
// `dash-operator` entre os papéis — usado para a sessão chegar à raiz sem cair no
// permissionGuard/layerGuard depois que o authGuard deixa de bloquear (A7(7)).
const HOME_ROLE = 'dash-operator';

const KEYS = [
  'dashboard.shell.title.auth_callback',
  'dashboard.states.loading',
  'dashboard.states.error',
] as const;

describe('core/pages/auth-callback.page.ts', () => {
  it('dado a URL ?code=abc&state=xyz quando iniciada então completeLogin chamado uma vez e router navega para /monitoramento (C-02-26)', async () => {
    const stub = createStynxSessionStub({
      active: false,
      permissions: permissionsForRolesFixture([HOME_ROLE]),
      claims: { 'cognito:groups': [HOME_ROLE] },
    });
    const { navigate, currentUrl } = await createDashboardRouterHarness([
      markerI18nModule([...KEYS]),
      { provide: StynxSessionService, useValue: stub },
    ]);
    await navigate('/monitoramento/auth/callback?code=abc&state=xyz');
    await vi.waitFor(() => {
      expect(stub.completeLogin).toHaveBeenCalledTimes(1);
      expect(currentUrl()).toBe('/monitoramento');
    });
    expect(stub.login).not.toHaveBeenCalled();
  });

  it('dado a URL sem code/state quando iniciada então login chamado uma vez e nenhuma navegação (C-02-26)', async () => {
    const stub = createStynxSessionStub({ active: false });
    const { navigate, currentUrl } = await createDashboardRouterHarness([
      markerI18nModule([...KEYS]),
      { provide: StynxSessionService, useValue: stub },
    ]);
    await navigate('/monitoramento/auth/callback');
    await vi.waitFor(() => {
      expect(stub.login).toHaveBeenCalledTimes(1);
    });
    expect(currentUrl()).toContain('/monitoramento/auth/callback');
    expect(stub.completeLogin).not.toHaveBeenCalled();
  });

  it('dado completeLogin rejeitado quando processado então dash-error-banner com dashboard.states.error (C-02-26)', async () => {
    const catalog = buildTestCatalog([...KEYS]);
    const stub = createStynxSessionStub({ active: false });
    stub.completeLogin.mockRejectedValueOnce(new Error('falha'));
    const { harness, navigate } = await createDashboardRouterHarness([
      markerI18nModule([...KEYS]),
      { provide: StynxSessionService, useValue: stub },
    ]);
    await navigate('/monitoramento/auth/callback?code=abc&state=xyz');
    await vi.waitFor(() => {
      const element = screenElement(harness) as HTMLElement;
      expect(element.textContent).toContain(catalog['dashboard.states.error']);
    });
  });

  it('dado completeLogin ainda não resolvido quando renderizado então detran-loading-state com dashboard.states.loading (C-02-26)', async () => {
    const catalog = buildTestCatalog([...KEYS]);
    const stub = createStynxSessionStub({ active: false });
    let resolveCompleteLogin: () => void = () => undefined;
    stub.completeLogin.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveCompleteLogin = resolve;
        }),
    );
    const { harness, navigate } = await createDashboardRouterHarness([
      markerI18nModule([...KEYS]),
      { provide: StynxSessionService, useValue: stub },
    ]);
    await navigate('/monitoramento/auth/callback?code=abc&state=xyz');
    const element = screenElement(harness) as HTMLElement;
    expect(element.textContent).toContain(catalog['dashboard.states.loading']);
    resolveCompleteLogin();
  });
});
