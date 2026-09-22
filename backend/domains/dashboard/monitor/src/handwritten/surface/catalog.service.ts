// Catálogo, configurações de indicador e painéis (CTG-0002 §3.3, §6.3,
// §10.1, §10.7; plan M22). Valores só de tabelas próprias e da API pública de
// `@detran/dashboard-crashes` (`readInternal`, nunca `dashboard.crash_*`);
// valor agregado passa pela supressão de §9.5; fonte desconectada ou bloco A
// oculto ⇒ `value: null` (route contract §1.3).
import { Inject, Injectable } from '@nestjs/common';
import { DetranError, type DashboardLayer } from '@detran/shared';
import { OpsParameterService } from '@detran/ops-parameter';
import type { Clock } from '@detran/inf-deadlines';
import { DashboardCrashesProjection } from '@detran/dashboard-crashes';

import {
  DASHBOARD_CLOCK,
  DASHBOARD_EVENT_TYPES,
  DashboardFreshnessService,
  assertDashIfMatch,
  envelopeOf,
  publish,
  type CycleContext,
} from '../cycle/index.js';
import type { DashboardSqlTransaction } from '../projection-contract.js';
import {
  layerAtLeast,
  ownStateFreshness,
  paginate,
  readCellThreshold,
  worstFreshness,
  type DashboardFreshnessMeta,
} from './layer-gate.js';
import {
  suppress,
  type CountCell,
  type SuppressResult,
} from './suppression.js';
import {
  pageOf,
  type BiPanelInput,
  type PatchBiPanelInput,
  type PatchIndicatorConfigInput,
  type Threshold,
} from './dto.js';

// ---------------------------------------------------------------------------
// linhas
// ---------------------------------------------------------------------------

export interface IndicatorRow extends Record<string, unknown> {
  id: string;
  code: string;
  block: 'A' | 'B' | 'C' | 'D';
  kind: string;
  name: string;
  question: string;
  source_app: string;
  source_ref: string;
  threshold_rule: string;
  owner_actor: string;
  expected_action: string;
  classification: string | null;
  latency_band: string;
  acceptable_latency_minutes: number | null;
  unavailable_strategy: 'hide' | 'mark' | null;
  projection: string | null;
  connected: boolean;
  clock_code: string | null;
}

export interface IndicatorConfigRow extends Record<string, unknown> {
  id: string;
  indicator_code: string;
  code: string;
  name: string;
  description: string | null;
  formula: string;
  granularity: string;
  threshold_json: Threshold | null;
  acceptable_latency_minutes: number | null;
  status: 'draft' | 'published';
  published_at: Date | null;
  published_by: string | null;
  version: number;
}

export interface BiPanelRow extends Record<string, unknown> {
  id: string;
  name: string;
  description: string | null;
  visibility_profile: DashboardLayer;
  config_json: Record<string, unknown>;
  status: 'draft' | 'published';
  published_at: Date | null;
  published_by: string | null;
  version: number;
}

/** Códigos de indicador técnico que exigem `levels` na publicação (§6.3). */
const CALIBRATED_CODES: ReadonlySet<string> = new Set([
  'IND-DASH-401',
  'IND-DASH-402',
  'IND-DASH-403',
  'IND-DASH-406',
]);

/** Projeções cujo valor é contagem por `state`/`current_state` (§10.1 C/D);
 *  `production` não tem `indicator_code` (célula por caso, CTG-0001 §4.1). */
const STATE_PROJECTIONS: Readonly<
  Record<string, { table: string; column: string; byIndicator: boolean }>
> = {
  'dashboard.production': {
    table: 'dashboard.production',
    column: 'current_state',
    byIndicator: false,
  },
  'dashboard.teat_measures': {
    table: 'dashboard.teat_measures',
    column: 'state',
    byIndicator: true,
  },
  'dashboard.pec_deadlines': {
    table: 'dashboard.pec_deadlines',
    column: 'to_state',
    byIndicator: true,
  },
  'dashboard.portal_service_metrics': {
    table: 'dashboard.portal_service_metrics',
    column: 'state',
    byIndicator: true,
  },
};

export function indicatorView(row: IndicatorRow): Record<string, unknown> {
  return {
    id: row.id,
    code: row.code,
    block: row.block,
    kind: row.kind,
    name: row.name,
    question: row.question,
    sourceApp: row.source_app,
    sourceRef: row.source_ref,
    thresholdRule: row.threshold_rule,
    ownerActor: row.owner_actor,
    expectedAction: row.expected_action,
    classification: row.classification,
    latencyBand: row.latency_band,
    acceptableLatencyMinutes: row.acceptable_latency_minutes,
    unavailableStrategy: row.unavailable_strategy,
    projection: row.projection,
    connected: row.connected,
    clockCode: row.clock_code,
  };
}

