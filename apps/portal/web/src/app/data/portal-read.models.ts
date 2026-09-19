// Modelos das leituras do par 2 (contrato CTG-0003b §2.1; ADR-0007): o que o OpenAPI gerado fixa
// (query e path tipados, itens das listas, pontos, resumo) é derivado por `import type` de
// `@detran/api-clients`; o que ele deixa livre — os corpos de `GET aits/{aitId}` e
// `GET requests/{id}`, tipados `{ [key: string]: unknown }` ([DIVERGE-1], OD-P69) — é transcrito de
// `portal-route-contract.md` §4/§5 e das interfaces de `process-timeline.projection.ts`, sem
// validação em tempo de execução (o cliente confia na projeção, como o par 1). Campos marcados
// `source_pending` não têm forma fechada (OD-P72/OD-P74): a UI só os renderiza quando presentes e
// nunca simula o que falta (M15).
import type {
  BpPortalCitizenService001Commands,
  BpPortalIdentity001Commands,
  BpPortalInbox001Commands,
  BpPortalProjections001Commands,
  BpPortalRequests001Commands,
} from '@detran/api-clients';
import type { AitAction } from '../shared/action-triplet.component'; // CTG-0003a §5.3

type ProjectionsOps = BpPortalProjections001Commands.operations;
type RequestsOps = BpPortalRequests001Commands.operations;
type ResponseJson<Op, Status extends number> = Op extends {
  responses: Record<Status, { content: { 'application/json': infer Body } }>;
}
  ? Body
  : never;

// —— autuações (contrato §4; infraction-view.projection.ts l. 30–90) ——

/** INFRACTION_SITUATIONS (7); OD-P20: 3 tokens internos sem rótulo nunca chegam. */
export type InfractionSituation =
  | 'aguardando_defesa'
  | 'em_defesa'
  | 'penalidade_aplicada'
  | 'em_recurso'
  | 'encerrada'
  | 'cancelada'
  | 'arquivada';

export type PointsStatus = 'em_disputa' | 'definitivo' | 'none';

/** `{ vehicle?: string; status?: string; page?: number; pageSize?: number }`. */
export type AitListQuery = NonNullable<
  ProjectionsOps['portalAitList']['parameters']['query']
>;

/** `{ items: AitListRaw[]; total: number; page: number; pageSize: number }`. */
export type AitListPage = ResponseJson<ProjectionsOps['portalAitList'], 200>;

/** contrato §4 `deadlines[]{ kind, dueOn, ownedBy }`; T14 §4. */
export interface AitDeadline {
  /** Token do prazo → `data-token` (rótulo: OD-P64). */
  readonly kind: string;
  /** ISO date calculada no servidor. */
  readonly dueOn: string;
  readonly ownedBy: 'citizen' | 'agency';
}

export type AitSummary = Omit<
  AitListPage['items'][number],
  'deadlines' | 'actions'
> & {
  readonly deadlines: readonly AitDeadline[];
  /** `{ key, available, reason?, minimumAssurance }`. */
  readonly actions: readonly AitAction[];
};

/** contrato §4 `notices[]`. */
export interface AitNotice {
  readonly kind: 'NA' | 'NP' | 'decisao';
  /** Token (`portal.notifications.origin.<channel>` quando sne|portal; demais: source_pending). */
  readonly channel: string;
  readonly dispatchedOn: string | null;
  readonly effectiveOn: string | null;
  /** Ciência ficta → `portal.notifications.ciencia_ficta`. */
  readonly fictitious: boolean;
  readonly printedDeadline: string | null;
}

/** `PagamentoSchema.tier` (contrato §5.1); `tiers[].code` presumido igual ([DIVERGE-6], OD-P74). */
export type PaymentTierCode =
  | 'desconto_80'
  | 'desconto_60_reconhecimento'
  | 'desconto_40_fora_sne'
  | 'integral_juros';

/** `PagamentoSchema.method`. */
export type PaymentMethod = 'pix' | 'debito' | 'boleto' | 'cartao';

