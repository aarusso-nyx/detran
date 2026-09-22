// `/v1/dashboard/{audit-trail,comparisons,transparency,kpis}` (CTG-0002 §3.6,
// §10.2–§10.5; plan M22). `@Resource` por método. `GET audit-trail` é N1 por
// padrão e N2 com `object`/`app` (§5.2) — e o próprio acesso é logado;
// `comparisons` nunca é nominal (`person` ⇒ 403); `kpis` só de tabelas
// próprias (`meta.freshness` de estado próprio).
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import {
  Action,
  Audit,
  DetranError,
  Resource,
  withTenantContext,
  type RequestLike,
} from '@detran/shared';

import type { DashboardSqlTransaction } from '../projection-contract.js';
import { DashboardAuditService } from './audit.service.js';
import {
  AuditTrailQuery,
  ComparisonsQuery,
  KpisQuery,
  TransparencyAuditDto,
  TransparencyChecklistQuery,
} from './dto.js';
import { kpiRange } from './export.service.js';
import {
  DOMAIN_BY_DIMENSION,
  DashboardLayerGate,
  ownStateFreshness,
  parseWith,
  readCellThreshold,
  type ResponseLike,
} from './layer-gate.js';
import { OpsParameterService } from '@detran/ops-parameter';

@Controller('v1/dashboard')
export class DashboardAuditController {
  constructor(
    private readonly audit: DashboardAuditService,
    private readonly gate: DashboardLayerGate,
    private readonly parameters: OpsParameterService,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Get('audit-trail')
  @Resource('dashboard:audit-trail')
  @Action('read')
  async auditTrail(
    @Req() req: RequestLike,
    @Query() rawQuery: unknown,
  ): Promise<Record<string, unknown>> {
    const query = parseWith(AuditTrailQuery, rawQuery);
    const n2 = query.object !== undefined || query.app !== undefined;
    return this.tx(async (tx) => {
      const layer = await this.gate.open(tx, req, {
        route: 'GET audit-trail',
        policy: 'dashboard:audit-trail:read',
        requiredLayer: n2 ? 'N2' : 'N1',
        ceiling: n2 ? 'N2' : 'N1',
        app: query.app,
        filters: query,
      });
      const listed = await this.audit.auditTrail(
        tx,
        this.gate.tenantId(),
        query,
        layer.servedLayer,
      );
      await this.gate.record(tx, layer, listed.items.length);
      return {
        items: listed.items,
        page: listed.page,
        pageSize: listed.pageSize,
        total: listed.total,
        meta: {
          freshness: ownStateFreshness(this.gate.now()),
          page: listed.page,
          pageSize: listed.pageSize,
          total: listed.total,
        },
      };
    });
  }

  @Get('comparisons')
  @Resource('dashboard:comparison')
  @Action('read')
  async comparisons(
    @Req() req: RequestLike,
    @Query() rawQuery: unknown,
  ): Promise<Record<string, unknown>> {
    const query = parseWith(ComparisonsQuery, rawQuery);
    return this.tx(async (tx) => {
      const layer = await this.gate.open(tx, req, {
        route: 'GET comparisons',
        policy: 'dashboard:comparison:read',
        requiredLayer: 'N1',
        ceiling: 'N1',
        app: DOMAIN_BY_DIMENSION[query.dimension],
        filters: query,
      });
      if (query.person === true) {
        throw new DetranError('DASH.RANKING_OF_PERSONS_FORBIDDEN', {
          status: 403,
          context: { dimension: query.dimension },
        });
      }
      const threshold = await readCellThreshold(this.parameters);
      const result = await this.audit.comparisons(
        tx,
        this.gate.tenantId(),
        query,
        threshold,
      );
      await this.gate.record(tx, layer, result.items.length);
      return {
        items: result.items,
        total: result.items.length,
        suppressedCells: result.suppressedCells,
        warnings:
          result.suppressedCells > 0
            ? [
                {
                  code: 'DASH.CELL_SUPPRESSED',
                  context: {
                    suppressedCells: result.suppressedCells,
                    threshold,
                  },
                },
              ]
            : [],
        meta: {
          freshness: ownStateFreshness(this.gate.now()),
          total: result.items.length,
          ...(result.sourcePending
            ? { sourcePending: result.sourcePending }
            : {}),
        },
      };
    });
  }

  @Get('transparency/checklist')
  @Resource('dashboard:transparency-audit')
  @Action('read')
  async transparencyChecklist(
    @Req() req: RequestLike,
    @Query() rawQuery: unknown,
  ): Promise<Record<string, unknown>> {
    const query = parseWith(TransparencyChecklistQuery, rawQuery, {
      period: {
        code: 'DASH.VALIDATION_FAILED',
        status: 400,
        context: { reason: 'period' },
      },
    });
    return this.tx(async (tx) => {
      const layer = await this.gate.open(tx, req, {
        route: 'GET transparency/checklist',
        policy: 'dashboard:transparency-audit:read',
        requiredLayer: 'N0',
        filters: query,
      });
      const ctx = await this.gate.context(
        tx,
        req,
        'dashboard:transparency-audit:read',
      );
      const period = query.period ?? this.audit.currentPeriod(ctx.tz);
      const checklist = await this.audit.transparencyChecklist(
        tx,
        ctx.tenantId,
        period,
      );
      await this.gate.record(tx, layer, checklist.items.length);
      return {
        ...checklist,
        meta: {
          freshness: ownStateFreshness(ctx.now),
          total: checklist.items.length,
        },
      };
    });
  }

  @Post('transparency/audits')
  @HttpCode(201)
  @Resource('dashboard:transparency-audit')
  @Action('audit')
  @Audit({
    action: 'DASH_TRANSPARENCY_AUDIT',
    entity: 'dashboard.transparency_audit',
  })
  async transparencyAudit(
    @Req() req: RequestLike,
    @Body() body: unknown,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    const periodicity = await this.audit.auditPeriodicity();
    const dto = parseWith(TransparencyAuditDto, body, {
      period: {
        code: 'DASH.DUTY_PERIOD_INVALID',
        status: 400,
        context: { periodicity },
      },
    });
    return this.tx(async (tx) => {
      const ctx = await this.gate.context(
        tx,
        req,
        'dashboard:transparency-audit:audit',
      );
      const created = await this.audit.transparencyAudit(tx, dto, ctx);
      res.status(201);
      return created;
    });
  }

  @Get('kpis')
  @Resource('dashboard:kpi')
  @Action('read')
  async kpis(
    @Req() req: RequestLike,
    @Query() rawQuery: unknown,
  ): Promise<Record<string, unknown>> {
    const query = parseWith(KpisQuery, rawQuery);
    return this.tx(async (tx) => {
      const layer = await this.gate.open(tx, req, {
        route: 'GET kpis',
        policy: 'dashboard:kpi:read',
        requiredLayer: 'N0',
        filters: query,
      });
      const ctx = await this.gate.context(tx, req, 'dashboard:kpi:read');
      const threshold = await readCellThreshold(this.parameters);
      const kpis = await this.audit.kpis(
        tx,
        ctx.tenantId,
        kpiRange(query, ctx),
        threshold,
      );
      await this.gate.record(tx, layer, 1);
      return { ...kpis, meta: { freshness: ownStateFreshness(ctx.now) } };
    });
  }

  private tx<T>(work: (tx: DashboardSqlTransaction) => Promise<T>): Promise<T> {
    return withTenantContext(
      this.database,
      this.requestContext,
      (transaction: Transaction) =>
        work(transaction as unknown as DashboardSqlTransaction),
    );
  }
}
