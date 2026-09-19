// R-0014 TASK-0002 (Inspector). `PORTAL_ROUTES` (M7 do plan.md) achatado recursivamente
// (`children` e `loadChildren`, carregados no teste) e comparado ao conjunto de `path` do
// manifesto (prompt §B.2): cobertura total e nenhuma rota a mais; toda rota do manifesto tem
// `title`; a rota `**` existe e resolve para uma página "não encontrada" (`data-screen=""`).
import type { Route, Routes } from '@angular/router';
import { PORTAL_ROUTES } from './app.routes';
import { PORTAL_ROUTE_MANIFEST_FIXTURE } from '../testing/route-manifest.fixture';
import {
  createPortalRouterHarness,
  screenElement,
} from '../testing/router-harness';

interface FlatRoute {
  readonly path: string;
  readonly title: Route['title'];
}

function joinPath(prefix: string, segment: string): string {
  return [prefix, segment].filter((part) => part !== '').join('/');
}

async function flatten(routes: Routes, prefix = ''): Promise<FlatRoute[]> {
  const result: FlatRoute[] = [];
  for (const route of routes) {
    if (route.path === '**') continue; // rota coringa: validada à parte
    if (route.path === undefined) continue; // sem path próprio (nunca deveria ocorrer no manifesto)
    const path = joinPath(prefix, route.path);
    result.push({ path, title: route.title });
    if (route.children) {
      result.push(...(await flatten(route.children, path)));
    }
    if (route.loadChildren) {
      const loaded = await route.loadChildren();
      const childRoutes = (
        Array.isArray(loaded) ? loaded : (loaded as { default: Routes }).default
      ) as Routes;
      result.push(...(await flatten(childRoutes, path)));
    }
  }
  return result;
}

describe('PORTAL_ROUTES', () => {
  it('dado PORTAL_ROUTES achatado (children + loadChildren) quando comparado ao manifesto então cobre todo path e nenhum a mais', async () => {
    const flat = await flatten(PORTAL_ROUTES);
    const actualPaths = new Set(flat.map((route) => route.path));
    const expectedPaths = new Set(
      PORTAL_ROUTE_MANIFEST_FIXTURE.map((entry) => entry.path),
    );
    expect(actualPaths).toEqual(expectedPaths);
  });

  it('dado cada rota do manifesto quando localizada em PORTAL_ROUTES então tem title', async () => {
    const flat = await flatten(PORTAL_ROUTES);
    const byPath = new Map(flat.map((route) => [route.path, route]));
    for (const entry of PORTAL_ROUTE_MANIFEST_FIXTURE) {
      const route = byPath.get(entry.path);
      expect(
        route,
        `rota ausente em PORTAL_ROUTES: ${entry.path}`,
      ).toBeDefined();
      expect(route?.title, `rota sem title: ${entry.path}`).toBeDefined();
    }
  });

  it('dado PORTAL_ROUTES quando inspecionado então a rota ** existe', () => {
    expect(PORTAL_ROUTES.some((route) => route.path === '**')).toBe(true);
  });

  it('dado uma URL fora do manifesto quando navega então resolve a rota ** com data-screen=""', async () => {
    const { harness } = await createPortalRouterHarness(PORTAL_ROUTES, []);
    await harness.navigateByUrl('/rota-inexistente-jamais-declarada');
    const element = screenElement(harness);
    expect(element).not.toBeNull();
    expect(element?.getAttribute('data-screen')).toBe('');
  });
});
