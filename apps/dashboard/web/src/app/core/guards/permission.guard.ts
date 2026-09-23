// permissionGuard (CTG-0002.md §4): `session.can(policy)` sobre as permissões da sessão. Nunca
// lê papéis (a camada é do `layerGuard`; o passe global chega como `'*'` nas permissões).
import { inject } from '@angular/core';
import { Router, type CanActivateFn, type UrlTree } from '@angular/router';
import type { DashboardPolicyKey } from '../../app.route-manifest';
import { FORBIDDEN_ROUTE } from '../manifest-routes';
import { DashboardSessionFacade } from '../session.facade';

export const FORBIDDEN_FROM_PARAM = 'de';

export function forbiddenTree(router: Router, url: string): UrlTree {
  return router.createUrlTree([FORBIDDEN_ROUTE], {
    queryParams: { [FORBIDDEN_FROM_PARAM]: url },
  });
}

/** Uma instância por chave: rota-mãe e rota-filha de §B compartilham a MESMA guarda. */
const GUARDS = new Map<string, CanActivateFn>();

export function permissionGuard(
  policy: DashboardPolicyKey | null,
): CanActivateFn {
  const key = policy ?? '';
  const cached = GUARDS.get(key);
  if (cached) return cached;
  const guard: CanActivateFn = (_route, state) => {
    const router = inject(Router);
    if (policy === null) return forbiddenTree(router, state.url);
    return (
      inject(DashboardSessionFacade).can(policy) ||
      forbiddenTree(router, state.url)
    );
  };
  GUARDS.set(key, guard);
  return guard;
}