export function indicatorConfigView(
  row: IndicatorConfigRow,
): Record<string, unknown> {
  return {
    id: row.id,
    indicatorCode: row.indicator_code,
    code: row.code,
    name: row.name,
    description: row.description,
    formula: row.formula,
    granularity: row.granularity,
    thresholdJson: row.threshold_json,
    acceptableLatencyMinutes: row.acceptable_latency_minutes,
    status: row.status,
    publishedAt: row.published_at ? row.published_at.toISOString() : null,
    publishedBy: row.published_by,
    version: row.version,
  };
}

export function biPanelView(row: BiPanelRow): Record<string, unknown> {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    visibilityProfile: row.visibility_profile,
    configJson: row.config_json,
    status: row.status,
    publishedAt: row.published_at ? row.published_at.toISOString() : null,
    publishedBy: row.published_by,
    version: row.version,
  };
}

export interface IndicatorsFilter {
  block?: string | undefined;
  app?: string | undefined;
  connected?: boolean | undefined;
  classification?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

@Injectable()
export class DashboardCatalogService {
  constructor(
    private readonly freshness: DashboardFreshnessService,
    private readonly parameters: OpsParameterService,
    @Inject(DASHBOARD_CLOCK) private readonly clock: Clock,
  ) {}

  // -------------------------------------------------------------------------
  // indicadores (§10.1)
  // -------------------------------------------------------------------------

  async indicators(
    tx: DashboardSqlTransaction,
    tenantId: string,
    filter: IndicatorsFilter,
  ): Promise<{
    items: Record<string, unknown>[];
    page: number;
    pageSize: number;
    total: number;
    freshness: DashboardFreshnessMeta;
  }> {
    const result = await tx.query<IndicatorRow>(
      `select * from dashboard.indicator
        where tenant_id = $1
          and ($2::text is null or block = $2)
          and ($3::text is null or source_app = $3)
          and ($4::boolean is null or connected = $4)
          and ($5::text is null or classification = $5)
        order by code`,
      [
        tenantId,
        filter.block ?? null,
        filter.app ?? null,
        filter.connected ?? null,
        filter.classification ?? null,
      ],
    );
    return {
      ...paginate(result.rows.map(indicatorView), pageOf(filter)),
      freshness: ownStateFreshness(this.clock.now()),
    };
  }

  async indicatorRow(
    tx: DashboardSqlTransaction,
    tenantId: string,
    code: string,
  ): Promise<IndicatorRow> {
    const result = await tx.query<IndicatorRow>(
      `select * from dashboard.indicator where tenant_id = $1 and code = $2`,
      [tenantId, code],
    );
    const row = result.rows[0];
    if (!row) {
      throw new DetranError('DASH.INDICATOR_NOT_IN_CATALOG', {
        status: 404,
        context: { code },
      });
    }
    if (!row.classification) {
      throw new DetranError('DASH.CLASSIFICATION_MISSING', {
        status: 422,
        context: { indicator: code },
      });
    }
    return row;
  }

  /** `GET indicators/{code}`: indicador + `value` (§10.1) + alertas abertos + `meta.freshness` da fonte. */
  async indicator(
    tx: DashboardSqlTransaction,
    tenantId: string,
    row: IndicatorRow,
  ): Promise<{
    body: Record<string, unknown>;
    freshness: DashboardFreshnessMeta;
  }> {
    const now = this.clock.now();
    if (row.projection === 'dashboard.crashes') {
      const crashes = new DashboardCrashesProjection(tx);
      const read = await crashes.readInternal({
        periodStart: monthStart(now),
        periodEnd: now.toISOString().slice(0, 10),
      });
      if (read.publicationStatus === 'blocked') {
        throw new DetranError('DASH.PANEL_BLOCKED_BY_DECISION', {
          status: 423,
          context: { panel: 'P-09', decision: 'DT-029', indicator: row.code },
        });
      }
    }
    const sourceMeta = await this.sourceFreshness(tx, tenantId, row);
    const disconnected = !row.projection || !row.connected;
    const freshness: DashboardFreshnessMeta = disconnected
      ? { ...sourceMeta, state: 'INDISPONIVEL' }
      : sourceMeta;
    const strategy =
      row.unavailable_strategy ?? (row.block === 'A' ? 'hide' : 'mark');
    const sourceUsable =
      freshness.state === 'FRESCO' || freshness.state === 'ATRASADO';
    const hidden = strategy === 'hide' && !sourceUsable;
    const value =
      disconnected || hidden
        ? null
        : await this.valueOf(tx, tenantId, row, now);
    const alerts = await this.openAlertsBySeverity(tx, tenantId, row.code);
    return {
      body: { ...indicatorView(row), value, alerts },
      freshness,
    };
  }

