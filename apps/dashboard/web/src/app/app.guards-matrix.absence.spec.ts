// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "app.guards-matrix.absence.spec.ts" (C-02-11;
// C-01-05 ausência; C-01-06). Um `it` por par rota × papel esperado 'forbidden' (20 × (36 −
// ativos)), sem amostragem (A15) — inclui CANDIDATO, CIDADAO, ADMIN/SUPORTE fora do passe e
// technical-admin bloqueado por camada em D-11 apesar do passe '*'.
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
    (role) => expectedRouteResult(entry.id as string, role) === 'forbidden',
  ).map((role) => ({ entry, role })),
);

describe('app.guards-matrix.absence.spec.ts', () => {
  it.each(CASES)(
    'dado a rota $entry.id ($entry.path) e sessão com papel $role (negado) quando navegada então /monitoramento/sem-permissao?de=<url> e nenhum data-screen (C-02-11)',
    async ({ entry, role }) => {
      const { harness, navigate, currentUrl } =
        await createDashboardRouterHarness([
          { provide: StynxSessionService, useValue: sessionForRoles([role]) },
        ]);
      const target = substituteRouteParams(entry.path);
      await navigate(target);
      expect(currentUrl()).toBe(
        `/monitoramento/sem-permissao?de=${encodeURIComponent(target)}`,
      );
      const element = screenElement(harness);
      expect(element?.getAttribute('data-screen') ?? '').toBe('');
    },
  );
});
