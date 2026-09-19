// R-0014 TASK-0017 (Inspector). Transcrição literal das assinaturas TS do contrato
// `work/rounds/R-0014/contracts/CTG-0003c.md` §2.1/§2.4 — nunca reinterpretadas. Usado só pelos
// specs deste par para tipar chamadas a métodos/tipos que os arquivos "(altera)" do §1
// (`data/portal.client.ts`, `data/portal-read.models.ts`) ainda não declaram: o spec importa a
// instância/classe REAL (existe em disco) e faz `as unknown as <Contrato>` para tipar contra a
// assinatura futura sem inventar valor nenhum — cada campo cita a seção do contrato de onde veio.
// Mesmo padrão de `contract-types.ts` (par 1) e `contract-types-appeal.ts` (par 2).

// ---------------------------------------------------------------------------------------------
// §2.1 — data/portal-read.models.ts (acréscimos do par 3)
// ---------------------------------------------------------------------------------------------

export type InboxKind = 'acao_necessaria' | 'informativo';
export type InboxSource = 'sne' | 'portal';
export type InboxCategory = 'SNE' | 'PROCESSO' | 'OUVIDORIA' | 'SISTEMA';

export interface InboxListQuery {
  readonly kind?: InboxKind;
  readonly read?: 'true' | 'false';
  readonly page?: number;
  readonly pageSize?: number;
}

export interface InboxDeadline {
  readonly dueOn: string;
  readonly ownedBy: 'citizen' | 'agency';
}

export interface InboxItem {
  readonly id: string;
  readonly kind: InboxKind;
  readonly source: InboxSource;
  readonly category: InboxCategory;
  readonly subjectLine?: string;
  readonly summary?: string;
  readonly aitId: string | null;
  readonly requestId: string | null;
  readonly availableOn?: string;
  readonly readOn: string | null;
  readonly deadline: InboxDeadline | null;
  readonly fictitiousAcknowledgementOn: string | null;
}

