// View-models de `shared/` (CTG-0002.md §8): só o que as fichas §4 exibem — nunca DTO do
// backend. Formatos marcados `source_pending` (OD-D16-017) chegam prontos do servidor e são
// exibidos como token; nada é calculado aqui (`CODESTYLE.md` §Frontend).
export type { DashboardBlock, DashboardScreenId } from '../app.route-manifest';
export { FRESHNESS_STATES } from '../core/freshness.store';
export type { FreshnessMeta, FreshnessState } from '../core/freshness.store';
export type { DashboardLayer } from '../core/layer-table';

import type { DashboardBlock } from '../app.route-manifest';
import type { FreshnessMeta } from '../core/freshness.store';

/** [WF-DASH-001] §Classificação (CTG-0001 §1.2 `dashboard.severity`). */
export const SEVERITY_LEVELS = [
  'N1',
  'N2',
  'N3',
  'CRITICO',
  'CRITICO_EXTINCAO',
] as const;
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

/** [WF-DASH-001] §Estados (10). */
export const ALERT_STATES = [
  'DETECTADO',
  'CLASSIFICADO',
  'NOTIFICADO',
  'RECONHECIDO',
  'ESCALONADO',
  'EM_TRATAMENTO',
  'VERIFICADO',
  'ENCERRADO',
  'CRITICO_EXTINCAO',
  'INCIDENTE_REGISTRADO',
] as const;
export type AlertState = (typeof ALERT_STATES)[number];

/** [WF-DASH-001] §Distinção: irregularidade × extinção de direito. */
export type AlertTrack = 'irregularidade' | 'extincao';

/** [WF-DASH-002] §Estados (8). */
export const DUTY_STATES = [
  'JANELA_ABERTA',
  'EM_APURACAO',
  'PREPARADO',
  'SUBMETIDO_PUBLICADO',
  'COMPROVADO',
  'ARQUIVADO',
  'ATRASADO',
  'NAO_CUMPRIDO',
] as const;
export type DutyState = (typeof DUTY_STATES)[number];

/** [RN-DASH-131]: letra canônica do relógio governante (rótulo só em B e C — OD-D16-007). */
export type ClockCode = 'A' | 'B' | 'C' | 'D';

/** [RN-DASH-142]. */
export type Classification = 'P1' | 'P2' | 'P3';

/** Apps de origem (nome próprio, não token traduzível). */
export type OriginApp = 'RAIT' | 'PEC' | 'BOAT' | 'TEAT' | 'PORTAL';

/** OD-D16-008 — finalidades admitidas na leitura N2 (`X-Purpose`). */
export const PURPOSE_TOKENS = [
  'supervisao',
  'auditoria',
  'apuracao',
  'resposta_ao_titular',
  'estatistica',
  'suporte',
] as const;
export type PurposeToken = (typeof PURPOSE_TOKENS)[number];

/** Contrato de rotas §4 (`GET comparisons`). */
export type Dimension = 'pool' | 'circuit' | 'unit' | 'clinic';

/** N2: identificador do objeto de processo; `null` enquanto a finalidade não é declarada. */
export interface AlertObjectView {
  readonly reference: string;
  readonly app: OriginApp;
}

/** Anatomia mínima [RN-DASH-135] (D-01/D-02 §4). */
export interface AlertView {
  readonly id: string;
  /** `IND-DASH-nnn`. */
  readonly indicatorCode: string;
  readonly block: DashboardBlock;
  readonly severity: SeverityLevel;
  readonly state: AlertState;
  readonly track: AlertTrack;
  readonly legalBasis: string;
  readonly owner: string;
  /** Tempo restante calculado pelo backend (token, OD-D16-017). */
  readonly remaining: string | null;
  readonly clock: ClockCode | null;
  readonly nextMilestoneAt: string | null;
  readonly app: OriginApp;
  readonly originRef: string | null;
  readonly object: AlertObjectView | null;
  readonly classification: Classification | null;
  readonly freshness: FreshnessMeta | null;
  readonly version: number | null;
}

export interface AlertTransitionView {
  readonly state: AlertState;
  readonly at: string;
  readonly recipient: string | null;
  readonly manual: boolean;
}

export interface AlertLifecycleView {
  readonly current: AlertState;
  readonly track: AlertTrack;
  readonly transitions: readonly AlertTransitionView[];
}

