// Ciclo do alerta (CTG-0002 §6; plan M18; [WF-DASH-001]). Detector (§6.2),
// classificador determinístico (§6.3), comandos de usuário `ack`/`treat`/
// `close`/`root-cause` (§3.1, guardas por `alert_transition_ref`, §6.1),
// verificação por evidência de origem (§6.5, 80 [+101]), incidente (§6.7,
// espelho de [WF-RAIT-002] §4.1), vencimento de timers (§13.3 passo 1: SLA
// de ACK 60 → 65, marcos 90 → 65), leituras `getView` (§6.6) e `getIncident`
// (§6.7). Tudo dentro do `tx` do chamador; efeito + trilha + timers + evento
// na mesma transação; `tenant_id = $1` em todo SQL (A15). Nenhum
// relógio de sistema: `ctx.now` é o instante de tudo. Nenhuma escrita fora de
// `dashboard.*` e `integration.outbox` ([RN-DASH-101]).
import { Inject, Injectable } from '@nestjs/common';
import { DetranError } from '@detran/shared';
import { OpsParameterService } from '@detran/ops-parameter';
import type { LocalDate } from '@detran/inf-deadlines';

import type { DashboardMonitorProjectionName } from '../projection-contract.js';
import { DashboardClockService, type DashboardTimer } from './clock.service.js';
import {
  AckAlertSchema,
  CloseAlertSchema,
  RootCauseSchema,
  TreatAlertSchema,
  parseDto,
  type AckAlertDto,
  type CloseAlertDto,
  type RootCauseDto,
  type TreatAlertDto,
} from './dto.js';
import {
  DASHBOARD_EVENT_TYPES,
  envelopeOf,
  publish,
  type DashboardEventDataValue,
} from './events.js';
import { assertDashIfMatch } from './if-match.js';
import {
  DashboardFreshnessService,
  type FreshnessMeta,
} from './freshness.service.js';
import {
  ALERT_COLUMNS,
  DashboardNotifier,
  alertEventData,
  appendAlertTrail,
  localDateOf,
  parseNotifiedNote,
  type AlertRow,
  type NotifierContext,
} from './notifier.js';
import {
  DASH_OPERATOR_ROLE,
  MILESTONE_TIMERS,
  ROOT_CAUSE_CATEGORIES,
  type AlertSeverity,
  type AlertState,
  type AlertTrack,
  type ChainStatus,
  type DashboardBlock,
  type DashboardLayer,
  type DashboardTimerCode,
  type DetectionLevel,
  query,
  type CycleSqlTransaction,
} from './tokens.js';
import {
  assertAlertState,
  isTerminalAlertState,
  loadAlertTransitions,
  type AlertTransitionRow,
} from './transitions.js';

// ---------------------------------------------------------------------------
// contratos públicos (§14.1)
// ---------------------------------------------------------------------------

export interface DetectionCell {
  projection:
    | DashboardMonitorProjectionName
    | 'dashboard.crashes'
    | 'dashboard.duty_cycle'
    | 'dashboard.transparency_audit';
  indicatorCode: string;
  sourceApp: string;
  objectKind: string;
  objectRef: string;
  objectLayer: DashboardLayer;
  /** Derivado da célula pelo chamador, nunca calculado aqui (§6.2). */
  level: DetectionLevel;
  governingClock?: 'A' | 'B' | 'C' | 'D';
  ceilingOn?: LocalDate;
  nextMilestoneAt?: Date;
  ownerRole?: string;
  ownerRef?: string;
  /** Janela do dever (bloco B): base dos marcos `T-DASH-MARCO-*` (§7.2 (3)). */
  windowStart?: Date;
  windowEnd?: Date;
  /** Envelope de origem (runner); ausente = fallback (§8.5, `note='fallback'`). */
  eventId?: string;
  occurredAt: Date;
}

export interface CycleContext {
  tenantId: string;
  tz: string;
  actor: {
    kind: 'user' | 'system' | 'timer';
    id?: string;
    role?: string;
    roles: readonly string[];
  };
  now: Date;
  requestId?: string;
}

export type DetectResult =
  | { kind: 'detected'; alertId: string }
  | { kind: 'reclassified'; alertId: string }
  | { kind: 'verified'; alertId: string }
  | {
      kind: 'ignored';
      reason:
        'stale_source' | 'disconnected' | 'open_alert' | 'no_ladder' | 'normal';
    };

export interface AlertTrailView {
  seq: number;
  fromState: AlertState | null;
  toState: AlertState;
  actorKind: 'user' | 'system' | 'timer';
  actorRef: string | null;
  occurredAt: string;
  note: string | null;
  rootCauseCategory: string | null;
  eventId: string | null;
}

export interface AlertTimerView {
  code: DashboardTimerCode;
  status: string;
  startedAt: string;
  dueAt: string | null;
  firedAt: string | null;
}

/** §6.6 — anatomia mínima. */
export interface AlertView extends Record<string, unknown> {
  id: string;
  indicatorCode: string;
  track: AlertTrack;
  state: AlertState;
  severity: AlertSeverity;
  block: DashboardBlock;
  sourceApp: string;
  object: { kind: string; ref: string | null; layer: DashboardLayer };
  ownerRole: string;
  ownerRef: string | null;
  governingClock: string | null;
  nextMilestoneAt: string | null;
  ceilingOn: string | null;
  escalationLevel: number;
  ackChannel: 'origin' | 'manual' | null;
  incidentRef: string | null;
  timestamps: {
    detectedAt: string | null;
    classifiedAt: string | null;
    notifiedAt: string | null;
    acknowledgedAt: string | null;
    treatingAt: string | null;
    verifiedAt: string | null;
    closedAt: string | null;
    escalatedAt: string | null;
    criticalAt: string | null;
    incidentAt: string | null;
  };
  trail: AlertTrailView[];
  timers: AlertTimerView[];
  version: number;
  meta: { freshness: FreshnessMeta };
}

/** §6.7 — `GET alerts/{id}/incident`. */
export interface IncidentView extends Record<string, unknown> {
  alertId: string;
  incidentRef: string | null;
  registeredAt: string | null;
  indicatorCode: string;
  governingClock: string | null;
  ceilingOn: string | null;
  ceilingReachedOn: string | null;
  object: { kind: string; ref: string | null; layer: DashboardLayer };
  sourceEventId: string | null;
  notified: {
    level: number | null;
    role: string;
    at: string;
    chainStatus: ChainStatus;
  }[];
  rootCauses: {
    category: string;
    note: string | null;
    actorRef: string | null;
    at: string;
  }[];
  trail: AlertTrailView[];
  meta: { freshness: FreshnessMeta };
}

// ---------------------------------------------------------------------------
// internos
// ---------------------------------------------------------------------------

interface IndicatorRow extends Record<string, unknown> {
  code: string;
  block: DashboardBlock;
  kind: string;
  source_app: string;
  projection: string | null;
  connected: boolean;
  clock_code: string | null;
}

interface TrailRow extends Record<string, unknown> {
  id: string;
  seq: number;
  from_state: AlertState | null;
  to_state: AlertState;
  actor_kind: 'user' | 'system' | 'timer';
  actor_ref: string | null;
  occurred_at: Date;
  note: string | null;
  root_cause_category: string | null;
  event_id: string | null;
}

interface ThresholdConfigRow extends Record<string, unknown> {
  threshold_json: unknown;
}

export interface ThresholdLevels {
  n1?: number;
  n2?: number;
  n3?: number;
  critical?: number;
}

export interface ThresholdJson {
  kind: 'target' | 'ceiling';
  metric: string;
  direction: 'above' | 'below';
  levels: ThresholdLevels;
}

const SEVERITY_RANK: Readonly<Record<DetectionLevel, number>> = {
  SEM_RISCO: 0,
  N1: 1,
  N2: 2,
  N3: 3,
  CRITICO: 4,
  TETO: 5,
};

