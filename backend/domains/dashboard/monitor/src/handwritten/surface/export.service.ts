// Exportação (CTG-0002 §3.5, §9 — [RN-DASH-172] cinco regras, [RN-DASH-161];
// plan M21): camada herdada do recorte (nunca acima da do papel, N3 nunca),
// formato aberto, finalidade e escopo em N2, limiar de célula para recortes
// agregados, marca d'água (§9.4) no arquivo e em `export_log.watermark`,
// `rows > dashboard.export.approval_rows` ⇒ 202 `pending-approval` e
// `approve` nominal do `agency-admin`; `EXPORTACAO_REGISTRADA` na outbox e
// `access_log` reforçado (`export_id`) na mesma transação. Os recortes
// (`buildScope`) leem só tabelas próprias; o recorte `alerts` é o mesmo de
// `GET alerts` (exportado daqui para o controller).
import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import {
  DetranError,
  type DashboardLayer,
  type RequestLike,
} from '@detran/shared';
import { OpsParameterService } from '@detran/ops-parameter';

import {
  DASHBOARD_EVENT_TYPES,
  dashboardParameterKey,
  envelopeOf,
  publish,
  readNumericParameter,
  type CycleContext,
} from '../cycle/index.js';
import type { DashboardSqlTransaction } from '../projection-contract.js';
import { DashboardAuditService } from './audit.service.js';
import { indicatorView, type IndicatorRow } from './catalog.service.js';
import {
  DOMAIN_BY_DIMENSION,
  DashboardLayerGate,
  domainAllowed,
  layerAtLeast,
  readCellThreshold,
  tenantInfoOf,
  type DomainScope,
  type LayerContext,
} from './layer-gate.js';
import { suppress, suppressionWarning, type CountCell } from './suppression.js';
import {
  csvWithWatermark,
  jsonWithWatermark,
  watermarkOf,
} from './watermark.js';
import {
  AuditTrailQuery,
  ComparisonsQuery,
  KpisQuery,
  N3_RESERVED_FILTER_KEYS,
  OPEN_EXPORT_FORMATS,
  pageOf,
  type AlertsQueryInput,
  type ApproveExportInput,
  type CreateExportInput,
  type ExportScope,
} from './dto.js';

// ---------------------------------------------------------------------------
// recorte `alerts` (§3.1 lista; §9.2)
// ---------------------------------------------------------------------------

export interface AlertListRow extends Record<string, unknown> {
  id: string;
  indicator_code: string;
  track: string;
  state: string;
  severity: string;
  block: string;
  source_app: string;
  object_kind: string;
  object_ref: string;
  object_layer: DashboardLayer;
  owner_role: string;
  owner_ref: string | null;
  governing_clock: string | null;
  next_milestone_at: Date | null;
  ceiling_on: string | null;
  detected_at: Date;
  classified_at: Date | null;
  notified_at: Date | null;
  acknowledged_at: Date | null;
  treating_at: Date | null;
  verified_at: Date | null;
  closed_at: Date | null;
  escalated_at: Date | null;
  critical_at: Date | null;
  incident_at: Date | null;
  ack_channel: string | null;
  escalation_level: number;
  incident_ref: string | null;
  version: number;
  total?: string;
}

const iso = (value: Date | null): string | null =>
  value ? value.toISOString() : null;

/** Item de lista (§6.6 sem trilha/timers); `object.ref`/`ownerRef` só em N2 e no escopo do papel (§5.2). */
export function alertItem(
  row: AlertListRow,
  servedLayer: DashboardLayer,
  domains: DomainScope,
): Record<string, unknown> {
  const full = servedLayer === 'N2' && domainAllowed(domains, row.source_app);
  return {
    id: row.id,
    indicatorCode: row.indicator_code,
    track: row.track,
    state: row.state,
    severity: row.severity,
    block: row.block,
    sourceApp: row.source_app,
    object: {
      kind: row.object_kind,
      ref: full ? row.object_ref : null,
      layer: row.object_layer,
    },
    ownerRole: row.owner_role,
    ownerRef: full ? row.owner_ref : null,
    governingClock: row.governing_clock,
    nextMilestoneAt: iso(row.next_milestone_at),
    ceilingOn: row.ceiling_on,
    escalationLevel: row.escalation_level,
    ackChannel: row.ack_channel,
    incidentRef: row.incident_ref,
    timestamps: {
      detectedAt: iso(row.detected_at),
      classifiedAt: iso(row.classified_at),
      notifiedAt: iso(row.notified_at),
      acknowledgedAt: iso(row.acknowledged_at),
      treatingAt: iso(row.treating_at),
      verifiedAt: iso(row.verified_at),
      closedAt: iso(row.closed_at),
      escalatedAt: iso(row.escalated_at),
      criticalAt: iso(row.critical_at),
      incidentAt: iso(row.incident_at),
    },
    version: row.version,
  };
}

