// Trilha, comparativos, transparência e KPIs (CTG-0002 §3.6, §10.2–§10.5;
// plan M22). Tudo das tabelas próprias: `access_log` ∪ `alert_trail`
// (nunca conteúdo sensível em N1), `prescription_risk`/`production` por
// dimensão com supressão §9.5 por grupo, `dataset` × sete requisitos de
// [RN-DASH-151] + `transparency_audit`, e os seis KPIs declarados (OD-D52).
import { Inject, Injectable } from '@nestjs/common';
import { DetranError, type DashboardLayer } from '@detran/shared';
import { OpsParameterService } from '@detran/ops-parameter';
import type { Clock } from '@detran/inf-deadlines';

import {
  DASHBOARD_CLOCK,
  civilDateOf,
  dashboardParameterKey,
  type CycleContext,
} from '../cycle/index.js';
import type { DashboardSqlTransaction } from '../projection-contract.js';
import { paginate } from './layer-gate.js';
import { suppress, type CountCell } from './suppression.js';
import {
  pageOf,
  type AuditTrailQueryInput,
  type ComparisonsQueryInput,
  type TransparencyAuditInput,
} from './dto.js';

// ---------------------------------------------------------------------------
// trilha (§10.3)
// ---------------------------------------------------------------------------

interface TrailRow extends Record<string, unknown> {
  kind: 'access' | 'alert';
  at: Date;
  id: string;
  user_ref: string | null;
  user_role: string | null;
  resource: string | null;
  layer: string | null;
  row_count: number | null;
  purpose: string | null;
  export_id: string | null;
  filters_json: Record<string, unknown> | null;
  alert_id: string | null;
  indicator_code: string | null;
  from_state: string | null;
  to_state: string | null;
  actor_kind: string | null;
  actor_ref: string | null;
  root_cause_category: string | null;
  note: string | null;
  object_ref: string | null;
  total: string;
}

export function trailItem(
  row: TrailRow,
  servedLayer: DashboardLayer,
): Record<string, unknown> {
  const n2 = servedLayer === 'N2';
  if (row.kind === 'access') {
    return {
      kind: 'access',
      id: row.id,
      at: row.at.toISOString(),
      userRef: row.user_ref,
      userRole: row.user_role,
      resource: row.resource,
      layer: row.layer,
      rowCount: row.row_count,
      purpose: row.purpose,
      exportId: row.export_id,
      ...(n2 ? { filters: row.filters_json ?? {} } : {}),
    };
  }
  return {
    kind: 'alert',
    id: row.id,
    occurredAt: row.at.toISOString(),
    alertId: row.alert_id,
    indicatorCode: row.indicator_code,
    fromState: row.from_state,
    toState: row.to_state,
    actorKind: row.actor_kind,
    actorRef: row.actor_ref,
    rootCauseCategory: row.root_cause_category,
    ...(n2 ? { note: row.note, objectRef: row.object_ref } : {}),
  };
}

// ---------------------------------------------------------------------------
// comparativos (§10.2)
// ---------------------------------------------------------------------------

export interface ComparisonGroup {
  label: string;
  cells: CountCell[];
  total: number | null;
  totalSuppressed: boolean;
  suppressedCells: number;
}

export interface ComparisonsResult {
  items: ComparisonGroup[];
  suppressedCells: number;
  threshold: number;
  sourcePending?: string;
}

interface DatasetRow extends Record<string, unknown> {
  id: string;
  dataset_key: string;
  name: string;
  description: string | null;
  classification: string;
  req_open_format: boolean;
  req_machine_readable: boolean;
  req_data_dictionary: boolean;
  req_periodic_update_history: boolean;
  req_authenticity_integrity: boolean;
  req_searchable: boolean;
  req_accessible: boolean;
  license: string | null;
  periodicity: string | null;
  quality_note: string | null;
  changelog_json: unknown;
  suppression_applied: boolean;
  published_at: Date | null;
  version: number;
}

