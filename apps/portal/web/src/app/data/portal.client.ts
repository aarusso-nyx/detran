// Camada de dados do Portal (plan.md M13; contrato CTG-0003a §2): wrapper tipado pelos contratos
// gerados em `@detran/api-clients` (`BP-PORTAL-*.commands`, ADR-0007: nunca editados) sobre o
// `HttpClient` que `provideStynxDefaults` configura (interceptors de auth, request-id, tenant e
// erro). O browser só fala com `/v1/portal/*` (ADR-0003; portal-route-contract.md §1) — única
// exceção: o `PUT` na URL assinada do storage ([DIVERGE-17]), por `fetch` puro, sem bearer.
// Comandos: `If-Match` sempre do `ETag` lido (nunca inventado; `null` omite o cabeçalho e o
// servidor responde 428) e `Idempotency-Key` determinística `<ato>:<alvo>:<fingerprint>` (M17,
// §2.2), recalculada a cada chamada. Nenhum método captura erros: a promessa rejeita com o
// `HttpErrorResponse` original e o chamador classifica com `presentError` (§3).
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  type HttpResponse,
} from '@angular/common/http';
import { Injectable, Injector, inject } from '@angular/core';
import type {
  BpPortalIdentity001Commands,
  BpPortalRequests001Commands,
} from '@detran/api-clients';
import { firstValueFrom, type Observable } from 'rxjs';
import { idempotencyKey } from './idempotency-key';
import type {
  AttachmentCompleted,
  AttachmentUploadIntent,
  CommandResult,
  DiligenceResponded,
  ElevationCompleted,
  ElevationStarted,
} from './portal-command.models';

type IdentityPaths = BpPortalIdentity001Commands.paths;
type RequestsOps = BpPortalRequests001Commands.operations;
type RequestsSchemas = BpPortalRequests001Commands.components['schemas'];
type IdentityOps = BpPortalIdentity001Commands.operations;
type IdentitySchemas = BpPortalIdentity001Commands.components['schemas'];

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

type ResponseJson<Op, Status extends number> = Op extends {
  responses: Record<Status, { content: { 'application/json': infer Body } }>;
}
  ? Body
  : never;

/** `GET /v1/portal/brand` — marca do tenant resolvido pelo `Host` (rota pública). */
export type BrandProfile = JsonOf<'/v1/portal/brand', 'get', 200>;

/** `GET /v1/portal/identity/me` — conta do cidadão e requisitos de nível por ato. */
export type CitizenAccount = ResponseJson<IdentityOps['portalMeGet'], 200>;

/** `GET /v1/portal/services` — Carta de Serviços (rota pública). */
export type ServiceCatalogItem = JsonOf<
  '/v1/portal/services',
  'get',
  200
>[number];

// Corpos de comando (§2.1; `import type` dos contratos gerados).
export type RequestCreateBody = RequestsSchemas['RequestCreateDto'];
export type RequestDraftBody = RequestsSchemas['RequestDraftUpdateDto'];
export type AttachmentIntentBody =
  RequestsSchemas['RequestAttachmentCreateDto'];
export type RequestSubmitBody = RequestsSchemas['RequestSubmitDto'];
export type RequestWithdrawBody = RequestsSchemas['RequestWithdrawDto'];
export type DiligenceResponseBody =
  RequestsSchemas['RequestDiligenceRespondDto'];
export type ElevationCreateBody =
  IdentitySchemas['AssuranceElevationCreateDto'];
export type ElevationCompleteBody =
  IdentitySchemas['AssuranceElevationCompleteDto'];

// Respostas 2xx declaradas no OpenAPI (§2.1).
export type RequestCreated = ResponseJson<
  RequestsOps['portalRequestCreate'],
  201
>;
export type DraftSaved = ResponseJson<
  RequestsOps['portalRequestDraftUpdate'],
  200
>;
export type RequestSubmitted = ResponseJson<
  RequestsOps['portalRequestSubmit'],
  200
>;
export type RequestWithdrawn = ResponseJson<
  RequestsOps['portalRequestWithdraw'],
  200
>;

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

/** `<alvo>` da chave quando o ato não tem alvo (`targetKind: 'none'`; [DIVERGE-5], A6(b)). */
const NO_TARGET = 'none';

const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';
const IF_MATCH_HEADER = 'If-Match';

function isJsonBlob(value: unknown): value is Blob {
  return (
    typeof Blob !== 'undefined' &&
    value instanceof Blob &&
    /^application\/([a-z0-9.+-]+\+)?json\b/i.test(value.type)
  );
}