/** `GET alerts` (§3.1): filtros, ordem por severidade combinada e paginação em SQL. */
export async function listAlerts(
  tx: DashboardSqlTransaction,
  tenantId: string,
  query: Omit<AlertsQueryInput, 'layer'>,
  servedLayer: DashboardLayer,
  domains: DomainScope,
  paginated = true,
): Promise<{
  items: Record<string, unknown>[];
  indicatorCodes: string[];
  page: number;
  pageSize: number;
  total: number;
}> {
  const page = pageOf(query);
  const result = await tx.query<AlertListRow>(
    `select a.*, a.ceiling_on::text as ceiling_on, count(*) over ()::text as total
       from dashboard.alert a
       join dashboard.severity_ref s on s.code = a.severity
      where a.tenant_id = $1
        and ($2::text is null or a.state = $2)
        and ($3::text is null or a.severity = $3)
        and ($4::text is null or a.block = $4)
        and ($5::text is null or a.indicator_code = $5)
        and ($6::text is null or a.source_app = $6)
        and ($7::text is null or a.owner_role = $7)
        and ($8::uuid is null or exists (
              select 1 from dashboard.prescription_risk p
               where p.tenant_id = a.tenant_id and p.pool_id = $8::uuid
                 and p.case_id::text = a.object_ref))
      order by s.sort_order desc, a.next_milestone_at asc nulls last, a.detected_at asc, a.id
      ${paginated ? 'limit $9 offset $10' : ''}`,
    [
      tenantId,
      query.state ?? null,
      query.severity ?? null,
      query.block ?? null,
      query.indicator ?? null,
      query.app ?? null,
      query.owner ?? null,
      query.pool ?? null,
      ...(paginated ? [page.pageSize, page.offset] : []),
    ],
  );
  const total = result.rows[0] ? Number(result.rows[0].total) : 0;
  return {
    items: result.rows.map((row) => alertItem(row, servedLayer, domains)),
    indicatorCodes: Array.from(
      new Set(result.rows.map((row) => row.indicator_code)),
    ),
    page: page.page,
    pageSize: page.pageSize,
    total,
  };
}

// ---------------------------------------------------------------------------
// export_log
// ---------------------------------------------------------------------------

export interface ExportLogRow extends Record<string, unknown> {
  id: string;
  user_ref: string;
  user_role: string;
  scope: string;
  filters_json: Record<string, unknown>;
  format: string;
  layer: DashboardLayer;
  purpose: string | null;
  row_count: number;
  status: 'registered' | 'pending-approval' | 'approved' | 'rejected';
  justification: string | null;
  approved_by: string | null;
  approved_at: Date | null;
  watermark: string | null;
  suppressed_cells: number;
  origin: string | null;
  requested_at: Date;
}

export interface ScopeResult {
  rows: unknown[];
  suppressedCells: number;
  threshold: number | null;
}

export interface ExportResponse {
  status: 201 | 202;
  body: Record<string, unknown>;
}

/** Recorte que só existe em N3 (§9.1 regra 4) — examinado no corpo bruto, antes do `.strict()`. */
export function assertExportNotN3(rawBody: unknown): void {
  if (!rawBody || typeof rawBody !== 'object') return;
  const body = rawBody as Record<string, unknown>;
  const filters =
    body.filters && typeof body.filters === 'object'
      ? (body.filters as Record<string, unknown>)
      : {};
  const reserved = (N3_RESERVED_FILTER_KEYS as readonly string[]).some(
    (key) => key in filters || key in body,
  );
  if (reserved || body.layer === 'N3' || filters.layer === 'N3') {
    throw new DetranError('DASH.EXPORT_N3_FORBIDDEN', { status: 403 });
  }
}

