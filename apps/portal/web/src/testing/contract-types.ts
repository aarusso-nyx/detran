// R-0014 TASK-0008 (Inspector). Transcrição literal das assinaturas TS do contrato
// `work/rounds/R-0014/contracts/CTG-0003a.md` §2–§4 e §6.1 — nunca reinterpretadas. Usado só
// pelos specs deste par para tipar chamadas a métodos/exports que os arquivos "(altera)" do §1
// (`core/session.facade.ts`, `core/error-boundary.ts`, `core/resume.service.ts`,
// `data/portal.client.ts`) ainda não declaram: o spec importa a classe/instância REAL (existe
// em disco) e faz `as unknown as <Contrato>` para tipar contra a assinatura futura sem inventar
// valor nenhum — cada campo abaixo cita a seção do contrato de onde veio. Arquivos inteiramente
// novos do §1 (`shared/*`, `forms/*`, `core/clock.ts`, `core/error-banner.component.ts`,
// `core/field-errors.directive.ts`, `data/idempotency-key.ts`, `data/portal-command.models.ts`)
// NÃO precisam deste cast: a importação direta já falha com "Cannot find module" (critério de
// aceitação do prompt), que é o comportamento esperado.
import type { CitizenAccount } from '../app/data/portal.client';

// ---------------------------------------------------------------------------------------------
// §2.1–§2.3 — data/portal-command.models.ts e trechos de data/portal.client.ts (novos tipos)
// ---------------------------------------------------------------------------------------------

export type RequestTargetKind =
  'ait' | 'case' | 'vehicle' | 'exam' | 'crash' | 'none';

export interface RequestCreateBody {
  readonly serviceKey: string;
  readonly targetKind: RequestTargetKind;
  readonly targetId?: string;
  readonly channel: 'portal';
}

/** União §5.1 (14 formas) — opaca para os specs deste arquivo (corpo é `unknown` no cliente). */
export type RequestDraftBody = Record<string, unknown>;

export interface AttachmentIntentBody {
  readonly filename: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly sha256: string;
}

export interface RequestSubmitBody {
  readonly signature: {
    readonly method: 'govbr' | 'upload';
    readonly signatureRef: string;
  };
  readonly consequenceAck?: {
    readonly textVersion: string;
    readonly acceptedAt: string;
  };
}

export interface RequestWithdrawBody {
  readonly confirm: true;
  readonly reason?: string;
}

export interface DiligenceResponseBody {
  readonly text: string;
  readonly attachmentIds: readonly string[];
}

export interface ElevationCreateBody {
  readonly targetLevel: 'avancada';
  readonly method: 'biographic' | 'biometric' | 'icp';
  readonly resumeRoute: string;
}

export interface ElevationCompleteBody {
  readonly resumeToken: string;
}

export interface RequestCreated {
  readonly requestId: string;
  readonly state: 'PEDIDO_EM_COMPOSICAO';
  readonly prefilled: Record<string, unknown>;
  readonly requirements: readonly string[];
  readonly minimumAssurance: 'none' | 'simples' | 'avancada' | 'qualificada';
  readonly version: number;
}

export interface DraftSaved {
  readonly requestId: string;
  readonly version: number;
  readonly savedAt: string;
}

export interface RequestSubmitted {
  readonly requestId: string;
  readonly state: 'EM_ANDAMENTO_NO_ORGAO' | 'AVALIACAO_OFERECIDA';
  readonly protocol: {
    readonly number?: string;
    readonly issuedAt?: string;
    readonly channel?: 'portal';
    readonly receiptHash?: string;
  };
  readonly delegation: {
    readonly status?: 'delegated' | 'not_applicable';
    readonly externalId?: string | null;
  };
  readonly version: number;
}

export interface RequestWithdrawn {
  readonly requestId: string;
  readonly state: 'DESISTIDO';
  readonly withdrawnAt: string;
  readonly version: number;
}

export interface CommandResult<T> {
  readonly body: T;
  readonly etag: string | null;
}