  private async sourceFreshness(
    tx: DashboardSqlTransaction,
    tenantId: string,
    row: IndicatorRow,
  ): Promise<DashboardFreshnessMeta> {
    const meta = await this.freshness.metaFor(tx, tenantId, [row.code]);
    return meta;
  }

  /** `meta.freshness` de uma lista que cruza indicadores (§5.5). */
  async freshnessFor(
    tx: DashboardSqlTransaction,
    tenantId: string,
    indicatorCodes: readonly string[],
  ): Promise<DashboardFreshnessMeta> {
    const codes = Array.from(new Set(indicatorCodes));
    const own = ownStateFreshness(this.clock.now());
    if (codes.length === 0) return own;
    const metas = await Promise.all(
      codes.map((code) => this.freshness.metaFor(tx, tenantId, [code])),
    );
    return worstFreshness(metas, own);
  }

  private async valueOf(
    tx: DashboardSqlTransaction,
    tenantId: string,
    row: IndicatorRow,
    now: Date,
  ): Promise<Record<string, unknown> | null> {
    switch (row.projection) {
      case 'dashboard.prescription_risk': {
        const cells = await tx.query<{ key: string; count: string }>(
          `select coalesce(flag, 'SEM_RISCO') as key, count(*)::text as count
             from dashboard.prescription_risk
            where tenant_id = $1 and indicator_code = $2
            group by 1 order by 1`,
          [tenantId, row.code],
        );
        return this.suppressed(cells.rows);
      }
      case 'dashboard.duty_evidence': {
        const cycle = await tx.query<{
          state: string;
          deadline_on: string | null;
          late_at: Date | null;
          period: string;
        }>(
          `select c.state, c.deadline_on::text as deadline_on, c.late_at, c.period
             from dashboard.duty_cycle c
             join dashboard.duty d on d.tenant_id = c.tenant_id and d.code = c.duty_code
            where c.tenant_id = $1 and d.indicator_code = $2
            order by c.period desc limit 1`,
          [tenantId, row.code],
        );
        const current = cycle.rows[0];
        if (!current) return null;
        return {
          period: current.period,
          state: current.state,
          deadlineOn: current.deadline_on,
          late: current.late_at !== null || current.state === 'ATRASADO',
        };
      }
      case 'dashboard.integration_health': {
        const metrics = await tx.query<{
          metric: string;
          system_key: string;
          metric_value: string;
          sample_count: number;
          period_start: string;
        }>(
          `select metric, system_key, metric_value::text as metric_value, sample_count, period_start::text as period_start
             from dashboard.integration_health
            where tenant_id = $1 and period_start = $2::date
            order by system_key, metric`,
          [tenantId, monthStart(now)],
        );
        return {
          periodStart: monthStart(now),
          metrics: metrics.rows.map((metric) => ({
            metric: metric.metric,
            systemKey: metric.system_key,
            value: Number(metric.metric_value),
            sampleCount: metric.sample_count,
          })),
        };
      }
      default: {
        const projection = row.projection
          ? STATE_PROJECTIONS[row.projection]
          : undefined;
        if (!projection) return null;
        const cells = await tx.query<{ key: string; count: string }>(
          `select coalesce(${projection.column}::text, 'sem-estado') as key, count(*)::text as count
             from ${projection.table}
            where tenant_id = $1
              ${projection.byIndicator ? 'and indicator_code = $2' : ''}
            group by 1 order by 1`,
          projection.byIndicator ? [tenantId, row.code] : [tenantId],
        );
        return this.suppressed(cells.rows);
      }
    }
  }

  private async suppressed(
    rows: readonly { key: string; count: string }[],
  ): Promise<Record<string, unknown>> {
    const threshold = await readCellThreshold(this.parameters);
    const result: SuppressResult<CountCell> = suppress(
      rows.map((row) => ({ key: row.key, count: Number(row.count) })),
      threshold,
    );
    return {
      cells: result.rows,
      total: result.total,
      totalSuppressed: result.totalSuppressed,
      suppressedCells: result.suppressedCells,
      threshold,
    };
  }

