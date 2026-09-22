// Tokens do ciclo de `@detran/dashboard-monitor` (CTG-0002 §13.1, §14.1;
// plan R-0011 M15/M16). Tokens de injeção (relógio, calendário, discovery,
// intervalo do sweeper, dependências do sweeper), os 14 códigos de
// `dashboard.timer_ref` (DDL 19; CTG-0001 §3.10) com a unidade/duração
// transcritas do vocabulário (o `computeDue` de §13.1 é puro — sem `tx` — e
// por isso lê a transcrição, não a tabela), os conjuntos de estado dos
// catálogos (DDL 19 `*_state_ref`, `severity_ref`, `block_ref`) e os leitores
// de parâmetro `dashboard.*` com a regra numérica de §1.3.7 (OD-D31). Chaves
// de parâmetro são montadas por concatenação (`dashboardParameterKey`), nunca
// literal (regra 1 do prompt; `verify:parameter-catalogue`).
import { DetranError } from '@detran/shared';
import type { OpsParameterService } from '@detran/ops-parameter';

// ---------------------------------------------------------------------------
// transação (forma de `DashboardSqlTransaction`, CTG-0001 §4.3, sem o
// genérico no método: aceita qualquer `{ query(statement, values?) }` —
// `Database.tx` do STYNX, a tx do harness e um espião de SQL do Inspector)
// ---------------------------------------------------------------------------

export interface CycleSqlTransaction {
  query(
    statement: string,
    values?: readonly unknown[],
  ): Promise<{ rows: Record<string, unknown>[]; rowCount?: number | null }>;
}

/** `tx.query` tipado pelo chamador (a forma da linha é declarada por quem
 *  escreve o SQL — nunca validada em runtime, como nos projetores). */
export async function query<T extends Record<string, unknown>>(
  tx: CycleSqlTransaction,
  statement: string,
  values: readonly unknown[] = [],
): Promise<{ rows: T[]; rowCount?: number | null }> {
  const result = await tx.query(statement, values);
  return result as { rows: T[]; rowCount?: number | null };
}

// ---------------------------------------------------------------------------
// tokens de injeção (§13.1, §13.3)
// ---------------------------------------------------------------------------

/** `Clock` de `@detran/inf-deadlines` (produção: relógio do sistema; testes: `FixedClock`). */
export const DASHBOARD_CLOCK = 'DASHBOARD_CLOCK';
/** `Calendar` de `@detran/inf-deadlines` (`InMemoryCalendar(calendar-2026.json)` até OD-D28). */
export const DASHBOARD_CALENDAR = 'DASHBOARD_CALENDAR';
/** `DashboardSweepDiscovery` (auth.tenants ativos + ator técnico — wiring TASK-0013). */
export const DASHBOARD_SWEEP_DISCOVERY = 'DASHBOARD_SWEEP_DISCOVERY';
/** Intervalo do tick do sweeper em ms (default `DASHBOARD_SWEEP_DEFAULT_INTERVAL_MS`). */
export const DASHBOARD_SWEEP_INTERVAL_MS = 'DASHBOARD_SWEEP_INTERVAL_MS';
/** Objeto `deps` do `DashboardClockSweeper` (§13.3; forma fixada pelo harness
 *  do Inspector, A21) — provido pelo `AppModule` (TASK-0013). */
export const DASHBOARD_SWEEPER_DEPENDENCIES = 'DASHBOARD_SWEEPER_DEPENDENCIES';
export const DASHBOARD_SWEEP_DEFAULT_INTERVAL_MS = 60_000;

// ---------------------------------------------------------------------------
// timers (dashboard.timer_ref — DDL 19; CTG-0001 §3.10; CTG-0002 §13.2)
// ---------------------------------------------------------------------------

