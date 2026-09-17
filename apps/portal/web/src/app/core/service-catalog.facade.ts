// ServiceCatalogFacade (plan.md M8/M15; adenda A3): `GET /v1/portal/services` (Carta de
// Serviços, rota pública) cacheado em memória por sessão do app → `availability(serviceKey)`.
// Serviço ausente do catálogo → `{ status: 'unavailable' }` sem motivo (o motivo só existe
// quando o catálogo o dá — `unavailableReason`); o backend marca `unavailable`/
// `partially_available` com `unavailableReason` e `alternativeChannelNote` (padrão "bloqueada por
// decisão": a UI nunca simula resultado). Token abstrato substituível por `useValue` nos testes.
import { Injectable, inject } from '@angular/core';
import { PortalClient, type ServiceCatalogItem } from '../data/portal.client';

export type ServiceAvailabilityStatus =
  'available' | 'partially_available' | 'unavailable';

export interface ServiceAvailability {
  readonly status: ServiceAvailabilityStatus;
  /** Token do catálogo (`unavailableReason`); nunca exibido cru — vai em `data-token`. */
  readonly reason?: string;
  /** Texto cidadão do catálogo (`alternativeChannelNote`). */
  readonly alternativeChannelNote?: string;
}

/** Serviço fora da Carta de Serviços: indisponível, sem motivo a exibir. */
export const NOT_CATALOGUED: ServiceAvailability = Object.freeze({
  status: 'unavailable',
});

export function toAvailability(item: ServiceCatalogItem): ServiceAvailability {
  return {
    status: item.availability ?? 'unavailable',
    reason: item.unavailableReason,
    alternativeChannelNote: item.alternativeChannelNote ?? undefined,
  };
}

@Injectable({
  providedIn: 'root',
  useFactory: () => inject(PortalServiceCatalogFacade),
})
export abstract class ServiceCatalogFacade {
  abstract availability(serviceKey: string): Promise<ServiceAvailability>;
}

@Injectable({ providedIn: 'root' })
export class PortalServiceCatalogFacade extends ServiceCatalogFacade {
  private readonly client = inject(PortalClient);
  private catalog: Promise<ReadonlyMap<string, ServiceCatalogItem>> | null =
    null;

  /** Carta de Serviços completa (cache por sessão do app). */
  items(): Promise<ReadonlyMap<string, ServiceCatalogItem>> {
    this.catalog ??= this.client.services().then(
      (items) =>
        new Map(
          items
            .filter((item) => typeof item.serviceKey === 'string')
            .map((item) => [item.serviceKey as string, item]),
        ),
      (error: unknown) => {
        this.catalog = null;
        throw error;
      },
    );
    return this.catalog;
  }

  async availability(serviceKey: string): Promise<ServiceAvailability> {
    const item = (await this.items()).get(serviceKey);
    return item ? toAvailability(item) : NOT_CATALOGUED;
  }

  /** Descarta o cache (troca de sessão/tenant). */
  invalidate(): void {
    this.catalog = null;
  }
}
