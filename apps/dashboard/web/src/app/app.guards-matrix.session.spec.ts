// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "app.guards-matrix.session.spec.ts"
// (C-02-13..15; C-01-06, C-01-08).
import { describe, expect, it } from 'vitest';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import {
  createDashboardRouterHarness,
  screenElement,
  substituteRouteParams,
} from '../testing/router-harness.js';
import { NO_CANONICAL_ROLE_SESSION } from '../testing/roles.fixture.js';
import {
  ANONYMOUS_SESSION,
  sessionForRoles,
} from '../testing/stynx-session.stub.js';
import { DASHBOARD_ROUTE_MANIFEST_FIXTURE } from '../testing/route-manifest.fixture.js';
import { DETRAN_ROLES_FIXTURE } from '../testing/roles.fixture.js';

const PAGE_ROUTES = DASHBOARD_ROUTE_MANIFEST_FIXTURE.filter(
  (entry) => entry.sheet !== null,
);

describe('app.guards-matrix.session.spec.ts', () => {
  it.each(PAGE_ROUTES)(
    'dado sessão ativa com roles [] quando navegada $path então /monitoramento/sem-permissao?de=<url> (C-02-13)',
    async (entry) => {
      const { navigate, currentUrl } = await createDashboardRouterHarness([
        { provide: StynxSessionService, useValue: sessionForRoles([]) },
      ]);
      const target = substituteRouteParams(entry.path);
      await navigate(target);
      expect(currentUrl()).toBe(
        `/monitoramento/sem-permissao?de=${encodeURIComponent(target)}`,
      );
    },
  );

  it.each(PAGE_ROUTES)(
    'dado sessão ativa com NO_CANONICAL_ROLE_SESSION quando navegada $path então /monitoramento/sem-permissao?de=<url> (C-02-13)',
    async (entry) => {
      const { navigate, currentUrl } = await createDashboardRouterHarness([
        {
          provide: StynxSessionService,
          useValue: sessionForRoles([...NO_CANONICAL_ROLE_SESSION.roles]),
        },
      ]);
      const target = substituteRouteParams(entry.path);
      await navigate(target);
      expect(currentUrl()).toBe(
        `/monitoramento/sem-permissao?de=${encodeURIComponent(target)}`,
      );
    },
  );

  it.each(DETRAN_ROLES_FIXTURE)(
    'dado /monitoramento/sem-permissao com sessão de papel %s quando navegada então ativa sem redirecionar (C-02-14)',
    async (role) => {
      const { harness, navigate, currentUrl } =
        await createDashboardRouterHarness([
          { provide: StynxSessionService, useValue: sessionForRoles([role]) },
        ]);
      await navigate('/monitoramento/sem-permissao');
      expect(currentUrl()).toBe('/monitoramento/sem-permissao');
      expect(screenElement(harness)).not.toBeNull();
    },
  );

  it('dado /monitoramento/sem-permissao com sessão inativa quando navegada então LOGIN_ROUTE (C-02-14)', async () => {
    const { navigate, currentUrl } = await createDashboardRouterHarness([
      { provide: StynxSessionService, useValue: ANONYMOUS_SESSION },
    ]);
    await navigate('/monitoramento/sem-permissao');
    expect(currentUrl()).toBe('/monitoramento/auth/callback');
  });

  it('dado sessão com dois papéis [rait-analyst, AUDITOR] quando navegada D-11 então ativa (união, ADR-0005) (C-02-15)', async () => {
    const { harness, navigate } = await createDashboardRouterHarness([
      {
        provide: StynxSessionService,
        useValue: sessionForRoles(['rait-analyst', 'AUDITOR']),
      },
    ]);
    await navigate('/monitoramento/auditoria');
    expect(screenElement(harness)).not.toBeNull();
  });

  it('dado sessão com dois papéis [ADMIN, AUDITOR] quando navegada D-11 então ativa (camada = máximo N2) (C-02-15)', async () => {
    const { harness, navigate } = await createDashboardRouterHarness([
      {
        provide: StynxSessionService,
        useValue: sessionForRoles(['ADMIN', 'AUDITOR']),
      },
    ]);
    await navigate('/monitoramento/auditoria');
    expect(screenElement(harness)).not.toBeNull();
  });
});
