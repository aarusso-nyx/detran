// Deveres periódicos (CTG-0002 §7; plan M19; [WF-DASH-002]; [RN-DASH-120]/
// [RN-DASH-113]). Regras puras de período e data-limite (§7.1, tabela por
// dever — `deadlineOnFor`, `validatePeriod`, `currentPeriodFor`), virada
// (`turnOver`, §7.2: abre `JANELA_ABERTA`, arma `T-DASH-DUTY-<n>`, marca o
// ciclo anterior `ATRASADO` como `NAO_CUMPRIDO` quando o período seguinte
// abre), `ATRASADO` ao vencer o timer (`onTimerFired`; estados posteriores
// → timer `SATISFEITO` sem efeito), comandos `start/prepare/submit/prove/
// archive` (§7.3, guardas por `duty_transition_ref`; dono §7.4) e as células
// de dever do fallback (§13.3 passo 4: nível pela fração da janela;
// `ATRASADO` → `CRITICO`, DUTY-02 → `TETO`, OD-D41). Datas civis no fuso do
// tenant; `deadline_on` inclusivo. Não há tabela de trilha de dever no DDL
// 80: o registro do ator é o `actor` do evento publicado (A21 (9)).
// Eventos `dashboard.duty.changed` com `domainEvent = 'DEVER_<estado>'`
// (os quatro tokens do contrato §12 + os propostos para as demais
// transições, OD-D33 — relatório).
import { Injectable } from '@nestjs/common';
import { DetranError } from '@detran/shared';
import type { LocalDate } from '@detran/inf-deadlines';

import {
  DashboardAlertService,
  type CycleContext,
  type DetectionCell,
} from './alert.service.js';
import { DashboardClockService, endOfCivilDay } from './clock.service.js';
import {
  ArchiveDutySchema,
  PrepareDutySchema,
  ProveDutySchema,
  SHA256_HEX_PATTERN,
  SubmitDutySchema,
  parseDto,
  type ArchiveDutyDto,
  type PrepareDutyDto,
  type ProveDutyDto,
  type SubmitDutyDto,
} from './dto.js';
import { DASHBOARD_EVENT_TYPES, envelopeOf, publish } from './events.js';
import type { FreshnessMeta } from './freshness.service.js';
import { assertDashIfMatch } from './if-match.js';
import { localDateOf } from './notifier.js';
import {
  AGENCY_ADMIN_ROLE,
  MILESTONE_TIMERS,
  type DashboardTimerCode,
  type DetectionLevel,
  type DutyDeadlineKind,
  type DutyState,
  query,
  type CycleSqlTransaction,
} from './tokens.js';
import {
  assertDutyTransition,
  loadDutyTransitions,
  type DutyTransitionRow,
} from './transitions.js';
import type { DashboardTimer } from './clock.service.js';

// ---------------------------------------------------------------------------
// linhas
// ---------------------------------------------------------------------------

/** `dashboard.duty` (DDL 80; seed 80) — as colunas que §7 consome. */
export interface DutyRow extends Record<string, unknown> {
  id: string;
  tenant_id: string;
  code: string;
  deadline_kind: DutyDeadlineKind;
  deadline_rule: string | null;
  periodicity: string;
  indicator_code: string | null;
  owner_role: string;
  scope: string;
}

export interface DutyCycleRow extends Record<string, unknown> {
  id: string;
  tenant_id: string;
  duty_code: string;
  period: string;
  state: DutyState;
  deadline_on: Date | string | null;
  opened_at: Date;
  started_at: Date | null;
  prepared_at: Date | null;
  submitted_at: Date | null;
  proved_at: Date | null;
  archived_at: Date | null;
  late_at: Date | null;
  unfulfilled_at: Date | null;
  draft_ref: string | null;
  evidence_protocol: string | null;
  evidence_capture_uri: string | null;
  evidence_hash: string | null;
  version: number;
}

export interface DutyCycleView extends Record<string, unknown> {
  id: string;
  dutyId: string;
  dutyCode: string;
  indicatorCode: string | null;
  period: string;
  state: DutyState;
  deadlineOn: string | null;
  late: boolean;
  timestamps: {
    openedAt: string;
    startedAt: string | null;
    preparedAt: string | null;
    submittedAt: string | null;
    provedAt: string | null;
    archivedAt: string | null;
    lateAt: string | null;
    unfulfilledAt: string | null;
  };
  draftRef: string | null;
  evidence: {
    protocol: string | null;
    captureUri: string | null;
    hash: string | null;
  };
  version: number;
  meta: { freshness: FreshnessMeta };
}

const DUTY_COLUMNS = `id, tenant_id, code, deadline_kind, deadline_rule, periodicity,
       indicator_code, owner_role, scope`;
