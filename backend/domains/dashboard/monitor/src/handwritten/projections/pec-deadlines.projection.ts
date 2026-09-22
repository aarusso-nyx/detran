// Source events: pec.deadline.changed (proposta WP-D3 — build pack §WP-D3, route contract §7; o PEC não publica eventos)
//
// Projeção `dashboard.pec_deadlines` (CTG-0001 §2.17, §4.1.4; IND-DASH-106,
// 107, 306…309, todos `connected = false`). Formato proposto do feed WP-D3
// `{indicador_id, caso_id, estado_anterior, estado_novo, timestamp,
// base_legal}` em camelCase no envelope (`indicadorId, casoId, estadoAnterior,
// estadoNovo, timestamp, baseLegal`), `aggregate.kind = 'exam-process'`,
// `version = 1`. Uma célula por `(tenant_id, case_id, indicator_code)`;
// `indicator_code` fora dos seis → `ignored: not_relevant`; `from_state`/
// `to_state` são tokens do PEC (sem check); `due_on` fica nulo (o formato não
// carrega data-limite — OD-D20). Nenhuma derivada.
import {
  DashboardProjectorBase,
  optionalText,
  requireText,
  type DashboardConsumedEvent,
  type DashboardEventVersions,
  type DashboardProjectionContext,
  type DashboardProjectionResult,
} from '../projection-contract.js';

export const consumedEvents = ['pec.deadline.changed'] as const;

export const PROJECTION_NAME = 'dashboard.pec_deadlines' as const;

/** Indicadores que o feed WP-D3 alimenta (CTG-0001 §4.1.4). */
export const PEC_DEADLINE_INDICATORS = [
  'IND-DASH-106',
  'IND-DASH-107',
  'IND-DASH-306',
  'IND-DASH-307',
  'IND-DASH-308',
  'IND-DASH-309',
] as const;

interface Parsed {
  indicatorCode: string;
  caseId: string;
  fromState: string | null;
  toState: string;
  changedAt: string;
  legalBasis: string | null;
}

interface CellRow extends Record<string, unknown> {
  id: string;
  last_event_id: string;
}

const SELECT_CELL = `select id, last_event_id
     from dashboard.pec_deadlines
    where tenant_id = $1 and case_id = $2 and indicator_code = $3`;

export class PecDeadlinesProjection extends DashboardProjectorBase<Parsed> {
  readonly projection = PROJECTION_NAME;
  readonly consumedEvents = consumedEvents;

  protected validate(event: DashboardConsumedEvent): Parsed {
    const p = this.projection;
    return {
      indicatorCode: requireText(p, event, 'indicadorId'),
      caseId: requireText(p, event, 'casoId'),
      fromState: optionalText(p, event, 'estadoAnterior'),
      toState: requireText(p, event, 'estadoNovo'),
      changedAt: requireText(p, event, 'timestamp'),
      legalBasis: optionalText(p, event, 'baseLegal'),
    };
  }

  protected async project(
    event: DashboardConsumedEvent,
    eventKey: string,
    parsed: Parsed,
    versions: DashboardEventVersions,
    ctx: DashboardProjectionContext,
  ): Promise<DashboardProjectionResult> {
    if (
      !PEC_DEADLINE_INDICATORS.includes(
        parsed.indicatorCode as (typeof PEC_DEADLINE_INDICATORS)[number],
      )
    ) {
      return this.ignored('not_relevant');
    }
    const existing = await ctx.tx.query<CellRow>(SELECT_CELL, [
      ctx.tenantId,
      parsed.caseId,
      parsed.indicatorCode,
    ]);
    const current = existing.rows[0];
    if (
      current &&
      (await this.stale(ctx, current.last_event_id, eventKey, event))
    ) {
      return this.ignored('stale_version');
    }
    await ctx.tx.query(
      `insert into dashboard.pec_deadlines
         (tenant_id, case_id, indicator_code, from_state, to_state, changed_at, due_on, legal_basis,
          last_event_id, event_schema_version, aggregate_version)
       values ($1, $2, $3, $4, $5, $6, null, $7, $8, $9, $10)
       on conflict (tenant_id, case_id, indicator_code)
       do update set from_state = excluded.from_state,
                     to_state = excluded.to_state,
                     changed_at = excluded.changed_at,
                     legal_basis = coalesce(excluded.legal_basis, dashboard.pec_deadlines.legal_basis),
                     last_event_id = excluded.last_event_id,
                     event_schema_version = excluded.event_schema_version,
                     aggregate_version = excluded.aggregate_version,
                     updated_at = $11`,
      [
        ctx.tenantId,
        parsed.caseId,
        parsed.indicatorCode,
        parsed.fromState,
        parsed.toState,
        parsed.changedAt,
        parsed.legalBasis,
        event.id,
        versions.schemaVersion,
        versions.aggregateVersion,
        ctx.now.toISOString(),
      ],
    );
    return this.applied(1);
  }
}