/** Camada exigida pelo recorte (§9.2) e app do recorte para o escopo (§5.3). */
export function scopeRequirement(
  scope: ExportScope,
  filters: Record<string, unknown>,
): { requiredLayer: DashboardLayer; app: string | undefined } {
  switch (scope) {
    case 'alerts':
      return {
        requiredLayer: filters.includeObject === true ? 'N2' : 'N1',
        app: typeof filters.app === 'string' ? filters.app : undefined,
      };
    case 'sources':
      return { requiredLayer: 'N1', app: undefined };
    case 'comparisons':
      return {
        requiredLayer: 'N1',
        app:
          typeof filters.dimension === 'string'
            ? DOMAIN_BY_DIMENSION[filters.dimension]
            : undefined,
      };
    case 'audit-trail':
      return {
        requiredLayer:
          filters.object !== undefined || filters.app !== undefined
            ? 'N2'
            : 'N1',
        app: typeof filters.app === 'string' ? filters.app : undefined,
      };
    case 'duties':
    case 'indicators':
    case 'kpis':
      return { requiredLayer: 'N0', app: undefined };
  }
}

const AGGREGATED_SCOPES: ReadonlySet<ExportScope> = new Set([
  'comparisons',
  'kpis',
  'indicators',
]);

@Injectable()
export class DashboardExportService {
  constructor(
    private readonly gate: DashboardLayerGate,
    private readonly audit: DashboardAuditService,
    private readonly parameters: OpsParameterService,
  ) {}

  /** `POST exports` (§9.1 ordem de avaliação → §9.3 fluxo 201/202). */
  async create(
    tx: DashboardSqlTransaction,
    req: RequestLike,
    dto: CreateExportInput,
    ctx: CycleContext,
  ): Promise<ExportResponse> {
    const filters = dto.filters ?? {};
    const requirement = scopeRequirement(dto.scope, filters);
    const roleLayer = this.gate.roleLayerOf(req);
    // regra 1 — camada exigida ≤ teto do papel (a exportação herda a camada servida)
    if (!layerAtLeast(roleLayer, requirement.requiredLayer)) {
      throw new DetranError('DASH.EXPORT_LAYER_EXCEEDED', {
        status: 403,
        context: { requiredLayer: requirement.requiredLayer, scope: dto.scope },
      });
    }
    // formato aberto
    if (!(OPEN_EXPORT_FORMATS as readonly string[]).includes(dto.format)) {
      throw new DetranError('DASH.EXPORT_FORMAT_NOT_OPEN', {
        status: 400,
        context: { allowed: [...OPEN_EXPORT_FORMATS], format: dto.format },
      });
    }
    // regra 2 — N2 exige finalidade do catálogo e escopo de domínio
    const servedLayer: DashboardLayer = requirement.requiredLayer;
    let purpose: string | null = null;
    if (servedLayer === 'N2') {
      if (!dto.purpose) {
        throw new DetranError('DASH.EXPORT_PURPOSE_REQUIRED', {
          status: 400,
          context: { scope: dto.scope },
        });
      }
      purpose = await this.gate.validatePurpose(dto.purpose);
    }
    const layerCtx: LayerContext = await this.gate.open(tx, req, {
      route: 'POST exports',
      policy: 'dashboard:export:create',
      requiredLayer: requirement.requiredLayer,
      requestedLayer: servedLayer,
      app: requirement.app,
      filters: { scope: dto.scope, format: dto.format, ...filters },
      purpose,
    });
    // limiar de célula legível para recortes agregados; §9.5
    const scope = await this.buildScope(
      tx,
      dto.scope,
      filters,
      servedLayer,
      layerCtx.domains,
      ctx,
    );
    const declared = dto.rows ?? 0;
    const rowCount = Math.max(declared, scope.rows.length);
    const limitKey = dashboardParameterKey('export', 'approval_rows');
    const limit = await readNumericParameter(this.parameters, limitKey);
    const exportId = randomUUID();
    const tenant = await tenantInfoOf(tx, ctx.tenantId);
    if (rowCount > limit) {
      await tx.query(
        `insert into dashboard.export_log
           (id, tenant_id, user_ref, user_role, scope, filters_json, format, layer, purpose, row_count,
            status, watermark, suppressed_cells, origin, requested_at, created_at)
         values ($1::uuid, $2, $3::uuid, $4, $5, $6::jsonb, $7, $8, $9, $10, 'pending-approval', null, $11, $12, $13, $13)`,
        [
          exportId,
          ctx.tenantId,
          layerCtx.userRef,
          layerCtx.userRole,
          dto.scope,
          JSON.stringify(filters),
          dto.format,
          servedLayer,
          purpose,
          rowCount,
          scope.suppressedCells,
          layerCtx.origin,
          ctx.now.toISOString(),
        ],
      );
      await this.gate.record(tx, layerCtx, rowCount, exportId);
      await this.emit(
        tx,
        exportId,
        layerCtx,
        dto.scope,
        dto.format,
        servedLayer,
        purpose,
        rowCount,
        scope.suppressedCells,
        'pending-approval',
        null,
        1,
        ctx,
      );
      return {
        status: 202,
        body: {
          code: 'DASH.EXPORT_VOLUME_APPROVAL_REQUIRED',
          status: 202,
          message: 'DASH.EXPORT_VOLUME_APPROVAL_REQUIRED',
          context: { rows: rowCount, limit, exportId },
        },
      };
    }
    const watermark = watermarkOf({
      agency: tenant.agency,
      layer: servedLayer,
      userRef: layerCtx.userRef,
      userRole: layerCtx.userRole,
      at: ctx.now,
      scope: dto.scope,
      filters,
      exportId,
    });
    await tx.query(
      `insert into dashboard.export_log
         (id, tenant_id, user_ref, user_role, scope, filters_json, format, layer, purpose, row_count,
          status, watermark, suppressed_cells, origin, requested_at, created_at)
       values ($1::uuid, $2, $3::uuid, $4, $5, $6::jsonb, $7, $8, $9, $10, 'registered', $11, $12, $13, $14, $14)`,
      [
        exportId,
        ctx.tenantId,
        layerCtx.userRef,
        layerCtx.userRole,
        dto.scope,
        JSON.stringify(filters),
        dto.format,
        servedLayer,
        purpose,
        rowCount,
        watermark,
        scope.suppressedCells,
        layerCtx.origin,
        ctx.now.toISOString(),
      ],
    );
    await this.gate.record(tx, layerCtx, rowCount, exportId);
    await this.emit(
      tx,
      exportId,
      layerCtx,
      dto.scope,
      dto.format,
      servedLayer,
      purpose,
      rowCount,
      scope.suppressedCells,
      'registered',
      null,
      1,
      ctx,
    );
    return {
      status: 201,
      body: this.body(
        exportId,
        'registered',
        dto.scope,
        dto.format,
        servedLayer,
        purpose,
        rowCount,
        scope,
        watermark,
      ),
    };
  }