const severityOf = (level: DetectionLevel): AlertSeverity =>
  level === 'TETO' ? 'CRITICO' : level === 'SEM_RISCO' ? 'N1' : level;

const rankOf = (severity: AlertSeverity): number => SEVERITY_RANK[severity];

/** `[WF-DASH-001]` §Classificação: N1 → nível 1 … CRÍTICO → nível 4 (§6.3). */
const chainLevelOf = (severity: AlertSeverity): number => rankOf(severity);

const isoOf = (value: Date | string | null | undefined): string | null =>
  value === null || value === undefined ? null : new Date(value).toISOString();

/** `prescription_risk.flag` → nível (§6.2, bloco A). */
export const PRESCRIPTION_FLAG_LEVELS: Readonly<
  Record<string, DetectionLevel>
> = {
  SEM_RISCO: 'SEM_RISCO',
  ALERTA_N1: 'N1',
  ALERTA_N2: 'N2',
  ALERTA_N3: 'N3',
  CRITICO: 'CRITICO',
  PRESCRITO_OPERACIONAL: 'TETO',
};

/** `extinct_state` que equivale ao teto ([WF-RAIT-002] §4/§6). */
const EXTINCT_STATES = ['EXTINTO_DECADENCIA', 'EXTINTO_PRESCRICAO'];

export function prescriptionLevelOf(cell: {
  flag: string | null;
  ceiling_reached_on: Date | string | null;
  extinct_state: string | null;
}): DetectionLevel {
  if (
    cell.ceiling_reached_on !== null &&
    cell.ceiling_reached_on !== undefined
  ) {
    return 'TETO';
  }
  if (cell.extinct_state && EXTINCT_STATES.includes(cell.extinct_state)) {
    return 'TETO';
  }
  if (!cell.flag) return 'SEM_RISCO';
  return PRESCRIPTION_FLAG_LEVELS[cell.flag] ?? 'SEM_RISCO';
}

/** Maior `levels.*` cruzado na `direction` (§6.3). */
export function ladderLevelOf(
  threshold: ThresholdJson,
  value: number,
): DetectionLevel {
  const crossed = (limit: number | undefined): boolean =>
    limit !== undefined &&
    (threshold.direction === 'above' ? value >= limit : value <= limit);
  if (crossed(threshold.levels.critical)) return 'CRITICO';
  if (crossed(threshold.levels.n3)) return 'N3';
  if (crossed(threshold.levels.n2)) return 'N2';
  if (crossed(threshold.levels.n1)) return 'N1';
  return 'SEM_RISCO';
}