/** Os sete requisitos de [RN-DASH-151] (coluna → chave da resposta). */
export const DATASET_REQUIREMENTS = [
  ['req_open_format', 'reqOpenFormat'],
  ['req_machine_readable', 'reqMachineReadable'],
  ['req_data_dictionary', 'reqDataDictionary'],
  ['req_periodic_update_history', 'reqPeriodicUpdateHistory'],
  ['req_authenticity_integrity', 'reqAuthenticityIntegrity'],
  ['req_searchable', 'reqSearchable'],
  ['req_accessible', 'reqAccessible'],
] as const;

export function datasetMissing(row: DatasetRow): string[] {
  const missing: string[] = [];
  for (const [column, key] of DATASET_REQUIREMENTS) {
    if (row[column] !== true) missing.push(key);
  }
  if (!row.suppression_applied) missing.push('suppressionApplied');
  return missing;
}

export function datasetView(row: DatasetRow): Record<string, unknown> {
  return {
    id: row.id,
    datasetKey: row.dataset_key,
    name: row.name,
    description: row.description,
    classification: row.classification,
    ...Object.fromEntries(
      DATASET_REQUIREMENTS.map(([column, key]) => [key, row[column] === true]),
    ),
    license: row.license,
    periodicity: row.periodicity,
    qualityNote: row.quality_note,
    changelog: row.changelog_json ?? [],
    suppressionApplied: row.suppression_applied,
    publishedAt: row.published_at ? row.published_at.toISOString() : null,
    missing: datasetMissing(row),
    version: row.version,
  };
}

interface TransparencyAuditRow extends Record<string, unknown> {
  id: string;
  period: string;
  checklist_json: Record<string, unknown>;
  result: string;
  audited_by: string;
  audited_at: Date;
  notes: string | null;
}

export function transparencyAuditView(
  row: TransparencyAuditRow,
): Record<string, unknown> {
  return {
    id: row.id,
    period: row.period,
    checklist: row.checklist_json,
    result: row.result,
    auditedBy: row.audited_by,
    auditedAt: row.audited_at.toISOString(),
    notes: row.notes,
  };
}

@Injectable()
export class DashboardAuditService {
  constructor(
    private readonly parameters: OpsParameterService,
    @Inject(DASHBOARD_CLOCK) private readonly clock: Clock,
  ) {}

  /** §10.3 — união ordenada por instante desc; `object` ⇒ só linhas de alerta do objeto. */
  async auditTrail(
    tx: DashboardSqlTransaction,
    tenantId: string,
    query: AuditTrailQueryInput,
    servedLayer: DashboardLayer,
  ): Promise<ReturnType<typeof paginate<Record<string, unknown>>>> {
    const page = pageOf(query);
    const includeAccess = query.kind !== 'alert' && query.object === undefined;
    const includeAlert = query.kind !== 'access';
    const result = await tx.query<TrailRow>(
      `with trail as (
         select 'access'::text as kind, l.at as at, l.id, l.user_ref, l.user_role, l.resource,
                l.layer, l.row_count, l.purpose, l.export_id, l.filters_json,
                null::uuid as alert_id, null::text as indicator_code, null::text as from_state,
                null::text as to_state, null::text as actor_kind, null::text as actor_ref,
                null::text as root_cause_category, null::text as note, null::text as object_ref
           from dashboard.access_log l
          where $9::boolean and l.tenant_id = $1
            and ($5::timestamptz is null or l.at >= $5)
            and ($6::timestamptz is null or l.at <= $6)
         union all
         select 'alert'::text, t.occurred_at, t.id, null, null, null, null, null, null, null, null,
                t.alert_id, a.indicator_code, t.from_state, t.to_state, t.actor_kind, t.actor_ref,
                t.root_cause_category, t.note, a.object_ref
           from dashboard.alert_trail t
           join dashboard.alert a on a.tenant_id = t.tenant_id and a.id = t.alert_id
          where $10::boolean and t.tenant_id = $1
            and ($2::text is null or a.object_ref = $2)
            and ($3::text is null or a.indicator_code = $3)
            and ($4::text is null or a.source_app = $4)
            and ($5::timestamptz is null or t.occurred_at >= $5)
            and ($6::timestamptz is null or t.occurred_at <= $6)
       )
       select *, count(*) over ()::text as total
         from trail
        order by at desc, id desc
        limit $7 offset $8`,
      [
        tenantId,
        query.object ?? null,
        query.indicator ?? null,
        query.app ?? null,
        query.from ?? null,
        query.to ?? null,
        page.pageSize,
        page.offset,
        includeAccess,
        includeAlert,
      ],
    );
    const total = result.rows[0] ? Number(result.rows[0].total) : 0;
    return {
      items: result.rows.map((row) => trailItem(row, servedLayer)),
      page: page.page,
      pageSize: page.pageSize,
      total,
    };
  }