const CYCLE_COLUMNS = `id, tenant_id, duty_code, period, state, deadline_on, opened_at,
       started_at, prepared_at, submitted_at, proved_at, archived_at, late_at,
       unfulfilled_at, draft_ref, evidence_protocol, evidence_capture_uri,
       evidence_hash, version`;

// ---------------------------------------------------------------------------
// §7.1 — período, virada e data-limite por dever (tabela transcrita)
// ---------------------------------------------------------------------------

type PeriodShape = 'YYYY-MM' | 'YYYY' | 'YYYY-MM-DD';

interface DutyPeriodRule {
  shape: PeriodShape;
  /** Ano de referência do período anual: corrente ou anterior (206). */
  reference?: 'current' | 'previous';
  /** `deadline_on` do período (nulo = sem prazo legal). */
  deadline: ((period: string) => LocalDate) | null;
  timer: DashboardTimerCode | null;
}

const MONTH_RE = /^(\d{4})-(\d{2})$/;
const YEAR_RE = /^\d{4}$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

const lastDayOfMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

const pad = (n: number): string => String(n).padStart(2, '0');

/** Dia 20 do mês subsequente ([WF-DASH-002] §Prazos; CONTRAN 918 art. 26). */
function dayTwentyNextMonth(period: string): LocalDate {
  const [, y, m] = MONTH_RE.exec(period)!;
  const next = new Date(Date.UTC(Number(y), Number(m), 1));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-20`;
}

/** Último dia do mês do período (`dashboard.duty.IND-202.deadline`, OD-D10). */
function lastDayOfPeriodMonth(period: string): LocalDate {
  const [, y, m] = MONTH_RE.exec(period)!;
  return `${y}-${m}-${pad(lastDayOfMonth(Number(y), Number(m)))}`;
}

/** Tabela de §7.1 por `duty.code` (fonte de cada linha na coluna "fonte" do
 *  contrato). Deveres fora da tabela seguem só o `deadline_kind`. */
const DUTY_PERIOD_RULES: Readonly<Record<string, DutyPeriodRule>> = {
  'DUTY-01': {
    shape: 'YYYY-MM',
    deadline: dayTwentyNextMonth,
    timer: 'T-DASH-DUTY-201',
  },
  'DUTY-02': {
    shape: 'YYYY-MM',
    deadline: lastDayOfPeriodMonth,
    timer: 'T-DASH-DUTY-202',
  },
  'DUTY-04': { shape: 'YYYY-MM', deadline: null, timer: null },
  'DUTY-05': { shape: 'YYYY', deadline: null, timer: null },
  'DUTY-07': {
    shape: 'YYYY',
    reference: 'previous',
    deadline: (period) => `${Number(period) + 1}-12-31`,
    timer: 'T-DASH-DUTY-206',
  },
  'DUTY-10': {
    shape: 'YYYY',
    reference: 'current',
    deadline: (period) => `${period}-12-31`,
    timer: 'T-DASH-DUTY-207',
  },
  'DUTY-PNATRANS': {
    shape: 'YYYY',
    reference: 'current',
    deadline: (period) => `${period}-04-30`,
    timer: 'T-DASH-DUTY-PNATRANS',
  },
};

/** Forma do período pelo `deadline_kind` (§7.1): mensal → `YYYY-MM`; anual e
 *  `undefined` (204, "anual, ano corrente") → `YYYY`; `per_event` →
 *  `YYYY-MM-DD`; `continuous`/`historical` → sem periodicidade (qualquer forma
 *  admitida pelo check da DDL). */
function shapeOf(
  duty: Pick<DutyRow, 'code' | 'deadline_kind'>,
): PeriodShape | null {
  const rule = DUTY_PERIOD_RULES[duty.code];
  if (rule) return rule.shape;
  switch (duty.deadline_kind) {
    case 'fixed_day':
    case 'monthly':
      return 'YYYY-MM';
    case 'annual_date':
    case 'undefined':
      return 'YYYY';
    case 'per_event':
      return 'YYYY-MM-DD';
    default:
      return null;
  }
}

function matchesShape(period: string, shape: PeriodShape): boolean {
  switch (shape) {
    case 'YYYY-MM':
      return MONTH_RE.test(period);
    case 'YYYY':
      return YEAR_RE.test(period);
    case 'YYYY-MM-DD':
      return DAY_RE.test(period);
  }
}

/** Deveres sem prazo legal ([RN-DASH-113]; §7.1): nunca recebem `deadline_on`. */
export function hasLegalDeadline(
  duty: Pick<DutyRow, 'code' | 'deadline_kind' | 'deadline_rule'>,
): boolean {
  if (
    ['undefined', 'continuous', 'historical', 'per_event'].includes(
      duty.deadline_kind,
    )
  ) {
    return false;
  }
  if (duty.deadline_rule === null) return false;
  const rule = DUTY_PERIOD_RULES[duty.code];
  return rule ? rule.deadline !== null : false;
}

/** Período anterior (A21 (2): imediatamente anterior). */
export function previousPeriodOf(period: string): string | null {
  const month = MONTH_RE.exec(period);
  if (month) {
    const y = Number(month[1]);
    const m = Number(month[2]);
    return m === 1 ? `${y - 1}-12` : `${y}-${pad(m - 1)}`;
  }
  if (YEAR_RE.test(period)) return String(Number(period) - 1);
  return null;
}

const TIMER_CODE_BY_DUTY: Readonly<Record<string, DashboardTimerCode>> =
  Object.fromEntries(
    Object.entries(DUTY_PERIOD_RULES)
      .filter(([, rule]) => rule.timer !== null)
      .map(([code, rule]) => [code, rule.timer!]),
  );

const AWAITING_STATES: readonly DutyState[] = [
  'JANELA_ABERTA',
  'EM_APURACAO',
  'PREPARADO',
];
const FULFILLED_STATES: readonly DutyState[] = [
  'SUBMETIDO_PUBLICADO',
  'COMPROVADO',
  'ARQUIVADO',
];

const isoOf = (value: Date | string | null | undefined): string | null =>
  value === null || value === undefined ? null : new Date(value).toISOString();

@Injectable()
export class DashboardDutyService {
  constructor(
    private readonly clock: DashboardClockService,
    private readonly alerts: DashboardAlertService,
  ) {}

  // -------------------------------------------------------------------------
  // regras puras (§7.1)
  // -------------------------------------------------------------------------

  /** `deadline_on` do período pela tabela de §7.1; `null` para deveres sem
   *  prazo legal, sem regra ou fora da tabela. */
  deadlineOnFor(duty: DutyRow, period: string): LocalDate | null {
    if (!hasLegalDeadline(duty)) return null;
    const rule = DUTY_PERIOD_RULES[duty.code];
    if (!rule || !rule.deadline || !matchesShape(period, rule.shape))
      return null;
    return rule.deadline(period);
  }

  /** `DASH.DUTY_PERIOD_INVALID` (400, `periodicity` = `deadline_kind`). */
  validatePeriod(duty: DutyRow, period: string): void {
    const shape = shapeOf(duty);
    const valid = shape
      ? matchesShape(period, shape)
      : MONTH_RE.test(period) || YEAR_RE.test(period) || DAY_RE.test(period);
    if (!valid) {
      throw new DetranError('DASH.DUTY_PERIOD_INVALID', {
        status: 400,
        context: { dutyId: duty.id, period, periodicity: duty.deadline_kind },
      });
    }
  }

  /** Período corrente de um dever com virada em `today` (§7.1/§7.2); `null`
   *  para deveres sem virada (`continuous`, `historical`, `per_event`). */
  currentPeriodFor(duty: DutyRow, today: LocalDate): string | null {
    const shape = shapeOf(duty);
    if (duty.deadline_kind === 'per_event' || shape === null) return null;
    const [year, month] = today.split('-').map(Number) as [number, number];
    if (shape === 'YYYY-MM') return `${year}-${pad(month)}`;
    if (shape === 'YYYY') {
      const rule = DUTY_PERIOD_RULES[duty.code];
      return String(rule?.reference === 'previous' ? year - 1 : year);
    }
    return null;
  }

  timerCodeFor(duty: Pick<DutyRow, 'code'>): DashboardTimerCode | null {
    return TIMER_CODE_BY_DUTY[duty.code] ?? null;
  }

  // -------------------------------------------------------------------------
  // §7.2 — virada
  // -------------------------------------------------------------------------

  async turnOver(
    tx: CycleSqlTransaction,
    today: LocalDate,
    ctx: CycleContext,
  ): Promise<{ opened: number; unfulfilled: number }> {
    const duties = await query<DutyRow>(
      tx,
      `select ${DUTY_COLUMNS} from dashboard.duty
        where tenant_id = $1 and deadline_kind in ('fixed_day', 'monthly', 'annual_date', 'undefined')
        order by code`,
      [ctx.tenantId],
    );
    let opened = 0;
    let unfulfilled = 0;
    for (const duty of duties.rows) {
      const period = this.currentPeriodFor(duty, today);
      if (!period) continue;
      const cycle = await this.openCycle(tx, duty, period, ctx);
      if (!cycle) continue;
      opened += 1;
      const previous = previousPeriodOf(period);
      if (!previous) continue;
      const earlier = await this.cycleByPair(
        tx,
        ctx.tenantId,
        duty.code,
        previous,
      );
      if (earlier && earlier.state === 'ATRASADO') {
        const transitions = await loadDutyTransitions(tx);
        assertDutyTransition(
          transitions,
          { state: earlier.state, dutyId: duty.id, period: previous },
          'NAO_CUMPRIDO',
          'system',
        );
        await this.applyTransition(
          tx,
          duty,
          earlier,
          'NAO_CUMPRIDO',
          { unfulfilled_at: ctx.now.toISOString() },
          ctx,
        );
        unfulfilled += 1;
      }
    }
    return { opened, unfulfilled };
  }

  /** Cria `JANELA_ABERTA` para `(duty, period)` se não existe (chave única
   *  `ux_dashboard_duty_cycle_period`); arma o timer quando há
   *  `deadline_on`; publica `DEVER_JANELA_ABERTA`. `null` quando já existia. */
  private async openCycle(
    tx: CycleSqlTransaction,
    duty: DutyRow,
    period: string,
    ctx: CycleContext,
  ): Promise<DutyCycleRow | null> {
    const deadlineOn = this.deadlineOnFor(duty, period);
    const inserted = await query<DutyCycleRow>(
      tx,
      `insert into dashboard.duty_cycle
         (tenant_id, duty_code, period, state, deadline_on, opened_at)
       values ($1, $2, $3, 'JANELA_ABERTA', $4, $5)
       on conflict (tenant_id, duty_code, period) do nothing
       returning ${CYCLE_COLUMNS}`,
      [ctx.tenantId, duty.code, period, deadlineOn, ctx.now.toISOString()],
    );
    const cycle = inserted.rows[0];
    if (!cycle) return null;
    await this.publishCycle(tx, duty, cycle, null, 'JANELA_ABERTA', ctx);
    const timerCode = this.timerCodeFor(duty);
    if (deadlineOn && timerCode) {
      const timer = await this.clock.arm(tx, ctx.tenantId, ctx.tz, {
        ownerKind: 'duty_cycle',
        ownerId: cycle.id,
        code: timerCode,
        startedAt: ctx.now,
        deadlineOn,
      });
      // Período aberto depois da data-limite (catch-up do sweeper): o timer
      // nasce vencido e o ciclo vai a `ATRASADO` na mesma transação.
      if (timer.dueAt && timer.dueAt.getTime() <= ctx.now.getTime()) {
        await this.onTimerFired(tx, timer, ctx);
      }
    }
    return cycle;
  }

  // -------------------------------------------------------------------------
  // §13.3 passo 1 — `T-DASH-DUTY-*` vencido
  // -------------------------------------------------------------------------

  /** Estado ∈ {JANELA_ABERTA, EM_APURACAO, PREPARADO} → `ATRASADO`
   *  (`late_at`, `DEVER_ATRASADO`) e detector (§6.2: `CRITICO`; DUTY-02 →
   *  `TETO`, OD-D41); estados posteriores → timer `SATISFEITO`
   *  (`cycle_advanced`) sem efeito. Devolve `true` quando venceu o timer. */
  async onTimerFired(
    tx: CycleSqlTransaction,
    timer: DashboardTimer,
    ctx: CycleContext,
  ): Promise<boolean> {
    const cycle = await this.cycleById(tx, ctx.tenantId, timer.ownerId);
    if (!cycle) return this.clock.fire(tx, ctx.tenantId, timer.id, ctx.now);
    if (!AWAITING_STATES.includes(cycle.state)) {
      await this.clock.satisfy(
        tx,
        ctx.tenantId,
        timer.id,
        'cycle_advanced',
        ctx.now,
      );
      return false;
    }
    if (!(await this.clock.fire(tx, ctx.tenantId, timer.id, ctx.now)))
      return false;
    const duty = await this.dutyByCode(tx, ctx.tenantId, cycle.duty_code);
    if (!duty) return true;
    const transitions = await loadDutyTransitions(tx);
    assertDutyTransition(
      transitions,
      { state: cycle.state, dutyId: duty.id, period: cycle.period },
      'ATRASADO',
      'system',
    );
    await this.applyTransition(
      tx,
      duty,
      cycle,
      'ATRASADO',
      { late_at: ctx.now.toISOString() },
      ctx,
    );
    const cell = await this.cellFor(tx, duty, cycle, ctx);
    if (cell) await this.alerts.detect(tx, cell, ctx);
    return true;
  }

  // -------------------------------------------------------------------------
  // §13.3 passo 4 — células de dever do fallback
  // -------------------------------------------------------------------------

  /** Ciclos não terminais com `deadline_on`, já abertos (`opened_at ≤ now`)
   *  e dever com `indicator_code` (DUTY-PNATRANS sem indicador ⇒ sem alerta,
   *  OD-D45). Nível pela fração decorrida da janela `[opened_at, fim do dia
   *  deadline_on]` (marcos 50/75/90 → N1/N2/N3); `ATRASADO` → `CRITICO`
   *  (DUTY-02 → `TETO`); cumpridos → `SEM_RISCO`. */
  async fallbackCells(
    tx: CycleSqlTransaction,
    ctx: CycleContext,
  ): Promise<DetectionCell[]> {
    const cycles = await query<DutyCycleRow>(
      tx,
      `select ${CYCLE_COLUMNS} from dashboard.duty_cycle
        where tenant_id = $1 and deadline_on is not null
          and state not in ('ARQUIVADO', 'NAO_CUMPRIDO') and opened_at <= $2
        order by duty_code, period`,
      [ctx.tenantId, ctx.now.toISOString()],
    );
    const duties = new Map<string, DutyRow | null>();
    const cells: DetectionCell[] = [];
    for (const cycle of cycles.rows) {
      if (!duties.has(cycle.duty_code)) {
        duties.set(
          cycle.duty_code,
          await this.dutyByCode(tx, ctx.tenantId, cycle.duty_code),
        );
      }
      const duty = duties.get(cycle.duty_code);
      if (!duty) continue;
      const cell = await this.cellFor(tx, duty, cycle, ctx);
      if (cell) cells.push(cell);
    }
    return cells;
  }

  /** Célula de um ciclo (§6.2 bloco B). `null` sem `indicator_code`. */
  async cellFor(
    tx: CycleSqlTransaction,
    duty: DutyRow,
    cycle: DutyCycleRow,
    ctx: CycleContext,
  ): Promise<DetectionCell | null> {
    if (!duty.indicator_code) return null;
    const indicator = await query<{ source_app: string }>(
      tx,
      `select source_app from dashboard.indicator where tenant_id = $1 and code = $2`,
      [ctx.tenantId, duty.indicator_code],
    );
    const sourceApp = indicator.rows[0]?.source_app ?? 'institucional';
    const deadlineOn = localDateOf(cycle.deadline_on);
    const windowStart = new Date(cycle.opened_at);
    const windowEnd = deadlineOn ? endOfCivilDay(deadlineOn, ctx.tz) : null;
    return {
      projection: 'dashboard.duty_cycle',
      indicatorCode: duty.indicator_code,
      sourceApp,
      objectKind: 'duty_cycle',
      objectRef: cycle.id,
      objectLayer: 'N0',
      level: this.levelOf(duty, cycle, windowStart, windowEnd, ctx.now),
      ownerRole: duty.owner_role,
      windowStart,
      windowEnd: windowEnd ?? undefined,
      occurredAt: ctx.now,
    };
  }

  private levelOf(
    duty: DutyRow,
    cycle: DutyCycleRow,
    windowStart: Date,
    windowEnd: Date | null,
    now: Date,
  ): DetectionLevel {
    if (FULFILLED_STATES.includes(cycle.state)) return 'SEM_RISCO';
    if (cycle.state === 'ATRASADO' || cycle.state === 'NAO_CUMPRIDO') {
      return duty.code === 'DUTY-02' ? 'TETO' : 'CRITICO';
    }
    if (!windowEnd) return 'SEM_RISCO';
    const span = windowEnd.getTime() - windowStart.getTime();
    if (span <= 0) return 'SEM_RISCO';
    const fraction = ((now.getTime() - windowStart.getTime()) / span) * 100;
    let level: DetectionLevel = 'SEM_RISCO';
    for (const milestone of MILESTONE_TIMERS) {
      if (fraction >= milestone.pct) level = milestone.severity;
    }
    return level;
  }

  // -------------------------------------------------------------------------
  // §7.3 — comandos
  // -------------------------------------------------------------------------

  /** `POST duties/{id}/cycles/{period}/start`: `dutyId` + `period`; dever
   *  `per_event` sem ciclo → cria `JANELA_ABERTA` e avança na mesma transação. */
  async start(
    tx: CycleSqlTransaction,
    dutyId: string,
    period: string,
    ifMatch: string | undefined,
    ctx: CycleContext,
  ): Promise<DutyCycleView> {
    const duty = await this.requireDuty(tx, ctx.tenantId, dutyId);
    this.validatePeriod(duty, period);
    let cycle = await this.cycleByPair(tx, ctx.tenantId, duty.code, period);
    const transitions = await loadDutyTransitions(tx);
    if (!cycle) {
      if (duty.deadline_kind !== 'per_event') {
        throw new DetranError('DASH.TENANT_MISMATCH', {
          status: 404,
          context: { dutyId, period },
        });
      }
      this.assertOwner(duty, ctx);
      cycle = (await this.openCycle(tx, duty, period, ctx))!;
    } else {
      assertDashIfMatch(ifMatch, Number(cycle.version));
      assertDutyTransition(
        transitions,
        { state: cycle.state, dutyId: duty.id, period },
        'EM_APURACAO',
        'dash-duty-owner',
      );
      this.assertOwner(duty, ctx);
    }
    await this.applyTransition(
      tx,
      duty,
      cycle,
      'EM_APURACAO',
      { started_at: ctx.now.toISOString() },
      ctx,
    );
    return this.viewOf(tx, duty, cycle);
  }

  async prepare(
    tx: CycleSqlTransaction,
    cycleId: string,
    input: PrepareDutyDto,
    ifMatch: string | undefined,
    ctx: CycleContext,
  ): Promise<DutyCycleView> {
    const { duty, cycle } = await this.guard(
      tx,
      cycleId,
      ifMatch,
      'PREPARADO',
      'dash-duty-owner',
      ctx,
      true,
    );
    const dto = parseDto(PrepareDutySchema, input);
    const patch: Record<string, unknown> = {
      prepared_at: ctx.now.toISOString(),
      draft_ref: dto.draftRef ?? null,
    };
    if (dto.deadlineOn !== undefined) {
      if (!hasLegalDeadline(duty)) {
        throw new DetranError('DASH.DUTY_NO_LEGAL_DEADLINE', {
          status: 422,
          context: { dutyId: duty.id, period: cycle.period },
        });
      }
      patch.deadline_on = dto.deadlineOn;
    }
    await this.applyTransition(tx, duty, cycle, 'PREPARADO', patch, ctx);
    return this.viewOf(tx, duty, cycle);
  }

  async submit(
    tx: CycleSqlTransaction,
    cycleId: string,
    input: SubmitDutyDto,
    ifMatch: string | undefined,
    ctx: CycleContext,
  ): Promise<DutyCycleView> {
    const { duty, cycle } = await this.guard(
      tx,
      cycleId,
      ifMatch,
      'SUBMETIDO_PUBLICADO',
      'dash-duty-owner',
      ctx,
      true,
    );
    const dto = parseDto(SubmitDutySchema, input);
    const submittedAt = dto.submittedAt ? new Date(dto.submittedAt) : ctx.now;
    if (submittedAt.getTime() > ctx.now.getTime()) {
      throw new DetranError('DASH.VALIDATION_FAILED', {
        status: 400,
        context: { dutyId: duty.id, field: 'submittedAt' },
      });
    }
    await this.applyTransition(
      tx,
      duty,
      cycle,
      'SUBMETIDO_PUBLICADO',
      {
        submitted_at: submittedAt.toISOString(),
        ...(dto.protocol !== undefined
          ? { evidence_protocol: dto.protocol }
          : {}),
      },
      ctx,
    );
    await this.settleTimersAndAlerts(tx, duty, cycle, ctx);
    return this.viewOf(tx, duty, cycle);
  }

  async prove(
    tx: CycleSqlTransaction,
    cycleId: string,
    input: ProveDutyDto,
    ifMatch: string | undefined,
    ctx: CycleContext,
  ): Promise<DutyCycleView> {
    const { duty, cycle } = await this.guard(
      tx,
      cycleId,
      ifMatch,
      'COMPROVADO',
      'dash-duty-owner',
      ctx,
      true,
    );
    const evidence = (input as { evidence?: { hash?: unknown } } | undefined)
      ?.evidence;
    const hash = evidence?.hash;
    if (typeof hash !== 'string' || hash.length === 0) {
      throw new DetranError('DASH.DUTY_EVIDENCE_REQUIRED', {
        status: 422,
        context: { dutyId: duty.id, period: cycle.period, missing: ['hash'] },
      });
    }
    if (!SHA256_HEX_PATTERN.test(hash)) {
      throw new DetranError('DASH.DUTY_EVIDENCE_HASH_INVALID', {
        status: 422,
        context: { dutyId: duty.id, period: cycle.period },
      });
    }
    const dto = parseDto(ProveDutySchema, input);
    await this.applyTransition(
      tx,
      duty,
      cycle,
      'COMPROVADO',
      {
        proved_at: ctx.now.toISOString(),
        evidence_hash: dto.evidence.hash,
        evidence_protocol: dto.evidence.protocol ?? cycle.evidence_protocol,
        evidence_capture_uri:
          dto.evidence.captureUri ?? cycle.evidence_capture_uri,
      },
      ctx,
    );
    await this.settleTimersAndAlerts(tx, duty, cycle, ctx);
    return this.viewOf(tx, duty, cycle);
  }

  /** `archive` (`dash-operator`/`agency-admin` pela política; não checa dono
   *  — §7.4; trilha = `actor` do evento, `actor_kind='user'`, OD-D19(d)). */
  async archive(
    tx: CycleSqlTransaction,
    cycleId: string,
    input: ArchiveDutyDto,
    ifMatch: string | undefined,
    ctx: CycleContext,
  ): Promise<DutyCycleView> {
    const { duty, cycle } = await this.guard(
      tx,
      cycleId,
      ifMatch,
      'ARQUIVADO',
      undefined,
      ctx,
      false,
    );
    parseDto(ArchiveDutySchema, input);
    await this.applyTransition(
      tx,
      duty,
      cycle,
      'ARQUIVADO',
      { archived_at: ctx.now.toISOString() },
      ctx,
    );
    return this.viewOf(tx, duty, cycle);
  }

  // -------------------------------------------------------------------------
  // leituras auxiliares (para a superfície)
  // -------------------------------------------------------------------------

  async findCycle(
    tx: CycleSqlTransaction,
    tenantId: string,
    dutyId: string,
    period: string,
  ): Promise<DutyCycleView | null> {
    const duty = await this.dutyById(tx, tenantId, dutyId);
    if (!duty) return null;
    const cycle = await this.cycleByPair(tx, tenantId, duty.code, period);
    if (!cycle) return null;
    return this.viewOf(tx, duty, cycle);
  }

  async viewOf(
    tx: CycleSqlTransaction,
    duty: DutyRow,
    cycle: DutyCycleRow,
  ): Promise<DutyCycleView> {
    const fresh = await this.cycleById(tx, cycle.tenant_id, cycle.id);
    const row = fresh ?? cycle;
    return {
      id: row.id,
      dutyId: duty.id,
      dutyCode: row.duty_code,
      indicatorCode: duty.indicator_code,
      period: row.period,
      state: row.state,
      deadlineOn: localDateOf(row.deadline_on),
      late: row.late_at !== null,
      timestamps: {
        openedAt: new Date(row.opened_at).toISOString(),
        startedAt: isoOf(row.started_at),
        preparedAt: isoOf(row.prepared_at),
        submittedAt: isoOf(row.submitted_at),
        provedAt: isoOf(row.proved_at),
        archivedAt: isoOf(row.archived_at),
        lateAt: isoOf(row.late_at),
        unfulfilledAt: isoOf(row.unfulfilled_at),
      },
      draftRef: row.draft_ref,
      evidence: {
        protocol: row.evidence_protocol,
        captureUri: row.evidence_capture_uri,
        hash: row.evidence_hash,
      },
      version: Number(row.version),
      meta: await this.alerts.freshnessMeta(
        tx,
        row.tenant_id,
        duty.indicator_code ? [duty.indicator_code] : [],
      ),
    };
  }

  // -------------------------------------------------------------------------
  // internos
  // -------------------------------------------------------------------------

  /** Guardas 1–4 de §7.3 para os comandos por id de ciclo. */
  private async guard(
    tx: CycleSqlTransaction,
    cycleId: string,
    ifMatch: string | undefined,
    to: DutyState,
    actor: 'dash-duty-owner' | undefined,
    ctx: CycleContext,
    checkOwner: boolean,
  ): Promise<{
    duty: DutyRow;
    cycle: DutyCycleRow;
    transitions: readonly DutyTransitionRow[];
  }> {
    const cycle = await this.cycleById(tx, ctx.tenantId, cycleId);
    if (!cycle) {
      throw new DetranError('DASH.TENANT_MISMATCH', {
        status: 404,
        context: { dutyCycleId: cycleId },
      });
    }
    const duty = await this.dutyByCode(tx, ctx.tenantId, cycle.duty_code);
    if (!duty) {
      throw new DetranError('DASH.TENANT_MISMATCH', {
        status: 404,
        context: { dutyCycleId: cycleId, dutyCode: cycle.duty_code },
      });
    }
    assertDashIfMatch(ifMatch, Number(cycle.version));
    const transitions = await loadDutyTransitions(tx);
    assertDutyTransition(
      transitions,
      { state: cycle.state, dutyId: duty.id, period: cycle.period },
      to,
      actor,
    );
    if (checkOwner) this.assertOwner(duty, ctx);
    return { duty, cycle, transitions };
  }

  /** §7.4 — `duty.owner_role` entre os papéis do principal ou `agency-admin`. */
  private assertOwner(duty: DutyRow, ctx: CycleContext): void {
    const roles = ctx.actor.roles;
    if (roles.includes(duty.owner_role) || roles.includes(AGENCY_ADMIN_ROLE))
      return;
    throw new DetranError('DASH.DUTY_NOT_OWNER', {
      status: 403,
      context: { dutyId: duty.id, ownerRole: duty.owner_role },
    });
  }

  /** Efeito comum: estado + carimbos + `version+1` + evento `DEVER_<estado>`. */
  private async applyTransition(
    tx: CycleSqlTransaction,
    duty: DutyRow,
    cycle: DutyCycleRow,
    to: DutyState,
    patch: Record<string, unknown>,
    ctx: CycleContext,
  ): Promise<void> {
    const columns = Object.keys(patch);
    const setClauses = columns.map(
      (column, index) => `${column} = $${index + 5}`,
    );
    const updated = await query<{ version: number }>(
      tx,
      `update dashboard.duty_cycle
          set state = $3, version = version + 1, updated_at = $4${setClauses.length ? ', ' : ''}${setClauses.join(', ')}
        where tenant_id = $1 and id = $2
        returning version`,
      [
        ctx.tenantId,
        cycle.id,
        to,
        ctx.now.toISOString(),
        ...columns.map((c) => patch[c]),
      ],
    );
    const fromState = cycle.state;
    Object.assign(cycle, patch, {
      state: to,
      version: Number(updated.rows[0]?.version ?? Number(cycle.version) + 1),
    });
    await this.publishCycle(tx, duty, cycle, fromState, to, ctx);
  }

  private async publishCycle(
    tx: CycleSqlTransaction,
    duty: DutyRow,
    cycle: DutyCycleRow,
    fromState: DutyState | null,
    toState: DutyState,
    ctx: CycleContext,
  ): Promise<void> {
    await publish(
      tx,
      envelopeOf({
        type: DASHBOARD_EVENT_TYPES.dutyChanged,
        domainEvent: `DEVER_${toState}`,
        tenantId: ctx.tenantId,
        occurredAt: ctx.now,
        actor: { kind: ctx.actor.kind, id: ctx.actor.id, role: ctx.actor.role },
        correlationId: ctx.requestId,
        aggregate: {
          kind: 'duty_cycle',
          id: cycle.id,
          version: Number(cycle.version),
        },
        data: {
          dutyCycleId: cycle.id,
          dutyCode: cycle.duty_code,
          indicatorCode: duty.indicator_code,
          period: cycle.period,
          fromState,
          toState,
          deadlineOn: localDateOf(cycle.deadline_on),
          late: cycle.late_at !== null && cycle.late_at !== undefined,
          evidenceHash:
            toState === 'COMPROVADO'
              ? (cycle.evidence_hash ?? undefined)
              : undefined,
          occurredAt: ctx.now.toISOString(),
        },
      }),
    );
  }

  /** `submit`/`prove`: `T-DASH-DUTY-*` do ciclo → `SATISFEITO`
   *  (`cycle_advanced`); alertas de marco abertos do ciclo → §6.5 com
   *  `SEM_RISCO`. */
  private async settleTimersAndAlerts(
    tx: CycleSqlTransaction,
    duty: DutyRow,
    cycle: DutyCycleRow,
    ctx: CycleContext,
  ): Promise<void> {
    await this.clock.satisfyAll(
      tx,
      ctx.tenantId,
      'duty_cycle',
      cycle.id,
      'cycle_advanced',
      ctx.now,
      'T-DASH-DUTY-',
    );
    if (duty.indicator_code) {
      await this.alerts.normalizeObject(
        tx,
        duty.indicator_code,
        'duty_cycle',
        cycle.id,
        null,
        ctx,
      );
    }
  }

  private async requireDuty(
    tx: CycleSqlTransaction,
    tenantId: string,
    dutyId: string,
  ): Promise<DutyRow> {
    const duty = await this.dutyById(tx, tenantId, dutyId);
    if (!duty) {
      throw new DetranError('DASH.TENANT_MISMATCH', {
        status: 404,
        context: { dutyId },
      });
    }
    return duty;
  }

  private async dutyById(
    tx: CycleSqlTransaction,
    tenantId: string,
    dutyId: string,
  ): Promise<DutyRow | null> {
    const result = await query<DutyRow>(
      tx,
      `select ${DUTY_COLUMNS} from dashboard.duty where tenant_id = $1 and id = $2`,
      [tenantId, dutyId],
    );
    return result.rows[0] ?? null;
  }

  private async dutyByCode(
    tx: CycleSqlTransaction,
    tenantId: string,
    code: string,
  ): Promise<DutyRow | null> {
    const result = await query<DutyRow>(
      tx,
      `select ${DUTY_COLUMNS} from dashboard.duty where tenant_id = $1 and code = $2`,
      [tenantId, code],
    );
    return result.rows[0] ?? null;
  }

  private async cycleById(
    tx: CycleSqlTransaction,
    tenantId: string,
    cycleId: string,
  ): Promise<DutyCycleRow | null> {
    const result = await query<DutyCycleRow>(
      tx,
      `select ${CYCLE_COLUMNS} from dashboard.duty_cycle where tenant_id = $1 and id = $2`,
      [tenantId, cycleId],
    );
    return result.rows[0] ?? null;
  }

  private async cycleByPair(
    tx: CycleSqlTransaction,
    tenantId: string,
    dutyCode: string,
    period: string,
  ): Promise<DutyCycleRow | null> {
    const result = await query<DutyCycleRow>(
      tx,
      `select ${CYCLE_COLUMNS} from dashboard.duty_cycle
        where tenant_id = $1 and duty_code = $2 and period = $3`,
      [tenantId, dutyCode, period],
    );
    return result.rows[0] ?? null;
  }
}