/**
 * Erro HTTP de uma requisição `responseType: 'blob'` cujo corpo é JSON → `HttpErrorResponse`
 * equivalente com `error` já decodificado (mesmos status, headers e url). Corpo não-JSON ou
 * ilegível → o erro original.
 */
async function decodeBlobError(error: unknown): Promise<unknown> {
  if (!(error instanceof HttpErrorResponse) || !isJsonBlob(error.error)) {
    return error;
  }
  let body: unknown;
  try {
    body = JSON.parse(await error.error.text());
  } catch {
    return error;
  }
  return new HttpErrorResponse({
    error: body,
    headers: error.headers,
    status: error.status,
    statusText: error.statusText,
    url: error.url ?? undefined,
  });
}

@Injectable({ providedIn: 'root' })
export class PortalClient {
  private readonly injector = inject(Injector);
  private httpClient: HttpClient | null = null;

  /**
   * `HttpClient` resolvido na primeira requisição: componentes só de apresentação (banner de
   * erro, nota de canal alternativo) chegam ao cliente pela `BrandService` sem nunca requisitar.
   */
  private get http(): HttpClient {
    this.httpClient ??= this.injector.get(HttpClient);
    return this.httpClient;
  }

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

  /** POST /v1/portal/requests — Idempotency-Key `<serviceKey>:<targetId|none>:<fp>`. */
  async createRequest(
    body: RequestCreateBody,
  ): Promise<CommandResult<RequestCreated>> {
    const key = await idempotencyKey(
      body.serviceKey,
      body.targetId ?? NO_TARGET,
      body,
    );
    return this.command<RequestCreated>((headers) =>
      this.http.post<RequestCreated>(this.url('/requests'), body, {
        headers,
        observe: 'response',
      }),
    )(key, null);
  }

  /** PUT /v1/portal/requests/{id}/draft — If-Match + Idempotency-Key `<serviceKey>:<requestId>:<fp>`. */
  async saveDraft(
    requestId: string,
    serviceKey: string,
    body: RequestDraftBody,
    ifMatch: string | null,
  ): Promise<CommandResult<DraftSaved>> {
    const key = await idempotencyKey(serviceKey, requestId, body);
    return this.command<DraftSaved>((headers) =>
      this.http.put<DraftSaved>(
        this.url(`/requests/${encodeURIComponent(requestId)}/draft`),
        body,
        { headers, observe: 'response' },
      ),
    )(key, ifMatch);
  }

  /** POST /v1/portal/requests/{id}/attachments — intenção → URL assinada (OD-P59). */
  async requestAttachmentUpload(
    requestId: string,
    intent: AttachmentIntentBody,
  ): Promise<CommandResult<AttachmentUploadIntent>> {
    const key = await idempotencyKey('attachment', requestId, intent);
    return this.command<AttachmentUploadIntent>((headers) =>
      this.http.post<AttachmentUploadIntent>(
        this.url(`/requests/${encodeURIComponent(requestId)}/attachments`),
        intent,
        { headers, observe: 'response' },
      ),
    )(key, null);
  }

