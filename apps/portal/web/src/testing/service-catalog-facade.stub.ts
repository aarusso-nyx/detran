// R-0014 TASK-0002 (Inspector, iteração 2 — adenda A2). Stub de
// `ServiceCatalogFacade.availability(serviceKey)` (M8): `{ status: 'available' |
// 'partially_available' | 'unavailable'; reason?: string }`. Só usado por specs; `import type`
// evita resolução em runtime antes de TASK-0004. `ReturnType<typeof vi.fn>` é
// `Mock<Procedure | Constructable>` sob vitest 4 (sem assinatura de chamada): tipamos com
// `Mock<ServiceCatalogFacade['availability']>` (plan.md §Adendas A2).
import { vi, type Mock } from 'vitest';
import type { ServiceCatalogFacade } from '../app/core/service-catalog.facade';

export interface ServiceAvailability {
  readonly status: 'available' | 'partially_available' | 'unavailable';
  readonly reason?: string;
}

export interface ServiceCatalogFacadeStub extends ServiceCatalogFacade {
  readonly availability: Mock<ServiceCatalogFacade['availability']>;
}

export function createServiceCatalogFacadeStub(
  result:
    ServiceAvailability | ((serviceKey: string) => ServiceAvailability) = {
    status: 'available',
  },
): ServiceCatalogFacadeStub {
  const availability = vi.fn<ServiceCatalogFacade['availability']>(
    async (serviceKey: string): Promise<ServiceAvailability> =>
      typeof result === 'function' ? result(serviceKey) : result,
  );
  return { availability };
}

/** Motivo canônico de indisponibilidade por delegação (M15 do plan.md; R-0007). */
export const DELEGACAO_INDISPONIVEL_R0007 = 'delegacao_indisponivel_r0007';
