// Tipos públicos do motor de prazos — assinaturas de
// docs/framework/arch/rait-deadline-engine.md §6, com `tx: Transaction`
// substituído pela porta `TimerStore` (work/rounds/R-0006/contracts/CTG-0001.md
// §5). Vocabulários (`TimerCode`, `TimerStatus`, `ExpiryKind`, `owner`,
// `durationUnit`) são espelho de `inf.infraction_timer_ref`
// (backend/database/ddl/14-inf-lifecycle-vocabulary.sql).

/** Data civil `YYYY-MM-DD`, sem hora (rait-deadline-engine.md §6). */
export type LocalDate = string;

/** Os 18 códigos de `inf.infraction_timer_ref`. */
export type TimerCode =
  | 'T-NA'
  | 'T-SNE-CIENCIA'
  | 'T-DEF'
  | 'T-IND'
  | 'T-NA-IND'
  | 'T-DEC'
  | 'T-NP-VENC'
  | 'T-REM10'
  | 'T-JUL-24M'
  | 'T-DIL'
  | 'T-R2'
  | 'T-PAR-3A'
  | 'T-PRESC-5A'
  | 'T-VOTO'
  | 'T-CONV'
  | 'T-ASS'
  | 'T-CLAIM'
  | 'SLA-30';

export type TimerOwnerKind = 'case' | 'infraction' | 'session';

/** `infraction_timer.status` (M12, derivado de rait-deadline-engine.md §3). */
export type TimerStatus = 'armado' | 'satisfeito' | 'cancelado' | 'vencido';

/** `inf.infraction_timer_ref.expiry_kind`. */
export type ExpiryKind =
  'transicao' | 'alerta' | 'marco' | 'regra' | 'guarda' | 'indicador';

/** Efeito observável de um vencimento (`guarda`/`indicador` nunca vencem). */
export type ExpiryEffect = 'transicao' | 'alerta' | 'marco' | 'regra';

export type TimerDurationUnit =
  'dias_corridos' | 'dias_uteis' | 'meses' | 'anos' | 'data_impressa' | 'meta';

export interface Clock {
  today(tenantTz: string): LocalDate;
  now(): Date;
}

export interface Calendar {
  isBusinessDay(d: LocalDate, tenantId: string): Promise<boolean>;
  nextBusinessDay(d: LocalDate, tenantId: string): Promise<LocalDate>;
}

export interface TimerDefinition {
  code: TimerCode;
  owner: 'infracao' | 'caso' | 'sessao' | 'indicador';
  durationValue: number | null;
  durationUnit: TimerDurationUnit;
  startMark: string;
  armedIn: string;
  expiryKind: ExpiryKind;
  /** Código de `inf.infraction_state_ref`. */
  expiryTarget: string | null;
  alertLadder: string | null;
  status: 'vigente' | 'a_confirmar' | 'proposta';
  legalBasis: string;
}

export interface TimerCatalog {
  get(code: TimerCode): TimerDefinition;
}

export interface Deadline {
  id: string;
  tenantId: string;
  ownerKind: TimerOwnerKind;
  ownerId: string;
  code: TimerCode;
  instance: 'jari' | 'cetran' | null;
  startBasis: string;
  startedOn: LocalDate;
  rawDueOn: LocalDate;
  dueOn: LocalDate;
  ceilingOn: LocalDate | null;
  businessDays: boolean;
  status: TimerStatus;
  satisfiedAt: Date | null;
  expiredAt: Date | null;
  cancelReason: string | null;
  suspendedByActId: string | null;
  suspendedDays: number;
  extensionCount: number;
  /**
   * Motivo do chamador em `extend` (CTG-0001 §5.2.9, emenda M15): nulo até a
   * primeira prorrogação, preenchido sem transformação. Nunca entra no
   * envelope do evento (`data.reason` continua o token `'prorrogacao'`).
   */
  extensionReason: string | null;
  legalBasis: string;
}

export interface SuspensionAct {
  id: string;
  days: number;
  evidenceRef: string;
  signedAt: Date;
}

export interface SweepReport {
  tenantId: string;
  scanned: number;
  expired: ReadonlyArray<{
    id: string;
    code: TimerCode;
    ownerKind: TimerOwnerKind;
    ownerId: string;
    dueOn: LocalDate;
    effect: ExpiryEffect;
  }>;
  skipped: number;
}

export interface TimerStore {
  insert(deadline: Deadline): Promise<Deadline>;
  findById(id: string): Promise<Deadline | null>;
  findOpen(
    tenantId: string,
    ownerId: string,
    code: TimerCode,
  ): Promise<Deadline | null>;
  findByArm(
    tenantId: string,
    ownerId: string,
    code: TimerCode,
    startedOn: LocalDate,
  ): Promise<Deadline | null>;
  listDue(
    tenantId: string,
    onOrBefore: LocalDate,
    limit: number,
  ): Promise<Deadline[]>;
  update(deadline: Deadline): Promise<Deadline>;
}

