// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "app.guards-matrix.anonymous.spec.ts" (C-02-12;
// C-01-08). Um `it` por rota (21 = 22 − 'auth/callback'): sessão inativa (ANONYMOUS_SESSION)
// sempre redireciona a LOGIN_ROUTE, nunca a '/sem-permissao'; 'auth/callback' ativa sem redirecionar.
import { describe, expect, it } from 'vitest';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import {
  createDashboardRouterHarness,
  screenElement,
  substituteRouteParams,
} from '../testing/router-harness.js';
import { ANONYMOUS_SESSION } from '../testing/stynx-session.stub.js';
import { DASHBOARD_ROUTE_MANIFEST_FIXTURE } from '../testing/route-manifest.fixture.js';
import { LOGIN_ROUTE } from './core/guards/auth.guard.js';

const OTHER_ROUTES = DASHBOARD_ROUTE_MANIFEST_FIXTURE.filter(
  (entry) => entry.path !== '/monitoramento/auth/callback',
);

describe('app.guards-matrix.anonymous.spec.ts', () => {
  it.each(OTHER_ROUTES)(
    'dado sessão inativa quando navegada a $path então URL final = LOGIN_ROUTE, nunca /sem-permissao (C-02-12)',
    async (entry) => {
      const { navigate, currentUrl } = await createDashboardRouterHarness([
        { provide: StynxSessionService, useValue: ANONYMOUS_SESSION },
      ]);
      await navigate(substituteRouteParams(entry.path));
      expect(currentUrl()).toBe(LOGIN_ROUTE);
      expect(currentUrl()).not.toContain('sem-permissao');
    },
  );

  it('dado sessão inativa quando navegada /monitoramento/auth/callback então ativa sem redirecionar (C-02-12)', async () => {
    const { harness, navigate, currentUrl } =
      await createDashboardRouterHarness([
        { provide: StynxSessionService, useValue: ANONYMOUS_SESSION },
      ]);
    await navigate('/monitoramento/auth/callback');
    expect(currentUrl()).toBe('/monitoramento/auth/callback');
    expect(screenElement(harness)).not.toBeNull();
  });
});