/** D-08 §4: linha da tabela-mestra de deveres. */
export interface DutyView {
  readonly id: string;
  /** Um dos 9 indicadores do bloco B, ou `null` nas linhas sem IND. */
  readonly indicatorCode: string | null;
  /** Rótulo do backend nas linhas sem IND (`source_pending`). */
  readonly label: string | null;
  readonly cycleState: DutyState;
  readonly period: string;
  /** `null` = "sem prazo definido" (invariante 9). */
  readonly deadlineAt: string | null;
  /** IND-DASH-202. */
  readonly sanctioned: boolean;
  /** Próprio × derivado. */
  readonly own: boolean;
  readonly classification: Classification | null;
  readonly freshness: FreshnessMeta | null;
}

/** OD-D16-011: protocolo, captura **ou** hash. */
export interface DutyEvidence {
  readonly protocol?: string;
  readonly captureUri?: string;
  readonly hash?: string;
}

export interface DutyCycleTransitionView {
  readonly state: DutyState;
  readonly at: string;
  readonly evidence: DutyEvidence | null;
}

export interface DutyCycleView {
  readonly dutyId: string;
  readonly period: string;
  readonly state: DutyState;
  readonly deadlineAt: string | null;
  readonly transitions: readonly DutyCycleTransitionView[];
  readonly lateHistory: readonly {
    readonly period: string;
    readonly state: DutyState;
  }[];
  readonly version: number | null;
}

/** = `forms/finalidade-n2` (igualdade de tipo provada em `forms/schemas-matrix.spec.ts`). */
export interface PurposeDeclaration {
  readonly purpose: PurposeToken;
  readonly reference: string;
}

/** = `forms/exportar`. */
export interface ExportRequest {
  readonly scope: string;
  readonly filters: Readonly<Record<string, string>>;
  readonly format: string;
  readonly purpose?: PurposeToken;
  readonly rows: number;
  readonly volumeJustification?: string;
}

export interface DistributionBar {
  readonly key: string;
  readonly label: string;
  readonly value: number | null;
  readonly suppressed: boolean;
  readonly threshold: number | null;
  readonly freshness: FreshnessMeta | null;
}

export interface DistributionSeries {
  readonly dimension: Dimension;
  readonly bars: readonly DistributionBar[];
  /** Escala única por gráfico (§Decisões 2): um eixo, um domínio, rótulo por chave existente. */
  readonly scale: { readonly max: number; readonly labelKey: string };
}

export interface SourceStatusView {
  readonly source: string;
  readonly freshness: FreshnessMeta;
  readonly acceptableLatency: string | null;
  readonly lastHeartbeatAt: string | null;
}

export interface IndicatorView {
  readonly code: string;
  readonly block: DashboardBlock;
  readonly classification: Classification | null;
  readonly owner: string | null;
  readonly threshold: string | null;
  readonly acceptableLatency: string | null;
  readonly connected: boolean;
  readonly freshness: FreshnessMeta | null;
}

/** Bloco C. */
export interface OperationalTargetView {
  readonly value: number | null;
  readonly target: number;
  readonly freshness: FreshnessMeta | null;
}

/** Bloco A. */
export interface LegalCeilingView {
  readonly value: number | null;
  readonly ceiling: number;
  readonly legalBasis: string;
  readonly freshness: FreshnessMeta | null;
}

export interface ExportRecordView {
  readonly id: string;
  readonly who: string;
  readonly at: string;
  readonly filters: Readonly<Record<string, string>>;
  readonly rows: number;
  readonly format: string;
  readonly purpose: PurposeToken | null;
  readonly pendingApproval: boolean;
}

export interface ReportView {
  readonly id: string;
  readonly reportType: string;
  readonly status: 'processing' | 'completed' | 'failed';
  readonly requestedAt: string;
  readonly fileUri: string | null;
}

export interface ChecklistItemView {
  readonly id: string;
  readonly label: string;
  readonly checked: boolean;
  /** `'DT-066'` nos itens 14.129; `null` quando o item está ativo. */
  readonly blockedByDecision: string | null;
}

/** [APP-DASHBOARD] §KPIs (rótulos por `data-kpi`: OD-D16-012). */
export interface KpiView {
  readonly key:
    'coverage' | 'mtta' | 'mttr' | 'duties_on_time' | 'avg_freshness';
  readonly value: number | null;
  readonly freshness: FreshnessMeta | null;
}