  /** §10.2 — agregados por dimensão com supressão §9.5 por grupo (`dimension` × período). */
  async comparisons(
    tx: DashboardSqlTransaction,
    tenantId: string,
    query: ComparisonsQueryInput,
    threshold: number,
  ): Promise<ComparisonsResult> {
    if (query.person === true) {
      throw new DetranError('DASH.RANKING_OF_PERSONS_FORBIDDEN', {
        status: 403,
        context: { dimension: query.dimension },
      });
    }
    if (query.dimension === 'unit' || query.dimension === 'clinic') {
      return {
        items: [],
        suppressedCells: 0,
        threshold,
        sourcePending: 'OD-D38',
      };
    }
    const rows =
      query.dimension === 'pool'
        ? await tx.query<{ label: string; key: string; count: string }>(
            `select coalesce(pool_id::text, 'sem-pool') as label,
                    coalesce(flag, 'SEM_RISCO') as key, count(*)::text as count
               from dashboard.prescription_risk
              where tenant_id = $1
                and ($2::date is null or created_at >= $2::date)
                and ($3::date is null or created_at < ($3::date + interval '1 day'))
              group by 1, 2 order by 1, 2`,
            [tenantId, query.from ?? null, query.to ?? null],
          )
        : await tx.query<{ label: string; key: string; count: string }>(
            `select coalesce(instance, 'sem-instancia') as label,
                    current_state as key, count(*)::text as count
               from dashboard.production
              where tenant_id = $1
                and ($2::date is null or period_start >= $2::date)
                and ($3::date is null or period_start <= $3::date)
              group by 1, 2 order by 1, 2`,
            [tenantId, query.from ?? null, query.to ?? null],
          );
    const groups = new Map<string, CountCell[]>();
    for (const row of rows.rows) {
      const cells = groups.get(row.label) ?? [];
      cells.push({ key: row.key, count: Number(row.count) });
      groups.set(row.label, cells);
    }
    let suppressedCells = 0;
    const items: ComparisonGroup[] = [];
    for (const [label, cells] of groups) {
      const result = suppress(cells, threshold);
      suppressedCells += result.suppressedCells;
      items.push({
        label,
        cells: result.rows,
        total: result.total,
        totalSuppressed: result.totalSuppressed,
        suppressedCells: result.suppressedCells,
      });
    }
    if (query.orderBy === 'count') {
      items.sort((left, right) => (right.total ?? -1) - (left.total ?? -1));
    } else {
      items.sort((left, right) => left.label.localeCompare(right.label));
    }
    return { items, suppressedCells, threshold };
  }

  // -------------------------------------------------------------------------
  // transparência (§10.4)
  // -------------------------------------------------------------------------

  async datasets(
    tx: DashboardSqlTransaction,
    tenantId: string,
    onlyPublic: boolean,
  ): Promise<DatasetRow[]> {
    const result = await tx.query<DatasetRow>(
      `select * from dashboard.dataset
        where tenant_id = $1 and (not $2::boolean or classification in ('P1', 'P2'))
        order by dataset_key`,
      [tenantId, onlyPublic],
    );
    return result.rows;
  }