/** Formas 2xx ausentes do OpenAPI (§2.3, [DIVERGE-3], OD-P59) — `source_pending` marcado no contrato. */
export interface AttachmentUploadIntent {
  readonly attachmentId: string;
  readonly uploadUrl: string;
  readonly method: 'PUT';
  readonly headers: Readonly<Record<string, string>>;
  readonly expiresAt: string | null;
}
export interface AttachmentCompleted {
  readonly attachmentId: string;
  readonly sha256: string;
}
export interface DiligenceResponded {
  readonly requestId: string;
  readonly version: number;
}
export interface ElevationStarted {
  readonly redirectUrl: string;
  readonly resumeToken: string;
  readonly elevationId: string;
}
export interface ElevationCompleted {
  readonly assuranceLevel: 'simples' | 'avancada' | 'qualificada';
}

// ---------------------------------------------------------------------------------------------
// §2.4 — PortalClient (comandos); `PortalCommandClient` é o subconjunto novo (leituras
// existentes — brand/me/services/entitledResource — ficam no tipo real `PortalClient`).
// ---------------------------------------------------------------------------------------------

export interface PortalCommandClient {
  createRequest(
    body: RequestCreateBody,
  ): Promise<CommandResult<RequestCreated>>;
  saveDraft(
    requestId: string,
    serviceKey: string,
    body: RequestDraftBody,
    ifMatch: string | null,
  ): Promise<CommandResult<DraftSaved>>;
  requestAttachmentUpload(
    requestId: string,
    intent: AttachmentIntentBody,
  ): Promise<CommandResult<AttachmentUploadIntent>>;
  uploadToSignedUrl(intent: AttachmentUploadIntent, file: Blob): Promise<void>;
  completeAttachment(
    requestId: string,
    attachmentId: string,
  ): Promise<CommandResult<AttachmentCompleted>>;
  submitRequest(
    requestId: string,
    serviceKey: string,
    targetId: string | null,
    body: RequestSubmitBody,
  ): Promise<CommandResult<RequestSubmitted>>;
  withdrawRequest(
    requestId: string,
    body: RequestWithdrawBody,
    ifMatch: string | null,
  ): Promise<CommandResult<RequestWithdrawn>>;
  respondDiligence(
    requestId: string,
    diligenceId: string,
    body: DiligenceResponseBody,
  ): Promise<CommandResult<DiligenceResponded>>;
  elevateAssurance(
    subjectId: string,
    body: ElevationCreateBody,
  ): Promise<CommandResult<ElevationStarted>>;
  completeElevation(
    elevationId: string,
    body: ElevationCompleteBody,
  ): Promise<CommandResult<ElevationCompleted>>;
  downloadReceipt(requestId: string): Promise<Blob>;
}

// ---------------------------------------------------------------------------------------------
// §3 — core/error-boundary.ts (ClassifiedError estendida + presentError + catálogo)
// ---------------------------------------------------------------------------------------------

export interface ExtendedClassifiedError {
  readonly code: string | null;
  readonly status: number;
  readonly messageKey: string | null;
  readonly requestId?: string;
  readonly context: Readonly<Record<string, unknown>>;
  readonly fields: readonly string[];
  readonly retryAfter: number | string | null;
}

export type ErrorSeverity = 'error' | 'warning' | 'info';

export type NextStep =
  | 'login'
  | 'reauth'
  | 'elevation'
  | 'entitlement_help'
  | 'service_unavailable'
  | 'ineligible'
  | 'retry'
  | 'reload'
  | 'inline_fields'
  | 'support'
  | 'existing_request'
  | 'payment'
  | 'enrollment'
  | 'representation'
  | 'none';

export interface ErrorPresentation {
  readonly code: string | null;
  readonly status: number;
  readonly messageKey: string;
  readonly messageParams: Readonly<Record<string, string>>;
  readonly severity: ErrorSeverity;
  readonly nextStep: NextStep;
  readonly nextStepRoute: string | null;
  readonly alternativeChannel: boolean;
  readonly fields: readonly string[];
  readonly retryAfter: number | string | null;
  readonly context: Readonly<Record<string, unknown>>;
  readonly requestId: string | null;
}

