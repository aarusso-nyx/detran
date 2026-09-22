// layerGuard (CTG-0002.md §4): camada do usuário × camada exigida pela rota. Nunca lê
// permissões — o passe global (`'*'`) não alcança a camada (`route-manifest.md` §E; A1).
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import {
  dashboardLayerAllows,
  type DashboardLayerRequirement,
} from '../layer-table';
import { DashboardSessionFacade } from '../session.facade';
import { forbiddenTree } from './permission.guard';

/** Uma instância por camada exigida: rota-mãe e rota-filha de §B compartilham a MESMA guarda. */
const GUARDS = new Map<string, CanActivateFn>();

export function layerGuard(
  access: DashboardLayerRequirement | null,
): CanActivateFn {
  const key = access ?? '';
  const cached = GUARDS.get(key);
  if (cached) return cached;
  const guard: CanActivateFn = (_route, state) => {
    const router = inject(Router);
    if (access === null) return forbiddenTree(router, state.url);
    return (
      dashboardLayerAllows(inject(DashboardSessionFacade).roles(), access) ||
      forbiddenTree(router, state.url)
    );
  };
  GUARDS.set(key, guard);
  return guard;
}
