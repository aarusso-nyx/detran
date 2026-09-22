// Fábrica de rotas a partir do manifesto (plan.md M3/M4/M6; contrato CTG-0002a §3; padrão
// `apps/portal/web/src/app/core/manifest-routes.ts`): cada entrada vira exatamente uma `Route`
// com `title` = `rait.screens.<slug>.title`, `data` (`screen`, `sheet`, `module`, `roles`,
// `kind`, `level`), componente (placeholder até o CTG-0002b) e guardas na ordem fixada
// auth → role → (caseAccess só em `casos/:id`). Redirect roots e `''` têm `pathMatch: 'full'`
// e a guarda de redirecionamento; o layout `casos/:id` recebe o redirect de aba inicial
// (tabela C, só quando a URL termina em `/casos/:id`) e as 11 abas como filhos relativos.
import { inject, type Type } from '@angular/core';
import type {
  CanActivateFn,
  CanMatchFn,
  Route,
  Routes,
  UrlSegment,
} from '@angular/router';
import {
  manifestEntriesOf,
  titleKeyOf,
  type RaitModule,
  type RaitRoleCode,
  type RaitRouteEntry,
} from '../app.route-manifest';
import {
  PlaceholderLayoutComponent,
  PlaceholderPageComponent,
} from '../shared/placeholder-page.component';
import { raitAuthGuard } from './guards/auth.guard';
import { caseAccessGuard } from './guards/case-access.guard';
import { groupRedirectGuard } from './guards/group-redirect.guard';
import { roleGuard } from './guards/role.guard';
import { roleHomeRedirectGuard } from './role-home';
import { RaitSessionFacade } from './session.facade';

export const NOT_FOUND_TITLE_KEY = 'rait.states.not_found';

const CASE_LAYOUT_PATH = 'casos/:id';
const AUTH_CALLBACK_PATH = 'auth/callback';
const FORBIDDEN_PATH = 'sem-permissao';

export interface ManifestRouteOptions {
  readonly component?: Type<unknown>;
  readonly title?: string;
}

export type FeatureModule = Exclude<RaitModule, 'core'>;

/** Primeiro segmento da URL que cada módulo lazy possui (spec §2/§4; `caso` vive em `/casos`). */
export const FEATURE_SEGMENTS: Readonly<
  Record<FeatureModule, readonly string[]>
> = {
  painel: ['painel'],
  fila: ['fila'],
  caso: ['casos'],
  protocolo: ['protocolo'],
  assinatura: ['assinatura'],
  autoridade: ['autoridade'],
  colegiado: ['colegiado'],
  gestao: ['gestao'],
  organizacao: ['organizacao'],
  integracoes: ['integracoes'],
  financeiro: ['financeiro'],
  arquivo: ['arquivo'],
  auditoria: ['auditoria'],
  admin: ['admin'],
  conta: ['conta'],
};

/**
 * `canMatch` de um módulo lazy montado em `path: ''`: só carrega o chunk quando o primeiro
 * segmento da URL pertence ao módulo (os caminhos completos ficam dentro do chunk).
 */
export function ownsFirstSegment(...segments: readonly string[]): CanMatchFn {
  return (_route: Route, url: UrlSegment[]) =>
    url.length > 0 && segments.includes(url[0].path);
}

/** Ordem fixa: auth → role → caseAccess (spec §3); `auth/callback` pública (A2). */
export function guardsFor(entry: RaitRouteEntry): CanActivateFn[] {
  if (entry.path === AUTH_CALLBACK_PATH) return [];
  if (entry.path === FORBIDDEN_PATH) return [raitAuthGuard];
  const guards: CanActivateFn[] = [raitAuthGuard, roleGuard(entry.roles)];
  if (entry.path === CASE_LAYOUT_PATH) guards.push(caseAccessGuard);
  return guards;
}

function dataOf(entry: RaitRouteEntry): Route['data'] {
  return {
    screen: entry.screen ?? '',
    sheet: entry.sheet,
    module: entry.module,
    roles: entry.roles,
    kind: entry.kind,
    level: entry.level,
  };
}