export interface InboxListPage {
  readonly items: readonly InboxItem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface InboxReadResult {
  readonly id: string;
  readonly readOn: string;
  readonly acknowledgementEvidence: {
    acknowledgedAt?: string;
    displayedSha256?: string;
  } | null;
}

export type SneChannel = 'push' | 'email' | 'sne';
export type WireSneEffect =
  'ciencia_ficta' | 'canal_exclusivo' | 'desconto_60' | 'cancelamento';

export interface SneEnrollmentCreateBody {
  readonly email?: string;
  readonly phone?: string;
  readonly channel?: SneChannel;
  readonly consent: {
    readonly textVersion: string;
    readonly effectsAck: readonly WireSneEffect[];
  };
}
export interface SneEnrollmentCancelBody {
  readonly reason?: string;
}
export interface SneEnrollment {
  readonly enrolled: boolean;
  readonly since: string | null;
  readonly channel: SneChannel | null;
  readonly cancelable: boolean;
}
export type SneEnrolled = SneEnrollment;
export interface SneCancelled extends SneEnrollment {
  readonly cancelledAt: string | null;
}

export interface PushSubscriptionCreateBody {
  readonly endpoint: string;
  readonly keys: { readonly p256dh: string; readonly auth: string };
}
export interface PushSubscriptionCreated {
  readonly id: string;
  readonly endpoint: string;
  readonly createdAt: string;
}
export interface PreferencesUpdateBody {
  readonly channel: SneChannel;
  readonly pushSubscription?: PushSubscriptionCreateBody | null;
}
export interface PreferencesUpdated {
  readonly channel: SneChannel;
  readonly version: number | null;
}

export interface CnhLicense {
  readonly status: 'valida' | 'vencida' | 'suspensa' | 'cassada' | null;
  readonly validUntil: string | null;
  readonly categories: readonly string[];
  readonly restrictions: readonly string[];
}
export interface CnhRead {
  readonly license: CnhLicense;
  readonly qrVerification: string | null;
  readonly documentBytes: string | null;
  readonly category: 'A' | 'C';
  readonly cachedAt: string;
}

export interface Vehicle {
  readonly vehicleId: string;
  readonly plate: string;
  readonly model: string | null;
}
export interface VehicleListPage {
  readonly items: readonly Vehicle[];
  readonly cachedAt: string | null;
}

export interface ClearanceItem {
  readonly kind: 'tributo' | 'encargo' | 'multa' | 'dpvat';
  readonly amount: number | null;
  readonly status: string;
  readonly blocking: boolean;
  readonly reason: string | null;
}
export interface ClearanceRestriction {
  readonly kind: string;
  readonly blocking: boolean;
}
export interface ClearanceSuspended {
  readonly aitId: string;
}
export interface VehicleClearance {
  readonly items: readonly ClearanceItem[];
  readonly restrictions: readonly ClearanceRestriction[];
  readonly suspendedEnforceability: readonly ClearanceSuspended[];
  readonly canIssue: boolean;
  readonly cachedAt: string;
}
export interface CrlvIssued {
  readonly documentBytes: string | null;
  readonly qrVerification: string | null;
  readonly issuedAt: string;
  readonly validUntil: string | null;
  readonly vehicleId: string;
}

export interface CrashSummary {
  readonly crashId: string;
  readonly stateLabel: string;
  readonly thirdPartyFieldsSuppressed: boolean;
  readonly summary: Readonly<Record<string, unknown>>;
}
export interface CrashListPage {
  readonly items: readonly CrashSummary[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}
export interface CrashDetail {
  readonly crashId: string;
  readonly stateLabel: string;
  readonly summary: Readonly<Record<string, unknown>>;
  readonly thirdPartyFieldsSuppressed: boolean;
}

export interface ExamSummary {
  readonly examId: string;
  readonly legalLabel: string;
  readonly validUntil: string | null;
  readonly boardDueOn: string | null;
}
export interface ExamListPage {
  readonly items: readonly ExamSummary[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}
export interface ExamDetail {
  readonly examId: string;
  readonly legalLabel: string;
  readonly validUntil: string | null;
  readonly boardDueOn: string | null;
}

export type ManifestationKind =
  'reclamacao' | 'denuncia' | 'sugestao' | 'elogio' | 'solicitacao';
export interface ManifestationCreateBody {
  readonly kind: ManifestationKind;
  readonly text?: string;
  readonly confidential?: boolean;
  readonly attachmentIds?: readonly string[];
  readonly anonymous?: boolean;
}
export interface EvaluationScores {
  readonly satisfaction: number;
  readonly quality: number;
  readonly deadline: number;
  readonly clarity: number;
  readonly channel: number;
}
export interface EvaluationCreateBody {
  readonly subjectKind: 'request' | 'manifestation';
  readonly subjectId: string;
  readonly scores: EvaluationScores;
  readonly comment?: string;
}
export interface ManifestationListQuery {
  readonly page?: number;
  readonly pageSize?: number;
}
export type ManifestationState =
  | 'MANIFESTACAO_REGISTRADA'
  | 'COMPROVANTE_EMITIDO'
  | 'EM_ANALISE'
  | 'INFORMACAO_SOLICITADA_AO_AGENTE'
  | 'DECISAO_FINAL_ELABORADA'
  | 'CIENCIA_AO_USUARIO'
  | 'ENCERRADA'
  | 'AVALIACAO_OFERECIDA'
  | 'AVALIADA';
export interface ManifestationExtension {
  readonly justification: string;
  readonly on: string;
  readonly newDueOn: string | null;
}
export interface ManifestationDeadlines {
  readonly agencyDueOn: string;
  readonly extended: ManifestationExtension | null;
}
export interface ManifestationDecision {
  readonly text: string | null;
  readonly decidedAt: string | null;
}
export interface ManifestationSummary {
  readonly manifestationId: string;
  readonly state: ManifestationState;
  readonly protocol: string;
  readonly kind: ManifestationKind;
  readonly receivedAt: string;
  readonly deadlines: ManifestationDeadlines;
  readonly decision: ManifestationDecision | null;
  readonly evaluationOffered: boolean;
  readonly evaluated: boolean;
}
export interface ManifestationListPage {
  readonly items: readonly ManifestationSummary[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}
export interface ManifestationDetail extends ManifestationSummary {
  readonly text: string | null;
  readonly confidential: boolean;
}
export interface ManifestationCreated {
  readonly manifestationId: string;
  readonly protocol: string;
  readonly receivedAt: string;
  readonly state: 'COMPROVANTE_EMITIDO';
  readonly agencyDueOn: string;
  readonly anonymous: boolean;
}
export interface ManifestationAcknowledged {
  readonly manifestationId: string;
  readonly state: 'AVALIACAO_OFERECIDA';
  readonly acknowledgedAt: string;
  readonly evaluationOffered: true;
  readonly version: number;
}
export interface EvaluationCreated {
  readonly evaluationId: string;
  readonly subjectKind: 'request' | 'manifestation';
  readonly subjectId: string;
  readonly state: 'AVALIADA' | 'CONCLUIDO';
  readonly submittedAt: string;
  readonly publicNotice: string;
}
export interface ServiceCharterDeadline {
  readonly serviceKey: string;
  readonly legalDeadline: string;
  readonly normativeReference: string;
  readonly availability: string;
}

// ---------------------------------------------------------------------------------------------
// §1.3/§2.3 — resultado de comando (mesma forma de `data/portal-command.models.ts`, par 1)
// ---------------------------------------------------------------------------------------------
export interface CommandResult<T> {
  readonly body: T;
  readonly etag: string | null;
}

// ---------------------------------------------------------------------------------------------
// §2.4 — PortalClient (leituras e comandos novos do par 3); subconjunto novo — as leituras/
// comandos dos pares 1/2 continuam no tipo real `PortalClient`.
// ---------------------------------------------------------------------------------------------
export interface PortalCommandClientPair3 {
  getService(serviceKey: string): Promise<unknown>;
  listInbox(query?: InboxListQuery): Promise<InboxListPage>;
  markInboxRead(inboxItemId: string): Promise<CommandResult<InboxReadResult>>;
  getSneEnrollment(): Promise<SneEnrollment>;
  enrollSne(body: SneEnrollmentCreateBody): Promise<CommandResult<SneEnrolled>>;
  cancelSne(
    body?: SneEnrollmentCancelBody,
  ): Promise<CommandResult<SneCancelled>>;
  createPushSubscription(
    body: PushSubscriptionCreateBody,
  ): Promise<CommandResult<PushSubscriptionCreated>>;
  updatePreferences(
    body: PreferencesUpdateBody,
    ifMatch: string | null,
  ): Promise<CommandResult<PreferencesUpdated>>;
  getCnh(): Promise<CnhRead>;
  downloadCnhDocument(): Promise<Blob>;
  listVehicles(): Promise<VehicleListPage>;
  getVehicleClearance(vehicleId: string): Promise<VehicleClearance>;
  issueCrlv(vehicleId: string): Promise<CommandResult<CrlvIssued>>;
  listCrashes(): Promise<CrashListPage>;
  getCrash(crashId: string): Promise<CrashDetail>;
  listExams(): Promise<ExamListPage>;
  getExam(examId: string): Promise<ExamDetail>;
  listManifestations(
    query?: ManifestationListQuery,
  ): Promise<ManifestationListPage>;
  getManifestation(manifestationId: string): Promise<ManifestationDetail>;
  createManifestation(
    body: ManifestationCreateBody,
  ): Promise<CommandResult<ManifestationCreated>>;
  acknowledgeManifestation(
    manifestationId: string,
  ): Promise<CommandResult<ManifestationAcknowledged>>;
  createEvaluation(
    body: EvaluationCreateBody,
  ): Promise<CommandResult<EvaluationCreated>>;
  getServiceCharterDeadline(
    serviceKey: string,
  ): Promise<ServiceCharterDeadline>;
}
