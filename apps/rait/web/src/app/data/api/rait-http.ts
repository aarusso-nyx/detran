// ÚNICO lugar de leitura com `HttpClient` da camada de dados (contrato CTG-0002b §3.2; guia §4
// "HttpClient só via cliente/facade"; M9). O `HttpClient` é o de `provideStynxDefaults`
// (bearer, tenant, request-id), obtido de forma preguiçosa pelo `Injector` (padrão
// `core/stream-transport.ts` e `apps/portal/web/src/app/data/portal.client.ts`): um cliente pode
// ser construído em contextos sem `provideHttpClient` (harness do shell) e só falha se de fato
// pedir a rede. `getOne` observa a resposta para guardar o `ETag` (`EtagStore`; ausente →
// `null`); `getList` faz GET SEM query string (os `list*` gerados não a aceitam — OD-R12-018) e
// converte o array plano em `ListPage` por `applyListQuery` (sem reordenar, [RN-RAIT-141]).
// Nenhum método captura erros: a promessa rejeita com o `HttpErrorResponse` original e o
// chamador classifica com `classifyError` (`core/error-boundary.ts`). Os comandos ficam para
// R-0007 CTG-0004 (M8).
import { HttpClient } from '@angular/common/http';
import { Injectable, Injector, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { applyListQuery, type ListQuerySpec } from '../list-query';
import type { ListPage, ListQuery } from '../models/list-page';
import { EtagStore, type RaitCollection } from './etag-store';

// Raízes dos contratos gerados (ADR-0003). Template literals: C-2B-15 só admite strings simples
// `'/v1/…'` que sejam caminhos completos de `paths`; uma raiz é prefixo, não caminho.
export const RAIT_API_ROOT = `/v1/inf/rait`;
export const INFRACTION_API_ROOT = `/v1/inf/infraction`;
export const COLLECTION_API_ROOT = `/v1/inf/collection`;
export const NOTIFICATION_API_ROOT = `/v1/inf/notification`;
export const ETAG_HEADER = 'ETag';
export const IF_MATCH_HEADER = 'If-Match';
export const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';

@Injectable({ providedIn: 'root' })
export class RaitHttp {
  private readonly injector = inject(Injector);
  private readonly etagStore = inject(EtagStore);
  private httpClient: HttpClient | null = null;

  private get http(): HttpClient {
    this.httpClient ??= this.injector.get(HttpClient);
    return this.httpClient;
  }

  /** `GET ${url}/${id}`; guarda o `ETag` da resposta em `EtagStore` (ausente → `null`). */
  async getOne<T>(
    url: string,
    collection: RaitCollection,
    id: string,
  ): Promise<T> {
    const response = await firstValueFrom(
      this.http.get<T>(`${url}/${encodeURIComponent(id)}`, {
        observe: 'response',
      }),
    );
    this.etagStore.set(collection, id, response.headers.get(ETAG_HEADER));
    return response.body as T;
  }

  /** `GET url` sem query string; corpo `T[]` → `applyListQuery` (§3.2). */
  async getList<T>(
    url: string,
    query: ListQuery,
    spec: ListQuerySpec<T>,
  ): Promise<ListPage<T>> {
    const body = await firstValueFrom(this.http.get<readonly T[]>(url));
    return applyListQuery(Array.isArray(body) ? body : [], query, spec);
  }
}
