// Fábrica de rotas a partir do manifesto (plan.md M7/M8): cada entrada vira uma `Route` com
// `title`, `data.screen`, componente (placeholder até o CTG-0003) e guardas na ordem fixada —
// auth → assurance → availability → entitlement. `anonimo` e `nenhum_ou_simples`: sem guarda
// (sessão opcional). Os módulos lazy (`features/<module>/<module>.routes.ts`) só chamam
// `moduleRoutes(<module>)` e trocam componentes por rota quando existirem.
import type { Type } from '@angular/core';
import type {
  CanActivateFn,
  CanMatchFn,
  Route,
  Routes,
  UrlSegment,
} from '@angular/router';
import {
  manifestEntriesOf,
  type PortalModule,
  type RouteManifestEntry,
} from '../app.route-manifest';
import { PlaceholderPageComponent } from '../shared/placeholder-page.component';
import { assuranceGuard } from './guards/assurance.guard';
import { portalAuthGuard } from './guards/auth.guard';
import { entitlementGuard } from './guards/entitlement.guard';
import { serviceAvailabilityGuard } from './guards/service-availability.guard';

/** Título das rotas ainda não construídas (plan.md M8; TASK-0006 traz os títulos reais). */
export const PLACEHOLDER_TITLE_KEY = 'portal.states.unavailable_in_version';

export interface ManifestRouteOptions {
  readonly component?: Type<unknown>;
  readonly title?: string;
}

export function guardsFor(entry: RouteManifestEntry): CanActivateFn[] {
  const guards: CanActivateFn[] = [];
  if (entry.access === 'simples' || entry.access === 'avancada') {
    guards.push(portalAuthGuard, assuranceGuard(entry.access));
  }
  if (entry.serviceKey) {
    guards.push(serviceAvailabilityGuard(entry.serviceKey));
  }
  if (entry.entitlement) {
    guards.push(entitlementGuard(entry.entitlement.kind));
  }
  return guards;
}

export function manifestRoute(
  entry: RouteManifestEntry,
  options: ManifestRouteOptions = {},
): Route {
  return {
    path: entry.path,
    ...(entry.path === '' ? { pathMatch: 'full' as const } : {}),
    title: options.title ?? PLACEHOLDER_TITLE_KEY,
    component: options.component ?? PlaceholderPageComponent,
    canActivate: guardsFor(entry),
    data: {
      screen: entry.screen ?? '',
      sheet: entry.sheet,
      module: entry.module,
      access: entry.access,
    },
  };
}

/** Rotas de um módulo, na ordem do manifesto, com os componentes indicados por `path`. */
export function moduleRoutes(
  module: PortalModule,
  options: Readonly<Record<string, ManifestRouteOptions>> = {},
): Routes {
  return manifestEntriesOf(module).map((entry) =>
    manifestRoute(entry, options[entry.path] ?? {}),
  );
}

/**
 * `canMatch` de um módulo lazy montado em `path: ''`: só carrega o chunk quando o primeiro
 * segmento da URL pertence ao módulo (os caminhos completos ficam dentro do chunk).
 */
export function ownsFirstSegment(...segments: readonly string[]): CanMatchFn {
  return (_route: Route, url: UrlSegment[]) =>
    url.length > 0 && segments.includes(url[0].path);
}
