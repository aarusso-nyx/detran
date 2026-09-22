// R-0012 TASK-0005 (Inspector). Critérios C-2A-05…11 do contrato `CTG-0002a.md` §11: árvore de
// rotas (`RAIT_ROUTES`), com os 15 `loadChildren` resolvidos no teste (padrão
// `apps/portal/web/src/app/app.routes.spec.ts`). Falha esperada nesta entrega: os módulos de
// produção (`app.routes.ts`, `core/manifest-routes.ts`, `shared/placeholder-page.component.ts`,
// `core/pages/forbidden.page.ts`) não existem ainda.
import type { CanMatchFn, Route, Routes, UrlSegment } from '@angular/router';
import { UrlSegment as UrlSegmentCtor } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { RAIT_ROUTES } from './app.routes';
import { FEATURE_SEGMENTS, ownsFirstSegment } from './core/manifest-routes';
import { RAIT_ROUTE_MANIFEST_FIXTURE } from '../testing/route-manifest.fixture';
import {
  createRaitRouterHarness,
  screenElement,
} from '../testing/router-harness';

interface FlatRoute {
  readonly path: string;
  readonly route: Route;
}

function joinPath(prefix: string, segment: string): string {
  return [prefix, segment].filter((part) => part !== '').join('/');
}