export interface ArmInput {
  ownerKind: TimerOwnerKind;
  ownerId: string;
  code: TimerCode;
  startOn: LocalDate;
  startBasis: string;
  legalBasis: string;
  tenantId: string;
  instance?: 'jari' | 'cetran';
  printedDeadline?: LocalDate;
}

export interface TimelinessInput {
  code: TimerCode;
  ownerId: string;
  tenantId: string;
  pieceMarkOn: LocalDate;
}

export interface TimelinessResult {
  timely: boolean;
  dueOn: LocalDate;
  basis: string;
}

export interface DeadlineEngine {
  arm(input: ArmInput): Promise<Deadline>;
  satisfy(id: string, reason: string): Promise<void>;
  cancel(id: string, reason: string): Promise<void>;
  reschedule(id: string, act: SuspensionAct): Promise<Deadline>;
  /**
   * Prorrogação única de `T-DIL` (CTG-0001 §5.2, emenda janela 2): `reason` é
   * o motivo do chamador para auditoria, como em `satisfy`/`cancel` — nunca o
   * token do evento publicado (que é sempre `'prorrogacao'`).
   */
  extend(id: string, reason: string): Promise<Deadline>;
  computeDue(
    code: TimerCode,
    startOn: LocalDate,
    tenantId: string,
    printedDeadline?: LocalDate,
  ): Promise<{ rawDueOn: LocalDate; dueOn: LocalDate }>;
  sweep(tenantId: string, limit?: number): Promise<SweepReport>;
  timeliness(input: TimelinessInput): Promise<TimelinessResult>;
}

/**
 * `data` de `inf.timer.rescheduled` (CTG-0001 §5.2, emenda janela 2):
 * `suspensionActId` é obrigatório e anulável (o ato existe na suspensão, é
 * nulo na prorrogação); `reason` distingue as duas origens.
 */
// `extends Record<string, unknown>` dá às duas interfaces uma assinatura de
// índice: é o que permite ao Inspector conferir `data` contra o esquema JSON
// com `as Record<string, unknown>` (deadline-engine.spec.ts), sem afrouxar os
// campos declarados (todos são subtipos de `unknown`).
export interface TimerRescheduledData extends Record<string, unknown> {
  ownerId: string;
  timerCode: TimerCode;
  oldDueOn: LocalDate;
  newDueOn: LocalDate;
  suspensionActId: string | null;
  reason: 'suspensao' | 'prorrogacao';
}

/** `data` de `inf.timer.expired` — um por timer que a varredura vence. */
export interface TimerExpiredData extends Record<string, unknown> {
  ownerKind: TimerOwnerKind;
  ownerId: string;
  timerCode: TimerCode;
  dueOn: LocalDate;
  effect: ExpiryEffect;
}

/**
 * Envelope reduzido ao que a biblioteca conhece (CTG-0001 §5.2 nota 1): os
 * campos que só quem grava na `integration.outbox` sabe preencher (`id`,
 * `version`, `actor`, `correlationId`, `causationId`, `aggregate.version`)
 * ficam fora. `aggregate.kind` é `'clock'` — o agregado do evento é o
 * relógio, não a infração/caso (nota 2 do §5.2).
 */
export type DeadlineEvent =
  | {
      type: 'inf.timer.rescheduled';
      domainEvent: 'TIMER_REPROGRAMADO';
      occurredAt: string;
      tenantId: string;
      aggregate: { kind: 'clock'; id: string };
      data: TimerRescheduledData;
    }
  | {
      type: 'inf.timer.expired';
      domainEvent: 'TIMER_VENCIDO';
      occurredAt: string;
      tenantId: string;
      aggregate: { kind: 'clock'; id: string };
      data: TimerExpiredData;
    };

/** Porta de eventos do motor (CTG-0001 §5.2): obrigatória em `DeadlineEngineDeps`. */
export interface DeadlineEvents {
  publish(event: DeadlineEvent): Promise<void>;
}

/**
 * Forma de `docs/framework/arch/fixtures/calendar-2026.json`: feriados são as
 * chaves de `national`, `am` e `manaus`; `optional` (ponto facultativo) não é
 * feriado (CTG-0001 §5 nota 3, `deadline.optional_day_policy =
 * business_day_for_citizen`).
 */
export interface CalendarJson {
  year: number;
  note?: string;
  national?: Record<string, string>;
  optional?: Record<string, string>;
  am?: Record<string, string>;
  manaus?: Record<string, string>;
}