/** contrato §4 `payment{ tiers[]{ code, percent, amount, availableUntil, requiresSne, waivesAppeal } }`. */
export interface PaymentTier {
  readonly code: PaymentTierCode;
  /** Percentual pago em relação ao original, como o servidor mandar (semântica: source_pending). */
  readonly percent: number;
  /** OD-P41: `null` quando `payment_json.tiers` vem sem valor. */
  readonly amount: number | null;
  /** ISO date. */
  readonly availableUntil: string | null;
  readonly requiresSne: boolean;
  readonly waivesAppeal: boolean;
}

export interface PaymentInfo {
  readonly tiers: readonly PaymentTier[];
  readonly paid: boolean;
  readonly paidTier: PaymentTierCode | null;
  /** source_pending: `payment_json.methods` (H.53; projeção l. 12–13) — forma não fixada (OD-P74). */
  readonly methods?: unknown;
}

/** contrato §4 `GET aits/{aitId}`; OpenAPI: `{ [key]: unknown }` ([DIVERGE-1]). */
export interface AitDetail extends AitSummary {
  readonly notices: readonly AitNotice[];
  readonly payment: PaymentInfo;
  /** Rascunho/pedido aberto sobre este AIT (contrato §4 `openRequestId?`). */
  readonly openRequestId: string | null;
  /** Sem rota de leitura nesta lista fechada → não renderizado. */
  readonly evidenceAvailable: boolean;
}

/** `{ aitId; pointsStatus: PointsStatus; points: null }` (OD-P34: points sempre null). */
export type AitPoints = ResponseJson<ProjectionsOps['portalAitPointsGet'], 200>;

/**
 * `{ definitivePoints; disputedPoints; byVehicle: unknown[]; last12Months: unknown[]; cachedAt }`.
 * `byVehicle`/`last12Months`: itens `{ [key]: unknown }` → não renderizados até OD-P78.
 */
export type PointsSummary = ResponseJson<
  ProjectionsOps['portalPointsSummaryGet'],
  200
>;

// —— pedidos (contrato §5; process-timeline.projection.ts l. 41–60) ——

/** WF-PORTAL-001 (contrato §5); 13 chaves `portal.situation.request.<STATE>`. */
export type RequestState =
  | 'IDENTIFICADO'
  | 'SERVICO_SELECIONADO'
  | 'ELEGIBILIDADE_VERIFICADA'
  | 'INELEGIVEL'
  | 'PEDIDO_EM_COMPOSICAO'
  | 'AGUARDANDO_NIVEL_ASSINATURA'
  | 'AGUARDANDO_PAGAMENTO'
  | 'PROTOCOLADO'
  | 'EM_ANDAMENTO_NO_ORGAO'
  | 'RESULTADO_DISPONIVEL'
  | 'AVALIACAO_OFERECIDA'
  | 'CONCLUIDO'
  | 'DESISTIDO';

/** `{ state?: string; kind?: string; period?: string; page?: number; pageSize?: number }`. */
export type RequestListQuery = NonNullable<
  RequestsOps['portalRequestList']['parameters']['query']
>;

export type RequestListPage = ResponseJson<
  RequestsOps['portalRequestList'],
  200
>;

export interface RequestNextAction {
  readonly by: 'citizen' | 'agency' | 'none';
  /** Chave i18n enviada pelo servidor: `portal.requests.nextAction.<STATE>`. */
  readonly label: string;
  /** ISO date. */
  readonly dueOn: string | null;
}

export type RequestSummary = Omit<
  RequestListPage['items'][number],
  'nextAction' | 'situation'
> & {
  readonly situation: RequestState;
  readonly nextAction: RequestNextAction;
};