export const DASHBOARD_TIMER_CODES = [
  'T-DASH-ACK-N1',
  'T-DASH-ACK-N2',
  'T-DASH-ACK-N3',
  'T-DASH-ACK-CRITICO',
  'T-DASH-MARCO-50',
  'T-DASH-MARCO-75',
  'T-DASH-MARCO-90',
  'T-DASH-DUTY-201',
  'T-DASH-DUTY-202',
  'T-DASH-DUTY-PNATRANS',
  'T-DASH-DUTY-206',
  'T-DASH-DUTY-207',
  'T-DASH-DUTY-209',
  'T-DASH-PENDING-FLOOR',
] as const;
export type DashboardTimerCode = (typeof DASHBOARD_TIMER_CODES)[number];

/** `dashboard.timer_ref.duration_unit` (M7/A7 — sete tokens). */
export type DashboardTimerUnit =
  | 'horas_uteis'
  | 'dias_corridos'
  | 'percentual'
  | 'imediato'
  | 'data_fixa'
  | 'mensal'
  | 'anual';

export interface DashboardTimerDefinition {
  unit: DashboardTimerUnit;
  /** `duration_value` (nulo para `imediato`/`data_fixa`/`mensal`/`anual`). */
  value: number | null;
}

/** Transcrição de `dashboard.timer_ref` (DDL 19 — `duration_value`,
 *  `duration_unit`), fonte DT-030 / WF-DASH-001 / RN-DASH-120. */
export const DASHBOARD_TIMER_DEFINITIONS: Readonly<
  Record<DashboardTimerCode, DashboardTimerDefinition>
> = {
  'T-DASH-ACK-N1': { unit: 'horas_uteis', value: 24 },
  'T-DASH-ACK-N2': { unit: 'horas_uteis', value: 8 },
  'T-DASH-ACK-N3': { unit: 'horas_uteis', value: 2 },
  'T-DASH-ACK-CRITICO': { unit: 'imediato', value: null },
  'T-DASH-MARCO-50': { unit: 'percentual', value: 50 },
  'T-DASH-MARCO-75': { unit: 'percentual', value: 75 },
  'T-DASH-MARCO-90': { unit: 'percentual', value: 90 },
  'T-DASH-DUTY-201': { unit: 'data_fixa', value: null },
  'T-DASH-DUTY-202': { unit: 'mensal', value: null },
  'T-DASH-DUTY-PNATRANS': { unit: 'data_fixa', value: null },
  'T-DASH-DUTY-206': { unit: 'anual', value: null },
  'T-DASH-DUTY-207': { unit: 'anual', value: null },
  'T-DASH-DUTY-209': { unit: 'mensal', value: null },
  'T-DASH-PENDING-FLOOR': { unit: 'dias_corridos', value: 60 },
};

export type DashboardTimerOwnerKind = 'alert' | 'duty_cycle' | 'source';
export type DashboardTimerStatus =
  'ARMADO' | 'VENCIDO' | 'SATISFEITO' | 'CANCELADO';

/** SLA de ACK por severidade (§6.8; `timer_ref.applies_to`). */
export const ACK_TIMER_BY_SEVERITY: Readonly<
  Record<AlertSeverity, DashboardTimerCode>
> = {
  N1: 'T-DASH-ACK-N1',
  N2: 'T-DASH-ACK-N2',
  N3: 'T-DASH-ACK-N3',
  CRITICO: 'T-DASH-ACK-CRITICO',
};

/** Marcos percentuais → severidade (§6.3; `timer_ref.applies_to`). */
export const MILESTONE_TIMERS: readonly {
  code: DashboardTimerCode;
  pct: number;
  severity: AlertSeverity;
}[] = [
  { code: 'T-DASH-MARCO-50', pct: 50, severity: 'N1' },
  { code: 'T-DASH-MARCO-75', pct: 75, severity: 'N2' },
  { code: 'T-DASH-MARCO-90', pct: 90, severity: 'N3' },
];

// ---------------------------------------------------------------------------
// estados e tokens de catálogo (DDL 19)
// ---------------------------------------------------------------------------

export const ALERT_STATES = [
  'DETECTADO',
  'CLASSIFICADO',
  'NOTIFICADO',
  'RECONHECIDO',
  'EM_TRATAMENTO',
  'VERIFICADO',
  'ENCERRADO',
  'ESCALONADO',
  'CRITICO_EXTINCAO',
  'INCIDENTE_REGISTRADO',
] as const;
export type AlertState = (typeof ALERT_STATES)[number];