  /** `POST exports/{id}/approve` (§9.3): regenera o recorte agora; sem `If-Match` (OD-D37). */
  async approve(
    tx: DashboardSqlTransaction,
    id: string,
    dto: ApproveExportInput,
    req: RequestLike,
    ctx: CycleContext,
  ): Promise<Record<string, unknown>> {
    const found = await tx.query<ExportLogRow>(
      `select * from dashboard.export_log where tenant_id = $1 and id = $2::uuid`,
      [ctx.tenantId, id],
    );
    const row = found.rows[0];
    if (!row) {
      throw new DetranError('DASH.TENANT_MISMATCH', {
        status: 404,
        context: { exportId: id },
      });
    }
    if (row.status !== 'pending-approval') {
      throw new DetranError('DASH.VALIDATION_FAILED', {
        status: 400,
        context: {
          exportId: id,
          currentState: row.status,
          sourcePending: 'OD-D35',
        },
      });
    }
    const layerCtx = await this.gate.open(tx, req, {
      route: 'POST exports/{id}/approve',
      policy: 'dashboard:export:approve',
      requiredLayer: 'N0',
      requestedLayer: row.layer,
      filters: { exportId: id },
    });
    const scope = await this.buildScope(
      tx,
      row.scope as ExportScope,
      row.filters_json ?? {},
      row.layer,
      layerCtx.domains,
      ctx,
    );
    const tenant = await tenantInfoOf(tx, ctx.tenantId);
    const watermark = watermarkOf({
      agency: tenant.agency,
      layer: row.layer,
      userRef: row.user_ref,
      userRole: row.user_role,
      at: ctx.now,
      scope: row.scope,
      filters: row.filters_json ?? {},
      exportId: row.id,
    });
    const rowCount = Math.max(row.row_count, scope.rows.length);
    await tx.query(
      `update dashboard.export_log set
         status = 'approved', approved_by = $3::uuid, approved_at = $4, justification = $5,
         watermark = $6, suppressed_cells = $7, updated_at = $4
       where tenant_id = $1 and id = $2::uuid`,
      [
        ctx.tenantId,
        id,
        layerCtx.userRef,
        ctx.now.toISOString(),
        dto.justification,
        watermark,
        scope.suppressedCells,
      ],
    );
    await this.gate.record(tx, layerCtx, rowCount, id);
    await this.emit(
      tx,
      id,
      layerCtx,
      row.scope,
      row.format,
      row.layer,
      row.purpose,
      rowCount,
      scope.suppressedCells,
      'approved',
      layerCtx.userRef,
      2,
      ctx,
    );
    return this.body(
      id,
      'approved',
      row.scope,
      row.format,
      row.layer,
      row.purpose,
      rowCount,
      scope,
      watermark,
    );
  }

