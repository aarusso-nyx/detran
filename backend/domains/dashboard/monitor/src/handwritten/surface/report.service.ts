// Relatórios gerados (CTG-0002 §3.3, §10.7; route contract §4; plan M22):
// `request` (201 `processing`, `ReportRequested`), `complete` (`file_uri`,
// `file_hash` SHA-256, marca d'água de §9.4 com a data-hora do `complete`,
// `ReportGenerated`), `fail` (`failure_code`, `ReportFailed` — OD-D33),
// `list`/`get` (nunca `file_uri` para papel abaixo de `layer`). Não há job
// neste CTG (OD-D50): `complete`/`fail` são chamados por `bi-analyst`/
// `technical-admin`.
import { Injectable } from '@nestjs/common';
import { DetranError, type DashboardLayer } from '@detran/shared';

import {
  DASHBOARD_EVENT_TYPES,
  assertDashIfMatch,
  envelopeOf,
  publish,
  type CycleContext,
} from '../cycle/index.js';
import type { DashboardSqlTransaction } from '../projection-contract.js';
import { layerAtLeast, paginate, tenantInfoOf } from './layer-gate.js';
import { watermarkOf } from './watermark.js';
import {
  pageOf,
  type CompleteReportInput,
  type FailReportInput,
  type RequestReportInput,
} from './dto.js';

const SHA256_HEX = /^[0-9a-f]{64}$/;

export interface GeneratedReportRow extends Record<string, unknown> {
  id: string;
  user_ref: string;
  report_type: string;
  filters_json: Record<string, unknown> | null;
  layer: DashboardLayer;
  purpose: string | null;
  requested_at: Date;
  completed_at: Date | null;
  status: 'processing' | 'completed' | 'failed';
  file_uri: string | null;
  file_hash: string | null;
  watermark: string | null;
  failure_code: string | null;
  version: number;
}

export function reportView(
  row: GeneratedReportRow,
  roleLayer: DashboardLayer,
): Record<string, unknown> {
  const mayDownload = layerAtLeast(roleLayer, row.layer);
  return {
    id: row.id,
    userRef: row.user_ref,
    reportType: row.report_type,
    filters: row.filters_json ?? {},
    layer: row.layer,
    purpose: row.purpose,
    requestedAt: row.requested_at.toISOString(),
    completedAt: row.completed_at ? row.completed_at.toISOString() : null,
    status: row.status,
    fileUri: mayDownload ? row.file_uri : null,
    fileHash: row.file_hash,
    watermark: row.watermark,
    failureCode: row.failure_code,
    version: row.version,
  };
}

@Injectable()
export class DashboardReportService {
  async list(
    tx: DashboardSqlTransaction,
    tenantId: string,
    roleLayer: DashboardLayer,
    filter: {
      status?: string | undefined;
      reportType?: string | undefined;
      page?: number | undefined;
      pageSize?: number | undefined;
    },
  ): Promise<ReturnType<typeof paginate<Record<string, unknown>>>> {
    const result = await tx.query<GeneratedReportRow>(
      `select * from dashboard.generated_report
        where tenant_id = $1
          and ($2::text is null or status = $2)
          and ($3::text is null or report_type = $3)
        order by requested_at desc, id desc`,
      [tenantId, filter.status ?? null, filter.reportType ?? null],
    );
    return paginate(
      result.rows.map((row) => reportView(row, roleLayer)),
      pageOf(filter),
    );
  }

  async get(
    tx: DashboardSqlTransaction,
    tenantId: string,
    id: string,
  ): Promise<GeneratedReportRow> {
    const result = await tx.query<GeneratedReportRow>(
      `select * from dashboard.generated_report where tenant_id = $1 and id = $2::uuid`,
      [tenantId, id],
    );
    const row = result.rows[0];
    if (!row) {
      throw new DetranError('DASH.TENANT_MISMATCH', {
        status: 404,
        context: { reportId: id },
      });
    }
    return row;
  }

