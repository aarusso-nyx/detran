// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "app.guards-matrix.presence.spec.ts" (C-02-10;
// C-01-05 presença). Um `it` por par rota × papel esperado 'active' (20 rotas page × papéis de
// `expectedRouteResult`), sem amostragem (A15) — inclui os casos de passe global de §E
// (GESTOR_DETRAN, technical-admin, ADMIN, SUPORTE). Um app por arquivo de spec (A18): cada `it`
// cria seu próprio harness (TestBed é resetado após cada teste por `src/test-setup.ts`).
import { describe, expect, it } from 'vitest';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import {
  createDashboardRouterHarness,
  screenElement,
  substituteRouteParams,
} from '../testing/router-harness.js';
import { sessionForRoles } from '../testing/stynx-session.stub.js';
import { DETRAN_ROLES_FIXTURE } from '../testing/roles.fixture.js';
import {
  DASHBOARD_ROUTE_MANIFEST_FIXTURE,
  expectedRouteResult,
} from '../testing/route-manifest.fixture.js';

const ROUTES_WITH_SHEET = DASHBOARD_ROUTE_MANIFEST_FIXTURE.filter(
  (entry) => entry.sheet !== null,
);

const CASES = ROUTES_WITH_SHEET.flatMap((entry) =>
  DETRAN_ROLES_FIXTURE.filter(
    (role) => expectedRouteResult(entry.id as string, role) === 'active',
  ).map((role) => ({ entry, role })),
);

describe('app.guards-matrix.presence.spec.ts', () => {
  it.each(CASES)(
    'dado a rota $entry.id ($entry.path) e sessão com papel $role (ativo) quando navegada então ativa (C-02-10)',
    async ({ entry, role }) => {
      const { harness, navigate, currentUrl } =
        await createDashboardRouterHarness([
          { provide: StynxSessionService, useValue: sessionForRoles([role]) },
        ]);
      const target = substituteRouteParams(entry.path);
      await navigate(target);
      const element = screenElement(harness);
      expect(element, `${entry.path} × ${role}`).not.toBeNull();
      expect(element?.getAttribute('data-screen')).toBe(entry.screen ?? '');
      expect(currentUrl()).toBe(target);
    },
  );
});
