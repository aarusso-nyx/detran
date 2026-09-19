// Camada de dados do Portal (plan.md M13; contrato CTG-0003a §2): wrapper tipado pelos contratos
// gerados em `@detran/api-clients` (`BP-PORTAL-*.commands`, ADR-0007: nunca editados) sobre o
// `HttpClient` que `provideStynxDefaults` configura (interceptors de auth, request-id, tenant e
// erro). O browser só fala com `/v1/portal/*` (ADR-0003; portal-route-contract.md §1) — única
// exceção: o `PUT` na URL assinada do storage ([DIVERGE-17]), por `fetch` puro, sem bearer.
// Comandos: `If-Match` sempre do `ETag` lido (nunca inventado; `null` omite o cabeçalho e o
// servidor responde 428) e `Idempotency-Key` determinística `<ato>:<alvo>:<fingerprint>` (M17,
// §2.2), recalculada a cada chamada. Nenhum método captura erros: a promessa rejeita com o
// `HttpErrorResponse` original e o chamador classifica com `presentError` (§3).
// Leituras do par 2 (contrato CTG-0003b §2.3): query por `HttpParams` só com as chaves presentes
// (números por `String()`), nenhuma envia `Idempotency-Key` nem `If-Match`; `getRequest` observa a
// resposta para devolver o `ETag` (`If-Match` do `withdraw`, §2.2). Corpos tipados `{ [key]: unknown }`
// no OpenAPI ([DIVERGE-1]) são entregues por asserção de tipo, sem transformação de dados.
// Leituras e comandos do par 3 (contrato CTG-0003c §2): mesmas regras; `If-Match` só em
// `PUT preferences` (valor do chamador — `null` omite e o servidor responde 428, OD-P87);
// `cancelSne` sem corpo envia `{}`; `downloadCnhDocument` reutiliza `decodeBlobError`.
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
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
import type {
  AitDetail,
  AitListPage,
  AitListQuery,
  AitPoints,
  CnhRead,
  CrashDetail,
  CrashListPage,
  CrashSummary,
  CrlvIssued,
  Decision,
  EvaluationCreateBody,
  EvaluationCreated,
  ExamDetail,
  ExamListPage,
  ExamSummary,
  InboxListPage,
  InboxListQuery,
  InboxReadResult,
  ManifestationAcknowledged,
  ManifestationCreateBody,
  ManifestationCreated,
  ManifestationDetail,
  ManifestationListPage,
  ManifestationListQuery,
  ManifestationSummary,
  PointsSummary,
  PreferencesUpdateBody,
  PreferencesUpdated,
  PushSubscriptionCreateBody,
  PushSubscriptionCreated,
  RequestDetail,
  RequestListPage,
  RequestListQuery,
  ServiceCharterDeadline,
  SneCancelled,
  SneEnrolled,
  SneEnrollment,
  SneEnrollmentCancelBody,
  SneEnrollmentCreateBody,
  Vehicle,
  VehicleClearance,
  VehicleListPage,
} from './portal-read.models';

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