/** OpenAPI `@example` de `portalRequestGet` (única fonte da forma de `request`). */
export interface RequestRecord {
  readonly requestId: string;
  readonly state: RequestState;
  readonly serviceKey: string;
  readonly targetKind: 'ait' | 'case' | 'vehicle' | 'exam' | 'crash' | 'none';
  readonly targetId: string | null;
  readonly channel: 'portal';
  readonly minimumAssurance: 'none' | 'simples' | 'avancada' | 'qualificada';
  readonly delegation: {
    /** Fixtures §10.5 como única fonte (source_pending). */
    readonly status: 'pending' | 'delegated' | 'failed' | 'not_applicable';
    readonly domain: string | null;
    readonly command: string | null;
    /** `case_id` do RAIT (process_timeline: `delegation_external_id`; [DIVERGE-4]). */
    readonly externalId: string | null;
    readonly error: string | null;
  };
  readonly protocol: {
    readonly number: string;
    readonly issuedAt: string;
    readonly channel: 'portal';
    readonly receiptHash: string;
  } | null;
  /** OpenAPI `@example` `"draft": null`. */
  readonly draft: Record<string, unknown> | null;
  readonly withdrawnAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
}

/** process-timeline.projection.ts l. 41–47 (sem `ownedBy` — [DIVERGE-3], OD-P71). */
export interface TimelineEntry {
  readonly at: string;
  /** Técnico; o tipo da diligência é `TIMELINE_INQUIRY_TYPE` (`shared/process-timeline.component.ts`). */
  readonly type: string;
  /** Um dos 7 PROCESS_TIMELINE_DOMAIN_EVENTS, ou `null`. */
  readonly domainEvent: string | null;
  readonly visibility: 'citizen';
  readonly data: Readonly<Record<string, string | number | boolean | null>>;
}

/** l. 49–53. */
export interface TimelineDeadline {
  readonly kind: 'diligencia';
  readonly dueOn: string;
  readonly ownedBy: 'citizen' | 'agency';
}

/** Forma proposta ([DIVERGE-18], OD-P72): todos os campos `source_pending`. */
export interface ProcessDocument {
  readonly documentId: string;
  readonly title: string;
  /** Token → `data-token`. */
  readonly kind: string | null;
  readonly issuedAt: string | null;
  /** `null` → estado indisponível, nunca link simulado. */
  readonly downloadUrl: string | null;
}

/** Forma proposta ([DIVERGE-18], OD-P72). */
export interface Diligence {
  /** `{did}` de POST …/diligences/{did}/responses; nome do campo source_pending. */
  readonly diligenceId: string;
  /** "O que exatamente está sendo pedido" (T11 §4); source_pending. */
  readonly requestText: string | null;
  /** Prazo próprio ([UC-PORTAL-009] AC-4); source_pending. */
  readonly dueOn: string | null;
  /** Gate `state: 'open'`; demais tokens source_pending. */
  readonly status: 'open' | 'answered' | 'expired';
  /** Token de DILIGENCE_NOT_OPEN.context.outcome; source_pending. */
  readonly outcome: string | null;
}

/** contrato §5 `GET …/decision`. */
export type DecisionOutcome =
  | 'deferido'
  | 'indeferido'
  | 'parcialmente_deferido'
  | 'provido'
  | 'negado'
  | 'nao_conhecido';

export interface DecisionNextStep {
  /** `'none'` no `@example`; demais tokens source_pending (OD-P72). */
  readonly kind: string | null;
  readonly serviceKey: string | null;
  readonly dueOn: string | null;
}

export interface Decision {
  readonly outcome: DecisionOutcome;
  /** TimelineDecision: sempre `null` nesta rodada (OD-P43). */
  readonly summary: string | null;
  readonly publishedOn: string | null;
  /** `null` → "baixar decisão" indisponível. */
  readonly documentUrl: string | null;
  readonly nextStep: DecisionNextStep;
  readonly refundDue: boolean | null;
  readonly finalInstance: boolean | null;
}

/** contrato §5 `actions{ … }`. */
export interface RequestActions {
  readonly canRespondDiligence: boolean;
  readonly canWithdraw: boolean;
  /** Token → `data-reason` (ex.: `'estado_nao_admite'`, `@example`). */
  readonly withdrawalBlockedReason: string | null;
  readonly canAppeal: boolean;
  readonly nextInstanceServiceKey: 'recurso_jari' | 'recurso_cetran' | null;
}