/** Tabela C (route-manifest.md): papel com aba própria → aba, na ordem de `RAIT_ROLE_PRECEDENCE`. */
const CASE_INITIAL_TABS: ReadonlyMap<RaitRoleCode, string> = new Map([
  ['rait-analyst', 'triagem'],
  ['rait-rapporteur', 'dossie'],
  ['rait-signing-authority', 'decisao'],
]);
const CASE_DEFAULT_TAB = 'resumo';

/** Puro: aba inicial de `/casos/:id` para os papéis canônicos da sessão (já em precedência). */
export function caseInitialTabFor(
  canonicalRoles: readonly RaitRoleCode[],
): string {
  const withTab = canonicalRoles.find((role) => CASE_INITIAL_TABS.has(role));
  return withTab
    ? (CASE_INITIAL_TABS.get(withTab) ?? CASE_DEFAULT_TAB)
    : CASE_DEFAULT_TAB;
}

/**
 * Tabela C: aba inicial por papel, só quando a URL termina em `/casos/:id` (`pathMatch: 'full'`).
 * Uma única rota com `redirectTo` funcional (resolvido em contexto de injeção): o Angular 22
 * rejeita `redirectTo` junto de `canMatch` (NG04014 — o redirecionamento acontece antes das
 * guardas), então a escolha por papel não pode ser feita com quatro rotas `canMatch` + `redirectTo`
 * como o contrato §3 descreve; a semântica (precedência `RAIT_ROLE_PRECEDENCE`, só papéis com
 * aba própria, `resumo` para os demais) é a mesma.
 */
export function caseInitialTabRoutes(): Routes {
  return [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: () =>
        caseInitialTabFor(inject(RaitSessionFacade).canonicalRoles()),
    },
  ];
}

function relativePath(entry: RaitRouteEntry, parent: RaitRouteEntry): string {
  return entry.path.slice(parent.path.length + 1);
}

export function manifestRoute(
  entry: RaitRouteEntry,
  options: ManifestRouteOptions = {},
  children: Routes = [],
): Route {
  const title = options.title ?? titleKeyOf(entry);
  const data = dataOf(entry);
  switch (entry.kind) {
    case 'redirect':
      return {
        path: entry.path,
        pathMatch: 'full',
        title,
        component: PlaceholderPageComponent,
        canActivate: [
          ...guardsFor(entry),
          entry.path === '' ? roleHomeRedirectGuard : groupRedirectGuard(entry),
        ],
        data,
      };
    case 'layout':
      return {
        path: entry.path,
        title,
        component: options.component ?? PlaceholderLayoutComponent,
        canActivate: guardsFor(entry),
        data,
        children: [...caseInitialTabRoutes(), ...children],
      };
    default:
      return {
        path: entry.path,
        ...(entry.path === '' ? { pathMatch: 'full' as const } : {}),
        title,
        component: options.component ?? PlaceholderPageComponent,
        canActivate: guardsFor(entry),
        data,
      };
  }
}

/**
 * Rotas de um módulo, na ordem do manifesto, com os componentes indicados por `path`. Uma
 * entrada cujo `path` começa por `<layout.path>/` vira filho do layout, com `path` relativo
 * (só ocorre em `caso`); as demais são planas.
 */
export function moduleRoutes(
  module: RaitModule,
  options: Readonly<Record<string, ManifestRouteOptions>> = {},
): Routes {
  const entries = manifestEntriesOf(module);
  const layouts = entries.filter((entry) => entry.kind === 'layout');
  const routes: Routes = [];
  for (const entry of entries) {
    const parent = layouts.find((layout) =>
      entry.path.startsWith(`${layout.path}/`),
    );
    if (parent) continue;
    if (entry.kind === 'layout') {
      const tabs = entries
        .filter((child) => child.path.startsWith(`${entry.path}/`))
        .map((child) => ({
          ...manifestRoute(child, options[child.path] ?? {}),
          path: relativePath(child, entry),
        }));
      routes.push(manifestRoute(entry, options[entry.path] ?? {}, tabs));
      continue;
    }
    routes.push(manifestRoute(entry, options[entry.path] ?? {}));
  }
  return routes;
}