  private async openAlertsBySeverity(
    tx: DashboardSqlTransaction,
    tenantId: string,
    code: string,
  ): Promise<Record<string, number>> {
    const result = await tx.query<{ severity: string; count: string }>(
      `select a.severity, count(*)::text as count
         from dashboard.alert a
         join dashboard.alert_state_ref s on s.code = a.state
        where a.tenant_id = $1 and a.indicator_code = $2 and s.is_terminal = false
        group by a.severity`,
      [tenantId, code],
    );
    return Object.fromEntries(
      result.rows.map((row) => [row.severity, Number(row.count)]),
    );
  }

  // -------------------------------------------------------------------------
  // configurações de indicador (§3.3)
  // -------------------------------------------------------------------------

  async indicatorConfigs(
    tx: DashboardSqlTransaction,
    tenantId: string,
    filter: {
      indicator?: string | undefined;
      status?: string | undefined;
      page?: number | undefined;
      pageSize?: number | undefined;
    },
  ): Promise<ReturnType<typeof paginate<Record<string, unknown>>>> {
    const result = await tx.query<IndicatorConfigRow>(
      `select * from dashboard.indicator_config
        where tenant_id = $1
          and ($2::text is null or indicator_code = $2)
          and ($3::text is null or status = $3)
        order by indicator_code, code`,
      [tenantId, filter.indicator ?? null, filter.status ?? null],
    );
    return paginate(result.rows.map(indicatorConfigView), pageOf(filter));
  }

  async indicatorConfigRow(
    tx: DashboardSqlTransaction,
    tenantId: string,
    id: string,
  ): Promise<IndicatorConfigRow> {
    const result = await tx.query<IndicatorConfigRow>(
      `select * from dashboard.indicator_config where tenant_id = $1 and id = $2::uuid`,
      [tenantId, id],
    );
    const row = result.rows[0];
    if (!row) {
      throw new DetranError('DASH.TENANT_MISMATCH', {
        status: 404,
        context: { indicatorConfigId: id },
      });
    }
    return row;
  }

  /** `PATCH indicator-configs/{id}` (§3.3): rascunho; publicada volta a `draft`. */
  async patchIndicatorConfig(
    tx: DashboardSqlTransaction,
    id: string,
    input: PatchIndicatorConfigInput,
    ifMatch: string | undefined,
    ctx: CycleContext,
  ): Promise<IndicatorConfigRow> {
    const row = await this.indicatorConfigRow(tx, ctx.tenantId, id);
    assertDashIfMatch(ifMatch, row.version);
    const indicator = await this.indicatorRow(
      tx,
      ctx.tenantId,
      row.indicator_code,
    );
    if (
      input.acceptableLatencyMinutes !== undefined &&
      input.acceptableLatencyMinutes !== null &&
      input.acceptableLatencyMinutes <= 0
    ) {
      throw new DetranError('DASH.INDICATOR_LATENCY_INVALID', {
        status: 400,
        context: {
          block: indicator.block,
          range: indicator.latency_band,
          sourcePending: 'OD-D34',
        },
      });
    }
    if (input.thresholdJson)
      assertThresholdKind(indicator, input.thresholdJson);
    const updated = await tx.query<IndicatorConfigRow>(
      `update dashboard.indicator_config set
         name = coalesce($3, name),
         description = case when $4::boolean then $5 else description end,
         formula = coalesce($6, formula),
         granularity = coalesce($7, granularity),
         threshold_json = case when $8::boolean then $9::jsonb else threshold_json end,
         acceptable_latency_minutes = case when $10::boolean then $11 else acceptable_latency_minutes end,
         status = 'draft', published_at = null, published_by = null,
         version = version + 1, updated_at = $12
       where tenant_id = $1 and id = $2::uuid
       returning *`,
      [
        ctx.tenantId,
        id,
        input.name ?? null,
        input.description !== undefined,
        input.description ?? null,
        input.formula ?? null,
        input.granularity ?? null,
        input.thresholdJson !== undefined,
        input.thresholdJson === undefined || input.thresholdJson === null
          ? null
          : JSON.stringify(input.thresholdJson),
        input.acceptableLatencyMinutes !== undefined,
        input.acceptableLatencyMinutes ?? null,
        ctx.now.toISOString(),
      ],
    );
    return updated.rows[0]!;
  }