export const ALERT_TRACKS = ['extinction', 'irregularity'] as const;
export type AlertTrack = (typeof ALERT_TRACKS)[number];

export const ALERT_SEVERITIES = ['N1', 'N2', 'N3', 'CRITICO'] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

/** Nível da célula (§6.2): severidade + `SEM_RISCO` + `TETO`. */
export type DetectionLevel = 'SEM_RISCO' | AlertSeverity | 'TETO';

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

export const FRESHNESS_STATES = [
  'FRESCO',
  'ATRASADO',
  'INDISPONIVEL',
  'DESATUALIZADO_MARCADO',
] as const;
export type FreshnessState = (typeof FRESHNESS_STATES)[number];

export const DASHBOARD_BLOCKS = ['A', 'B', 'C', 'D'] as const;
export type DashboardBlock = (typeof DASHBOARD_BLOCKS)[number];

export type DashboardLayer = 'N0' | 'N1' | 'N2';

/** `alert_trail.root_cause_category` (DDL 80; catálogo `DASH.ROOT_CAUSE_CATEGORY_INVALID`). */
export const ROOT_CAUSE_CATEGORIES = [
  'transport',
  'acceptance',
  'payload',
] as const;
export type RootCauseCategory = (typeof ROOT_CAUSE_CATEGORIES)[number];

/** `duty.deadline_kind` (DDL 80). */
export type DutyDeadlineKind =
  | 'fixed_day'
  | 'monthly'
  | 'annual_date'
  | 'continuous'
  | 'per_event'
  | 'undefined'
  | 'historical';

/** Papéis canônicos citados pelo ciclo (`roles.ts` `DETRAN_ROLES`;
 *  `05-role-catalog.sql`): operador de monitoramento (§6.1), administrador
 *  do órgão (§7.4) e auditoria (H.54, §6.4 item 4). */
export const DASH_OPERATOR_ROLE = 'dash-operator';
export const AGENCY_ADMIN_ROLE = 'agency-admin';
export const AUDITOR_ROLE = 'AUDITOR';

/** `escalation_chain_ref.status` + o marcador H.54 do notificador (§12.1). */
export type ChainStatus = 'vigente' | 'source_pending' | 'h54';

// ---------------------------------------------------------------------------
// parâmetros dashboard.* (§1.3.7, OD-D31)
// ---------------------------------------------------------------------------

/** Chave de parâmetro por concatenação (padrão `portal-stream.service.ts`;
 *  nunca literal `dashboard.<x>` em código). */
export function dashboardParameterKey(...parts: readonly string[]): string {
  return ['dashboard', ...parts].join('.');
}

const LEADING_DECIMAL = /^\s*(\d+(?:[.,]\d+)?)/;

/** Regra de leitura numérica de §1.3.7: número → ele mesmo; string → o
 *  número decimal inicial; senão `DASH.VALIDATION_FAILED` com
 *  `context.parameterKey`. */
export function numericParameterValue(key: string, value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const match = LEADING_DECIMAL.exec(value);
    if (match?.[1]) return Number(match[1].replace(',', '.'));
  }
  throw new DetranError('DASH.VALIDATION_FAILED', {
    status: 400,
    context: { parameterKey: key },
  });
}

/** Booleano de `value_json` (`true`/`false` ou a string equivalente). */
export function booleanParameterValue(key: string, value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  throw new DetranError('DASH.VALIDATION_FAILED', {
    status: 400,
    context: { parameterKey: key },
  });
}

/** Leitura tipada de um parâmetro pelo `OpsParameterService.get(key)`
 *  (`value_json`). */
export async function readNumericParameter(
  parameters: OpsParameterService,
  key: string,
): Promise<number> {
  const parameter = await parameters.get(key);
  return numericParameterValue(key, parameter.value_json);
}

export async function readBooleanParameter(
  parameters: OpsParameterService,
  key: string,
): Promise<boolean> {
  const parameter = await parameters.get(key);
  return booleanParameterValue(key, parameter.value_json);
}
