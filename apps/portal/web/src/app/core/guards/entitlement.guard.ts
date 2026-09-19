// entitlementGuard(kind) (plan.md M8; portal-route-contract.md §1.2): o id vem do parâmetro de
// rota do manifesto (`:aitId` para `ait`, …); vínculo negado → tela "por que não vejo isto"
// (`/vinculo/por-que-nao-vejo?recurso=<kind>&id=<id>`), nunca 404 nem "acesso negado".
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { EntitlementFacade, type EntitlementKind } from '../entitlement.facade';

export const ENTITLEMENT_MISSING_ROUTE = '/vinculo/por-que-nao-vejo';

export const ENTITLEMENT_PARAM: Readonly<Record<EntitlementKind, string>> = {
  ait: 'aitId',
  request: 'requestId',
  vehicle: 'vehicleId',
  crash: 'crashId',
  exam: 'examId',
  manifestation: 'manifestationId',
};

export function entitlementGuard(kind: EntitlementKind): CanActivateFn {
  return async (route) => {
    const id = route.paramMap.get(ENTITLEMENT_PARAM[kind]) ?? '';
    const facade = inject(EntitlementFacade);
    const router = inject(Router);
    if (id && (await facade.check(kind, id))) return true;
    return router.createUrlTree([ENTITLEMENT_MISSING_ROUTE], {
      queryParams: { recurso: kind, id },
    });
  };
}
