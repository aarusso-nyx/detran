// serviceAvailabilityGuard(serviceKey) (plan.md M8/M15): o catálogo diz `unavailable` →
// `/servico-indisponivel/<key>` (motivo + canal alternativo, nunca 404);
// `partially_available` entra na tela, que limita o escopo.
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { ServiceCatalogFacade } from '../service-catalog.facade';

export const SERVICE_UNAVAILABLE_ROUTE = '/servico-indisponivel';

export function serviceAvailabilityGuard(serviceKey: string): CanActivateFn {
  return async () => {
    const facade = inject(ServiceCatalogFacade);
    const router = inject(Router);
    const availability = await facade.availability(serviceKey);
    if (availability.status !== 'unavailable') return true;
    return router.createUrlTree([SERVICE_UNAVAILABLE_ROUTE, serviceKey]);
  };
}
