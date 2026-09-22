// Source events: rait.clock.flag-changed (RAIT_ALERTA_PRESCRICAO; rait-events-sse-contract §2.2 — sem produtor em main, OD-D17)
// Source events: rait.case.changed (RAIT_CASO_ESTADO_ALTERADO; §2.1; inf/rait-case)
// Source events: rait.case.received (RAIT_RECURSO_RECEBIDO_JULGADOR; §2.1; inf/rait-case)
// Source events: rait.assignment.changed (§2.2; inf/rait-worklist)
// Source events: inf.timer.expired (TIMER_VENCIDO; §2.4; inf/deadlines)
// Source events: inf.timer.rescheduled (TIMER_REPROGRAMADO; §2.4; inf/deadlines)
// Source events: inf.infraction.changed (INFRACAO_ESTADO_ALTERADO; §2.4; inf/infraction)
//
// Projeção `dashboard.prescription_risk` (CTG-0001 §2.14, §4.1.1; IND-DASH-
// 101…105; [RN-DASH-131] tabela de relógios). Uma célula por
// `(tenant_id, case_id, clock_code)`; `case_id` = `caseId`/`ownerId`/
// `infractionId` (uuid opaco, N2). Só os eventos que trazem o relógio
// (`clockCode` ou `timerCode` ∈ {T-DEC, T-JUL-24M, T-PAR-3A, T-PRESC-5A}) e o
// recebimento pelo julgador (`body` — início de T-JUL-24M, relógio B) criam
// células; `rait.case.changed`, `rait.assignment.changed` e
// `inf.infraction.changed` só tocam células existentes do caso (sem célula →
// `ignored: not_relevant`). `ceiling_on` vem só do evento (`ceilingOn`/
// `newDueOn`), nunca é calculado. Relógio B sem `instance` conhecida (jari/
// cetran) não tem indicador derivável (102/103) → `ignored: not_relevant`.
import {
  DashboardProjectorBase,
  optionalBoolean,
  optionalInteger,
  optionalText,
  requireText,
  type DashboardConsumedEvent,
  type DashboardEventVersions,
  type DashboardProjectionContext,
  type DashboardProjectionResult,
} from '../projection-contract.js';

export const consumedEvents = [
  'rait.clock.flag-changed',
  'rait.case.changed',
  'rait.case.received',
  'rait.assignment.changed',
  'inf.timer.expired',
  'inf.timer.rescheduled',
  'inf.infraction.changed',
] as const;

export const PROJECTION_NAME = 'dashboard.prescription_risk' as const;

/** Rótulos do despacho por índice do literal — os `type` técnicos `x.y.z` não
 *  se repetem como literal fora de `consumedEvents` (`verify:parameter-catalogue`
 *  leria cada um como chave de `ops.parameter`; precedente `portal/requests/
 *  events.ts`). */
const [
  CLOCK_FLAG_CHANGED,
  CASE_CHANGED,
  CASE_RECEIVED,
  ASSIGNMENT_CHANGED,
  TIMER_EXPIRED,
  TIMER_RESCHEDULED,
] = consumedEvents;

/** `timer_code → clock_code` (CTG-0001 §4.1.1; [RN-DASH-131]). */
export const PRESCRIPTION_TIMER_CLOCKS: Readonly<Record<string, ClockCode>> = {
  'T-DEC': 'A',
  'T-JUL-24M': 'B',
  'T-PAR-3A': 'C',
  'T-PRESC-5A': 'D',
};

/** `inf.infraction.changed.toState` que a projeção grava em `extinct_state`. */
export const PRESCRIPTION_EXTINCT_STATES = [
  'EXTINTO_DECADENCIA',
  'EXTINTO_PRESCRICAO',
] as const;

type ClockCode = 'A' | 'B' | 'C' | 'D';
type Instance = 'jari' | 'cetran';

const CLOCK_CODES: readonly ClockCode[] = ['A', 'B', 'C', 'D'];
const INSTANCES: readonly Instance[] = ['jari', 'cetran'];

/** `indicator_code` derivado ([RN-DASH-131]): A→101, B+jari→102, B+cetran→103,
 *  C→104, D→105; B sem instância conhecida → `null` (não derivável). */