  /** `POST indicator-configs/{id}/publish` (§3.3): `draft → published` + `IndicatorConfigChanged`. */
  async publishIndicatorConfig(
    tx: DashboardSqlTransaction,
    id: string,
    ifMatch: string | undefined,
    ctx: CycleContext,
  ): Promise<IndicatorConfigRow> {
    const row = await this.indicatorConfigRow(tx, ctx.tenantId, id);
    assertDashIfMatch(ifMatch, row.version);
    if (row.status !== 'draft') {
      throw new DetranError('DASH.VALIDATION_FAILED', {
        status: 400,
        context: { currentState: row.status, sourcePending: 'OD-D35' },
      });
    }
    const indicator = await this.indicatorRow(
      tx,
      ctx.tenantId,
      row.indicator_code,
    );
    if (
      indicator.clock_code !== null &&
      !['A', 'B', 'C', 'D'].includes(indicator.clock_code)
    ) {
      throw new DetranError('DASH.INDICATOR_CLOCK_CODE_INVALID', {
        status: 400,
        context: { allowed: ['A', 'B', 'C', 'D'], code: indicator.code },
      });
    }
    if (row.threshold_json) assertThresholdKind(indicator, row.threshold_json);
    const levels = row.threshold_json?.levels ?? {};
    const calibrated =
      row.threshold_json !== null &&
      Object.values(levels).some((level) => typeof level === 'number');
    if (CALIBRATED_CODES.has(indicator.code) && !calibrated) {
      throw new DetranError('DASH.INDICATOR_THRESHOLD_NOT_CALIBRATED', {
        status: 422,
        context: { code: indicator.code },
      });
    }
    const updated = await tx.query<IndicatorConfigRow>(
      `update dashboard.indicator_config set
         status = 'published', published_at = $3, published_by = $4::uuid,
         version = version + 1, updated_at = $3
       where tenant_id = $1 and id = $2::uuid
       returning *`,
      [ctx.tenantId, id, ctx.now.toISOString(), ctx.actor.id ?? null],
    );
    const published = updated.rows[0]!;
    await publish(
      tx,
      envelopeOf({
        type: DASHBOARD_EVENT_TYPES.indicatorConfigChanged,
        domainEvent: 'IndicatorConfigChanged',
        tenantId: ctx.tenantId,
        occurredAt: ctx.now,
        actor: ctx.actor,
        correlationId: ctx.requestId,
        aggregate: { kind: 'indicator_config', id, version: published.version },
        data: {
          indicatorConfigId: id,
          indicatorCode: published.indicator_code,
          code: published.code,
          status: published.status,
          publishedBy: published.published_by,
          publishedAt: published.published_at
            ? published.published_at.toISOString()
            : null,
          acceptableLatencyMinutes: published.acceptable_latency_minutes,
          hasThreshold: published.threshold_json !== null,
          occurredAt: ctx.now.toISOString(),
        },
      }),
    );
    return published;
  }

  // -------------------------------------------------------------------------
  // painéis (§3.3, §10.7)
  // -------------------------------------------------------------------------

  /** Lista só os painéis com `visibility_profile ≤` camada do papel (§5.2). */
  async biPanels(
    tx: DashboardSqlTransaction,
    tenantId: string,
    roleLayer: DashboardLayer,
    filter: {
      status?: string | undefined;
      visibilityProfile?: string | undefined;
      page?: number | undefined;
      pageSize?: number | undefined;
    },
  ): Promise<ReturnType<typeof paginate<Record<string, unknown>>>> {
    const result = await tx.query<BiPanelRow>(
      `select * from dashboard.bi_panel
        where tenant_id = $1
          and ($2::text is null or status = $2)
          and ($3::text is null or visibility_profile = $3)
        order by name`,
      [tenantId, filter.status ?? null, filter.visibilityProfile ?? null],
    );
    const visible = result.rows.filter((row) =>
      layerAtLeast(roleLayer, row.visibility_profile),
    );
    return paginate(visible.map(biPanelView), pageOf(filter));
  }

  async biPanelRow(
    tx: DashboardSqlTransaction,
    tenantId: string,
    id: string,
  ): Promise<BiPanelRow> {
    const result = await tx.query<BiPanelRow>(
      `select * from dashboard.bi_panel where tenant_id = $1 and id = $2::uuid`,
      [tenantId, id],
    );
    const row = result.rows[0];
    if (!row) {
      throw new DetranError('DASH.TENANT_MISMATCH', {
        status: 404,
        context: { biPanelId: id },
      });
    }
    return row;
  }

