// Relógio próprio do DASHBOARD (CTG-0002 §13.1, §13.2, §6.8; plan M15 — via
// M7/A3: `Clock`/`Calendar` de `@detran/inf-deadlines` só como dependência
// de leitura; integração ao motor de prazos fica para OD-D28). Timers em
// `dashboard.timer`, idempotentes por `ux_dashboard_timer_arm`
// `(tenant_id, owner_kind, owner_id, code, started_at)`. `due_at` por
// `duration_unit` de `timer_ref` (§13.2): `horas_uteis` = horas de relógio
// cujo dia civil no fuso do tenant é dia útil pelo `Calendar` (OD-D44);
// `imediato` = `started_at`; `percentual` = `started_at + pct/100 ×
// (windowEnd − started_at)` (sem `windowEnd` ⇒ nulo, nunca vence);
// `data_fixa`/`mensal`/`anual` = fim do dia civil `deadlineOn` no fuso do
// tenant (`23:59:59.999`), sem adiamento em dia não útil (OD-D55);
// `dias_corridos` = `started_at + n dias` (idade, não prazo). Nenhum
// relógio de sistema: o relógio é injetado; `now` das operações é parâmetro.
import { Inject, Injectable } from '@nestjs/common';
import type { Calendar, Clock, LocalDate } from '@detran/inf-deadlines';

import {
  DASHBOARD_CALENDAR,
  DASHBOARD_CLOCK,
  DASHBOARD_TIMER_DEFINITIONS,
  type DashboardTimerCode,
  type DashboardTimerOwnerKind,
  type DashboardTimerStatus,
  query,
  type CycleSqlTransaction,
} from './tokens.js';

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

export interface DashboardTimer {
  id: string;
  tenantId: string;
  ownerKind: DashboardTimerOwnerKind;
  ownerId: string;
  code: DashboardTimerCode;
  startedAt: Date;
  dueAt: Date | null;
  status: DashboardTimerStatus;
  firedAt: Date | null;
  satisfiedAt: Date | null;
  cancelledAt: Date | null;
  reason: string | null;
  version: number;
}

export interface ArmDashboardTimer {
  ownerKind: DashboardTimerOwnerKind;
  ownerId: string;
  code: DashboardTimerCode;
  startedAt: Date;
  /** `data_fixa`/`mensal`/`anual`: a data-limite civil (§7.1). */
  deadlineOn?: LocalDate | null;
  /** `percentual`: fim da janela. */
  windowEnd?: Date | null;
}

interface TimerRow extends Record<string, unknown> {
  id: string;
  tenant_id: string;
  owner_kind: DashboardTimerOwnerKind;
  owner_id: string;
  code: DashboardTimerCode;
  started_at: Date;
  due_at: Date | null;
  status: DashboardTimerStatus;
  fired_at: Date | null;
  satisfied_at: Date | null;
  cancelled_at: Date | null;
  reason: string | null;
  version: number;
}

const TIMER_COLUMNS = `id, tenant_id, owner_kind, owner_id, code, started_at, due_at, status,
       fired_at, satisfied_at, cancelled_at, reason, version`;

function timerOf(row: TimerRow): DashboardTimer {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    ownerKind: row.owner_kind,
    ownerId: row.owner_id,
    code: row.code,
    startedAt: new Date(row.started_at),
    dueAt: row.due_at === null ? null : new Date(row.due_at),
    status: row.status,
    firedAt: row.fired_at === null ? null : new Date(row.fired_at),
    satisfiedAt: row.satisfied_at === null ? null : new Date(row.satisfied_at),
    cancelledAt: row.cancelled_at === null ? null : new Date(row.cancelled_at),
    reason: row.reason,
    version: Number(row.version),
  };
}

// ---------------------------------------------------------------------------
// datas civis no fuso do tenant (puras)
// ---------------------------------------------------------------------------

