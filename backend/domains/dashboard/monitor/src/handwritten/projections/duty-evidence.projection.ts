// Source events: dashboard.duty.changed (DEVER_JANELA_ABERTA, DEVER_ATRASADO, DEVER_COMPROVADO; proposta própria do DASHBOARD — route contract §6, publicado a partir do CTG-0002)
//
// Projeção `dashboard.duty_evidence` (CTG-0001 §2.20, §4.1.7; IND-DASH-
// 201…209, `connected = false` até o CTG-0002). Evento proposto: `type =
// 'dashboard.duty.changed'`, `domainEvent ∈ {DEVER_JANELA_ABERTA,
// DEVER_ATRASADO, DEVER_COMPROVADO}`, `data = { dutyCode, period, fromState,
// toState, deadlineOn?, evidenceHash? }`, `aggregate.kind = 'duty-cycle'`.
// Uma célula por `(tenant_id, duty_code, period)`: `state = toState` (=
// `duty_state_ref`, check da DDL), `deadline_on`, `opened_at` (`occurredAt`
// de DEVER_JANELA_ABERTA), `proved_at` (`occurredAt` de DEVER_COMPROVADO),
// `late = proved_at > deadline_on or DEVER_ATRASADO visto`, `evidence_hash`;
// `indicator_code` lido de `dashboard.duty` (tabela própria, mesma transação).
import {
  DashboardProjectorBase,
  dateOf,
  optionalText,
  requireText,
  type DashboardConsumedEvent,
  type DashboardEventVersions,
  type DashboardProjectionContext,
  type DashboardProjectionResult,
} from '../projection-contract.js';

export const consumedEvents = ['dashboard.duty.changed'] as const;

export const PROJECTION_NAME = 'dashboard.duty_evidence' as const;

interface Parsed {
  dutyCode: string;
  period: string;
  toState: string;
  deadlineOn: string | null;
  evidenceHash: string | null;
  domainEvent: string;
}

interface CellRow extends Record<string, unknown> {
  id: string;
  last_event_id: string;
}

interface DutyRow extends Record<string, unknown> {
  indicator_code: string | null;
}

const SELECT_CELL = `select id, last_event_id
     from dashboard.duty_evidence
    where tenant_id = $1 and duty_code = $2 and period = $3`;

const SELECT_DUTY = `select indicator_code
     from dashboard.duty
    where tenant_id = $1 and code = $2`;

export class DutyEvidenceProjection extends DashboardProjectorBase<Parsed> {
  readonly projection = PROJECTION_NAME;
  readonly consumedEvents = consumedEvents;

  protected validate(event: DashboardConsumedEvent): Parsed {
    const p = this.projection;
    return {
      dutyCode: requireText(p, event, 'dutyCode'),
      period: requireText(p, event, 'period'),
      toState: requireText(p, event, 'toState'),
      deadlineOn: optionalText(p, event, 'deadlineOn'),
      evidenceHash: optionalText(p, event, 'evidenceHash'),
      domainEvent: event.domainEvent ?? '',
    };
  }

  protected async project(
    event: DashboardConsumedEvent,
    eventKey: string,
    parsed: Parsed,
    versions: DashboardEventVersions,
    ctx: DashboardProjectionContext,
  ): Promise<DashboardProjectionResult> {
    const existing = await ctx.tx.query<CellRow>(SELECT_CELL, [
      ctx.tenantId,
      parsed.dutyCode,
      parsed.period,
    ]);
    const current = existing.rows[0];
    if (
      current &&
      (await this.stale(ctx, current.last_event_id, eventKey, event))
    ) {
      return this.ignored('stale_version');
    }
    const duty = await ctx.tx.query<DutyRow>(SELECT_DUTY, [
      ctx.tenantId,
      parsed.dutyCode,
    ]);
    const indicatorCode = duty.rows[0]?.indicator_code ?? null;
    const openedAt =
      parsed.domainEvent === 'DEVER_JANELA_ABERTA' ? event.occurredAt : null;
    const provedAt =
      parsed.domainEvent === 'DEVER_COMPROVADO' ? event.occurredAt : null;
    const late =
      parsed.domainEvent === 'DEVER_ATRASADO' ||
      (provedAt !== null &&
        parsed.deadlineOn !== null &&
        dateOf(provedAt) > parsed.deadlineOn);

    await ctx.tx.query(
      `insert into dashboard.duty_evidence
         (tenant_id, duty_code, period, indicator_code, state, deadline_on, opened_at, proved_at, late,
          evidence_hash, last_event_id, event_schema_version, aggregate_version)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       on conflict (tenant_id, duty_code, period)
       do update set indicator_code = coalesce(excluded.indicator_code, dashboard.duty_evidence.indicator_code),
                     state = excluded.state,
                     deadline_on = coalesce(excluded.deadline_on, dashboard.duty_evidence.deadline_on),
                     opened_at = coalesce(dashboard.duty_evidence.opened_at, excluded.opened_at),
                     proved_at = coalesce(excluded.proved_at, dashboard.duty_evidence.proved_at),
                     late = dashboard.duty_evidence.late or excluded.late
                       or (excluded.proved_at is not null and dashboard.duty_evidence.deadline_on is not null
                           and excluded.proved_at::date > dashboard.duty_evidence.deadline_on),
                     evidence_hash = coalesce(excluded.evidence_hash, dashboard.duty_evidence.evidence_hash),
                     last_event_id = excluded.last_event_id,
                     event_schema_version = excluded.event_schema_version,
                     aggregate_version = excluded.aggregate_version,
                     updated_at = $14`,
      [
        ctx.tenantId,
        parsed.dutyCode,
        parsed.period,
        indicatorCode,
        parsed.toState,
        parsed.deadlineOn,
        openedAt,
        provedAt,
        late,
        parsed.evidenceHash,
        event.id,
        versions.schemaVersion,
        versions.aggregateVersion,
        ctx.now.toISOString(),
      ],
    );
    return this.applied(1);
  }
}