  async createBiPanel(
    tx: DashboardSqlTransaction,
    input: BiPanelInput,
    ctx: CycleContext,
  ): Promise<BiPanelRow> {
    const duplicate = await tx.query<{ id: string }>(
      `select id from dashboard.bi_panel where tenant_id = $1 and name = $2`,
      [ctx.tenantId, input.name],
    );
    if (duplicate.rows.length > 0) {
      throw new DetranError('DASH.VALIDATION_FAILED', {
        status: 400,
        context: { field: 'name', reason: 'duplicate' },
      });
    }
    const created = await tx.query<BiPanelRow>(
      `insert into dashboard.bi_panel
         (tenant_id, name, description, visibility_profile, config_json, status, version, created_at)
       values ($1, $2, $3, $4, $5::jsonb, 'draft', 1, $6)
       returning *`,
      [
        ctx.tenantId,
        input.name,
        input.description ?? null,
        input.visibilityProfile,
        JSON.stringify(input.configJson),
        ctx.now.toISOString(),
      ],
    );
    return created.rows[0]!;
  }

  async patchBiPanel(
    tx: DashboardSqlTransaction,
    id: string,
    input: PatchBiPanelInput,
    ifMatch: string | undefined,
    ctx: CycleContext,
  ): Promise<BiPanelRow> {
    const row = await this.biPanelRow(tx, ctx.tenantId, id);
    assertDashIfMatch(ifMatch, row.version);
    if (input.name !== undefined && input.name !== row.name) {
      const duplicate = await tx.query<{ id: string }>(
        `select id from dashboard.bi_panel where tenant_id = $1 and name = $2 and id <> $3::uuid`,
        [ctx.tenantId, input.name, id],
      );
      if (duplicate.rows.length > 0) {
        throw new DetranError('DASH.VALIDATION_FAILED', {
          status: 400,
          context: { field: 'name', reason: 'duplicate' },
        });
      }
    }
    const updated = await tx.query<BiPanelRow>(
      `update dashboard.bi_panel set
         name = coalesce($3, name),
         description = case when $4::boolean then $5 else description end,
         visibility_profile = coalesce($6, visibility_profile),
         config_json = coalesce($7::jsonb, config_json),
         status = 'draft', published_at = null, published_by = null,
         version = version + 1, updated_at = $8
       where tenant_id = $1 and id = $2::uuid
       returning *`,
      [
        ctx.tenantId,
        id,
        input.name ?? null,
        input.description !== undefined,
        input.description ?? null,
        input.visibilityProfile ?? null,
        input.configJson === undefined
          ? null
          : JSON.stringify(input.configJson),
        ctx.now.toISOString(),
      ],
    );
    return updated.rows[0]!;
  }

  async publishBiPanel(
    tx: DashboardSqlTransaction,
    id: string,
    ifMatch: string | undefined,
    ctx: CycleContext,
  ): Promise<BiPanelRow> {
    const row = await this.biPanelRow(tx, ctx.tenantId, id);
    assertDashIfMatch(ifMatch, row.version);
    if (row.status !== 'draft') {
      throw new DetranError('DASH.VALIDATION_FAILED', {
        status: 400,
        context: { currentState: row.status, sourcePending: 'OD-D35' },
      });
    }
    const updated = await tx.query<BiPanelRow>(
      `update dashboard.bi_panel set
         status = 'published', published_at = $3, published_by = $4::uuid,
         version = version + 1, updated_at = $3
       where tenant_id = $1 and id = $2::uuid
       returning *`,
      [ctx.tenantId, id, ctx.now.toISOString(), ctx.actor.id ?? null],
    );
    return updated.rows[0]!;
  }
}

/** §6.3: `kind='ceiling'` só em bloco A e `kind='target'` só em B/C/D. */
function assertThresholdKind(
  indicator: IndicatorRow,
  threshold: Threshold,
): void {
  const expected = indicator.block === 'A' ? 'ceiling' : 'target';
  if (threshold.kind !== expected) {
    throw new DetranError('DASH.INDICATOR_TARGET_AND_CEILING_MIXED', {
      status: 422,
      context: {
        code: indicator.code,
        block: indicator.block,
        kind: threshold.kind,
      },
    });
  }
}

function monthStart(now: Date): string {
  return `${now.toISOString().slice(0, 7)}-01`;
}