export function prescriptionIndicatorCode(
  clockCode: ClockCode,
  instance: string | null,
): string | null {
  switch (clockCode) {
    case 'A':
      return 'IND-DASH-101';
    case 'B':
      if (instance === 'jari') return 'IND-DASH-102';
      if (instance === 'cetran') return 'IND-DASH-103';
      return null;
    case 'C':
      return 'IND-DASH-104';
    case 'D':
      return 'IND-DASH-105';
  }
}

interface CellRow extends Record<string, unknown> {
  id: string;
  clock_code: ClockCode;
  instance: string | null;
  last_event_id: string;
}

type Parsed =
  | {
      kind: 'flag-changed';
      caseId: string;
      clockId: string;
      clockCode: ClockCode;
      flag: string;
      daysRemaining: number | null;
      ceilingOn: string | null;
    }
  | {
      kind: 'case-changed';
      caseId: string;
      toState: string;
      instance: string | null;
    }
  | {
      kind: 'case-received';
      caseId: string;
      body: Instance;
      receivedOn: string;
    }
  | {
      kind: 'assignment';
      caseId: string;
      poolId: string | null;
      active: boolean;
    }
  | {
      kind: 'timer-expired';
      caseId: string;
      timerCode: string;
      dueOn: string;
      effect: string;
    }
  | {
      kind: 'timer-rescheduled';
      caseId: string;
      timerCode: string;
      newDueOn: string;
    }
  | { kind: 'infraction-changed'; caseId: string; toState: string };

const SELECT_CASE_CELLS = `select id, clock_code, instance, last_event_id
     from dashboard.prescription_risk
    where tenant_id = $1 and case_id = $2`;

const SELECT_CELL = `select id, clock_code, instance, last_event_id
     from dashboard.prescription_risk
    where tenant_id = $1 and case_id = $2 and clock_code = $3`;

export class PrescriptionRiskProjection extends DashboardProjectorBase<Parsed> {
  readonly projection = PROJECTION_NAME;
  readonly consumedEvents = consumedEvents;

  protected validate(event: DashboardConsumedEvent, eventKey: string): Parsed {
    const p = this.projection;
    switch (eventKey) {
      case CLOCK_FLAG_CHANGED: {
        const clockCode = requireText(p, event, 'clockCode');
        if (!CLOCK_CODES.includes(clockCode as ClockCode)) {
          throw this.invalid(event, 'data.clockCode');
        }
        return {
          kind: 'flag-changed',
          caseId: requireText(p, event, 'caseId'),
          clockId: requireText(p, event, 'clockId'),
          clockCode: clockCode as ClockCode,
          flag: requireText(p, event, 'toFlag'),
          daysRemaining: optionalInteger(p, event, 'daysRemaining'),
          ceilingOn: optionalText(p, event, 'ceilingOn'),
        };
      }
      case CASE_CHANGED:
        return {
          kind: 'case-changed',
          caseId: requireText(p, event, 'caseId'),
          toState: requireText(p, event, 'toState'),
          instance: optionalText(p, event, 'instance'),
        };
      case CASE_RECEIVED: {
        const body = requireText(p, event, 'body');
        if (!INSTANCES.includes(body as Instance)) {
          throw this.invalid(event, 'data.body');
        }
        return {
          kind: 'case-received',
          caseId: requireText(p, event, 'caseId'),
          body: body as Instance,
          receivedOn: requireText(p, event, 'receivedOn'),
        };
      }
      case ASSIGNMENT_CHANGED:
        return {
          kind: 'assignment',
          caseId: requireText(p, event, 'caseId'),
          poolId: optionalText(p, event, 'poolId'),
          active: optionalBoolean(p, event, 'active') ?? true,
        };
      case TIMER_EXPIRED:
        return {
          kind: 'timer-expired',
          caseId: requireText(p, event, 'ownerId'),
          timerCode: requireText(p, event, 'timerCode'),
          dueOn: requireText(p, event, 'dueOn'),
          effect: requireText(p, event, 'effect'),
        };
      case TIMER_RESCHEDULED:
        return {
          kind: 'timer-rescheduled',
          caseId: requireText(p, event, 'ownerId'),
          timerCode: requireText(p, event, 'timerCode'),
          newDueOn: requireText(p, event, 'newDueOn'),
        };
      default:
        return {
          kind: 'infraction-changed',
          caseId: requireText(p, event, 'infractionId'),
          toState: requireText(p, event, 'toState'),
        };
    }
  }