  /** `POST generated-reports` (§3.3): as guardas de camada/finalidade já passaram no controller. */
  async request(
    tx: DashboardSqlTransaction,
    input: RequestReportInput,
    purpose: string | null,
    ctx: CycleContext,
  ): Promise<GeneratedReportRow> {
    const created = await tx.query<GeneratedReportRow>(
      `insert into dashboard.generated_report
         (tenant_id, user_ref, report_type, filters_json, layer, purpose, requested_at, status, version, created_at)
       values ($1, $2::uuid, $3, $4::jsonb, $5, $6, $7, 'processing', 1, $7)
       returning *`,
      [
        ctx.tenantId,
        ctx.actor.id ?? null,
        input.reportType,
        JSON.stringify(input.filters ?? {}),
        input.layer,
        purpose,
        ctx.now.toISOString(),
      ],
    );
    const row = created.rows[0]!;
    await this.emit(tx, row, 'ReportRequested', ctx);
    return row;
  }

  async complete(
    tx: DashboardSqlTransaction,
    id: string,
    input: CompleteReportInput,
    ifMatch: string | undefined,
    ctx: CycleContext,
  ): Promise<GeneratedReportRow> {
    const row = await this.get(tx, ctx.tenantId, id);
    assertDashIfMatch(ifMatch, row.version);
    this.assertProcessing(row);
    if (!SHA256_HEX.test(input.fileHash)) {
      throw new DetranError('DASH.REPORT_FILE_HASH_MISMATCH', {
        status: 422,
        context: { reportId: id },
      });
    }
    const tenant = await tenantInfoOf(tx, ctx.tenantId);
    const watermark = watermarkOf({
      agency: tenant.agency,
      layer: row.layer,
      userRef: row.user_ref,
      userRole: ctx.actor.role ?? ctx.actor.roles[0] ?? 'sistema',
      at: ctx.now,
      scope: row.report_type,
      filters: row.filters_json ?? {},
      exportId: row.id,
    });
    const updated = await tx.query<GeneratedReportRow>(
      `update dashboard.generated_report set
         status = 'completed', file_uri = $3, file_hash = $4, watermark = $5,
         completed_at = $6, version = version + 1, updated_at = $6
       where tenant_id = $1 and id = $2::uuid
       returning *`,
      [
        ctx.tenantId,
        id,
        input.fileUri,
        input.fileHash,
        watermark,
        ctx.now.toISOString(),
      ],
    );
    const completed = updated.rows[0]!;
    await this.emit(tx, completed, 'ReportGenerated', ctx);
    return completed;
  }

  async fail(
    tx: DashboardSqlTransaction,
    id: string,
    input: FailReportInput,
    ifMatch: string | undefined,
    ctx: CycleContext,
  ): Promise<GeneratedReportRow> {
    const row = await this.get(tx, ctx.tenantId, id);
    assertDashIfMatch(ifMatch, row.version);
    this.assertProcessing(row);
    const updated = await tx.query<GeneratedReportRow>(
      `update dashboard.generated_report set
         status = 'failed', failure_code = $3, version = version + 1, updated_at = $4
       where tenant_id = $1 and id = $2::uuid
       returning *`,
      [ctx.tenantId, id, input.failureCode, ctx.now.toISOString()],
    );
    const failed = updated.rows[0]!;
    await this.emit(tx, failed, 'ReportFailed', ctx);
    return failed;
  }

  private assertProcessing(row: GeneratedReportRow): void {
    if (row.status !== 'processing') {
      throw new DetranError('DASH.REPORT_STATE_INVALID', {
        status: 409,
        context: { reportId: row.id, currentState: row.status },
      });
    }
  }

  private async emit(
    tx: DashboardSqlTransaction,
    row: GeneratedReportRow,
    domainEvent: 'ReportRequested' | 'ReportGenerated' | 'ReportFailed',
    ctx: CycleContext,
  ): Promise<void> {
    await publish(
      tx,
      envelopeOf({
        type: DASHBOARD_EVENT_TYPES.reportChanged,
        domainEvent,
        tenantId: ctx.tenantId,
        occurredAt: ctx.now,
        actor: ctx.actor,
        correlationId: ctx.requestId,
        aggregate: {
          kind: 'generated_report',
          id: row.id,
          version: row.version,
        },
        data: {
          reportId: row.id,
          reportType: row.report_type,
          layer: row.layer,
          purpose: row.purpose,
          status: row.status,
          fileHash: row.file_hash,
          failureCode: row.failure_code,
          occurredAt: ctx.now.toISOString(),
        },
      }),
    );
  }
}
