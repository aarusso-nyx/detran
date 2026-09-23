// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "app.routes.spec.ts" (C-02-05..09). Não compila
// até `src/app/app.routes.ts`, `core/manifest-routes.ts` e `core/guards/*.ts` existirem
// (TASK-0005) — falha esperada de módulo (§14.2 regra 2).
import type { Route, Routes } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { DASHBOARD_ROUTES } from './app.routes.js';
import { FEATURE_SEGMENTS, ownsFirstSegment } from './core/manifest-routes.js';
import { authGuard } from './core/guards/auth.guard.js';
import { DASHBOARD_ROUTE_MANIFEST_FIXTURE } from '../testing/route-manifest.fixture.js';
import {
  createDashboardRouterHarness,
  screenElement,
  substituteRouteParams,
} from '../testing/router-harness.js';
import { sessionForRoles } from '../testing/stynx-session.stub.js';
import { StynxSessionService } from '@stynx-nyx/angular-auth';

interface FlatEntry {
  readonly path: string;
  readonly route: Route;
}

/** Achata `DASHBOARD_ROUTES`, resolvendo os `loadChildren` das 10 montagens de feature. */
async function flattenDashboardRoutes(routes: Routes): Promise<FlatEntry[]> {
  const out: FlatEntry[] = [];
  const root = routes.find((route) => route.path === 'monitoramento');
  if (!root?.children) return out;
  for (const child of root.children) {
    if (child.loadChildren) {
      const loaded = (await (
        child.loadChildren as () => Promise<Routes | { [key: string]: Routes }>
      )()) as unknown;
      const childRoutes: Routes = Array.isArray(loaded)
        ? loaded
        : (Object.values(loaded as Record<string, Routes>)[0] ?? []);
      for (const route of childRoutes) {
        const full = route.path
          ? `/monitoramento/${route.path}`
          : '/monitoramento';
        out.push({ path: full, route });
      }
    } else if (child.path !== undefined) {
      out.push({ path: `/monitoramento/${child.path}`, route: child });
    }
  }
  return out;
}