/** contrato §5 `GET requests/{id}` (T-07); OpenAPI: `{ [key]: unknown }` ([DIVERGE-1]). */
export interface RequestDetail {
  readonly request: RequestRecord;
  readonly timeline: readonly TimelineEntry[];
  readonly deadlines: readonly TimelineDeadline[];
  readonly documents: readonly ProcessDocument[];
  readonly diligences: readonly Diligence[];
  readonly decision: Decision | null;
  readonly actions: RequestActions;
}

// —— par 3 (contrato CTG-0003c §2.1): caixa, SNE, push/preferências, documentos, veículos,
// sinistros, exames e atendimento. Mesma regra do par 2: o que o OpenAPI fixa é derivado; o
// que ele deixa livre (`{ [key]: unknown }`) é transcrito de `portal-route-contract.md` §6/§7/§8
// como forma proposta, marcada `source_pending` (OD-P91), sem validação em tempo de execução —
// a UI só renderiza o campo quando presente e nunca simula o que falta (M15).

type InboxOps = BpPortalInbox001Commands.operations;
type InboxSchemas = BpPortalInbox001Commands.components['schemas'];
type CitizenOps = BpPortalCitizenService001Commands.operations;
type CitizenSchemas = BpPortalCitizenService001Commands.components['schemas'];
type IdentitySchemas = BpPortalIdentity001Commands.components['schemas'];

// —— caixa do cidadão (contrato §6; BP-PORTAL-INBOX-001) ——

/** `{ kind?: 'acao_necessaria' | 'informativo'; read?: 'true' | 'false'; page?; pageSize? }`. */
export type InboxListQuery = NonNullable<
  InboxOps['portalInboxList']['parameters']['query']
>;

/** `{ items: InboxItemRaw[]; total; page; pageSize }` — itens com campos opcionais no gerado. */
export type InboxListPage = ResponseJson<InboxOps['portalInboxList'], 200>;

export type InboxKind = 'acao_necessaria' | 'informativo';
export type InboxSource = 'sne' | 'portal';
/** Token → `data-category` (rótulo: `portal.notifications.category.<token>`, OD-P89). */
export type InboxCategory = 'SNE' | 'PROCESSO' | 'OUVIDORIA' | 'SISTEMA';

export interface InboxDeadline {
  /** ISO date do servidor. */
  readonly dueOn: string;
  readonly ownedBy: 'citizen' | 'agency';
}

export type InboxItem = Omit<
  InboxListPage['items'][number],
  'kind' | 'source' | 'category' | 'deadline'
> & {
  readonly id: string;
  readonly kind: InboxKind;
  readonly source: InboxSource;
  readonly category: InboxCategory;
  readonly deadline: InboxDeadline | null;
  /** SÓ para `source: 'sne'`; data calculada pelo servidor — nunca derivada de `availableOn` ([DIVERGE-4]). */
  readonly fictitiousAcknowledgementOn: string | null;
};

/** `{ id; readOn; acknowledgementEvidence: { acknowledgedAt?; displayedSha256? } | null }`. */
export type InboxReadResult = ResponseJson<
  InboxOps['portalInboxItemRead'],
  200
>;

// —— SNE (contrato §5.1/§6) ——

/** `{ email?; phone?; channel?: 'push'|'email'|'sne'; consent: { textVersion; effectsAck: WireSneEffect[] } }`. */
export type SneEnrollmentCreateBody = InboxSchemas['SneEnrollmentCreateDto'];
/** `{ reason? }`. */
export type SneEnrollmentCancelBody = InboxSchemas['SneEnrollmentCancelDto'];
/** Enum do fio (OpenAPI/schema; OD-P61): ciencia_ficta|canal_exclusivo|desconto_60|cancelamento. */
export type WireSneEffect =
  SneEnrollmentCreateBody['consent']['effectsAck'][number];
export type SneChannel = NonNullable<SneEnrollmentCreateBody['channel']>;
/** `{ enrolled: boolean; since: string | null; channel: SneChannel | null; cancelable: boolean }`. */
export type SneEnrollment = ResponseJson<
  InboxOps['portalSneEnrollmentGet'],
  200
>;
export type SneEnrolled = ResponseJson<
  InboxOps['portalSneEnrollmentCreate'],
  201