export interface PresentErrorOptions {
  readonly resumeRoute?: string;
  readonly serviceKey?: string;
  readonly entitlement?: {
    readonly kind: string;
    readonly id: string;
  };
}

/** Os 67 códigos de §3.3, na ordem do catálogo §1–§7 (transcrição; não invente nem reordene). */
export const PORTAL_ERROR_CODES = [
  // §1 sessão, identidade e nível (9)
  'PORTAL.AUTH_REQUIRED',
  'PORTAL.IDENTITY_NOT_CITIZEN',
  'PORTAL.ASSURANCE_NOT_VERIFIED',
  'PORTAL.ASSURANCE_INSUFFICIENT',
  'PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED',
  'PORTAL.REPRESENTATION_REFUSED',
  'PORTAL.REPRESENTATION_EXPIRED',
  'PORTAL.TENANT_UNRESOLVED',
  'PORTAL.SESSION_TENANT_MISMATCH',
  // §2 vínculo e elegibilidade (5)
  'PORTAL.NOT_FOUND',
  'PORTAL.ENTITLEMENT_REQUIRED',
  'PORTAL.INELIGIBLE',
  'PORTAL.SERVICE_UNAVAILABLE',
  'PORTAL.SERVICE_PARTIALLY_AVAILABLE',
  // §3 pedidos e atos (18)
  'PORTAL.REQUEST_STATE_INVALID',
  'PORTAL.REQUEST_DRAFT_EXISTS',
  'PORTAL.REQUEST_ONE_PER_AIT',
  'PORTAL.REQUEST_SIGNATURE_REQUIRED',
  'PORTAL.REQUEST_CONSEQUENCE_ACK_REQUIRED',
  'PORTAL.REQUEST_OUT_OF_DEADLINE',
  'PORTAL.APPEAL_CETRAN_WINDOW_CLOSED',
  'PORTAL.ATTACHMENT_INVALID',
  'PORTAL.ATTACHMENT_AGENCY_DOCUMENT',
  'PORTAL.WITHDRAWAL_AFTER_JUDGMENT',
  'PORTAL.DILIGENCE_NOT_OPEN',
  'PORTAL.DILIGENCE_ASKS_AGENCY_DOCUMENT',
  'PORTAL.INDICATION_DRIVER_INVALID',
  'PORTAL.INDICATION_SECOND_SIGNATURE_PENDING',
  'PORTAL.INDICATION_WINDOW_CLOSED',
  'PORTAL.DELEGATION_FAILED',
  'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY',
  'PORTAL.EVALUATION_NOT_OFFERED',
  // §4 pagamento e SNE (11)
  'PORTAL.PAYMENT_TIER_NOT_AVAILABLE',
  'PORTAL.PAYMENT_SNE_TIER_REQUIRES_ENROLLMENT',
  'PORTAL.PAYMENT_WAIVER_ACK_REQUIRED',
  'PORTAL.PAYMENT_WAIVER_DISABLED',
  'PORTAL.PAYMENT_METHOD_UNAVAILABLE',
  'PORTAL.PAYMENT_ALREADY_PAID',
  'PORTAL.PAYMENT_PROVIDER_UNAVAILABLE',
  'PORTAL.SNE_CONTACT_REQUIRED',
  'PORTAL.SNE_ALREADY_ENROLLED',
  'PORTAL.SNE_NOT_ENROLLED',
  'PORTAL.SNE_UPSTREAM_UNAVAILABLE',
  // §5 documentos, veículos, sinistros e exames (11)
  'PORTAL.CNH_NOT_FOUND',
  'PORTAL.CNH_NOT_VALID_FOR_DIGITAL',
  'PORTAL.CNH_CLEARANCE_PENDING',
  'PORTAL.CRLV_BLOCKED_BY_DEBT',
  'PORTAL.CRLV_BLOCKED_BY_RESTRICTION',
  'PORTAL.CRLV_SUSPENDED_ENFORCEABILITY_NOT_BLOCKING',
  'PORTAL.NATIONAL_READ_UNAVAILABLE',
  'PORTAL.CRASH_NOT_FINAL',
  'PORTAL.CRASH_THIRD_PARTY_DATA_RESTRICTED',
  'PORTAL.EXAM_PROCESSING',
  'PORTAL.BOARD_REQUEST_WINDOW_CLOSED',
  // §6 atendimento, avaliação e LGPD (7)
  'PORTAL.MANIFESTATION_KIND_INVALID',
  'PORTAL.MANIFESTATION_STATE_INVALID',
  'PORTAL.MANIFESTATION_NEVER_REFUSED',
  'PORTAL.EVALUATION_ALREADY_SUBMITTED',
  'PORTAL.PRIVACY_SCOPE_REQUIRES_ASSURANCE',
  'PORTAL.PRIVACY_NO_DATA',
  'PORTAL.PRIVACY_CORRECTION_NOT_ALLOWED',
  // §7 genéricos (6)
  'PORTAL.VALIDATION_FAILED',
  'PORTAL.ENUM_INVALID',
  'PORTAL.IF_MATCH_REQUIRED',
  'PORTAL.VERSION_CONFLICT',
  'PORTAL.RATE_LIMITED',
  'PORTAL.INTERNAL',
] as const;