/** `HttpParams` só com as chaves presentes (`undefined` omitido; números por `String()`). */
function queryParams(
  query: Readonly<Record<string, string | number | undefined>>,
): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    params = params.set(key, String(value));
  }
  return params;
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

  // —— leituras do par 2 (contrato CTG-0003b §2.3) ——

  /** GET /v1/portal/aits?vehicle&status&page&pageSize — chaves `undefined` omitidas da query. */
  listAits(query: AitListQuery = {}): Promise<AitListPage> {
    return firstValueFrom(
      this.http.get<AitListPage>(this.url('/aits'), {
        params: queryParams(query),
      }),
    );
  }

  /** GET /v1/portal/aits/{aitId} — 404 NOT_FOUND{kind:'ait'} = sem vínculo (contrato §1.2). */
  getAit(aitId: string): Promise<AitDetail> {
    return this.get<AitDetail>(`/aits/${encodeURIComponent(aitId)}`);
  }

  /** GET /v1/portal/aits/{aitId}/points — `points` sempre null nesta rodada (OD-P34). */
  getAitPoints(aitId: string): Promise<AitPoints> {
    return this.get<AitPoints>(`/aits/${encodeURIComponent(aitId)}/points`);
  }

  /** GET /v1/portal/points-summary — zero pontos quando sem linha (nunca 404, UC-010). */
  getPointsSummary(): Promise<PointsSummary> {
    return this.get<PointsSummary>('/points-summary');
  }

  /** GET /v1/portal/requests?state&kind&period&page&pageSize. */
  listRequests(query: RequestListQuery = {}): Promise<RequestListPage> {
    return firstValueFrom(
      this.http.get<RequestListPage>(this.url('/requests'), {
        params: queryParams(query),
      }),
    );
  }

  /**
   * GET /v1/portal/requests/{id} — `observe: 'response'`; `etag` do cabeçalho (§2.2). Resolvida
   * no próprio `next` da resposta (como `firstValueFrom`), sem envelope `async`: as facades de
   * leitura refletem a resposta nos signals no tick seguinte à sua chegada.
   */
  getRequest(requestId: string): Promise<CommandResult<RequestDetail>> {
    return new Promise((resolve, reject) => {
      this.http
        .get<RequestDetail>(
          this.url(`/requests/${encodeURIComponent(requestId)}`),
          { observe: 'response' },
        )
        .subscribe({
          next: (response) =>
            resolve({
              body: response.body as RequestDetail,
              etag: response.headers.get('ETag'),
            }),
          error: (error: unknown) => reject(error),
        });
    });
  }

  /** GET /v1/portal/requests/{id}/decision — 404 NOT_FOUND{kind:'decision'} = ainda sem decisão. */
  getDecision(requestId: string): Promise<Decision> {
    return this.get<Decision>(
      `/requests/${encodeURIComponent(requestId)}/decision`,
    );
  }

  // —— par 3 (contrato CTG-0003c §2.4) ——

  /** GET /v1/portal/services/{serviceKey} — 404 NOT_FOUND{kind:'service'} = fora do catálogo. */
  getService(serviceKey: string): Promise<ServiceCatalogItem> {
    return this.get<ServiceCatalogItem>(
      `/services/${encodeURIComponent(serviceKey)}`,
    );
  }

  /** GET /v1/portal/inbox?kind&read&page&pageSize — `undefined` omitido; `read` como 'true'|'false'. */
  listInbox(query: InboxListQuery = {}): Promise<InboxListPage> {
    return firstValueFrom(
      this.http.get<InboxListPage>(this.url('/inbox'), {
        params: queryParams(query),
      }),
    );
  }

  /** POST /v1/portal/inbox/{id}/read — `inbox_read:<id>:<fp({})>`; registra ciência (SNE). */
  async markInboxRead(
    inboxItemId: string,
  ): Promise<CommandResult<InboxReadResult>> {
    const body = {};
    const key = await idempotencyKey('inbox_read', inboxItemId, body);
    return this.command<InboxReadResult>((headers) =>
      this.http.post<InboxReadResult>(
        this.url(`/inbox/${encodeURIComponent(inboxItemId)}/read`),
        body,
        { headers, observe: 'response' },
      ),
    )(key, null);
  }

  /** GET /v1/portal/sne/enrollment — `enrolled=false` com nulos quando sem linha (nunca 404). */
  getSneEnrollment(): Promise<SneEnrollment> {
    return this.get<SneEnrollment>('/sne/enrollment');
  }

  /** POST /v1/portal/sne/enrollment — `adesao_sne:none:<fp>`; 403 ASSURANCE_INSUFFICIENT abaixo de 'avancada'. */
  async enrollSne(
    body: SneEnrollmentCreateBody,
  ): Promise<CommandResult<SneEnrolled>> {
    const key = await idempotencyKey('adesao_sne', NO_TARGET, body);
    return this.command<SneEnrolled>((headers) =>
      this.http.post<SneEnrolled>(this.url('/sne/enrollment'), body, {
        headers,
        observe: 'response',
      }),
    )(key, null);
  }

  /** DELETE /v1/portal/sne/enrollment — corpo opcional { reason? } (`{}` quando ausente); `cancelamento_sne:none:<fp>`. */
  async cancelSne(
    body: SneEnrollmentCancelBody = {},
  ): Promise<CommandResult<SneCancelled>> {
    const key = await idempotencyKey('cancelamento_sne', NO_TARGET, body);
    return this.command<SneCancelled>((headers) =>
      this.http.delete<SneCancelled>(this.url('/sne/enrollment'), {
        headers,
        body,
        observe: 'response',
      }),
    )(key, null);
  }

  /** POST /v1/portal/push-subscriptions — `push_subscription:none:<fp>`; 201 upsert por endpoint. */
  async createPushSubscription(
    body: PushSubscriptionCreateBody,
  ): Promise<CommandResult<PushSubscriptionCreated>> {
    const key = await idempotencyKey('push_subscription', NO_TARGET, body);
    return this.command<PushSubscriptionCreated>((headers) =>
      this.http.post<PushSubscriptionCreated>(
        this.url('/push-subscriptions'),
        body,
        { headers, observe: 'response' },
      ),
    )(key, null);
  }

  /** PUT /v1/portal/identity/preferences — If-Match (null omite → 428) + `update_preferences:none:<fp>`; 2xx source_pending. */
  async updatePreferences(
    body: PreferencesUpdateBody,
    ifMatch: string | null,
  ): Promise<CommandResult<PreferencesUpdated>> {
    const key = await idempotencyKey('update_preferences', NO_TARGET, body);
    return this.command<PreferencesUpdated>((headers) =>
      this.http.put<PreferencesUpdated>(
        this.url('/identity/preferences'),
        body,
        { headers, observe: 'response' },
      ),
    )(key, ifMatch);
  }

  /** GET /v1/portal/documents/cnh — consulta informativa (categoria C; RN-PORTAL-117). */
  getCnh(): Promise<CnhRead> {
    return this.get<CnhRead>('/documents/cnh');
  }

  /**
   * GET /v1/portal/documents/cnh?documentBytes=true — `responseType: 'blob'`; erro JSON
   * decodificado como `downloadReceipt`. Nesta rodada responde 422 SERVICE_UNAVAILABLE
   * { unavailableReason: 'documento_assinado_pendente_r0014' } ([DIVERGE-9]).
   */
  async downloadCnhDocument(): Promise<Blob> {
    try {
      return await firstValueFrom(
        this.http.get(this.url('/documents/cnh'), {
          params: queryParams({ documentBytes: 'true' }),
          responseType: 'blob',
        }),
      );
    } catch (error: unknown) {
      throw await decodeBlobError(error);
    }
  }

  /** GET /v1/portal/vehicles — itens livres (OD-P36) entregues como Vehicle[] por asserção. */
  listVehicles(): Promise<
    VehicleListPage & { readonly items: readonly Vehicle[] }
  > {
    return this.get<VehicleListPage & { readonly items: readonly Vehicle[] }>(
      '/vehicles',
    );
  }

  /** GET /v1/portal/vehicles/{id}/clearance — 404 NOT_FOUND{kind:'vehicle'}; 503 sem cache (OD-P21). */
  getVehicleClearance(vehicleId: string): Promise<VehicleClearance> {
    return this.get<VehicleClearance>(
      `/vehicles/${encodeURIComponent(vehicleId)}/clearance`,
    );
  }

  /** POST /v1/portal/vehicles/{id}/crlv-e — `emissao_crlv:<vehicleId>:<fp({})>`; sem 2xx no OpenAPI ([DIVERGE-10]). */
  async issueCrlv(vehicleId: string): Promise<CommandResult<CrlvIssued>> {
    const body = {};
    const key = await idempotencyKey('emissao_crlv', vehicleId, body);
    return this.command<CrlvIssued>((headers) =>
      this.http.post<CrlvIssued>(
        this.url(`/vehicles/${encodeURIComponent(vehicleId)}/crlv-e`),
        body,
        { headers, observe: 'response' },
      ),
    )(key, null);
  }

  /** GET /v1/portal/crashes — sem parâmetros de busca no OpenAPI ([DIVERGE-14]). */
  listCrashes(): Promise<
    CrashListPage & { readonly items: readonly CrashSummary[] }
  > {
    return this.get<
      CrashListPage & { readonly items: readonly CrashSummary[] }
    >('/crashes');
  }

  /** GET /v1/portal/crashes/{id} — 404 NOT_FOUND{kind:'crash'}. */
  getCrash(crashId: string): Promise<CrashDetail> {
    return this.get<CrashDetail>(`/crashes/${encodeURIComponent(crashId)}`);
  }

  /** GET /v1/portal/exams. */
  listExams(): Promise<
    ExamListPage & { readonly items: readonly ExamSummary[] }
  > {
    return this.get<ExamListPage & { readonly items: readonly ExamSummary[] }>(
      '/exams',
    );
  }

  /** GET /v1/portal/exams/{id} — 404 NOT_FOUND{kind:'exam'}. */
  getExam(examId: string): Promise<ExamDetail> {
    return this.get<ExamDetail>(`/exams/${encodeURIComponent(examId)}`);
  }

  /** GET /v1/portal/manifestations?page&pageSize — anônimas não são listáveis. */
  listManifestations(
    query: ManifestationListQuery = {},
  ): Promise<
    ManifestationListPage & { readonly items: readonly ManifestationSummary[] }
  > {
    return firstValueFrom(
      this.http.get<
        ManifestationListPage & {
          readonly items: readonly ManifestationSummary[];
        }
      >(this.url('/manifestations'), { params: queryParams(query) }),
    );
  }

  /** GET /v1/portal/manifestations/{id} — 404 NOT_FOUND{kind:'manifestation'}; corpo livre no OpenAPI (OD-P91). */
  getManifestation(manifestationId: string): Promise<ManifestationDetail> {
    return this.get<ManifestationDetail>(
      `/manifestations/${encodeURIComponent(manifestationId)}`,
    );
  }

  /** POST /v1/portal/manifestations — `manifestar:none:<fp>`; sem 401 no OpenAPI (anônimo admitido, H.51). */
  async createManifestation(
    body: ManifestationCreateBody,
  ): Promise<CommandResult<ManifestationCreated>> {
    const key = await idempotencyKey('manifestar', NO_TARGET, body);
    return this.command<ManifestationCreated>((headers) =>
      this.http.post<ManifestationCreated>(this.url('/manifestations'), body, {
        headers,
        observe: 'response',
      }),
    )(key, null);
  }

  /** POST /v1/portal/manifestations/{id}/acknowledge — `acknowledge:<id>:<fp({})>`; ETag "<version>". */
  async acknowledgeManifestation(
    manifestationId: string,
  ): Promise<CommandResult<ManifestationAcknowledged>> {
    const body = {};
    const key = await idempotencyKey('acknowledge', manifestationId, body);
    return this.command<ManifestationAcknowledged>((headers) =>
      this.http.post<ManifestationAcknowledged>(
        this.url(
          `/manifestations/${encodeURIComponent(manifestationId)}/acknowledge`,
        ),
        body,
        { headers, observe: 'response' },
      ),
    )(key, null);
  }

  /** POST /v1/portal/evaluations — `avaliar:<subjectId>:<fp>` ([DIVERGE-18]: uma rota para request e manifestation). */
  async createEvaluation(
    body: EvaluationCreateBody,
  ): Promise<CommandResult<EvaluationCreated>> {
    const key = await idempotencyKey('avaliar', body.subjectId, body);
    return this.command<EvaluationCreated>((headers) =>
      this.http.post<EvaluationCreated>(this.url('/evaluations'), body, {
        headers,
        observe: 'response',
      }),
    )(key, null);
  }

  /** GET /v1/portal/service-charter/{serviceKey}/deadline — 404 NOT_FOUND{kind:'service'}. */
  getServiceCharterDeadline(
    serviceKey: string,
  ): Promise<ServiceCharterDeadline> {
    return this.get<ServiceCharterDeadline>(
      `/service-charter/${encodeURIComponent(serviceKey)}/deadline`,
    );
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
