// roleGuard (plan.md M4; contrato CTG-0002a §4): papel é por rota (spec §3), permissão é por
// ação (`*stynxHasPermission`) — este guard nunca consulta `permissions()`. Aceita quando
// `roles === 'all'` e a sessão tem algum papel canônico, ou quando `roles ∩ roles()` ≠ ∅ (união de
// papéis, ADR-0005). Nega com `UrlTree('/sem-permissao?de=<url>')` (`onDeny: 'redirect'`) ou com
// `false` (`onDeny: 'skip'`, só nos `canMatch` da aba inicial de `/casos/:id`).
import { inject } from '@angular/core';
import {
  Router,
  type ActivatedRouteSnapshot,
  type CanActivateFn,
  type CanMatchFn,
  type Route,
  type RouterStateSnapshot,
  type UrlSegment,
  type UrlTree,
} from '@angular/router';
import type { RaitRoleCode } from '../../app.route-manifest';
import { RaitSessionFacade } from '../session.facade';

export const FORBIDDEN_ROUTE = '/sem-permissao';
export const FORBIDDEN_FROM_PARAM = 'de';

export interface RoleGuardOptions {
  readonly onDeny?: 'redirect' | 'skip';
}

/**
 * URL pedida pelo usuário: a `initialUrl` da navegação em curso (antes de redirecionamentos de
 * reconhecimento, como a aba inicial de `/casos/:id`), senão `state.url`.
 */
export function requestedUrl(
  router: Router,
  state: RouterStateSnapshot,
): string {
  const navigation = router.getCurrentNavigation();
  return navigation ? router.serializeUrl(navigation.initialUrl) : state.url;
}

/** `UrlTree` de `/sem-permissao?de=<url pedida>` (só para exibição; nunca navega de volta). */
export function forbiddenUrlTree(router: Router, from: string): UrlTree {
  return router.createUrlTree([FORBIDDEN_ROUTE], {
    queryParams: { [FORBIDDEN_FROM_PARAM]: from },
  });
}

export function roleAccepts(
  roles: readonly RaitRoleCode[] | 'all',
  session: RaitSessionFacade,
): boolean {
  if (roles === 'all') return session.canonicalRoles().length > 0;
  return session.hasRole(...roles);
}

export function roleGuard(
  roles: readonly RaitRoleCode[] | 'all',
  options: RoleGuardOptions = {},
): CanActivateFn & CanMatchFn {
  const onDeny = options.onDeny ?? 'redirect';
  return (
    routeOrSnapshot: Route | ActivatedRouteSnapshot,
    segmentsOrState: UrlSegment[] | RouterStateSnapshot,
  ) => {
    const session = inject(RaitSessionFacade);
    if (roleAccepts(roles, session)) return true;
    if (onDeny === 'skip') return false;
    const router = inject(Router);
    const from = Array.isArray(segmentsOrState)
      ? `/${segmentsOrState.map((segment) => segment.path).join('/')}`
      : requestedUrl(router, segmentsOrState);
    return forbiddenUrlTree(router, from);
  };
}