  /** Linhas do recorte (§9.2) já na camada servida e com supressão §9.5 quando agregado. */
  async buildScope(
    tx: DashboardSqlTransaction,
    scope: ExportScope,
    filters: Record<string, unknown>,
    servedLayer: DashboardLayer,
    domains: DomainScope,
    ctx: CycleContext,
  ): Promise<ScopeResult> {
    const threshold = AGGREGATED_SCOPES.has(scope)
      ? await readCellThreshold(this.parameters)
      : null;
    switch (scope) {
      case 'alerts': {
        const query = pickAlertFilters(filters);
        const listed = await listAlerts(
          tx,
          ctx.tenantId,
          query,
          servedLayer,
          domains,
          false,
        );
        return { rows: listed.items, suppressedCells: 0, threshold };
      }
      case 'duties': {
        const result = await tx.query<Record<string, unknown>>(
          `select d.code as duty_code, d.title, d.periodicity, d.deadline_kind, d.scope, d.owner_role,
                  d.indicator_code, c.period, c.state, c.deadline_on::text as deadline_on,
                  c.opened_at, c.submitted_at, c.proved_at, c.archived_at, c.late_at
             from dashboard.duty d
             left join dashboard.duty_cycle c on c.tenant_id = d.tenant_id and c.duty_code = d.code
            where d.tenant_id = $1
            order by d.code, c.period desc nulls last`,
          [ctx.tenantId],
        );
        return {
          rows: result.rows.map(camelize),
          suppressedCells: 0,
          threshold,
        };
      }
      case 'indicators': {
        const indicators = await tx.query<IndicatorRow>(
          `select * from dashboard.indicator where tenant_id = $1 order by code`,
          [ctx.tenantId],
        );
        const open = await tx.query<{ indicator_code: string; count: string }>(
          `select a.indicator_code, count(*)::text as count
             from dashboard.alert a
             join dashboard.alert_state_ref s on s.code = a.state
            where a.tenant_id = $1 and s.is_terminal = false
            group by a.indicator_code`,
          [ctx.tenantId],
        );
        const counts = new Map(
          open.rows.map((row) => [row.indicator_code, Number(row.count)]),
        );
        const cells: CountCell[] = indicators.rows.map((row) => ({
          key: row.code,
          count: counts.get(row.code) ?? 0,
        }));
        const suppressed = suppress(cells, threshold ?? 0);
        const byCode = new Map(suppressed.rows.map((cell) => [cell.key, cell]));
        return {
          rows: indicators.rows.map((row) => ({
            ...indicatorView(row),
            openAlerts: byCode.get(row.code)?.count ?? null,
            suppression: byCode.get(row.code)?.suppression,
          })),
          suppressedCells: suppressed.suppressedCells,
          threshold,
        };
      }
      case 'sources': {
        const result = await tx.query<Record<string, unknown>>(
          `select source_key, app, state, last_seen_at, last_read_at, acceptable_latency_minutes,
                  heartbeat_contract, stale_since, hidden, version
             from dashboard.source where tenant_id = $1 order by source_key`,
          [ctx.tenantId],
        );
        return {
          rows: result.rows.map(camelize),
          suppressedCells: 0,
          threshold,
        };
      }
      case 'comparisons': {
        const parsed = ComparisonsQuery.safeParse(filters);
        if (!parsed.success) {
          throw new DetranError('DASH.VALIDATION_FAILED', {
            status: 400,
            context: { field: 'filters.dimension', scope },
          });
        }
        const result = await this.audit.comparisons(
          tx,
          ctx.tenantId,
          parsed.data,
          threshold ?? 0,
        );
        return {
          rows: result.items,
          suppressedCells: result.suppressedCells,
          threshold,
        };
      }
      case 'kpis': {
        const parsed = KpisQuery.safeParse(filters);
        if (!parsed.success) {
          throw new DetranError('DASH.VALIDATION_FAILED', {
            status: 400,
            context: { field: 'filters', scope },
          });
        }
        const range = kpiRange(parsed.data, ctx);
        const kpis = await this.audit.kpis(
          tx,
          ctx.tenantId,
          range,
          threshold ?? 0,
        );
        const openAlerts = kpis.openAlerts as { suppressedCells: number };
        return {
          rows: [kpis],
          suppressedCells: openAlerts.suppressedCells,
          threshold,
        };
      }
      case 'audit-trail': {
        const parsed = AuditTrailQuery.safeParse({ ...filters, pageSize: 200 });
        if (!parsed.success) {
          throw new DetranError('DASH.VALIDATION_FAILED', {
            status: 400,
            context: { field: 'filters', scope },
          });
        }
        const trail = await this.audit.auditTrail(
          tx,
          ctx.tenantId,
          parsed.data,
          servedLayer,
        );
        return { rows: trail.items, suppressedCells: 0, threshold };
      }
    }
  }