interface CivilParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(tz: string): Intl.DateTimeFormat {
  let formatter = formatters.get(tz);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    formatters.set(tz, formatter);
  }
  return formatter;
}

function civilPartsOf(instant: Date, tz: string): CivilParts {
  const values = Object.fromEntries(
    formatterFor(tz)
      .formatToParts(instant)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  ) as Record<string, number>;
  return {
    year: values.year!,
    month: values.month!,
    day: values.day!,
    hour: values.hour!,
    minute: values.minute!,
    second: values.second!,
  };
}

/** Deslocamento (ms) do fuso no instante: `civil como UTC − instante`. */
function offsetMsAt(instant: Date, tz: string): number {
  const p = civilPartsOf(instant, tz);
  const asUtc = Date.UTC(
    p.year,
    p.month - 1,
    p.day,
    p.hour,
    p.minute,
    p.second,
  );
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** Data civil `YYYY-MM-DD` de um instante no fuso do tenant. */
export function civilDateOf(instant: Date, tz: string): LocalDate {
  const p = civilPartsOf(instant, tz);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/** Instante de uma data-hora civil no fuso do tenant (duas iterações de
 *  correção do deslocamento — forma de `boat-renaest-job.service.ts`). */
export function zonedInstant(
  date: LocalDate,
  tz: string,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
): Date {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const civilAsUtc = Date.UTC(y, m - 1, d, hour, minute, second, millisecond);
  let guess = civilAsUtc;
  for (let i = 0; i < 2; i += 1) {
    guess = civilAsUtc - offsetMsAt(new Date(guess), tz);
  }
  return new Date(guess);
}

/** Início do dia civil (`00:00:00.000`). */
export function startOfCivilDay(date: LocalDate, tz: string): Date {
  return zonedInstant(date, tz);
}

/** Fim do dia civil (`23:59:59.999`, §13.2). */
export function endOfCivilDay(date: LocalDate, tz: string): Date {
  return zonedInstant(date, tz, 23, 59, 59, 999);
}

/** `YYYY-MM-DD` + n dias (aritmética civil em UTC, sem fuso). */
export function addDays(date: LocalDate, days: number): LocalDate {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

// ---------------------------------------------------------------------------
// serviço
// ---------------------------------------------------------------------------

@Injectable()
export class DashboardClockService {
  constructor(
    @Inject(DASHBOARD_CLOCK) private readonly clock: Clock,
    @Inject(DASHBOARD_CALENDAR) private readonly calendar: Calendar,
  ) {}

  now(): Date {
    return this.clock.now();
  }

  today(tz: string): LocalDate {
    return this.clock.today(tz);
  }

  /** Idempotente por `(tenant, ownerKind, ownerId, code, startedAt)`:
   *  existente ⇒ devolve sem inserir. `due_at` por §13.2. */
  async arm(
    tx: CycleSqlTransaction,
    tenantId: string,
    tz: string,
    input: ArmDashboardTimer,
  ): Promise<DashboardTimer> {
    const computed = await this.computeDue(tz, tenantId, input.code, input);
    // Data-limite já passada quando o timer é armado (ex. período aberto
    // pelo sweeper depois de `deadline_on`): nasce vencido — `due_at =
    // started_at` (check `ck_dashboard_timer_due_after_start`; OD no
    // relatório).
    const dueAt =
      computed && computed.getTime() < input.startedAt.getTime()
        ? new Date(input.startedAt.getTime())
        : computed;
    const inserted = await query<TimerRow>(
      tx,
      `insert into dashboard.timer
         (tenant_id, owner_kind, owner_id, code, started_at, due_at, status)
       values ($1, $2, $3, $4, $5, $6, 'ARMADO')
       on conflict (tenant_id, owner_kind, owner_id, code, started_at) do nothing
       returning ${TIMER_COLUMNS}`,
      [
        tenantId,
        input.ownerKind,
        input.ownerId,
        input.code,
        input.startedAt.toISOString(),
        dueAt === null ? null : dueAt.toISOString(),
      ],
    );
    if (inserted.rows[0]) return timerOf(inserted.rows[0]);
    const existing = await query<TimerRow>(
      tx,
      `select ${TIMER_COLUMNS}
         from dashboard.timer
        where tenant_id = $1 and owner_kind = $2 and owner_id = $3
          and code = $4 and started_at = $5`,
      [
        tenantId,
        input.ownerKind,
        input.ownerId,
        input.code,
        input.startedAt.toISOString(),
      ],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new Error(
        `dashboard.timer: arm sem linha após on conflict (${input.code})`,
      );
    }
    return timerOf(row);
  }

  /** ARMADO → SATISFEITO (outro estado ⇒ no-op). */
  async satisfy(
    tx: CycleSqlTransaction,
    tenantId: string,
    timerId: string,
    reason: string,
    at: Date = this.clock.now(),
  ): Promise<void> {
    await query(
      tx,
      `update dashboard.timer
          set status = 'SATISFEITO', satisfied_at = $3, reason = $4,
              version = version + 1, updated_at = $3
        where tenant_id = $1 and id = $2 and status = 'ARMADO'`,
      [tenantId, timerId, at.toISOString(), reason],
    );
  }

  /** ARMADO → CANCELADO (outro estado ⇒ no-op). */
  async cancel(
    tx: CycleSqlTransaction,
    tenantId: string,
    timerId: string,
    reason: string,
    at: Date = this.clock.now(),
  ): Promise<void> {
    await query(
      tx,
      `update dashboard.timer
          set status = 'CANCELADO', cancelled_at = $3, reason = $4,
              version = version + 1, updated_at = $3
        where tenant_id = $1 and id = $2 and status = 'ARMADO'`,
      [tenantId, timerId, at.toISOString(), reason],
    );
  }

  /** Cancela todos os ARMADO do dono; devolve quantos. */
  async cancelAll(
    tx: CycleSqlTransaction,
    tenantId: string,
    ownerKind: DashboardTimerOwnerKind,
    ownerId: string,
    reason: string,
    at: Date = this.clock.now(),
  ): Promise<number> {
    const result = await query(
      tx,
      `update dashboard.timer
          set status = 'CANCELADO', cancelled_at = $4, reason = $5,
              version = version + 1, updated_at = $4
        where tenant_id = $1 and owner_kind = $2 and owner_id = $3
          and status = 'ARMADO'`,
      [tenantId, ownerKind, ownerId, at.toISOString(), reason],
    );
    return result.rowCount ?? 0;
  }

  /** Satisfaz todos os ARMADO do dono (opcionalmente só um prefixo de
   *  código, ex. `T-DASH-ACK-`); devolve quantos. */
  async satisfyAll(
    tx: CycleSqlTransaction,
    tenantId: string,
    ownerKind: DashboardTimerOwnerKind,
    ownerId: string,
    reason: string,
    at: Date,
    codePrefix?: string,
  ): Promise<number> {
    const result = await query(
      tx,
      `update dashboard.timer
          set status = 'SATISFEITO', satisfied_at = $4, reason = $5,
              version = version + 1, updated_at = $4
        where tenant_id = $1 and owner_kind = $2 and owner_id = $3
          and status = 'ARMADO' and code like $6`,
      [
        tenantId,
        ownerKind,
        ownerId,
        at.toISOString(),
        reason,
        `${codePrefix ?? ''}%`,
      ],
    );
    return result.rowCount ?? 0;
  }

  /** ARMADO com `due_at ≤ now`, ordem `(due_at, id)`, `limit`; nunca `due_at` nulo. */
  async due(
    tx: CycleSqlTransaction,
    tenantId: string,
    now: Date,
    limit = 500,
  ): Promise<DashboardTimer[]> {
    const result = await query<TimerRow>(
      tx,
      `select ${TIMER_COLUMNS}
         from dashboard.timer
        where tenant_id = $1 and status = 'ARMADO'
          and due_at is not null and due_at <= $2
        order by due_at, id
        limit $3`,
      [tenantId, now.toISOString(), limit],
    );
    return result.rows.map(timerOf);
  }

  /** ARMADO → VENCIDO com `fired_at = now`; `false` quando já não estava
   *  ARMADO (idempotência do sweeper). */
  async fire(
    tx: CycleSqlTransaction,
    tenantId: string,
    timerId: string,
    now: Date,
  ): Promise<boolean> {
    const result = await query(
      tx,
      `update dashboard.timer
          set status = 'VENCIDO', fired_at = $3, version = version + 1,
              updated_at = $3
        where tenant_id = $1 and id = $2 and status = 'ARMADO'`,
      [tenantId, timerId, now.toISOString()],
    );
    return (result.rowCount ?? 0) > 0;
  }

  /** Timers de um dono (todos os estados), ordem `(started_at, code)`. */
  async listByOwner(
    tx: CycleSqlTransaction,
    tenantId: string,
    ownerKind: DashboardTimerOwnerKind,
    ownerId: string,
  ): Promise<DashboardTimer[]> {
    const result = await query<TimerRow>(
      tx,
      `select ${TIMER_COLUMNS}
         from dashboard.timer
        where tenant_id = $1 and owner_kind = $2 and owner_id = $3
        order by started_at, code`,
      [tenantId, ownerKind, ownerId],
    );
    return result.rows.map(timerOf);
  }

  /** Regra de `due_at` por `duration_unit` (§13.2; §6.8 para `horas_uteis`). */
  async computeDue(
    tz: string,
    tenantId: string,
    code: DashboardTimerCode,
    input: ArmDashboardTimer,
  ): Promise<Date | null> {
    const definition = DASHBOARD_TIMER_DEFINITIONS[code];
    const startedAt = input.startedAt;
    switch (definition.unit) {
      case 'imediato':
        return new Date(startedAt.getTime());
      case 'horas_uteis':
        return this.addBusinessHours(
          startedAt,
          definition.value ?? 0,
          tz,
          tenantId,
        );
      case 'percentual': {
        const windowEnd = input.windowEnd ?? null;
        if (!windowEnd) return null;
        const span = windowEnd.getTime() - startedAt.getTime();
        return new Date(
          startedAt.getTime() + ((definition.value ?? 0) / 100) * span,
        );
      }
      case 'data_fixa':
      case 'mensal':
      case 'anual': {
        const deadlineOn = input.deadlineOn ?? null;
        if (!deadlineOn) return null;
        return endOfCivilDay(deadlineOn, tz);
      }
      case 'dias_corridos':
        return new Date(startedAt.getTime() + (definition.value ?? 0) * DAY_MS);
    }
  }

  /** §6.8: soma horas de relógio só em dias úteis do `Calendar` (o dia
   *  civil no fuso do tenant); horas em dia não útil não contam. */
  private async addBusinessHours(
    startedAt: Date,
    hours: number,
    tz: string,
    tenantId: string,
  ): Promise<Date> {
    let remaining = hours * HOUR_MS;
    let cursor = new Date(startedAt.getTime());
    let day = civilDateOf(cursor, tz);
    // Guarda contra calendário degenerado (nunca um dia útil).
    for (let guard = 0; guard < 3_660; guard += 1) {
      const dayEnd = startOfCivilDay(addDays(day, 1), tz);
      if (await this.calendar.isBusinessDay(day, tenantId)) {
        const available = dayEnd.getTime() - cursor.getTime();
        if (remaining <= available) {
          return new Date(cursor.getTime() + remaining);
        }
        remaining -= available;
      }
      cursor = dayEnd;
      day = addDays(day, 1);
    }
    throw new Error('dashboard.timer: calendário sem dia útil em 10 anos');
  }
}