  protected async project(
    event: DashboardConsumedEvent,
    eventKey: string,
    parsed: Parsed,
    versions: DashboardEventVersions,
    ctx: DashboardProjectionContext,
  ): Promise<DashboardProjectionResult> {
    switch (parsed.kind) {
      case 'flag-changed':
        return this.upsertClockCell(event, eventKey, versions, ctx, {
          caseId: parsed.caseId,
          clockCode: parsed.clockCode,
          clockId: parsed.clockId,
          flag: parsed.flag,
          daysRemaining: parsed.daysRemaining,
          ceilingOn: parsed.ceilingOn,
          flagChangedAt: event.occurredAt,
        });
      case 'timer-expired': {
        const clockCode = PRESCRIPTION_TIMER_CLOCKS[parsed.timerCode];
        if (!clockCode) return this.ignored('not_relevant');
        return this.upsertClockCell(event, eventKey, versions, ctx, {
          caseId: parsed.caseId,
          clockCode,
          timerCode: parsed.timerCode,
          ceilingEffect: parsed.effect,
          ceilingReachedOn: parsed.dueOn,
        });
      }
      case 'timer-rescheduled': {
        const clockCode = PRESCRIPTION_TIMER_CLOCKS[parsed.timerCode];
        if (!clockCode) return this.ignored('not_relevant');
        return this.upsertClockCell(event, eventKey, versions, ctx, {
          caseId: parsed.caseId,
          clockCode,
          timerCode: parsed.timerCode,
          ceilingOn: parsed.newDueOn,
        });
      }
      case 'case-received': {
        // Recebimento pelo julgador inicia T-JUL-24M (relógio B) e fixa a
        // instância (`body`); as demais células do caso recebem received_on.
        const created = await this.upsertClockCell(
          event,
          eventKey,
          versions,
          ctx,
          {
            caseId: parsed.caseId,
            clockCode: 'B',
            instance: parsed.body,
            receivedOn: parsed.receivedOn,
          },
        );
        const touched = await this.updateCaseCells(
          event,
          eventKey,
          versions,
          ctx,
          parsed.caseId,
          (cell) =>
            cell.clock_code === 'B'
              ? null
              : {
                  set: 'received_on = $2, instance = $3',
                  values: [parsed.receivedOn, parsed.body],
                },
        );
        const cells =
          (created.kind === 'applied' ? created.cells : 0) +
          (touched.kind === 'applied' ? touched.cells : 0);
        if (cells > 0) return this.applied(cells);
        return created.kind === 'ignored' ? created : touched;
      }
      case 'case-changed':
        return this.updateCaseCells(
          event,
          eventKey,
          versions,
          ctx,
          parsed.caseId,
          (cell) => {
            const instance = parsed.instance ?? cell.instance ?? null;
            const indicatorCode = prescriptionIndicatorCode(
              cell.clock_code,
              instance,
            );
            if (indicatorCode === null) return null;
            return {
              set: 'case_state = $2, instance = $3, indicator_code = $4',
              values: [parsed.toState, instance, indicatorCode],
            };
          },
        );
      case 'assignment':
        return this.updateCaseCells(
          event,
          eventKey,
          versions,
          ctx,
          parsed.caseId,
          () => ({
            set: 'pool_id = $2',
            values: [parsed.active ? parsed.poolId : null],
          }),
        );
      case 'infraction-changed':
        if (
          !PRESCRIPTION_EXTINCT_STATES.includes(
            parsed.toState as (typeof PRESCRIPTION_EXTINCT_STATES)[number],
          )
        ) {
          return this.ignored('not_relevant');
        }
        return this.updateCaseCells(
          event,
          eventKey,
          versions,
          ctx,
          parsed.caseId,
          () => ({ set: 'extinct_state = $2', values: [parsed.toState] }),
        );
    }
  }