>;
/** `{ enrolled: false; since: null; channel; cancelable: false; cancelledAt }`. */
export type SneCancelled = ResponseJson<
  InboxOps['portalSneEnrollmentDelete'],
  200
>;

// —— push e preferências ——

/** `{ endpoint; keys: { p256dh; auth } }`. */
export type PushSubscriptionCreateBody =
  InboxSchemas['PushSubscriptionCreateDto'];
/** `{ id; endpoint; createdAt }`. */
export type PushSubscriptionCreated = ResponseJson<
  InboxOps['portalPushSubscriptionCreate'],
  201
>;
/** `{ channel; pushSubscription? }`. */
export type PreferencesUpdateBody = IdentitySchemas['PreferencesUpdateDto'];
/** Forma PROPOSTA: `PUT preferences` não declara 2xx (OD-P87/OD-P59) — ambos os campos `source_pending`. */
export interface PreferencesUpdated {
  readonly channel: PreferencesUpdateBody['channel'];
  readonly version: number | null;
}

// —— documentos e veículos (contrato §7; BP-PORTAL-PROJECTIONS-001) ——

/** `{ license: { [key]: unknown }; qrVerification: null; documentBytes: null; category: 'C'; cachedAt }`. */
export type CnhRead = ResponseJson<ProjectionsOps['portalDocumentCnhGet'], 200>;

/** Forma PROPOSTA de `license` (contrato §7; OD-P35/OD-P91): todos os campos `source_pending`. */
export interface CnhLicense {
  readonly status: 'valida' | 'vencida' | 'suspensa' | 'cassada' | null;
  readonly validUntil: string | null;
  readonly categories: readonly string[];
  readonly restrictions: readonly string[];
}

/** `{ items: { [key]: unknown }[]; cachedAt: string | null }` (OD-P36). */
export type VehicleListPage = ResponseJson<
  ProjectionsOps['portalVehicleList'],
  200
>;

/** Forma PROPOSTA do item (contrato §7 `[{ vehicleId, plate, renavamMasked: never, model }]`; OD-P36/OD-P91). */
export interface Vehicle {
  readonly vehicleId: string;
  readonly plate: string;
  readonly model: string | null;
}

/** contrato §7; vocabulário de `status`/`reason` `source_pending` (tokens → `data-*`). */
export interface ClearanceItem {
  readonly kind: 'tributo' | 'encargo' | 'multa' | 'dpvat';
  readonly amount: number | null;
  readonly status: string;
  readonly blocking: boolean;
  readonly reason: string | null;
}

export interface ClearanceRestriction {
  /** Token → `data-token`; vocabulário `source_pending`. */
  readonly kind: string;
  readonly blocking: boolean;
}

/** Catálogo §5 `CRLV_SUSPENDED_ENFORCEABILITY_NOT_BLOCKING { aitIds[] }`; forma do item `source_pending`. */
export interface ClearanceSuspended {
  readonly aitId: string;
}

/** Gerado: `{ …, canIssue: boolean; cachedAt: string }`; itens transcritos do contrato §7 (OD-P21/OD-P91). */
export type VehicleClearance = Omit<
  ResponseJson<ProjectionsOps['portalVehicleClearanceGet'], 200>,
  'items' | 'restrictions' | 'suspendedEnforceability'
> & {
  readonly items: readonly ClearanceItem[];
  readonly restrictions: readonly ClearanceRestriction[];
  readonly suspendedEnforceability: readonly ClearanceSuspended[];
};

/** Forma PROPOSTA (`POST crlv-e` sem 2xx no OpenAPI — [DIVERGE-9]/[DIVERGE-10]; OD-P91). */
export interface CrlvIssued {
  readonly documentBytes: string | null;
  readonly qrVerification: string | null;
  readonly issuedAt: string;
  /** `source_pending` — necessário ao `OfflineDocumentStore.put` (M14). */
  readonly validUntil: string | null;
  /** Preenchido pelo cliente a partir do parâmetro da rota (§7.1; [DIVERGE-13]). */
  readonly vehicleId: string;
}

// —— sinistros e exames (contrato §7; OD-P19) ——

export type CrashListPage = ResponseJson<
  ProjectionsOps['portalCrashList'],
  200
>;