  /**
   * PUT na URL assinada (fora de `/v1/portal/*`; [DIVERGE-17]): `fetch` puro, sem os
   * interceptors STYNX, sem `Authorization` e com `credentials: 'omit'` — o bearer nunca vai ao
   * storage. Resposta não-2xx rejeita com `HttpErrorResponse` (sem `code`: apresentação genérica).
   */
  async uploadToSignedUrl(
    intent: AttachmentUploadIntent,
    file: Blob,
  ): Promise<void> {
    const response = await fetch(intent.uploadUrl, {
      method: intent.method,
      headers: { ...intent.headers },
      body: file,
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new HttpErrorResponse({
        status: response.status,
        statusText: response.statusText,
        url: intent.uploadUrl,
      });
    }
  }

  /** POST /v1/portal/requests/{id}/attachments/{attachmentId}/complete (sem corpo). */
  async completeAttachment(
    requestId: string,
    attachmentId: string,
  ): Promise<CommandResult<AttachmentCompleted>> {
    const body = {};
    const key = await idempotencyKey('attachment_complete', attachmentId, body);
    return this.command<AttachmentCompleted>((headers) =>
      this.http.post<AttachmentCompleted>(
        this.url(
          `/requests/${encodeURIComponent(requestId)}/attachments/${encodeURIComponent(attachmentId)}/complete`,
        ),
        body,
        { headers, observe: 'response' },
      ),
    )(key, null);
  }

  /** POST /v1/portal/requests/{id}/submit — Idempotency-Key `<serviceKey>:<targetId|requestId>:<fp>`. */
  async submitRequest(
    requestId: string,
    serviceKey: string,
    targetId: string | null,
    body: RequestSubmitBody,
  ): Promise<CommandResult<RequestSubmitted>> {
    const key = await idempotencyKey(serviceKey, targetId ?? requestId, body);
    return this.command<RequestSubmitted>((headers) =>
      this.http.post<RequestSubmitted>(
        this.url(`/requests/${encodeURIComponent(requestId)}/submit`),
        body,
        { headers, observe: 'response' },
      ),
    )(key, null);
  }

  /** POST /v1/portal/requests/{id}/withdraw — If-Match + Idempotency-Key `withdraw:<requestId>:<fp>`. */
  async withdrawRequest(
    requestId: string,
    body: RequestWithdrawBody,
    ifMatch: string | null,
  ): Promise<CommandResult<RequestWithdrawn>> {
    const key = await idempotencyKey('withdraw', requestId, body);
    return this.command<RequestWithdrawn>((headers) =>
      this.http.post<RequestWithdrawn>(
        this.url(`/requests/${encodeURIComponent(requestId)}/withdraw`),
        body,
        { headers, observe: 'response' },
      ),
    )(key, ifMatch);
  }

  /** POST /v1/portal/requests/{id}/diligences/{did}/responses — `respond_diligence:<did>:<fp>`. */
  async respondDiligence(
    requestId: string,
    diligenceId: string,
    body: DiligenceResponseBody,
  ): Promise<CommandResult<DiligenceResponded>> {
    const key = await idempotencyKey('respond_diligence', diligenceId, body);
    return this.command<DiligenceResponded>((headers) =>
      this.http.post<DiligenceResponded>(
        this.url(
          `/requests/${encodeURIComponent(requestId)}/diligences/${encodeURIComponent(diligenceId)}/responses`,
        ),
        body,
        { headers, observe: 'response' },
      ),
    )(key, null);
  }

  /** POST /v1/portal/identity/assurance/elevations — `elevation:<subjectId>:<fp>`. */
  async elevateAssurance(
    subjectId: string,
    body: ElevationCreateBody,
  ): Promise<CommandResult<ElevationStarted>> {
    const key = await idempotencyKey('elevation', subjectId, body);
    return this.command<ElevationStarted>((headers) =>
      this.http.post<ElevationStarted>(
        this.url('/identity/assurance/elevations'),
        body,
        { headers, observe: 'response' },
      ),
    )(key, null);
  }

  /** POST /v1/portal/identity/assurance/elevations/{id}/complete — `elevation_complete:<id>:<fp>`. */
  async completeElevation(
    elevationId: string,
    body: ElevationCompleteBody,
  ): Promise<CommandResult<ElevationCompleted>> {
    const key = await idempotencyKey('elevation_complete', elevationId, body);
    return this.command<ElevationCompleted>((headers) =>
      this.http.post<ElevationCompleted>(
        this.url(
          `/identity/assurance/elevations/${encodeURIComponent(elevationId)}/complete`,
        ),
        body,
        { headers, observe: 'response' },
      ),
    )(key, null);
  }

  /**
   * GET /v1/portal/requests/{id}/receipt — PDF assinado (ADR-0018); exige sessão. Com
   * `responseType: 'blob'` o corpo de erro também chega como `Blob`: quando é JSON, é decodificado
   * para que o `ErrorBoundary` leia o `code` do catálogo; caso contrário o erro sobe intacto.
   */
  async downloadReceipt(requestId: string): Promise<Blob> {
    try {
      return await firstValueFrom(
        this.http.get(
          this.url(`/requests/${encodeURIComponent(requestId)}/receipt`),
          { responseType: 'blob' },
        ),
      );
    } catch (error: unknown) {
      throw await decodeBlobError(error);
    }
  }

  private url(path: string): string {
    return `${PORTAL_API_PREFIX}${path}`;
  }

  private get<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(this.url(path)));
  }

  /** Monta os cabeçalhos do comando e lê o `ETag` da resposta (`observe: 'response'`). */
  private command<T>(
    send: (headers: HttpHeaders) => Observable<HttpResponse<T>>,
  ): (key: string, ifMatch: string | null) => Promise<CommandResult<T>> {
    return async (key, ifMatch) => {
      let headers = new HttpHeaders({ [IDEMPOTENCY_KEY_HEADER]: key });
      if (ifMatch !== null) headers = headers.set(IF_MATCH_HEADER, ifMatch);
      const response = await firstValueFrom(send(headers));
      return { body: response.body as T, etag: response.headers.get('ETag') };
    };
  }
}
