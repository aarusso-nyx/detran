// CatalogoFacade (contrato CTG-0003c §3.9; T-25/T-15; [RN-PORTAL-108]; [DIVERGE-22/23]): a Carta de
// Serviços — a lista vem do cache do par 1 (`PortalServiceCatalogFacade.items()`, `GET services`,
// ordem do servidor) e o detalhe de `GET services/{serviceKey}` (404 = fora do catálogo →
// `not_found`, sem vínculo). `functionalRoute` delega a `core/functional-route.ts` (regra §3.9,
// compartilhada com a home — A12(e)): entrada do manifesto sem parâmetro → rota; só `:aitId` →
// `/autos`; outro parâmetro ou nenhuma entrada → `null`; nunca `item.route`. T-15 é
// estática (sem operação gerada, OD-P90): sem leitura aqui.
import { Injectable, inject, signal } from '@angular/core';
import {
  presentError,
  type ErrorPresentation,
} from '../../core/error-boundary';
import { functionalRouteFor } from '../../core/functional-route';
import { PortalServiceCatalogFacade } from '../../core/service-catalog.facade';
import {
  PortalClient,
  type ServiceCatalogItem,
} from '../../data/portal.client';
import { readStatusFor, type ReadStatus } from '../../data/read-status';

@Injectable()
export class CatalogoFacade {
  private readonly client = inject(PortalClient);
  private readonly catalog = inject(PortalServiceCatalogFacade);

  private readonly statusState = signal<ReadStatus>('idle');
  private readonly errorState = signal<ErrorPresentation | null>(null);
  private readonly itemsState = signal<readonly ServiceCatalogItem[]>([]);
  private readonly selectedState = signal<ServiceCatalogItem | null>(null);
  private sequence = 0;

  readonly status = this.statusState.asReadonly();
  readonly error = this.errorState.asReadonly();
  /** Cache do par 1 (`GET services`), ordem do servidor. */
  readonly items = this.itemsState.asReadonly();
  /** `GET services/{serviceKey}` quando `:serviceKey` presente. */
  readonly selected = this.selectedState.asReadonly();

  async loadList(): Promise<void> {
    this.statusState.set('loading');
    this.errorState.set(null);
    this.selectedState.set(null);
    const sequence = ++this.sequence;
    try {
      const items = Array.from((await this.catalog.items()).values());
      if (sequence !== this.sequence) return;
      this.itemsState.set(items);
      this.statusState.set(items.length === 0 ? 'empty' : 'ready');
    } catch (error: unknown) {
      if (sequence !== this.sequence) return;
      const presentation = presentError(error);
      this.errorState.set(presentation);
      this.statusState.set(readStatusFor(presentation));
    }
  }

  /** 404 NOT_FOUND{kind:'service'} → `not_found` (não é vínculo: `portal.screens.t25.state.sem_permissao`). */
  async loadService(serviceKey: string): Promise<void> {
    this.statusState.set('loading');
    this.errorState.set(null);
    const sequence = ++this.sequence;
    try {
      const item = await this.client.getService(serviceKey);
      if (sequence !== this.sequence) return;
      this.selectedState.set(item);
      this.statusState.set('ready');
    } catch (error: unknown) {
      if (sequence !== this.sequence) return;
      const presentation = presentError(error);
      this.selectedState.set(null);
      this.errorState.set(presentation);
      this.statusState.set(readStatusFor(presentation));
    }
  }

  functionalRoute(serviceKey: string): string | null {
    return functionalRouteFor(serviceKey);
  }
}
