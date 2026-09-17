// EntitlementFacade (plan.md M8; portal-route-contract.md §1.2): o vínculo CPF ↔ recurso é
// decidido no servidor. `check` lê o recurso: 200 prova o vínculo; 404 `PORTAL.NOT_FOUND`
// (disfarce de inexistência) ou qualquer `PORTAL.ENTITLEMENT_*` o nega. Outros erros (rede,
// 5xx) não são "sem vínculo": propagam para o `ErrorBoundary`. Token abstrato substituível por
// `useValue` nos testes (detran-ui-guide.md §5).
import { Injectable, inject } from '@angular/core';
import { PortalClient, type EntitlementKind } from '../data/portal.client';
import { classifyError } from './error-boundary';

export type { EntitlementKind } from '../data/portal.client';

const ENTITLEMENT_CODE_PREFIX = 'PORTAL.ENTITLEMENT_';
const NOT_FOUND_CODE = 'PORTAL.NOT_FOUND';

export function deniesEntitlement(error: unknown): boolean {
  const { code, status } = classifyError(error);
  if (code === NOT_FOUND_CODE) return true;
  if (code?.startsWith(ENTITLEMENT_CODE_PREFIX)) return true;
  return status === 404;
}

@Injectable({
  providedIn: 'root',
  useFactory: () => inject(PortalEntitlementFacade),
})
export abstract class EntitlementFacade {
  abstract check(kind: EntitlementKind, id: string): Promise<boolean>;
}

@Injectable({ providedIn: 'root' })
export class PortalEntitlementFacade extends EntitlementFacade {
  private readonly client = inject(PortalClient);

  async check(kind: EntitlementKind, id: string): Promise<boolean> {
    try {
      await this.client.entitledResource(kind, id);
      return true;
    } catch (error) {
      if (deniesEntitlement(error)) return false;
      throw error;
    }
  }
}
