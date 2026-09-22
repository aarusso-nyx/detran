// Fábrica de rotas a partir do manifesto (CTG-0002.md §3): cada entrada vira exatamente uma
// `Route`, com o `title` (chave i18n), o `data` derivado da entrada e as guardas na ordem fixa
// auth → permissão → camada. O título é da rota, nunca do componente.
import type { Type } from '@angular/core';
import type { CanActivateFn, Route, Routes, UrlSegment } from '@angular/router';
import {
  manifestEntriesOf,
  routePathOf,
  titleKeyOf,
  type DashboardModule,
  type DashboardRouteEntry,
} from '../app.route-manifest';
import { UnavailablePageComponent } from './pages/unavailable.page';
import { authGuard } from './guards/auth.guard';
import { layerGuard } from './guards/layer.guard';
import { permissionGuard } from './guards/permission.guard';

export const MONITORAMENTO_SEGMENT = 'monitoramento';
export const FORBIDDEN_ROUTE = '/monitoramento/sem-permissao';

export interface ManifestRouteOptions {
  readonly component?: Type<unknown>;
}

/**
 * `canMatch` do módulo lazy montado em `path: ''`: casa quando o primeiro segmento da URL é do
 * módulo. `''` em `segments` casa a URL vazia — D-01 é a raiz do módulo `triage`.
 *
 * O tipo de retorno declara só os dois parâmetros que a regra usa (é atribuível a `CanMatchFn`,
 * que em Angular 22 recebe um terceiro argumento de contexto).
 */
export function ownsFirstSegment(
  ...segments: readonly string[]
): (route: Route, url: UrlSegment[]) => boolean {
  return (_route: Route, url: UrlSegment[]) =>
    segments.includes(url[0]?.path ?? '');
}

/** Ordem fixa (§Decisões 4); auxiliares: `auth/callback` anônima, `sem-permissao` só autenticada. */
export function guardsFor(entry: DashboardRouteEntry): CanActivateFn[] {
  if (entry.kind === 'auxiliary') {
    return entry.slug === 'auth-callback' ? [] : [authGuard];
  }
  return [authGuard, permissionGuard(entry.policy), layerGuard(entry.access)];
}

export function manifestRoute(
  entry: DashboardRouteEntry,
  options: ManifestRouteOptions = {},
): Route {
  const path = routePathOf(entry);
  return {
    path,
    ...(path === '' ? { pathMatch: 'full' as const } : {}),
    title: titleKeyOf(entry),
    component: options.component ?? UnavailablePageComponent,
    canActivate: guardsFor(entry),
    data: {
      screen: entry.screen ?? '',
      id: entry.id,
      sheet: entry.sheet,
      module: entry.module,
      access: entry.access,
      policy: entry.policy,
      kind: entry.kind,
      level: entry.level,
      slug: entry.slug,
      blocks: entry.blocks,
    },
  };
}

/** Rotas de um módulo, na ordem do manifesto (as filhas de §B são irmãs, nunca `children`). */
export function moduleRoutes(
  module: DashboardModule,
  options: Readonly<Record<string, ManifestRouteOptions>> = {},
): Routes {
  return manifestEntriesOf(module).map((entry) =>
    manifestRoute(entry, options[entry.path] ?? {}),
  );
}

/** Primeiro segmento de cada módulo de feature (ordem de §Decisões 1). */
export const FEATURE_SEGMENTS: Readonly<
  Record<Exclude<DashboardModule, 'core'>, readonly string[]>
> = {
  triage: ['', 'alertas'],
  radar: ['radar'],
  integrations: ['integracoes'],
  duties: ['deveres'],
  comparison: ['comparativo'],
  audit: ['auditoria'],
  transparency: ['transparencia'],
  crashes: ['sinistros'],
  catalogue: ['indicadores', 'frescor', 'kpis'],
  reports: ['relatorios', 'exportacoes'],
};