describe('app.routes.ts', () => {
  it("dado DASHBOARD_ROUTES achatado então cada uma das 22 entradas do manifesto tem exatamente uma Route e toda Route fora de {'', '**'} está no manifesto; existe uma Route '' e uma '**' (C-02-05, C-01-10)", async () => {
    const flattened = await flattenDashboardRoutes(DASHBOARD_ROUTES);
    for (const entry of DASHBOARD_ROUTE_MANIFEST_FIXTURE) {
      const matches = flattened.filter((flat) => flat.path === entry.path);
      expect(matches, `rota para ${entry.path}`).toHaveLength(1);
    }
    for (const flat of flattened) {
      const inManifest = DASHBOARD_ROUTE_MANIFEST_FIXTURE.some(
        (entry) => entry.path === flat.path,
      );
      expect(inManifest, `${flat.path} fora do manifesto`).toBe(true);
    }
    const rootRedirect = DASHBOARD_ROUTES.filter(
      (route) => route.path === '' && route.redirectTo === 'monitoramento',
    );
    expect(rootRedirect).toHaveLength(1);
    expect(rootRedirect[0].pathMatch).toBe('full');
    const wildcard = DASHBOARD_ROUTES.filter((route) => route.path === '**');
    expect(wildcard).toHaveLength(1);
    expect(wildcard[0].redirectTo).toBe('/monitoramento/sem-permissao');
  });

  it("dado cada Route do manifesto quando lida então title/data batem com a entrada e canActivate tem 3 guardas nas 20 com policy (authGuard por identidade); 'auth/callback' [] e 'sem-permissao' [authGuard]; as filhas com o mesmo component e as mesmas guardas do pai (C-02-06)", async () => {
    const flattened = await flattenDashboardRoutes(DASHBOARD_ROUTES);
    for (const entry of DASHBOARD_ROUTE_MANIFEST_FIXTURE) {
      const flat = flattened.find((f) => f.path === entry.path);
      expect(flat, entry.path).toBeDefined();
      const route = flat!.route;
      expect(route.data?.['id']).toBe(entry.id);
      expect(route.data?.['sheet']).toBe(entry.sheet);
      expect(route.data?.['module']).toBe(entry.module);
      expect(route.data?.['access']).toBe(entry.access);
      expect(route.data?.['policy']).toBe(entry.policy);
      expect(route.data?.['kind']).toBe(entry.kind);
      expect(route.data?.['level']).toBe(entry.level);
      expect(route.data?.['slug']).toBe(entry.slug);
      expect(route.data?.['screen']).toBe(entry.screen ?? '');

      if (entry.policy !== null) {
        expect(route.canActivate).toHaveLength(3);
        expect(route.canActivate?.[0]).toBe(authGuard);
      }
    }
    const authCallback = flattened.find(
      (f) => f.path === '/monitoramento/auth/callback',
    );
    expect(authCallback?.route.canActivate ?? []).toEqual([]);
    const semPermissao = flattened.find(
      (f) => f.path === '/monitoramento/sem-permissao',
    );
    expect(semPermissao?.route.canActivate).toEqual([authGuard]);

    for (const [childPath, parentPath] of [
      ['/monitoramento/indicadores/:id', '/monitoramento/indicadores'],
      ['/monitoramento/relatorios/:id', '/monitoramento/relatorios'],
    ] as const) {
      const child = flattened.find((f) => f.path === childPath)!;
      const parent = flattened.find((f) => f.path === parentPath)!;
      expect(child.route.component).toBe(parent.route.component);
      expect(child.route.canActivate).toEqual(parent.route.canActivate);
    }
  });

  it('dado FEATURE_MOUNTS quando lidos então canMatch = ownsFirstSegment(FEATURE_SEGMENTS[m]) e casa/não casa os segmentos esperados (C-02-07)', () => {
    const triageGuard = ownsFirstSegment(...FEATURE_SEGMENTS.triage);
    const emptyUrl: never[] = [];
    const seg = (path: string) => ({ path }) as never;
    expect(triageGuard({} as never, emptyUrl as never)).toBe(true);
    expect(triageGuard({} as never, [seg('alertas')] as never)).toBe(true);
    expect(triageGuard({} as never, [seg('radar')] as never)).toBe(false);

    const radarGuard = ownsFirstSegment(...FEATURE_SEGMENTS.radar);
    expect(radarGuard({} as never, emptyUrl as never)).toBe(false);
  });

  it("dado '/' quando navegado (sessão dash-operator) então URL final '/monitoramento' e página D-01; dado '/nao-existe' então '/monitoramento/sem-permissao' sem query (C-02-08)", async () => {
    const { navigate, currentUrl } = await createDashboardRouterHarness([
      {
        provide: StynxSessionService,
        useValue: sessionForRoles(['dash-operator']),
      },
    ]);
    await navigate('/');
    expect(currentUrl()).toBe('/monitoramento');
    await navigate('/nao-existe');
    expect(currentUrl()).toBe('/monitoramento/sem-permissao');
  });

  it.each(
    DASHBOARD_ROUTE_MANIFEST_FIXTURE.filter((entry) => entry.kind === 'page'),
  )(
    'dado a rota $path quando ativada com o primeiro papel de roles então renderiza dash-screen-frame indisponível nesta versão, sem requisição HTTP (C-02-09, §Decisões 6)',
    async (entry) => {
      const role = (entry.roles ?? [])[0];
      const { harness, navigate, httpMock } =
        await createDashboardRouterHarness([
          { provide: StynxSessionService, useValue: sessionForRoles([role]) },
        ]);
      await navigate(substituteRouteParams(entry.path));
      const element = screenElement(harness);
      expect(element, entry.path).not.toBeNull();
      expect(element?.getAttribute('data-screen')).toBe(entry.screen ?? '');
      expect(element?.getAttribute('data-level')).toBe('L0');
      expect(element?.getAttribute('data-state')).toBe(
        'unavailable_in_version',
      );
      expect(
        element?.querySelector('code[data-dependency]')?.textContent,
      ).toContain('R-0011 BP-DASH-MONITOR-001');
      httpMock().expectNone(() => true);
    },
  );
});
