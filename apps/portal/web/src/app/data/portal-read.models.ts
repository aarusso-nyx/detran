// Modelos das leituras do par 2 (contrato CTG-0003b §2.1; ADR-0007): o que o OpenAPI gerado fixa
// (query e path tipados, itens das listas, pontos, resumo) é derivado por `import type` de
// `@detran/api-clients`; o que ele deixa livre — os corpos de `GET aits/{aitId}` e
// `GET requests/{id}`, tipados `{ [key: string]: unknown }` ([DIVERGE-1], OD-P69) — é transcrito de
// `portal-route-contract.md` §4/§5 e das interfaces de `process-timeline.projection.ts`, sem
// validação em tempo de execução (o cliente confia na projeção, como o par 1). Campos marcados
// `source_pending` não têm forma fechada (OD-P72/OD-P74): a UI só os renderiza quando presentes e
// nunca simula o que falta (M15).
import type {
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