  private body(
    id: string,
    status: string,
    scope: string,
    format: string,
    layer: DashboardLayer,
    purpose: string | null,
    rowCount: number,
    result: ScopeResult,
    watermark: string,
  ): Record<string, unknown> {
    const warning = suppressionWarning(
      result.suppressedCells,
      result.threshold ?? 0,
    );
    const content =
      format === 'csv'
        ? csvWithWatermark(watermark, result.rows.map(flatten))
        : jsonWithWatermark(watermark, layer, result.rows);
    return {
      id,
      status,
      scope,
      format,
      layer,
      purpose,
      rowCount,
      suppressedCells: result.suppressedCells,
      watermark,
      ...(warning ? { warnings: [warning] } : { warnings: [] }),
      content,
    };
  }

  private async emit(
    tx: DashboardSqlTransaction,
    exportId: string,
    layerCtx: LayerContext,
    scope: string,
    format: string,
    layer: DashboardLayer,
    purpose: string | null,
    rowCount: number,
    suppressedCells: number,
    status: 'registered' | 'pending-approval' | 'approved',
    approvedBy: string | null,
    version: number,
    ctx: CycleContext,
  ): Promise<void> {
    await publish(
      tx,
      envelopeOf({
        type: DASHBOARD_EVENT_TYPES.exportRegistered,
        domainEvent: 'EXPORTACAO_REGISTRADA',
        tenantId: ctx.tenantId,
        occurredAt: ctx.now,
        actor: ctx.actor,
        correlationId: ctx.requestId,
        aggregate: { kind: 'export_log', id: exportId, version },
        data: {
          exportId,
          userRef: layerCtx.userRef,
          userRole: layerCtx.userRole,
          scope,
          format,
          layer,
          purpose,
          rowCount,
          suppressedCells,
          status,
          approvedBy,
          occurredAt: ctx.now.toISOString(),
        },
      }),
    );
  }
}

/** Só os filtros de `GET alerts` que o recorte `alerts` conhece (§3.1). */
function pickAlertFilters(
  filters: Record<string, unknown>,
): Omit<AlertsQueryInput, 'layer'> {
  const text = (key: string): string | undefined =>
    typeof filters[key] === 'string' ? (filters[key] as string) : undefined;
  const block = text('block');
  return {
    state: text('state'),
    severity: text('severity'),
    block:
      block === 'A' || block === 'B' || block === 'C' || block === 'D'
        ? block
        : undefined,
    indicator: text('indicator'),
    app: text('app'),
    owner: text('owner'),
    unit: text('unit'),
    pool: text('pool'),
  };
}

/** `from..to` default = mês corrente no fuso do tenant (§10.5). */
export function kpiRange(
  query: { from?: string | undefined; to?: string | undefined },
  ctx: CycleContext,
): { from: string; to: string } {
  const today = civilDate(ctx.now, ctx.tz);
  return {
    from: query.from ?? `${today.slice(0, 7)}-01`,
    to: query.to ?? today,
  };
}

function civilDate(instant: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, value]),
  );
  return `${values.year!}-${values.month!}-${values.day!}`;
}

function camelize(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()),
      value instanceof Date ? value.toISOString() : value,
    ]),
  );
}

/** Linha plana para CSV: objetos aninhados viram JSON canônico na célula. */
function flatten(row: unknown): Record<string, unknown> {
  if (row && typeof row === 'object' && !Array.isArray(row)) {
    return row as Record<string, unknown>;
  }
  return { value: row };
}