export function parseThreshold(value: unknown): ThresholdJson | null {
  const raw = typeof value === 'string' ? safeJson(value) : value;
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const levels = record.levels;
  if (!levels || typeof levels !== 'object') return null;
  const parsedLevels: ThresholdLevels = {};
  for (const key of ['n1', 'n2', 'n3', 'critical'] as const) {
    const candidate = (levels as Record<string, unknown>)[key];
    if (typeof candidate === 'number') parsedLevels[key] = candidate;
  }
  if (Object.keys(parsedLevels).length === 0) return null;
  return {
    kind: record.kind === 'ceiling' ? 'ceiling' : 'target',
    metric: typeof record.metric === 'string' ? record.metric : '',
    direction: record.direction === 'below' ? 'below' : 'above',
    levels: parsedLevels,
  };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

type AlertActorKind = 'owner' | 'dash-operator' | 'none';

@Injectable()
export class DashboardAlertService {
  constructor(
    private readonly clock: DashboardClockService,
    private readonly notifier: DashboardNotifier,
    private readonly freshness: DashboardFreshnessService,
    @Inject(OpsParameterService)
    private readonly parameters: OpsParameterService,
  ) {}

  // -------------------------------------------------------------------------
  // detector (§6.2) → classificador (§6.3) → notificador (§6.4) | 40 → 110
  // -------------------------------------------------------------------------

  async detect(
    tx: CycleSqlTransaction,
    cell: DetectionCell,
    ctx: CycleContext,
  ): Promise<DetectResult> {
    const indicator = await this.indicator(
      tx,
      ctx.tenantId,
      cell.indicatorCode,
    );
    if (!indicator) return { kind: 'ignored', reason: 'disconnected' };
    // (1) fonte velha / desconectado — nunca DETECTADO (§8.4)
    const source = await this.freshness.stateOf(
      tx,
      ctx.tenantId,
      cell.indicatorCode,
      cell.projection,
    );
    if (source && DashboardFreshnessService.isStale(source.state)) {
      return { kind: 'ignored', reason: 'stale_source' };
    }
    if (!indicator.connected)
      return { kind: 'ignored', reason: 'disconnected' };

    // (2) dedupe por chave (tenant, indicator_code, object_kind, object_ref)
    // — serializado entre instâncias do sweeper/runner: sem a trava, duas
    // transações leem "sem alerta aberto" e ambas inserem.
    await query(
      tx,
      `select pg_advisory_xact_lock(hashtextextended(
         'dashboard.alert:' || $1 || ':' || $2 || ':' || $3 || ':' || $4, 0))`,
      [ctx.tenantId, cell.indicatorCode, cell.objectKind, cell.objectRef],
    );
    const transitions = await loadAlertTransitions(tx);
    const latest = await this.latestAlertForKey(tx, ctx.tenantId, cell);
    const open =
      latest && !isTerminalAlertState(transitions, latest.state)
        ? latest
        : null;
    if (open) {
      if (cell.level === 'SEM_RISCO') {
        const verified = await this.applyNormalEvidence(
          tx,
          open,
          cell.eventId ?? null,
          transitions,
          ctx,
        );
        return verified
          ? { kind: 'verified', alertId: open.id }
          : { kind: 'ignored', reason: 'normal' };
      }
      const nextSeverity = severityOf(cell.level);
      if (rankOf(nextSeverity) > rankOf(open.severity)) {
        await this.reclassify(tx, open, nextSeverity, transitions, ctx, null);
        return { kind: 'reclassified', alertId: open.id };
      }
      return { kind: 'ignored', reason: 'open_alert' };
    }
    // (3) nível normal sem alerta aberto → nada
    if (cell.level === 'SEM_RISCO')
      return { kind: 'ignored', reason: 'normal' };
    // A21 (12): incidente já registrado para a chave — o teto não se atinge
    // duas vezes; um alerta por ciclo.
    if (latest && latest.state === 'INCIDENTE_REGISTRADO') {
      return { kind: 'ignored', reason: 'open_alert' };
    }
    // Blocos C/D só com escada publicada (§6.3)
    if (indicator.block === 'C' || indicator.block === 'D') {
      const ladder = await this.publishedThreshold(
        tx,
        ctx.tenantId,
        cell.indicatorCode,
      );
      if (!ladder) return { kind: 'ignored', reason: 'no_ladder' };
    }
    // (4) alerta novo
    const alert = await this.createAlert(tx, cell, indicator, ctx);
    const fromEvent = cell.eventId ?? null;
    await this.publishAlert(
      tx,
      alert,
      null,
      'DETECTADO',
      'ALERTA_DETECTADO',
      ctx,
      fromEvent,
    );
    // 20 — classificador
    await appendAlertTrail(
      tx,
      alert,
      { fromState: 'DETECTADO', toState: 'CLASSIFICADO', actorKind: 'system' },
      ctx.now,
      { state: 'CLASSIFICADO', classified_at: ctx.now.toISOString() },
    );
    await this.publishAlert(
      tx,
      alert,
      'DETECTADO',
      'CLASSIFICADO',
      'ALERTA_CLASSIFICADO',
      ctx,
      fromEvent,
    );
    if (cell.level === 'TETO') {
      await this.criticalExtinction(tx, alert, ctx, fromEvent);
    } else {
      await this.armMilestones(tx, alert, cell, ctx);
      await this.notifier.notify(
        tx,
        alert,
        1,
        this.notifierContext(ctx),
        'ALERTA_NOTIFICADO',
      );
    }
    return { kind: 'detected', alertId: alert.id };
  }

  // -------------------------------------------------------------------------
  // comandos de usuário (§3.1, §6.1)
  // -------------------------------------------------------------------------

  async ack(
    tx: CycleSqlTransaction,
    alertId: string,
    input: AckAlertDto,
    ifMatch: string | undefined,
    ctx: CycleContext,
  ): Promise<AlertView> {
    const alert = await this.require(tx, ctx.tenantId, alertId);
    assertDashIfMatch(ifMatch, Number(alert.version));
    const transitions = await loadAlertTransitions(tx);
    assertAlertState(transitions, alert, 'RECONHECIDO');
    const actorKind = this.actorKindFor(alert, ctx);
    if (actorKind === 'none') {
      throw new DetranError('DASH.ALERT_ACK_NOT_OWNER', {
        status: 403,
        context: { alertId, ownerRole: alert.owner_role },
      });
    }
    const dto = parseDto(AckAlertSchema, input);
    if ((dto.channel === 'manual' || dto.onBehalfOf) && !dto.note) {
      throw new DetranError('DASH.ALERT_ACK_MANUAL_NOTE_REQUIRED', {
        status: 422,
        context: { alertId },
      });
    }
    if (dto.onBehalfOf && !ctx.actor.roles.includes(DASH_OPERATOR_ROLE)) {
      throw new DetranError('DASH.VALIDATION_FAILED', {
        status: 400,
        context: { alertId, field: 'onBehalfOf' },
      });
    }
    await this.assertFreshSource(tx, alert, ctx);
    const channel = dto.onBehalfOf ? 'manual' : dto.channel;
    const actorRef = dto.onBehalfOf
      ? `${ctx.actor.id ?? ''} for ${dto.onBehalfOf}`
      : (ctx.actor.id ?? null);
    const fromState = alert.state;
    await appendAlertTrail(
      tx,
      alert,
      {
        fromState,
        toState: 'RECONHECIDO',
        actorKind: 'user',
        actorRef,
        note: dto.note ?? null,
      },
      ctx.now,
      {
        state: 'RECONHECIDO',
        acknowledged_at: ctx.now.toISOString(),
        ack_channel: channel,
      },
    );
    await this.clock.satisfyAll(
      tx,
      ctx.tenantId,
      'alert',
      alert.id,
      'ack',
      ctx.now,
      'T-DASH-ACK-',
    );
    await this.publishAlert(
      tx,
      alert,
      fromState,
      'RECONHECIDO',
      'ALERTA_RECONHECIDO',
      ctx,
      null,
    );
    return (await this.getView(tx, alertId, 'N2'))!;
  }

  async treat(
    tx: CycleSqlTransaction,
    alertId: string,
    input: TreatAlertDto,
    ifMatch: string | undefined,
    ctx: CycleContext,
  ): Promise<AlertView> {
    const alert = await this.require(tx, ctx.tenantId, alertId);
    assertDashIfMatch(ifMatch, Number(alert.version));
    const transitions = await loadAlertTransitions(tx);
    assertAlertState(transitions, alert, 'EM_TRATAMENTO');
    if (this.actorKindFor(alert, ctx) !== 'owner') {
      throw new DetranError('DASH.FORBIDDEN_ACTION', {
        status: 403,
        context: {
          alertId,
          attemptedAction: 'treat',
          ownerRole: alert.owner_role,
        },
      });
    }
    const dto = parseDto(TreatAlertSchema, input);
    await this.assertFreshSource(tx, alert, ctx);
    const fromState = alert.state;
    await appendAlertTrail(
      tx,
      alert,
      {
        fromState,
        toState: 'EM_TRATAMENTO',
        actorKind: 'user',
        actorRef: ctx.actor.id ?? null,
        note: dto.originRef ?? null,
      },
      ctx.now,
      { state: 'EM_TRATAMENTO', treating_at: ctx.now.toISOString() },
    );
    await this.publishAlert(
      tx,
      alert,
      fromState,
      'EM_TRATAMENTO',
      'ALERTA_EM_TRATAMENTO',
      ctx,
      null,
    );
    await this.verifyLoaded(tx, alert, transitions, ctx);
    return (await this.getView(tx, alertId, 'N2'))!;
  }

  async close(
    tx: CycleSqlTransaction,
    alertId: string,
    input: CloseAlertDto,
    ifMatch: string | undefined,
    ctx: CycleContext,
  ): Promise<AlertView> {
    const alert = await this.require(tx, ctx.tenantId, alertId);
    assertDashIfMatch(ifMatch, Number(alert.version));
    const transitions = await loadAlertTransitions(tx);
    if (isTerminalAlertState(transitions, alert.state)) {
      throw new DetranError('DASH.ALERT_STATE_INVALID', {
        status: 409,
        context: { alertId, currentState: alert.state, allowed: [] },
      });
    }
    if (alert.track === 'extinction') {
      throw new DetranError('DASH.ALERT_EXTINCTION_NOT_CLOSABLE', {
        status: 409,
        context: { alertId, track: alert.track, currentState: alert.state },
      });
    }
    if (alert.state !== 'VERIFICADO') {
      throw new DetranError('DASH.ALERT_CLOSE_WITHOUT_VERIFICATION', {
        status: 409,
        context: { alertId, currentState: alert.state },
      });
    }
    assertAlertState(transitions, alert, 'ENCERRADO');
    if (!ctx.actor.roles.includes(DASH_OPERATOR_ROLE)) {
      throw new DetranError('DASH.FORBIDDEN_ACTION', {
        status: 403,
        context: { alertId, attemptedAction: 'close' },
      });
    }
    const dto = parseDto(CloseAlertSchema, input);
    await this.assertFreshSource(tx, alert, ctx);
    const fromState = alert.state;
    await appendAlertTrail(
      tx,
      alert,
      {
        fromState,
        toState: 'ENCERRADO',
        actorKind: 'user',
        actorRef: ctx.actor.id ?? null,
        note: dto.note ?? null,
      },
      ctx.now,
      { state: 'ENCERRADO', closed_at: ctx.now.toISOString() },
    );
    await this.clock.cancelAll(
      tx,
      ctx.tenantId,
      'alert',
      alert.id,
      'alert_closed',
      ctx.now,
    );
    await this.publishAlert(
      tx,
      alert,
      fromState,
      'ENCERRADO',
      'ALERTA_ENCERRADO',
      ctx,
      null,
    );
    return (await this.getView(tx, alertId, 'N2'))!;
  }

  async annotateRootCause(
    tx: CycleSqlTransaction,
    alertId: string,
    input: RootCauseDto,
    ifMatch: string | undefined,
    ctx: CycleContext,
  ): Promise<AlertView> {
    const alert = await this.require(tx, ctx.tenantId, alertId);
    assertDashIfMatch(ifMatch, Number(alert.version));
    const category = (input as { category?: unknown } | undefined)?.category;
    if (
      typeof category !== 'string' ||
      !(ROOT_CAUSE_CATEGORIES as readonly string[]).includes(category)
    ) {
      throw new DetranError('DASH.ROOT_CAUSE_CATEGORY_INVALID', {
        status: 400,
        context: { alertId, allowed: [...ROOT_CAUSE_CATEGORIES] },
      });
    }
    const dto = parseDto(RootCauseSchema, input);
    await appendAlertTrail(
      tx,
      alert,
      {
        fromState: alert.state,
        toState: alert.state,
        actorKind: ctx.actor.kind,
        actorRef: ctx.actor.id ?? null,
        note: dto.description ?? dto.note ?? null,
        rootCauseCategory: category,
      },
      ctx.now,
    );
    return (await this.getView(tx, alertId, 'N2'))!;
  }

  // -------------------------------------------------------------------------
  // evidência de origem (§6.5)
  // -------------------------------------------------------------------------

  /** Lê a última célula da projeção do indicador para `object_ref`; se já
   *  normal → 80 (+101 na extinção) na mesma transação. */
  async verifyFromCell(
    tx: CycleSqlTransaction,
    alertId: string,
    ctx: CycleContext,
  ): Promise<boolean> {
    const alert = await this.require(tx, ctx.tenantId, alertId);
    const transitions = await loadAlertTransitions(tx);
    return this.verifyLoaded(tx, alert, transitions, ctx);
  }

  /** Evidência de normalização vinda de um comando do próprio DASHBOARD
   *  (ex. `submit`/`prove` de um ciclo, auditoria de transparência): aplica
   *  §6.5 a todo alerta aberto da chave. */
  async normalizeObject(
    tx: CycleSqlTransaction,
    indicatorCode: string,
    objectKind: string,
    objectRef: string,
    eventId: string | null,
    ctx: CycleContext,
  ): Promise<number> {
    const transitions = await loadAlertTransitions(tx);
    const result = await query<AlertRow>(
      tx,
      `select ${ALERT_COLUMNS}
         from dashboard.alert
        where tenant_id = $1 and indicator_code = $2 and object_kind = $3
          and object_ref = $4
        order by detected_at`,
      [ctx.tenantId, indicatorCode, objectKind, objectRef],
    );
    let verified = 0;
    for (const alert of result.rows) {
      if (isTerminalAlertState(transitions, alert.state)) continue;
      if (
        await this.applyNormalEvidence(tx, alert, eventId, transitions, ctx)
      ) {
        verified += 1;
      }
    }
    return verified;
  }

  // -------------------------------------------------------------------------
  // timers vencidos (§13.3 passo 1)
  // -------------------------------------------------------------------------

  /** ACK vencido: 60 → 65 (novo `T-DASH-ACK`), ou `chain_exhausted` (OD-D40);
   *  marco vencido: reclassificação / 90 → 65. Devolve `true` quando o timer
   *  foi vencido por esta chamada (`fire`), `false` quando outro sweeper já o
   *  venceu. */
  async onTimerFired(
    tx: CycleSqlTransaction,
    timer: DashboardTimer,
    ctx: CycleContext,
  ): Promise<boolean> {
    if (!(await this.clock.fire(tx, ctx.tenantId, timer.id, ctx.now)))
      return false;
    const alert = await this.load(tx, ctx.tenantId, timer.ownerId);
    if (!alert) return true;
    const transitions = await loadAlertTransitions(tx);
    const timerCtx: CycleContext = {
      ...ctx,
      actor: { kind: 'timer', id: timer.id, roles: [] },
    };
    if (timer.code.startsWith('T-DASH-ACK-')) {
      if (alert.state !== 'NOTIFICADO') return true;
      const nextLevel = Number(alert.escalation_level) + 1;
      const recipient = await this.notifier.resolveRecipient(
        tx,
        alert,
        nextLevel,
      );
      await appendAlertTrail(
        tx,
        alert,
        {
          fromState: 'NOTIFICADO',
          toState: 'ESCALONADO',
          actorKind: 'timer',
          actorRef: timer.code,
          note: recipient ? null : 'chain_exhausted',
        },
        ctx.now,
        { state: 'ESCALONADO', escalated_at: ctx.now.toISOString() },
      );
      if (!recipient) {
        await this.publishAlert(
          tx,
          alert,
          'NOTIFICADO',
          'ESCALONADO',
          'ALERTA_ESCALONADO',
          timerCtx,
          null,
        );
        return true;
      }
      await this.notifier.notify(
        tx,
        alert,
        nextLevel,
        this.notifierContext(timerCtx),
        'ALERTA_ESCALONADO',
      );
      return true;
    }
    const milestone = MILESTONE_TIMERS.find((m) => m.code === timer.code);
    if (milestone) {
      if (isTerminalAlertState(transitions, alert.state)) return true;
      if (rankOf(milestone.severity) > rankOf(alert.severity)) {
        await this.reclassify(
          tx,
          alert,
          milestone.severity,
          transitions,
          timerCtx,
          timer.code,
        );
      }
      await this.refreshNextMilestone(tx, alert, ctx);
    }
    return true;
  }

  // -------------------------------------------------------------------------
  // leituras (§6.6, §6.7)
  // -------------------------------------------------------------------------

  async getView(
    tx: CycleSqlTransaction,
    alertId: string,
    servedLayer: 'N1' | 'N2',
  ): Promise<AlertView | null> {
    const tenantId = await this.tenantOfAlert(tx, alertId);
    if (!tenantId) return null;
    const alert = await this.load(tx, tenantId, alertId);
    if (!alert) return null;
    const trail = await this.trail(tx, alert);
    const timers = await this.clock.listByOwner(
      tx,
      tenantId,
      'alert',
      alert.id,
    );
    const redact = servedLayer !== 'N2';
    return {
      id: alert.id,
      indicatorCode: alert.indicator_code,
      track: alert.track,
      state: alert.state,
      severity: alert.severity,
      block: alert.block,
      sourceApp: alert.source_app,
      object: {
        kind: alert.object_kind,
        ref: redact ? null : alert.object_ref,
        layer: alert.object_layer,
      },
      ownerRole: alert.owner_role,
      ownerRef: redact ? null : alert.owner_ref,
      governingClock: alert.governing_clock,
      nextMilestoneAt: isoOf(alert.next_milestone_at),
      ceilingOn: localDateOf(alert.ceiling_on),
      escalationLevel: Number(alert.escalation_level),
      ackChannel: alert.ack_channel,
      incidentRef: alert.incident_ref,
      timestamps: {
        detectedAt: isoOf(alert.detected_at),
        classifiedAt: isoOf(alert.classified_at),
        notifiedAt: isoOf(alert.notified_at),
        acknowledgedAt: isoOf(alert.acknowledged_at),
        treatingAt: isoOf(alert.treating_at),
        verifiedAt: isoOf(alert.verified_at),
        closedAt: isoOf(alert.closed_at),
        escalatedAt: isoOf(alert.escalated_at),
        criticalAt: isoOf(alert.critical_at),
        incidentAt: isoOf(alert.incident_at),
      },
      trail: trail.map(trailViewOf),
      timers: timers.map((timer) => ({
        code: timer.code,
        status: timer.status,
        startedAt: timer.startedAt.toISOString(),
        dueAt: timer.dueAt ? timer.dueAt.toISOString() : null,
        firedAt: timer.firedAt ? timer.firedAt.toISOString() : null,
      })),
      version: Number(alert.version),
      meta: {
        freshness: await this.freshness.metaFor(tx, tenantId, [
          alert.indicator_code,
        ]),
      },
    };
  }

  async getIncident(
    tx: CycleSqlTransaction,
    alertId: string,
    servedLayer: 'N1' | 'N2',
  ): Promise<IncidentView | null> {
    const tenantId = await this.tenantOfAlert(tx, alertId);
    if (!tenantId) return null;
    const alert = await this.load(tx, tenantId, alertId);
    if (!alert || alert.state !== 'INCIDENTE_REGISTRADO') return null;
    const trail = await this.trail(tx, alert);
    const ceilingReachedOn = await this.ceilingReachedOn(tx, alert);
    const notified: IncidentView['notified'] = [];
    const rootCauses: IncidentView['rootCauses'] = [];
    for (const line of trail) {
      const parsed = parseNotifiedNote(line.note);
      if (parsed) {
        notified.push({
          ...parsed,
          at: new Date(line.occurred_at).toISOString(),
        });
      }
      if (line.root_cause_category) {
        rootCauses.push({
          category: line.root_cause_category,
          note: line.note,
          actorRef: line.actor_ref,
          at: new Date(line.occurred_at).toISOString(),
        });
      }
    }
    return {
      alertId: alert.id,
      incidentRef: alert.incident_ref,
      registeredAt: isoOf(alert.incident_at),
      indicatorCode: alert.indicator_code,
      governingClock: alert.governing_clock,
      ceilingOn: localDateOf(alert.ceiling_on),
      ceilingReachedOn,
      object: {
        kind: alert.object_kind,
        ref: servedLayer === 'N2' ? alert.object_ref : null,
        layer: alert.object_layer,
      },
      sourceEventId: alert.source_event_id,
      notified,
      rootCauses,
      trail: trail.map(trailViewOf),
      meta: {
        freshness: await this.freshness.metaFor(tx, tenantId, [
          alert.indicator_code,
        ]),
      },
    };
  }

  /** `meta.freshness` (§5.5) para quem só tem o serviço de alertas à mão
   *  (`DashboardDutyService`, §14.1). */
  freshnessMeta(
    tx: CycleSqlTransaction,
    tenantId: string,
    indicatorCodes: readonly string[],
  ): Promise<{ freshness: FreshnessMeta }> {
    return this.freshness
      .metaFor(tx, tenantId, indicatorCodes)
      .then((freshness) => ({ freshness }));
  }

  // -------------------------------------------------------------------------
  // células do fallback (§13.3 passo 4, §8.5) — as tabelas próprias sem evento
  // -------------------------------------------------------------------------

  /** `prescription_risk` (por `flag`/teto), transparência (IND-DASH-209,
   *  período anterior sem auditoria, §10.4) e blocos C/D com escada
   *  publicada (`portal_service_metrics.score`, `pec_deadlines`/
   *  `teat_measures` idade em dias). */
  async fallbackCells(
    tx: CycleSqlTransaction,
    ctx: CycleContext,
    today: LocalDate,
  ): Promise<DetectionCell[]> {
    const cells: DetectionCell[] = [];
    const risk = await query<{
      case_id: string;
      clock_code: 'A' | 'B' | 'C' | 'D';
      indicator_code: string;
      flag: string | null;
      ceiling_on: Date | string | null;
      ceiling_reached_on: Date | string | null;
      extinct_state: string | null;
      pool_id: string | null;
    }>(
      tx,
      `select case_id, clock_code, indicator_code, flag, ceiling_on,
              ceiling_reached_on, extinct_state, pool_id
         from dashboard.prescription_risk
        where tenant_id = $1
        order by indicator_code, case_id`,
      [ctx.tenantId],
    );
    for (const row of risk.rows) {
      cells.push({
        projection: 'dashboard.prescription_risk',
        indicatorCode: row.indicator_code,
        sourceApp: 'rait',
        objectKind: 'case',
        objectRef: row.case_id,
        objectLayer: 'N2',
        level: prescriptionLevelOf(row),
        governingClock: row.clock_code,
        ceilingOn: localDateOf(row.ceiling_on) ?? undefined,
        occurredAt: ctx.now,
      });
    }
    cells.push(...(await this.transparencyCells(tx, ctx, today)));
    cells.push(...(await this.ladderCells(tx, ctx)));
    return cells;
  }

  private async transparencyCells(
    tx: CycleSqlTransaction,
    ctx: CycleContext,
    today: LocalDate,
  ): Promise<DetectionCell[]> {
    const indicator = await this.indicator(tx, ctx.tenantId, 'IND-DASH-209');
    if (!indicator) return [];
    const [year, month] = today.split('-').map(Number) as [number, number];
    const previous = new Date(Date.UTC(year, month - 2, 1));
    const period = `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, '0')}`;
    const audited = await query<{ id: string }>(
      tx,
      `select id from dashboard.transparency_audit
        where tenant_id = $1 and period = $2`,
      [ctx.tenantId, period],
    );
    return [
      {
        projection: 'dashboard.transparency_audit',
        indicatorCode: indicator.code,
        sourceApp: indicator.source_app,
        objectKind: 'period',
        objectRef: period,
        objectLayer: 'N0',
        level: audited.rows.length > 0 ? 'SEM_RISCO' : 'CRITICO',
        occurredAt: ctx.now,
      },
    ];
  }

  private async ladderCells(
    tx: CycleSqlTransaction,
    ctx: CycleContext,
  ): Promise<DetectionCell[]> {
    const configs = await query<{
      indicator_code: string;
      threshold_json: unknown;
      block: DashboardBlock;
      source_app: string;
      projection: string | null;
    }>(
      tx,
      `select c.indicator_code, c.threshold_json, i.block, i.source_app, i.projection
         from dashboard.indicator_config c
         join dashboard.indicator i
           on i.tenant_id = c.tenant_id and i.code = c.indicator_code
        where c.tenant_id = $1 and c.status = 'published'
          and c.threshold_json is not null and i.block in ('C', 'D')
        order by c.indicator_code, c.published_at desc`,
      [ctx.tenantId],
    );
    const cells: DetectionCell[] = [];
    const seen = new Set<string>();
    for (const config of configs.rows) {
      if (seen.has(config.indicator_code)) continue;
      seen.add(config.indicator_code);
      const threshold = parseThreshold(config.threshold_json);
      if (!threshold) continue;
      const metrics = await this.metricCells(
        tx,
        ctx,
        config.indicator_code,
        config.projection,
      );
      for (const metric of metrics) {
        cells.push({
          projection: metric.projection,
          indicatorCode: config.indicator_code,
          sourceApp: config.source_app,
          objectKind: metric.objectKind,
          objectRef: metric.objectRef,
          objectLayer: metric.objectLayer,
          level: ladderLevelOf(threshold, metric.value),
          eventId: undefined,
          occurredAt: ctx.now,
        });
      }
    }
    return cells;
  }

  /** Métrica por projeção (§6.3): `portal_service_metrics.score`;
   *  `pec_deadlines`/`teat_measures` = idade em dias desde
   *  `changed_at`/`started_at`. `integration_health` não carrega
   *  `indicator_code` (sem célula por indicador; OD no relatório). */
  private async metricCells(
    tx: CycleSqlTransaction,
    ctx: CycleContext,
    indicatorCode: string,
    projection: string | null,
  ): Promise<
    {
      projection: DetectionCell['projection'];
      objectKind: string;
      objectRef: string;
      objectLayer: DashboardLayer;
      value: number;
      lastEventId: string | null;
    }[]
  > {
    const dayMs = 86_400_000;
    if (projection === 'dashboard.portal_service_metrics') {
      const rows = await query<{
        object_kind: string;
        object_ref: string;
        score: string | number | null;
        last_event_id: string;
      }>(
        tx,
        `select object_kind, object_ref, score, last_event_id
           from dashboard.portal_service_metrics
          where tenant_id = $1 and indicator_code = $2 and score is not null`,
        [ctx.tenantId, indicatorCode],
      );
      return rows.rows.map((row) => ({
        projection: 'dashboard.portal_service_metrics' as const,
        objectKind: row.object_kind,
        objectRef: row.object_ref,
        objectLayer: 'N1' as const,
        value: Number(row.score),
        lastEventId: row.last_event_id,
      }));
    }
    if (projection === 'dashboard.pec_deadlines') {
      const rows = await query<{
        case_id: string;
        changed_at: Date;
        last_event_id: string;
      }>(
        tx,
        `select case_id, changed_at, last_event_id
           from dashboard.pec_deadlines
          where tenant_id = $1 and indicator_code = $2`,
        [ctx.tenantId, indicatorCode],
      );
      return rows.rows.map((row) => ({
        projection: 'dashboard.pec_deadlines' as const,
        objectKind: 'exam-process',
        objectRef: row.case_id,
        objectLayer: 'N2' as const,
        value: (ctx.now.getTime() - new Date(row.changed_at).getTime()) / dayMs,
        lastEventId: row.last_event_id,
      }));
    }
    if (projection === 'dashboard.teat_measures') {
      const rows = await query<{
        object_kind: string;
        object_ref: string;
        started_at: Date | null;
        last_event_id: string;
      }>(
        tx,
        `select object_kind, object_ref, started_at, last_event_id
           from dashboard.teat_measures
          where tenant_id = $1 and indicator_code = $2 and started_at is not null`,
        [ctx.tenantId, indicatorCode],
      );
      return rows.rows.map((row) => ({
        projection: 'dashboard.teat_measures' as const,
        objectKind: row.object_kind,
        objectRef: row.object_ref,
        objectLayer: 'N2' as const,
        value:
          (ctx.now.getTime() - new Date(row.started_at!).getTime()) / dayMs,
        lastEventId: row.last_event_id,
      }));
    }
    return [];
  }

  // -------------------------------------------------------------------------
  // internos — criação, classificação, notificação, incidente
  // -------------------------------------------------------------------------

  private async createAlert(
    tx: CycleSqlTransaction,
    cell: DetectionCell,
    indicator: IndicatorRow,
    ctx: CycleContext,
  ): Promise<AlertRow> {
    const track: AlertTrack =
      indicator.kind === 'legal-ceiling' || cell.level === 'TETO'
        ? 'extinction'
        : 'irregularity';
    // `owner_role` = dono da célula (deveres: `duty.owner_role`; RAIT com
    // `rait.assignment.changed`, OD-D32), senão nível 1 da cadeia do app;
    // app sem cadeia → `dash-operator` (o papel que §2.3 dá aos apps sem dono
    // de área, OD-D29 — declarado no relatório).
    const ownerRole =
      cell.ownerRole ??
      (await this.chainLevelOne(tx, cell.sourceApp)) ??
      DASH_OPERATOR_ROLE;
    const severity = severityOf(cell.level);
    const nextMilestoneAt = cell.nextMilestoneAt ?? null;
    const inserted = await query<AlertRow>(
      tx,
      `insert into dashboard.alert
         (tenant_id, indicator_code, track, state, severity, block, source_app,
          object_kind, object_ref, object_layer, owner_role, owner_ref,
          governing_clock, next_milestone_at, ceiling_on, detected_at,
          escalation_level, source_event_id)
       values ($1, $2, $3, 'DETECTADO', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 0, $16)
       returning ${ALERT_COLUMNS}`,
      [
        ctx.tenantId,
        cell.indicatorCode,
        track,
        severity,
        indicator.block,
        cell.sourceApp,
        cell.objectKind,
        cell.objectRef,
        cell.objectLayer,
        ownerRole,
        cell.ownerRef ?? null,
        cell.governingClock ?? null,
        nextMilestoneAt ? nextMilestoneAt.toISOString() : null,
        cell.ceilingOn ?? null,
        cell.occurredAt.toISOString(),
        cell.eventId ?? null,
      ],
    );
    const alert = inserted.rows[0]!;
    // trilha seq 1 (`[*] → DETECTADO`); `note='fallback'` sem evento (§8.5)
    await query(
      tx,
      `insert into dashboard.alert_trail
         (tenant_id, alert_id, seq, from_state, to_state, actor_kind, actor_ref,
          occurred_at, note, event_id)
       values ($1, $2, 1, null, 'DETECTADO', 'system', $3, $4, $5, $6)`,
      [
        ctx.tenantId,
        alert.id,
        cell.projection,
        ctx.now.toISOString(),
        cell.eventId ? null : 'fallback',
        cell.eventId ?? null,
      ],
    );
    return alert;
  }

  private async chainLevelOne(
    tx: CycleSqlTransaction,
    sourceApp: string,
  ): Promise<string | null> {
    const result = await query<{ role: string }>(
      tx,
      `select role from dashboard.escalation_chain_ref
        where source_app = $1 and level = 1`,
      [sourceApp],
    );
    return result.rows[0]?.role ?? null;
  }

  /** Bloco B: `T-DASH-MARCO-50/75/90` da janela `[windowStart, windowEnd]`
   *  ainda à frente; `next_milestone_at` = `due_at` do próximo (§6.2). */
  private async armMilestones(
    tx: CycleSqlTransaction,
    alert: AlertRow,
    cell: DetectionCell,
    ctx: CycleContext,
  ): Promise<void> {
    if (!cell.windowStart || !cell.windowEnd) return;
    let next: Date | null = null;
    for (const milestone of MILESTONE_TIMERS) {
      const due = await this.clock.computeDue(
        ctx.tz,
        ctx.tenantId,
        milestone.code,
        {
          ownerKind: 'alert',
          ownerId: alert.id,
          code: milestone.code,
          startedAt: cell.windowStart,
          windowEnd: cell.windowEnd,
        },
      );
      if (!due || due.getTime() <= ctx.now.getTime()) continue;
      const timer = await this.clock.arm(tx, ctx.tenantId, ctx.tz, {
        ownerKind: 'alert',
        ownerId: alert.id,
        code: milestone.code,
        startedAt: cell.windowStart,
        windowEnd: cell.windowEnd,
      });
      if (timer.dueAt && (!next || timer.dueAt < next)) next = timer.dueAt;
    }
    if (next && !alert.next_milestone_at) {
      await query(
        tx,
        `update dashboard.alert set next_milestone_at = $3
          where tenant_id = $1 and id = $2`,
        [ctx.tenantId, alert.id, next.toISOString()],
      );
      alert.next_milestone_at = next;
    }
  }

  private async refreshNextMilestone(
    tx: CycleSqlTransaction,
    alert: AlertRow,
    ctx: CycleContext,
  ): Promise<void> {
    const timers = await this.clock.listByOwner(
      tx,
      ctx.tenantId,
      'alert',
      alert.id,
    );
    const armed = timers
      .filter(
        (t) =>
          t.status === 'ARMADO' &&
          t.code.startsWith('T-DASH-MARCO-') &&
          t.dueAt,
      )
      .sort((a, b) => a.dueAt!.getTime() - b.dueAt!.getTime());
    const next = armed[0]?.dueAt ?? null;
    await query(
      tx,
      `update dashboard.alert set next_milestone_at = $3
        where tenant_id = $1 and id = $2`,
      [ctx.tenantId, alert.id, next ? next.toISOString() : null],
    );
    alert.next_milestone_at = next;
  }

  /** §6.3 — reclassificação: `NOTIFICADO`/`RECONHECIDO`/`CLASSIFICADO`/
   *  `DETECTADO`/`VERIFICADO` sobem `severity` no lugar (trilha
   *  `reclassified:<N>`, `from = to`, OD-D40); `EM_TRATAMENTO` → 90 → 65
   *  (notifica o nível da nova severidade). */
  private async reclassify(
    tx: CycleSqlTransaction,
    alert: AlertRow,
    severity: AlertSeverity,
    transitions: readonly AlertTransitionRow[],
    ctx: CycleContext,
    timerCode: string | null,
  ): Promise<void> {
    if (alert.state === 'EM_TRATAMENTO') {
      assertAlertState(transitions, alert, 'ESCALONADO');
      await appendAlertTrail(
        tx,
        alert,
        {
          fromState: 'EM_TRATAMENTO',
          toState: 'ESCALONADO',
          actorKind: timerCode ? 'timer' : 'system',
          actorRef: timerCode,
          note: `reclassified:${severity}`,
        },
        ctx.now,
        { state: 'ESCALONADO', severity, escalated_at: ctx.now.toISOString() },
      );
      const level = chainLevelOf(severity);
      const recipient = await this.notifier.resolveRecipient(tx, alert, level);
      if (!recipient) {
        await appendAlertTrail(
          tx,
          alert,
          {
            fromState: 'ESCALONADO',
            toState: 'ESCALONADO',
            actorKind: 'system',
            note: 'chain_exhausted',
          },
          ctx.now,
        );
        await this.publishAlert(
          tx,
          alert,
          'EM_TRATAMENTO',
          'ESCALONADO',
          'ALERTA_ESCALONADO',
          ctx,
          null,
        );
        return;
      }
      await this.notifier.notify(
        tx,
        alert,
        level,
        this.notifierContext(ctx),
        'ALERTA_ESCALONADO',
      );
      return;
    }
    await appendAlertTrail(
      tx,
      alert,
      {
        fromState: alert.state,
        toState: alert.state,
        actorKind: timerCode ? 'timer' : 'system',
        actorRef: timerCode,
        note: `reclassified:${severity}`,
      },
      ctx.now,
      { severity },
    );
  }

  /** 40 (`CLASSIFICADO → CRITICO_EXTINCAO`) → §6.4 item 4 → 110
   *  (`INCIDENTE_REGISTRADO`, `incident_ref` = id da linha 110). */
  private async criticalExtinction(
    tx: CycleSqlTransaction,
    alert: AlertRow,
    ctx: CycleContext,
    fromEvent: string | null,
  ): Promise<void> {
    const transitions = await loadAlertTransitions(tx);
    assertAlertState(transitions, alert, 'CRITICO_EXTINCAO');
    await appendAlertTrail(
      tx,
      alert,
      {
        fromState: 'CLASSIFICADO',
        toState: 'CRITICO_EXTINCAO',
        actorKind: 'system',
        eventId: fromEvent,
      },
      ctx.now,
      { state: 'CRITICO_EXTINCAO', critical_at: ctx.now.toISOString() },
    );
    await this.publishAlert(
      tx,
      alert,
      'CLASSIFICADO',
      'CRITICO_EXTINCAO',
      'ALERTA_CRITICO_EXTINCAO',
      ctx,
      fromEvent,
    );
    await this.notifier.notifyCriticalExtinction(
      tx,
      alert,
      this.notifierContext(ctx),
    );
    assertAlertState(transitions, alert, 'INCIDENTE_REGISTRADO');
    const { trailId } = await appendAlertTrail(
      tx,
      alert,
      {
        fromState: 'CRITICO_EXTINCAO',
        toState: 'INCIDENTE_REGISTRADO',
        actorKind: 'system',
        note: `incident:${alert.indicator_code}:${localDateOf(alert.ceiling_on) ?? ''}`,
        eventId: fromEvent,
      },
      ctx.now,
      { state: 'INCIDENTE_REGISTRADO', incident_at: ctx.now.toISOString() },
    );
    await query(
      tx,
      `update dashboard.alert set incident_ref = $3 where tenant_id = $1 and id = $2`,
      [ctx.tenantId, alert.id, trailId],
    );
    alert.incident_ref = trailId;
    await this.publishAlert(
      tx,
      alert,
      'CRITICO_EXTINCAO',
      'INCIDENTE_REGISTRADO',
      'INCIDENTE_REGISTRADO',
      ctx,
      fromEvent,
    );
  }

  /** §6.5 — evidência `SEM_RISCO` para um alerta aberto: `EM_TRATAMENTO` →
   *  80 (+101 na extinção); outros estados → só trilha `origin_normal`. */
  private async applyNormalEvidence(
    tx: CycleSqlTransaction,
    alert: AlertRow,
    eventId: string | null,
    transitions: readonly AlertTransitionRow[],
    ctx: CycleContext,
  ): Promise<boolean> {
    if (alert.state === 'EM_TRATAMENTO') {
      await this.verifyAlert(tx, alert, eventId, transitions, ctx);
      return true;
    }
    if (alert.state === 'VERIFICADO') return false;
    await appendAlertTrail(
      tx,
      alert,
      {
        fromState: alert.state,
        toState: alert.state,
        actorKind: 'system',
        note: 'origin_normal',
        eventId,
      },
      ctx.now,
    );
    return false;
  }

  private async verifyAlert(
    tx: CycleSqlTransaction,
    alert: AlertRow,
    eventId: string | null,
    transitions: readonly AlertTransitionRow[],
    ctx: CycleContext,
  ): Promise<void> {
    assertAlertState(transitions, alert, 'VERIFICADO');
    await appendAlertTrail(
      tx,
      alert,
      {
        fromState: 'EM_TRATAMENTO',
        toState: 'VERIFICADO',
        actorKind: 'system',
        eventId,
      },
      ctx.now,
      { state: 'VERIFICADO', verified_at: ctx.now.toISOString() },
    );
    await this.publishAlert(
      tx,
      alert,
      'EM_TRATAMENTO',
      'VERIFICADO',
      'ALERTA_VERIFICADO',
      ctx,
      eventId,
    );
    if (alert.track !== 'extinction') return;
    // 101 — a evidência é a mudança de estado na origem
    assertAlertState(transitions, alert, 'ENCERRADO');
    await appendAlertTrail(
      tx,
      alert,
      {
        fromState: 'VERIFICADO',
        toState: 'ENCERRADO',
        actorKind: 'system',
        eventId,
      },
      ctx.now,
      { state: 'ENCERRADO', closed_at: ctx.now.toISOString() },
    );
    await this.clock.cancelAll(
      tx,
      ctx.tenantId,
      'alert',
      alert.id,
      'alert_closed',
      ctx.now,
    );
    await this.publishAlert(
      tx,
      alert,
      'VERIFICADO',
      'ENCERRADO',
      'ALERTA_ENCERRADO',
      ctx,
      eventId,
    );
  }

  /** Lê a última célula da projeção para `object_ref` e decide (§6.5). */
  private async verifyLoaded(
    tx: CycleSqlTransaction,
    alert: AlertRow,
    transitions: readonly AlertTransitionRow[],
    ctx: CycleContext,
  ): Promise<boolean> {
    if (alert.state !== 'EM_TRATAMENTO') return false;
    const evidence = await this.latestCellEvidence(tx, alert, ctx);
    if (!evidence || evidence.level !== 'SEM_RISCO') return false;
    await this.verifyAlert(tx, alert, evidence.eventId, transitions, ctx);
    return true;
  }

  /** Última célula da projeção do indicador para a chave do alerta. */
  private async latestCellEvidence(
    tx: CycleSqlTransaction,
    alert: AlertRow,
    ctx: CycleContext,
  ): Promise<{ level: DetectionLevel; eventId: string | null } | null> {
    const indicator = await this.indicator(
      tx,
      ctx.tenantId,
      alert.indicator_code,
    );
    const projection = indicator?.projection ?? null;
    const tenantId = ctx.tenantId;
    if (alert.object_kind === 'duty_cycle') {
      const cycle = await query<{ state: string }>(
        tx,
        `select state from dashboard.duty_cycle where tenant_id = $1 and id = $2`,
        [tenantId, alert.object_ref],
      );
      const state = cycle.rows[0]?.state;
      if (!state) return null;
      const fulfilled = [
        'SUBMETIDO_PUBLICADO',
        'COMPROVADO',
        'ARQUIVADO',
      ].includes(state);
      return { level: fulfilled ? 'SEM_RISCO' : 'N1', eventId: null };
    }
    if (alert.object_kind === 'period') {
      const audited = await query<{ id: string }>(
        tx,
        `select id from dashboard.transparency_audit where tenant_id = $1 and period = $2`,
        [tenantId, alert.object_ref],
      );
      return {
        level: audited.rows.length > 0 ? 'SEM_RISCO' : 'CRITICO',
        eventId: null,
      };
    }
    if (projection === 'dashboard.prescription_risk') {
      const rows = await query<{
        flag: string | null;
        ceiling_reached_on: Date | string | null;
        extinct_state: string | null;
        last_event_id: string;
        flag_changed_at: Date | null;
      }>(
        tx,
        `select flag, ceiling_reached_on, extinct_state, last_event_id, flag_changed_at
           from dashboard.prescription_risk
          where tenant_id = $1 and case_id = $2
            and (clock_code = $3 or $3 is null)
          order by flag_changed_at desc nulls last, updated_at desc nulls last
          limit 1`,
        [tenantId, alert.object_ref, alert.governing_clock],
      );
      const row = rows.rows[0];
      if (!row) return null;
      return { level: prescriptionLevelOf(row), eventId: row.last_event_id };
    }
    if (
      projection === 'dashboard.portal_service_metrics' ||
      projection === 'dashboard.pec_deadlines' ||
      projection === 'dashboard.teat_measures'
    ) {
      const threshold = await this.publishedThreshold(
        tx,
        tenantId,
        alert.indicator_code,
      );
      if (!threshold) return null;
      const metrics = await this.metricCells(
        tx,
        ctx,
        alert.indicator_code,
        projection,
      );
      const metric = metrics.find(
        (m) =>
          m.objectKind === alert.object_kind &&
          m.objectRef === alert.object_ref,
      );
      if (!metric) return null;
      return {
        level: ladderLevelOf(threshold, metric.value),
        eventId: metric.lastEventId,
      };
    }
    // `dashboard.crashes` (R-0010) e `integration_health`: sem leitura de
    // célula por objeto neste CTG (OD no relatório) — nunca verificado por
    // comando, só por evento (`detect` com `SEM_RISCO`).
    return null;
  }

  private async ceilingReachedOn(
    tx: CycleSqlTransaction,
    alert: AlertRow,
  ): Promise<string | null> {
    if (alert.object_kind !== 'case') return null;
    const rows = await query<{ ceiling_reached_on: Date | string | null }>(
      tx,
      `select ceiling_reached_on from dashboard.prescription_risk
        where tenant_id = $1 and case_id = $2 and (clock_code = $3 or $3 is null)
        order by ceiling_reached_on desc nulls last limit 1`,
      [alert.tenant_id, alert.object_ref, alert.governing_clock],
    );
    return localDateOf(rows.rows[0]?.ceiling_reached_on ?? null);
  }

  private async publishAlert(
    tx: CycleSqlTransaction,
    alert: AlertRow,
    fromState: AlertState | null,
    toState: AlertState,
    domainEvent: string,
    ctx: CycleContext,
    causationId: string | null,
    extra: Record<string, DashboardEventDataValue | undefined> = {},
  ): Promise<void> {
    await publish(
      tx,
      envelopeOf({
        type: DASHBOARD_EVENT_TYPES.alertChanged,
        domainEvent,
        tenantId: ctx.tenantId,
        occurredAt: ctx.now,
        actor: { kind: ctx.actor.kind, id: ctx.actor.id, role: ctx.actor.role },
        correlationId: ctx.requestId,
        causationId: causationId ?? alert.source_event_id,
        aggregate: {
          kind: 'alert',
          id: alert.id,
          version: Number(alert.version),
        },
        data: alertEventData(alert, fromState, toState, ctx.now, extra),
      }),
    );
  }

  private notifierContext(ctx: CycleContext): NotifierContext {
    return {
      tenantId: ctx.tenantId,
      tz: ctx.tz,
      now: ctx.now,
      actor: { kind: ctx.actor.kind, id: ctx.actor.id, role: ctx.actor.role },
      requestId: ctx.requestId,
    };
  }

  // -------------------------------------------------------------------------
  // guardas comuns
  // -------------------------------------------------------------------------

  /** §6.1: `owner` = `alert.owner_role` entre os papéis ou `principal.id =
   *  owner_ref`; `dash-operator` = papel `dash-operator`. */
  private actorKindFor(alert: AlertRow, ctx: CycleContext): AlertActorKind {
    const roles = ctx.actor.roles;
    if (roles.includes(alert.owner_role)) return 'owner';
    if (ctx.actor.id && alert.owner_ref && ctx.actor.id === alert.owner_ref)
      return 'owner';
    if (roles.includes(DASH_OPERATOR_ROLE)) return 'dash-operator';
    return 'none';
  }

  /** §8.4 — `DASH.ALERT_SOURCE_STALE` (409, `indicator`, `freshness`). */
  private async assertFreshSource(
    tx: CycleSqlTransaction,
    alert: AlertRow,
    ctx: CycleContext,
  ): Promise<void> {
    const source = await this.freshness.stateOf(
      tx,
      ctx.tenantId,
      alert.indicator_code,
    );
    if (source && DashboardFreshnessService.isStale(source.state)) {
      throw new DetranError('DASH.ALERT_SOURCE_STALE', {
        status: 409,
        context: {
          alertId: alert.id,
          indicator: alert.indicator_code,
          freshness: source.state,
        },
      });
    }
  }

  private async require(
    tx: CycleSqlTransaction,
    tenantId: string,
    alertId: string,
  ): Promise<AlertRow> {
    const alert = await this.load(tx, tenantId, alertId);
    if (!alert) {
      throw new DetranError('DASH.TENANT_MISMATCH', {
        status: 404,
        context: { alertId },
      });
    }
    return alert;
  }

  private async load(
    tx: CycleSqlTransaction,
    tenantId: string,
    alertId: string,
  ): Promise<AlertRow | null> {
    const result = await query<AlertRow>(
      tx,
      `select ${ALERT_COLUMNS} from dashboard.alert where tenant_id = $1 and id = $2`,
      [tenantId, alertId],
    );
    return result.rows[0] ?? null;
  }

  /** Leituras sem contexto de tenant (`getView`/`getIncident` recebem só o
   *  id; RLS é a última linha): o tenant vem da própria linha. */
  private async tenantOfAlert(
    tx: CycleSqlTransaction,
    alertId: string,
  ): Promise<string | null> {
    const result = await query<{ tenant_id: string }>(
      tx,
      `select tenant_id from dashboard.alert where id = $1`,
      [alertId],
    );
    return result.rows[0]?.tenant_id ?? null;
  }

  private async trail(
    tx: CycleSqlTransaction,
    alert: AlertRow,
  ): Promise<TrailRow[]> {
    const result = await query<TrailRow>(
      tx,
      `select id, seq, from_state, to_state, actor_kind, actor_ref, occurred_at,
              note, root_cause_category, event_id
         from dashboard.alert_trail
        where tenant_id = $1 and alert_id = $2
        order by seq`,
      [alert.tenant_id, alert.id],
    );
    return result.rows;
  }

  private async indicator(
    tx: CycleSqlTransaction,
    tenantId: string,
    code: string,
  ): Promise<IndicatorRow | null> {
    const result = await query<IndicatorRow>(
      tx,
      `select code, block, kind, source_app, projection, connected, clock_code
         from dashboard.indicator
        where tenant_id = $1 and code = $2`,
      [tenantId, code],
    );
    return result.rows[0] ?? null;
  }

  private async latestAlertForKey(
    tx: CycleSqlTransaction,
    tenantId: string,
    cell: Pick<DetectionCell, 'indicatorCode' | 'objectKind' | 'objectRef'>,
  ): Promise<AlertRow | null> {
    const result = await query<AlertRow>(
      tx,
      `select ${ALERT_COLUMNS}
         from dashboard.alert
        where tenant_id = $1 and indicator_code = $2 and object_kind = $3
          and object_ref = $4
        order by detected_at desc, created_at desc
        limit 1`,
      [tenantId, cell.indicatorCode, cell.objectKind, cell.objectRef],
    );
    return result.rows[0] ?? null;
  }

  /** `indicator_config` publicada com `levels` não vazio (§6.3). */
  private async publishedThreshold(
    tx: CycleSqlTransaction,
    tenantId: string,
    indicatorCode: string,
  ): Promise<ThresholdJson | null> {
    const result = await query<ThresholdConfigRow>(
      tx,
      `select threshold_json
         from dashboard.indicator_config
        where tenant_id = $1 and indicator_code = $2 and status = 'published'
          and threshold_json is not null
        order by published_at desc nulls last, version desc
        limit 1`,
      [tenantId, indicatorCode],
    );
    const row = result.rows[0];
    if (!row) return null;
    return parseThreshold(row.threshold_json);
  }
}

function trailViewOf(line: TrailRow): AlertTrailView {
  return {
    seq: Number(line.seq),
    fromState: line.from_state,
    toState: line.to_state,
    actorKind: line.actor_kind,
    actorRef: line.actor_ref,
    occurredAt: new Date(line.occurred_at).toISOString(),
    note: line.note,
    rootCauseCategory: line.root_cause_category,
    eventId: line.event_id,
  };
}
