// Camada de dados do Portal (plan.md M13): wrapper tipado pelos contratos gerados em
// `@detran/api-clients` (`BP-PORTAL-*.commands`, ADR-0007: nunca editados) sobre o `HttpClient`
// que `provideStynxDefaults` configura (interceptors de auth, request-id, tenant e erro). O
// browser só fala com `/v1/portal/*` (ADR-0003; portal-route-contract.md §1). Só leituras nesta
// entrega; comandos (`If-Match` do `ETag`, `Idempotency-Key` determinística) chegam com os
// módulos de feature (CTG-0003).
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { BpPortalIdentity001Commands } from '@detran/api-clients';
import { firstValueFrom } from 'rxjs';

type IdentityPaths = BpPortalIdentity001Commands.paths;

export const PORTAL_API_PREFIX = '/v1/portal';

type JsonOf<
  Path extends keyof IdentityPaths,
  Method extends keyof IdentityPaths[Path],
  Status extends number,
> = IdentityPaths[Path][Method] extends {
  responses: Record<Status, { content: { 'application/json': infer Body } }>;
}
  ? Body
  : never;

/** `GET /v1/portal/brand` — marca do tenant resolvido pelo `Host` (rota pública). */
export type BrandProfile = JsonOf<'/v1/portal/brand', 'get', 200>;

/** `GET /v1/portal/identity/me` — conta do cidadão e requisitos de nível por ato. */
export type CitizenAccount = JsonOf<'/v1/portal/identity/me', 'get', 200>;

/** `GET /v1/portal/services` — Carta de Serviços (rota pública). */
export type ServiceCatalogItem = JsonOf<
  '/v1/portal/services',
  'get',
  200
>[number];

/** Corpo de erro padronizado do domínio `portal` (`portal-error-catalog.md`). */
export interface PortalErrorBody {
  readonly code: string;
  readonly status: number;
  readonly message: string;
  readonly messageKey?: string;
  readonly requestId?: string;
  readonly context?: Record<string, unknown>;
}

/** Recursos cuja leitura comprova o vínculo do cidadão (`portal.entitlement`, contrato §1.2). */
export type EntitlementKind =
  'ait' | 'request' | 'vehicle' | 'crash' | 'exam' | 'manifestation';

const ENTITLEMENT_RESOURCE: Record<EntitlementKind, (id: string) => string> = {
  ait: (id) => `/aits/${id}`,
  request: (id) => `/requests/${id}`,
  vehicle: (id) => `/vehicles/${id}/clearance`,
  crash: (id) => `/crashes/${id}`,
  exam: (id) => `/exams/${id}`,
  manifestation: (id) => `/manifestations/${id}`,
};

@Injectable({ providedIn: 'root' })
export class PortalClient {
  private readonly http = inject(HttpClient);

  brand(): Promise<BrandProfile> {
    return this.get<BrandProfile>('/brand');
  }

  me(): Promise<CitizenAccount> {
    return this.get<CitizenAccount>('/identity/me');
  }

  services(): Promise<ServiceCatalogItem[]> {
    return this.get<ServiceCatalogItem[]>('/services');
  }

  /** Leitura do recurso de vínculo: 200 prova o vínculo; 404 `PORTAL.NOT_FOUND` o nega. */
  entitledResource(kind: EntitlementKind, id: string): Promise<unknown> {
    return this.get<unknown>(
      ENTITLEMENT_RESOURCE[kind](encodeURIComponent(id)),
    );
  }

  private get<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${PORTAL_API_PREFIX}${path}`));
  }
}