  /** Período mensal (`dashboard.transparency.audit_period = monthly` ⇒ `YYYY-MM`). */
  async auditPeriodicity(): Promise<string> {
    try {
      const parameter = await this.parameters.get(
        dashboardParameterKey('transparency', 'audit_period'),
      );
      const value: unknown = parameter.value_json;
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim().toLowerCase();
      }
    } catch {
      // parâmetro ausente: forma do check do banco (`YYYY-MM`)
    }
    return 'monthly';
  }

  currentPeriod(tz: string): string {
    return civilDateOf(this.clock.now(), tz).slice(0, 7);
  }

  async transparencyChecklist(
    tx: DashboardSqlTransaction,
    tenantId: string,
    period: string,
  ): Promise<{
    period: string;
    items: Record<string, unknown>[];
    lastAudit: Record<string, unknown> | null;
  }> {
    const datasets = await this.datasets(tx, tenantId, true);
    const last = await tx.query<TransparencyAuditRow>(
      `select * from dashboard.transparency_audit
        where tenant_id = $1 and period = $2
        order by audited_at desc limit 1`,
      [tenantId, period],
    );
    return {
      period,
      items: datasets.map(datasetView),
      lastAudit: last.rows[0] ? transparencyAuditView(last.rows[0]) : null,
    };
  }

  async transparencyAudit(
    tx: DashboardSqlTransaction,
    input: TransparencyAuditInput,
    ctx: CycleContext,
  ): Promise<Record<string, unknown>> {
    const existing = await tx.query<{ id: string }>(
      `select id from dashboard.transparency_audit where tenant_id = $1 and period = $2`,
      [ctx.tenantId, input.period],
    );
    if (existing.rows.length > 0) {
      throw new DetranError('DASH.VALIDATION_FAILED', {
        status: 400,
        context: {
          period: input.period,
          reason: 'already_audited',
          sourcePending: 'OD-D35',
        },
      });
    }
    const created = await tx.query<TransparencyAuditRow>(
      `insert into dashboard.transparency_audit
         (tenant_id, period, checklist_json, result, audited_by, audited_at, notes, created_at)
       values ($1, $2, $3::jsonb, $4, $5::uuid, $6, $7, $6)
       returning *`,
      [
        ctx.tenantId,
        input.period,
        JSON.stringify(input.checklist),
        input.result,
        ctx.actor.id ?? null,
        ctx.now.toISOString(),
        input.notes ?? null,
      ],
    );
    return transparencyAuditView(created.rows[0]!);
  }

  // -------------------------------------------------------------------------
  // KPIs (§10.5, OD-D52)
  // -------------------------------------------------------------------------

  async kpis(
    tx: DashboardSqlTransaction,
    tenantId: string,
    range: { from: string; to: string },
    threshold: number,
  ): Promise<Record<string, unknown>> {
    const now = this.clock.now().toISOString();
    const [coverage, mtta, mttr, duties, freshness, openAlerts] =
      await Promise.all([
        tx.query<{ block: string; total: string; connected: string }>(
          `select block, count(*)::text as total, count(*) filter (where connected)::text as connected
           from dashboard.indicator where tenant_id = $1 group by block order by block`,
          [tenantId],
        ),
        tx.query<{ minutes: string | null; sample: string }>(
          `select avg(extract(epoch from (acknowledged_at - notified_at)) / 60)::text as minutes,
                count(*)::text as sample
           from dashboard.alert
          where tenant_id = $1 and acknowledged_at is not null and notified_at is not null
            and acknowledged_at >= $2::date and acknowledged_at < ($3::date + interval '1 day')`,
          [tenantId, range.from, range.to],
        ),
        tx.query<{ minutes: string | null; sample: string }>(
          `select avg(extract(epoch from (verified_at - detected_at)) / 60)::text as minutes,
                count(*)::text as sample
           from dashboard.alert
          where tenant_id = $1 and verified_at is not null
            and verified_at >= $2::date and verified_at < ($3::date + interval '1 day')`,
          [tenantId, range.from, range.to],
        ),
        tx.query<{ on_time: string; considered: string }>(
          `select count(*) filter (where submitted_at is not null and submitted_at::date <= deadline_on)::text as on_time,
                count(*)::text as considered
           from dashboard.duty_cycle
          where tenant_id = $1 and deadline_on is not null
            and ((submitted_at >= $2::date and submitted_at < ($3::date + interval '1 day'))
              or (late_at >= $2::date and late_at < ($3::date + interval '1 day')))`,
          [tenantId, range.from, range.to],
        ),
        tx.query<{ state: string; count: string; minutes: string | null }>(
          `select state, count(*)::text as count,
                avg(extract(epoch from ($2::timestamptz - last_seen_at)) / 60)::text as minutes
           from dashboard.source
          where tenant_id = $1
          group by state order by state`,
          [tenantId, now],
        ),
        tx.query<{ severity: string; track: string; count: string }>(
          `select a.severity, a.track, count(*)::text as count
           from dashboard.alert a
           join dashboard.alert_state_ref s on s.code = a.state
          where a.tenant_id = $1 and s.is_terminal = false
          group by a.severity, a.track`,
          [tenantId],
        ),
      ]);
    const totalIndicators = coverage.rows.reduce(
      (sum, row) => sum + Number(row.total),
      0,
    );
    const connectedIndicators = coverage.rows.reduce(
      (sum, row) => sum + Number(row.connected),
      0,
    );
    const bySeverity = new Map<string, number>();
    const byTrack = new Map<string, number>();
    for (const row of openAlerts.rows) {
      bySeverity.set(
        row.severity,
        (bySeverity.get(row.severity) ?? 0) + Number(row.count),
      );
      byTrack.set(row.track, (byTrack.get(row.track) ?? 0) + Number(row.count));
    }
    const severityCells = suppress(
      [...bySeverity].map(([key, count]) => ({ key, count })),
      threshold,
    );
    const trackCells = suppress(
      [...byTrack].map(([key, count]) => ({ key, count })),
      threshold,
    );
    const freshnessSamples = freshness.rows.filter(
      (row) => row.minutes !== null,
    );
    const freshnessAverage =
      freshnessSamples.length > 0
        ? freshnessSamples.reduce((sum, row) => sum + Number(row.minutes), 0) /
          freshnessSamples.length
        : null;
    return {
      period: range,
      coverage: {
        connected: connectedIndicators,
        total: totalIndicators,
        ratio:
          totalIndicators > 0 ? connectedIndicators / totalIndicators : null,
        byBlock: coverage.rows.map((row) => ({
          block: row.block,
          connected: Number(row.connected),
          total: Number(row.total),
        })),
      },
      mtta: {
        minutes:
          mtta.rows[0]?.minutes === null || mtta.rows[0] === undefined
            ? null
            : Number(mtta.rows[0].minutes),
        sample: Number(mtta.rows[0]?.sample ?? 0),
      },
      mttr: {
        minutes:
          mttr.rows[0]?.minutes === null || mttr.rows[0] === undefined
            ? null
            : Number(mttr.rows[0].minutes),
        sample: Number(mttr.rows[0]?.sample ?? 0),
      },
      dutiesOnTime: {
        onTime: Number(duties.rows[0]?.on_time ?? 0),
        considered: Number(duties.rows[0]?.considered ?? 0),
        ratio:
          Number(duties.rows[0]?.considered ?? 0) > 0
            ? Number(duties.rows[0]!.on_time) /
              Number(duties.rows[0]!.considered)
            : null,
      },
      freshnessAverage: {
        minutes: freshnessAverage,
        byState: Object.fromEntries(
          freshness.rows.map((row) => [row.state, Number(row.count)]),
        ),
      },
      openAlerts: {
        bySeverity: severityCells.rows,
        byTrack: trackCells.rows,
        total: severityCells.total,
        totalSuppressed: severityCells.totalSuppressed,
        suppressedCells:
          severityCells.suppressedCells + trackCells.suppressedCells,
      },
    };
  }
}