  /** Célula do relógio: insert … on conflict (tenant_id, case_id, clock_code)
   *  do update, preservando o que o evento não traz (`coalesce`). */
  private async upsertClockCell(
    event: DashboardConsumedEvent,
    eventKey: string,
    versions: DashboardEventVersions,
    ctx: DashboardProjectionContext,
    cell: {
      caseId: string;
      clockCode: ClockCode;
      instance?: Instance;
      clockId?: string;
      flag?: string;
      daysRemaining?: number | null;
      ceilingOn?: string | null;
      receivedOn?: string;
      timerCode?: string;
      ceilingEffect?: string;
      ceilingReachedOn?: string;
      flagChangedAt?: string;
    },
  ): Promise<DashboardProjectionResult> {
    const existing = await ctx.tx.query<CellRow>(SELECT_CELL, [
      ctx.tenantId,
      cell.caseId,
      cell.clockCode,
    ]);
    const current = existing.rows[0];
    if (
      current &&
      (await this.stale(ctx, current.last_event_id, eventKey, event))
    ) {
      return this.ignored('stale_version');
    }
    const instance = cell.instance ?? current?.instance ?? null;
    const indicatorCode = prescriptionIndicatorCode(cell.clockCode, instance);
    if (indicatorCode === null) return this.ignored('not_relevant');

    await ctx.tx.query(
      `insert into dashboard.prescription_risk
         (tenant_id, case_id, clock_code, indicator_code, clock_id, instance, flag, days_remaining,
          ceiling_on, received_on, timer_code, ceiling_effect, ceiling_reached_on, flag_changed_at,
          last_event_id, event_schema_version, aggregate_version)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       on conflict (tenant_id, case_id, clock_code)
       do update set indicator_code = excluded.indicator_code,
                     clock_id = coalesce(excluded.clock_id, dashboard.prescription_risk.clock_id),
                     instance = coalesce(excluded.instance, dashboard.prescription_risk.instance),
                     flag = coalesce(excluded.flag, dashboard.prescription_risk.flag),
                     days_remaining = coalesce(excluded.days_remaining, dashboard.prescription_risk.days_remaining),
                     ceiling_on = coalesce(excluded.ceiling_on, dashboard.prescription_risk.ceiling_on),
                     received_on = coalesce(excluded.received_on, dashboard.prescription_risk.received_on),
                     timer_code = coalesce(excluded.timer_code, dashboard.prescription_risk.timer_code),
                     ceiling_effect = coalesce(excluded.ceiling_effect, dashboard.prescription_risk.ceiling_effect),
                     ceiling_reached_on = coalesce(excluded.ceiling_reached_on, dashboard.prescription_risk.ceiling_reached_on),
                     flag_changed_at = coalesce(excluded.flag_changed_at, dashboard.prescription_risk.flag_changed_at),
                     last_event_id = excluded.last_event_id,
                     event_schema_version = excluded.event_schema_version,
                     aggregate_version = excluded.aggregate_version,
                     updated_at = $18`,
      [
        ctx.tenantId,
        cell.caseId,
        cell.clockCode,
        indicatorCode,
        cell.clockId ?? null,
        instance,
        cell.flag ?? null,
        cell.daysRemaining ?? null,
        cell.ceilingOn ?? null,
        cell.receivedOn ?? null,
        cell.timerCode ?? null,
        cell.ceilingEffect ?? null,
        cell.ceilingReachedOn ?? null,
        cell.flagChangedAt ?? null,
        event.id,
        versions.schemaVersion,
        versions.aggregateVersion,
        ctx.now.toISOString(),
      ],
    );
    return this.applied(1);
  }

  /** Eventos sem relógio tocam todas as células existentes do caso; `patch`
   *  devolve o `set` e os valores da célula (ou `null` para pulá-la). */
  private async updateCaseCells(
    event: DashboardConsumedEvent,
    eventKey: string,
    versions: DashboardEventVersions,
    ctx: DashboardProjectionContext,
    caseId: string,
    patch: (cell: CellRow) => { set: string; values: unknown[] } | null,
  ): Promise<DashboardProjectionResult> {
    const rows = await ctx.tx.query<CellRow>(SELECT_CASE_CELLS, [
      ctx.tenantId,
      caseId,
    ]);
    let cells = 0;
    let staleCells = 0;
    for (const cell of rows.rows) {
      const change = patch(cell);
      if (!change) continue;
      if (await this.stale(ctx, cell.last_event_id, eventKey, event)) {
        staleCells += 1;
        continue;
      }
      const base = change.values.length + 1;
      await ctx.tx.query(
        `update dashboard.prescription_risk
            set ${change.set}, last_event_id = $${base + 1}, event_schema_version = $${base + 2},
                aggregate_version = $${base + 3}, updated_at = $${base + 4}
          where id = $1`,
        [
          cell.id,
          ...change.values,
          event.id,
          versions.schemaVersion,
          versions.aggregateVersion,
          ctx.now.toISOString(),
        ],
      );
      cells += 1;
    }
    if (cells > 0) return this.applied(cells);
    return this.ignored(staleCells > 0 ? 'stale_version' : 'not_relevant');
  }
}