async function flatten(routes: Routes, prefix = ''): Promise<FlatRoute[]> {
  const result: FlatRoute[] = [];
  for (const route of routes) {
    if (route.path === undefined) continue;
    const path = joinPath(prefix, route.path);
    result.push({ path, route });
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

/** A Route "de manifesto" num `path` é a única, entre as que casam esse path achatado, que tem
 * `data` (produzida por `manifestRoute()`) — distingue da(s) Route(s) puramente estruturais de
 * `path: ''` (FEATURE_MOUNTS, o wrapper raiz, os 4 redirects de aba inicial de `casos/:id`). */
function manifestRouteAt(flat: readonly FlatRoute[], path: string): Route {
  const candidates = flat.filter(
    (entry) => entry.path === path && entry.route.data !== undefined,
  );
  if (candidates.length !== 1) {
    throw new Error(
      `esperava exatamente 1 Route com data em "${path}", achei ${candidates.length}`,
    );
  }
  return candidates[0].route;
}

describe('C-2A-05 — RAIT_ROUTES achatado cobre exatamente o manifesto + **', () => {
  it('dado RAIT_ROUTES achatado quando comparado ao manifesto então mesmo conjunto de paths (74) e nenhum a mais além de **', async () => {
    const flat = await flatten(RAIT_ROUTES);
    const actualPaths = new Set(
      flat.map((entry) => entry.path).filter((path) => path !== '**'),
    );
    const expectedPaths = new Set(
      RAIT_ROUTE_MANIFEST_FIXTURE.map((entry) => entry.path),
    );
    expect(actualPaths).toEqual(expectedPaths);
  });

  it('dado RAIT_ROUTES quando inspecionado então existe exatamente uma Route "**" com title rait.states.not_found', () => {
    const wildcards = RAIT_ROUTES.filter((route) => route.path === '**');
    expect(wildcards).toHaveLength(1);
    expect(wildcards[0].title).toBe('rait.states.not_found');
  });
});

describe('C-2A-06 — cada Route page/layout tem title/data/canActivate corretos', () => {
  RAIT_ROUTE_MANIFEST_FIXTURE.forEach((entry) => {
    if (entry.kind === 'redirect') return;
    it(`dado a rota "${entry.path || '/'}" (${entry.kind}) quando lida então title/data/canActivate batem com o manifesto`, async () => {
      const flat = await flatten(RAIT_ROUTES);
      const route = manifestRouteAt(flat, entry.path);
      const slug =
        entry.path === ''
          ? 'home'
          : entry.path.replace(/:/g, '').replace(/\//g, '-');
      expect(route.title).toBe(`rait.screens.${slug}.title`);
      expect(route.data?.['screen']).toBe(entry.screen ?? '');
      expect(route.data?.['sheet']).toBe(entry.sheet);
      expect(route.data?.['module']).toBe(entry.module);
      expect(route.data?.['roles']).toEqual(entry.roles);
      expect(route.data?.['kind']).toBe(entry.kind);
      expect(route.data?.['level']).toBe(entry.level);

      if (entry.path === 'auth/callback') {
        expect(route.canActivate ?? []).toHaveLength(0);
      } else if (entry.path === 'sem-permissao') {
        expect(route.canActivate).toHaveLength(1);
      } else if (entry.path === 'casos/:id') {
        expect(route.canActivate).toHaveLength(3); // auth, role, caseAccess
      } else {
        expect(route.canActivate).toHaveLength(2); // auth, role
      }
    });
  });
});

describe('C-2A-07 — Route "" (home)', () => {
  it('dado a Route "" quando lida então pathMatch "full" e 3 guardas (auth, role, roleHomeRedirect)', async () => {
    const flat = await flatten(RAIT_ROUTES);
    const route = manifestRouteAt(flat, '');
    expect(route.pathMatch).toBe('full');
    expect(route.canActivate).toHaveLength(3);
  });
});

describe('C-2A-08 — as 8 raízes de grupo', () => {
  const groupRoots = RAIT_ROUTE_MANIFEST_FIXTURE.filter(
    (entry) => entry.kind === 'redirect' && entry.path !== '',
  );

  it('dado o manifesto quando filtradas as raízes de grupo então são 8', () => {
    expect(groupRoots).toHaveLength(8);
  });

  groupRoots.forEach((entry) => {
    it(`dado a raiz de grupo "${entry.path}" quando lida então pathMatch "full" e 3 guardas (auth, role, groupRedirect)`, async () => {
      const flat = await flatten(RAIT_ROUTES);
      const route = manifestRouteAt(flat, entry.path);
      expect(route.pathMatch).toBe('full');
      expect(route.canActivate).toHaveLength(3);
    });
  });
});

describe('C-2A-09 — children de casos/:id', () => {
  it('dado a Route "casos/:id" quando lida então 1 rota "" com redirectTo função (Angular 22 proíbe redirectTo + canMatch, NG04014) seguida das 11 abas com title', async () => {
    // A7(b): a versão anterior assumia 4 redirects com canMatch por papel, mas o Angular 22
    // rejeita `redirectTo` combinado com `canMatch` (NG04014). A aba inicial de `casos/:id` é
    // UMA rota `''` `pathMatch: 'full'` com `redirectTo` funcional (`caseInitialTabFor`); o
    // comportamento por papel (qual aba é escolhida) é C-2A-22, em `core/guards.spec.ts`.
    const flat = await flatten(RAIT_ROUTES);
    const layout = manifestRouteAt(flat, 'casos/:id');
    const children = layout.children ?? [];
    const initialTabRoutes = children.filter((child) => child.path === '');
    expect(initialTabRoutes).toHaveLength(1);
    const [initialTab] = initialTabRoutes;
    expect(initialTab.pathMatch).toBe('full');
    expect(typeof initialTab.redirectTo).toBe('function');
    expect(initialTab.canMatch).toBeUndefined();

    const abas = RAIT_ROUTE_MANIFEST_FIXTURE.filter((entry) =>
      entry.path.startsWith('casos/:id/'),
    );
    expect(abas).toHaveLength(11);
    for (const aba of abas) {
      const relative = aba.path.slice('casos/:id/'.length);
      const child = children.find((c) => c.path === relative);
      expect(child, `aba ausente: ${relative}`).toBeDefined();
      const slug = aba.path.replace(/:/g, '').replace(/\//g, '-');
      expect(child?.title).toBe(`rait.screens.${slug}.title`);
    }
  });
});

describe('C-2A-10 — FEATURE_MOUNTS e ownsFirstSegment', () => {
  it('dado o wrapper raiz (RAIT_ROUTES[0].children) quando lidos os 15 primeiros então path "" e canMatch por FEATURE_SEGMENTS, na ordem', () => {
    const rootChildren = RAIT_ROUTES[0]?.children ?? [];
    const featureModules = Object.keys(FEATURE_SEGMENTS);
    expect(featureModules).toHaveLength(15);
    const mounts = rootChildren.slice(0, 15);
    expect(mounts).toHaveLength(15);
    for (const mount of mounts) {
      expect(mount.path).toBe('');
      expect(mount.canMatch).toBeDefined();
      expect(mount.loadChildren).toBeDefined();
    }
  });

  function seg(path: string): UrlSegment {
    return new UrlSegmentCtor(path, {});
  }

  it('dado ownsFirstSegment("painel") quando o primeiro segmento é "painel" então true', () => {
    const guard = ownsFirstSegment('painel') as CanMatchFn;
    expect(guard({} as never, [seg('painel')], {} as never)).toBe(true);
  });

  it('dado ownsFirstSegment("painel") quando o primeiro segmento é "painell" então false', () => {
    const guard = ownsFirstSegment('painel') as CanMatchFn;
    expect(guard({} as never, [seg('painell')], {} as never)).toBe(false);
  });

  it('dado ownsFirstSegment("painel") quando não há segmentos então false', () => {
    const guard = ownsFirstSegment('painel') as CanMatchFn;
    expect(guard({} as never, [], {} as never)).toBe(false);
  });
});

describe('C-2A-11 / C-2B-63 — página L0 (sem página real nesta rodada) renderiza o placeholder', () => {
  // Atualização de C-2A-11 (CTG-0002b.md §8, "Atualização de C-2A-11"): com o CTG-0002b, as
  // rotas L1/L2 passam a ter página real (C-2B-61/62) — o placeholder só continua para as 13
  // rotas L0 do manifesto (M13). É o mesmo `it`, restrito por `level === 'L0'`.
  const placeholderEntries = RAIT_ROUTE_MANIFEST_FIXTURE.filter(
    (entry) => entry.kind === 'page' && entry.level === 'L0',
  );

  it('dado o manifesto quando filtradas as rotas L0 então são 13', () => {
    expect(placeholderEntries).toHaveLength(13);
  });

  placeholderEntries.forEach((entry) => {
    it(`dado a rota "${entry.path}" ativada com o papel mínimo quando renderizada então rait-placeholder-page com data-screen="${entry.screen ?? ''}"`, async () => {
      const minimalRole =
        entry.roles === 'all' ? 'rait-analyst' : entry.roles[0];
      const { createSessionStub } = await import('../testing/session.stub');
      const { RaitSessionFacade } = await import('./core/session.facade');
      const session = createSessionStub({ active: true, roles: [minimalRole] });
      const { substituteRouteParams } =
        await import('../testing/router-harness');
      const url = `/${substituteRouteParams(entry.path)}`;
      const harness = await createRaitRouterHarness([
        { provide: RaitSessionFacade, useValue: session },
      ]);
      await harness.navigateByUrl(url);
      const element = screenElement(harness);
      expect(element).not.toBeNull();
      expect(element?.tagName.toLowerCase()).toBe('rait-placeholder-page');
      expect(element?.getAttribute('data-screen')).toBe(entry.screen ?? '');
      // `createRaitRouterHarness` fixa `STYNX_I18N_OPTIONS` com catálogo vazio: `stynxTranslate`
      // cai no fallback da própria lib (`catalogState()[key] ?? key`) e mostra a chave — o
      // suficiente para verificar que `detran-error-state` recebeu o título certo, sem montar um
      // catálogo real aqui.
      const errorState = element?.querySelector('detran-error-state');
      expect(errorState).not.toBeNull();
      expect(errorState?.textContent ?? '').toContain(
        'rait.states.unavailable_in_version',
      );
    });
  });
});