/** `summary` livre (OD-P19/OD-P91). */
export type CrashSummary = Required<
  Pick<
    CrashListPage['items'][number],
    'crashId' | 'stateLabel' | 'thirdPartyFieldsSuppressed'
  >
> & { readonly summary: Readonly<Record<string, unknown>> };

/** `{ crashId; stateLabel (já traduzido pelo servidor); summary: { [key]: unknown }; thirdPartyFieldsSuppressed }`. */
export type CrashDetail = ResponseJson<ProjectionsOps['portalCrashGet'], 200>;

export type ExamListPage = ResponseJson<ProjectionsOps['portalExamList'], 200>;

export type ExamSummary = Required<
  Pick<ExamListPage['items'][number], 'examId' | 'legalLabel'>
> & { readonly validUntil: string | null; readonly boardDueOn: string | null };

/** `{ examId; legalLabel: string; validUntil: string | null; boardDueOn: string | null }`. */
export type ExamDetail = ResponseJson<ProjectionsOps['portalExamGet'], 200>;

// —— atendimento (contrato §8; BP-PORTAL-CITIZEN-SERVICE-001) ——

/** `{ kind; text?; confidential?; attachmentIds?; anonymous? }`. */
export type ManifestationCreateBody = CitizenSchemas['ManifestationCreateDto'];
/** `{ subjectKind: 'request'|'manifestation'; subjectId; scores{…}; comment? }`. */
export type EvaluationCreateBody = CitizenSchemas['EvaluationCreateDto'];
/** `{ page?; pageSize? }`. */
export type ManifestationListQuery = NonNullable<
  CitizenOps['portalManifestationList']['parameters']['query']
>;
export type ManifestationListPage = ResponseJson<
  CitizenOps['portalManifestationList'],
  200
>;

/** [WF-PORTAL-004] §Estados (9); chaves `portal.situation.manifestation.<STATE>` (OD-P89). */
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

/** 5 tipos (`ManifestationCreateDto.kind`). */
export type ManifestationKind = ManifestationCreateBody['kind'];

/** contrato §8 `extended?{ justification, on }`; fixture `manifestation_extension`. */
export interface ManifestationExtension {
  readonly justification: string;
  readonly on: string;
  /** Fixture `new_due_on`; `source_pending` no contrato. */
  readonly newDueOn: string | null;
}

export interface ManifestationDeadlines {
  /** ÚNICO relógio exibido ([RN-PORTAL-109] 4/5); `info_due_on` nunca chega. */
  readonly agencyDueOn: string;
  readonly extended: ManifestationExtension | null;
}

/** `@example` `{ text, decidedAt }`. */
export interface ManifestationDecision {
  readonly text: string | null;
  readonly decidedAt: string | null;
}

/** Itens de `portalManifestationList` (gerado com campos opcionais; `@example` fixa os nomes). */
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

/** OpenAPI: `{ [key]: unknown }` (OD-P91); `@example`: "item da lista + text/confidential". */
export interface ManifestationDetail extends ManifestationSummary {
  readonly text: string | null;
  readonly confidential: boolean;
}

/** `{ manifestationId; protocol; receivedAt; state: 'COMPROVANTE_EMITIDO'; agencyDueOn; anonymous }`. */
export type ManifestationCreated = ResponseJson<
  CitizenOps['portalManifestationCreate'],
  201
>;
/** `{ manifestationId; state: 'AVALIACAO_OFERECIDA'; acknowledgedAt; evaluationOffered: true; version }` (ETag "<version>"). */
export type ManifestationAcknowledged = ResponseJson<
  CitizenOps['portalManifestationAcknowledge'],
  200
>;
/** `{ evaluationId; subjectKind; subjectId; state; submittedAt; publicNotice }`. */
export type EvaluationCreated = ResponseJson<
  CitizenOps['portalEvaluationCreate'],
  201
>;
/** `{ serviceKey; legalDeadline; normativeReference; availability }` (fixture: "source_pending (OD-P26)"). */
export type ServiceCharterDeadline = ResponseJson<
  CitizenOps['portalServiceCharterDeadlineGet'],
  200
>;