export type PortalErrorCode = (typeof PORTAL_ERROR_CODES)[number];

/** Superfície de `core/error-boundary.ts` usada pelos specs (existente + §3 novo). */
export interface PortalErrorBoundaryContract {
  classifyError(error: unknown): ExtendedClassifiedError;
  messageKeyFor(code: string): string;
  presentError(
    error: unknown,
    options?: PresentErrorOptions,
  ): ErrorPresentation;
  readonly PORTAL_ERROR_CODES: typeof PORTAL_ERROR_CODES;
}

// ---------------------------------------------------------------------------------------------
// §4 — SessionFacade completo
// ---------------------------------------------------------------------------------------------

export type AssuranceLevel = 'simples' | 'avancada' | 'qualificada';
export type ElevationMethod = 'biographic' | 'biometric' | 'icp';

export interface ActRequirement {
  readonly act: string;
  readonly level: AssuranceLevel | 'none';
  readonly allowed: boolean;
  readonly reason?: string;
}

export interface Representation {
  readonly id?: string;
  readonly label: string;
  readonly scope?: 'ait' | 'all';
  readonly validUntil?: string | null;
}

export interface ElevationRequest {
  readonly targetLevel: 'avancada';
  readonly method: ElevationMethod;
  readonly resumeRoute: string;
  readonly draft?: unknown;
}

/** Superfície completa de `SessionFacade`/`PortalSessionFacade` (§4). */
export interface PortalSessionFacadeContract {
  readonly active: () => boolean;
  readonly account: () => CitizenAccount | null;
  readonly assuranceLevel: () => AssuranceLevel | null;
  readonly actRequirements: () => readonly ActRequirement[];
  readonly representations: () => readonly Representation[];
  readonly representation: () => Representation | null;
  readonly loading: () => boolean;
  readonly loadError: () => ExtendedClassifiedError | null;
  load(): Promise<void>;
  requirementFor(actKey: string): ActRequirement | null;
  canPerform(actKey: string): boolean;
  requestElevation(input: ElevationRequest): Promise<ElevationStarted>;
  completeElevation(elevationId: string, resumeToken: string): Promise<void>;
}

// ---------------------------------------------------------------------------------------------
// §7 — OfflineDocumentStore (API já implementada; tipo só para clareza nos specs)
// ---------------------------------------------------------------------------------------------

export type OfflineDocumentKind = 'cnh-e' | 'crlv-e';
export interface OfflineDocument<T = unknown> {
  readonly kind: OfflineDocumentKind;
  readonly document: T;
  readonly validUntil: string;
}

// ---------------------------------------------------------------------------------------------
// §5.4 (parcial) — formas usadas por shared/service-wizard.component.spec.ts via cast do
// SessionFacade (não precisa cast próprio: o componente é novo, falha por módulo ausente).
// ---------------------------------------------------------------------------------------------

export interface ResumeServiceContract {
  save(point: { route: string; draft: unknown }): void;
  resume(): { route: string; draft: unknown } | null;
  peek(): { route: string; draft: unknown } | null;
  clear(): void;
}
