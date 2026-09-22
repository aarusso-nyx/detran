// `/v1/dashboard/{indicators,indicator-configs,bi-panels,generated-reports}`
// (CTG-0002 §3.3, §10.1, §10.7; route contract §4; plan M22). `@Resource` por
// método (a classe monta em `v1/dashboard`). Leituras N0 com `access_log`;
// painéis/relatórios acima da camada do papel são omitidos da lista e 403 no
// detalhe (§5.2); N3 recusado antes do enum (§5.4.3).
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
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
  etagOf,
  withTenantContext,
  type RequestLike,
} from '@detran/shared';

import type { DashboardSqlTransaction } from '../projection-contract.js';
import {
  DashboardCatalogService,
  biPanelView,
  indicatorConfigView,
} from './catalog.service.js';
import { DashboardReportService, reportView } from './report.service.js';
import {
  BiPanelDto,
  BiPanelsQuery,
  CompleteReportDto,
  FailReportDto,
  IndicatorConfigsQuery,
  IndicatorsQuery,
  PatchBiPanelDto,
  PatchIndicatorConfigDto,
  ReportsQuery,
  RequestReportDto,
  REPORT_TYPES,
} from './dto.js';
import {
  DashboardLayerGate,
  assertNotN3,
  headerValue,
  layerAtLeast,
  ownStateFreshness,
  parseWith,
  type ResponseLike,
} from './layer-gate.js';

@Controller('v1/dashboard')
export class DashboardCatalogController {
  constructor(
    private readonly catalog: DashboardCatalogService,
    private readonly reports: DashboardReportService,
    private readonly gate: DashboardLayerGate,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  // -------------------------------------------------------------------------
  // indicadores (§10.1)
  // -------------------------------------------------------------------------

  @Get('indicators')
  @Resource('dashboard:indicator')
  @Action('read')
  async indicators(
    @Req() req: RequestLike,
    @Query() rawQuery: unknown,
  ): Promise<Record<string, unknown>> {
    const query = parseWith(IndicatorsQuery, rawQuery);
    return this.tx(async (tx) => {
      const layer = await this.gate.open(tx, req, {
        route: 'GET indicators',
        policy: 'dashboard:indicator:read',
        requiredLayer: 'N0',
        filters: query,
      });
      const listed = await this.catalog.indicators(
        tx,
        this.gate.tenantId(),
        query,
      );
      await this.gate.record(tx, layer, listed.items.length);
      return {
        items: listed.items,
        page: listed.page,
        pageSize: listed.pageSize,
        total: listed.total,
        meta: {
          freshness: listed.freshness,
          page: listed.page,
          pageSize: listed.pageSize,
          total: listed.total,
        },
      };
    });
  }

  @Get('indicators/:code')
  @Resource('dashboard:indicator')
  @Action('read')
  async indicator(
    @Req() req: RequestLike,
    @Param('code') code: string,
  ): Promise<Record<string, unknown>> {
    return this.tx(async (tx) => {
      const row = await this.catalog.indicatorRow(
        tx,
        this.gate.tenantId(),
        code,
      );
      const layer = await this.gate.open(tx, req, {
        route: 'GET indicators/{code}',
        policy: 'dashboard:indicator:read',
        requiredLayer: 'N0',
        indicator: code,
        filters: { code },
      });
      const detail = await this.catalog.indicator(
        tx,
        this.gate.tenantId(),
        row,
      );
      await this.gate.record(tx, layer, 1);
      return { ...detail.body, meta: { freshness: detail.freshness } };
    });
  }

  // -------------------------------------------------------------------------
  // configurações de indicador (§3.3)
  // -------------------------------------------------------------------------

  @Get('indicator-configs')
  @Resource('dashboard:indicator-config')
  @Action('read')
  async indicatorConfigs(
    @Req() req: RequestLike,
    @Query() rawQuery: unknown,
  ): Promise<Record<string, unknown>> {
    const query = parseWith(IndicatorConfigsQuery, rawQuery);
    return this.tx(async (tx) => {
      const layer = await this.gate.open(tx, req, {
        route: 'GET indicator-configs',
        policy: 'dashboard:indicator-config:read',
        requiredLayer: 'N0',
        filters: query,
      });
      const listed = await this.catalog.indicatorConfigs(
        tx,
        this.gate.tenantId(),
        query,
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

  @Get('indicator-configs/:id')
  @Resource('dashboard:indicator-config')
  @Action('read')
  async indicatorConfig(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    return this.tx(async (tx) => {
      const row = await this.catalog.indicatorConfigRow(
        tx,
        this.gate.tenantId(),
        id,
      );
      const layer = await this.gate.open(tx, req, {
        route: 'GET indicator-configs/{id}',
        policy: 'dashboard:indicator-config:read',
        requiredLayer: 'N0',
        indicator: row.indicator_code,
        filters: { id },
      });
      await this.gate.record(tx, layer, 1);
      res.setHeader('ETag', etagOf(row.version));
      return {
        ...indicatorConfigView(row),
        meta: { freshness: ownStateFreshness(this.gate.now()) },
      };
    });
  }

  @Patch('indicator-configs/:id')
  @Resource('dashboard:indicator-config')
  @Action('update')
  @Audit({
    action: 'DASH_INDICATOR_CONFIG_UPDATE',
    entity: 'dashboard.indicator_config',
  })
  async patchIndicatorConfig(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | string[] | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    const dto = parseWith(PatchIndicatorConfigDto, body);
    return this.tx(async (tx) => {
      const ctx = await this.gate.context(
        tx,
        req,
        'dashboard:indicator-config:update',
      );
      const row = await this.catalog.patchIndicatorConfig(
        tx,
        id,
        dto,
        headerValue(ifMatch),
        ctx,
      );
      res.setHeader('ETag', etagOf(row.version));
      return indicatorConfigView(row);
    });
  }

  @Post('indicator-configs/:id/publish')
  @HttpCode(200)
  @Resource('dashboard:indicator-config')
  @Action('publish')
  @Audit({
    action: 'DASH_INDICATOR_CONFIG_PUBLISH',
    entity: 'dashboard.indicator_config',
  })
  async publishIndicatorConfig(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Headers('if-match') ifMatch: string | string[] | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    return this.tx(async (tx) => {
      const ctx = await this.gate.context(
        tx,
        req,
        'dashboard:indicator-config:publish',
      );
      const row = await this.catalog.publishIndicatorConfig(
        tx,
        id,
        headerValue(ifMatch),
        ctx,
      );
      res.setHeader('ETag', etagOf(row.version));
      return indicatorConfigView(row);
    });
  }

  // -------------------------------------------------------------------------
  // painéis (§3.3, §10.7)
  // -------------------------------------------------------------------------

  @Get('bi-panels')
  @Resource('dashboard:bi-panel')
  @Action('read')
  async biPanels(
    @Req() req: RequestLike,
    @Query() rawQuery: unknown,
  ): Promise<Record<string, unknown>> {
    assertNotN3(rawQuery);
    const query = parseWith(BiPanelsQuery, rawQuery);
    return this.tx(async (tx) => {
      const layer = await this.gate.open(tx, req, {
        route: 'GET bi-panels',
        policy: 'dashboard:bi-panel:read',
        requiredLayer: 'N0',
        filters: query,
      });
      const listed = await this.catalog.biPanels(
        tx,
        this.gate.tenantId(),
        layer.roleLayer,
        query,
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

  @Get('bi-panels/:id')
  @Resource('dashboard:bi-panel')
  @Action('read')
  async biPanel(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    return this.tx(async (tx) => {
      const row = await this.catalog.biPanelRow(tx, this.gate.tenantId(), id);
      const layer = await this.gate.open(tx, req, {
        route: 'GET bi-panels/{id}',
        policy: 'dashboard:bi-panel:read',
        requiredLayer: 'N0',
        filters: { id },
      });
      if (!layerAtLeast(layer.roleLayer, row.visibility_profile)) {
        throw new DetranError('DASH.LAYER_FORBIDDEN', {
          status: 403,
          context: {
            requiredLayer: row.visibility_profile,
            roles: layer.roles,
          },
        });
      }
      await this.gate.record(tx, layer, 1);
      res.setHeader('ETag', etagOf(row.version));
      return {
        ...biPanelView(row),
        meta: { freshness: ownStateFreshness(this.gate.now()) },
      };
    });
  }

  @Post('bi-panels')
  @Resource('dashboard:bi-panel')
  @Action('publish')
  @Audit({ action: 'DASH_BI_PANEL_CREATE', entity: 'dashboard.bi_panel' })
  async createBiPanel(
    @Req() req: RequestLike,
    @Body() body: unknown,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    assertNotN3(body);
    const dto = parseWith(BiPanelDto, body);
    return this.tx(async (tx) => {
      const ctx = await this.gate.context(
        tx,
        req,
        'dashboard:bi-panel:publish',
      );
      const row = await this.catalog.createBiPanel(tx, dto, ctx);
      res.status(201);
      res.setHeader('Location', `/v1/dashboard/bi-panels/${row.id}`);
      res.setHeader('ETag', etagOf(row.version));
      return biPanelView(row);
    });
  }

  @Patch('bi-panels/:id')
  @Resource('dashboard:bi-panel')
  @Action('publish')
  @Audit({ action: 'DASH_BI_PANEL_UPDATE', entity: 'dashboard.bi_panel' })
  async patchBiPanel(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | string[] | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    assertNotN3(body);
    const dto = parseWith(PatchBiPanelDto, body);
    return this.tx(async (tx) => {
      const ctx = await this.gate.context(
        tx,
        req,
        'dashboard:bi-panel:publish',
      );
      const row = await this.catalog.patchBiPanel(
        tx,
        id,
        dto,
        headerValue(ifMatch),
        ctx,
      );
      res.setHeader('ETag', etagOf(row.version));
      return biPanelView(row);
    });
  }

  @Post('bi-panels/:id/publish')
  @HttpCode(200)
  @Resource('dashboard:bi-panel')
  @Action('publish')
  @Audit({ action: 'DASH_BI_PANEL_PUBLISH', entity: 'dashboard.bi_panel' })
  async publishBiPanel(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Headers('if-match') ifMatch: string | string[] | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    return this.tx(async (tx) => {
      const ctx = await this.gate.context(
        tx,
        req,
        'dashboard:bi-panel:publish',
      );
      const row = await this.catalog.publishBiPanel(
        tx,
        id,
        headerValue(ifMatch),
        ctx,
      );
      res.setHeader('ETag', etagOf(row.version));
      return biPanelView(row);
    });
  }

  // -------------------------------------------------------------------------
  // relatórios (§3.3, §10.7)
  // -------------------------------------------------------------------------

  @Get('generated-reports')
  @Resource('dashboard:generated-report')
  @Action('read')
  async reportsList(
    @Req() req: RequestLike,
    @Query() rawQuery: unknown,
  ): Promise<Record<string, unknown>> {
    const query = parseWith(ReportsQuery, rawQuery);
    return this.tx(async (tx) => {
      const layer = await this.gate.open(tx, req, {
        route: 'GET generated-reports',
        policy: 'dashboard:generated-report:read',
        requiredLayer: 'N0',
        filters: query,
      });
      const listed = await this.reports.list(
        tx,
        this.gate.tenantId(),
        layer.roleLayer,
        query,
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

  @Get('generated-reports/:id')
  @Resource('dashboard:generated-report')
  @Action('read')
  async report(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    return this.tx(async (tx) => {
      const row = await this.reports.get(tx, this.gate.tenantId(), id);
      const layer = await this.gate.open(tx, req, {
        route: 'GET generated-reports/{id}',
        policy: 'dashboard:generated-report:read',
        requiredLayer: 'N0',
        filters: { id },
      });
      if (!layerAtLeast(layer.roleLayer, row.layer)) {
        throw new DetranError('DASH.LAYER_FORBIDDEN', {
          status: 403,
          context: { requiredLayer: row.layer, roles: layer.roles },
        });
      }
      await this.gate.record(tx, layer, 1);
      res.setHeader('ETag', etagOf(row.version));
      return {
        ...reportView(row, layer.roleLayer),
        meta: { freshness: ownStateFreshness(this.gate.now()) },
      };
    });
  }

  @Post('generated-reports')
  @Resource('dashboard:generated-report')
  @Action('request')
  @Audit({
    action: 'DASH_REPORT_REQUEST',
    entity: 'dashboard.generated_report',
  })
  async requestReport(
    @Req() req: RequestLike,
    @Body() body: unknown,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    // §9.1 regra 4 antes do enum: `layer: 'N3'` → `DASH.EXPORT_N3_FORBIDDEN`.
    if (
      body &&
      typeof body === 'object' &&
      (body as { layer?: unknown }).layer === 'N3'
    ) {
      throw new DetranError('DASH.EXPORT_N3_FORBIDDEN', { status: 403 });
    }
    const dto = parseWith(RequestReportDto, body, {
      reportType: {
        code: 'DASH.REPORT_TYPE_INVALID',
        status: 400,
        context: { allowed: [...REPORT_TYPES] },
      },
    });
    return this.tx(async (tx) => {
      const roleLayer = this.gate.roleLayerOf(req);
      if (!layerAtLeast(roleLayer, dto.layer)) {
        throw new DetranError('DASH.EXPORT_LAYER_EXCEEDED', {
          status: 403,
          context: { requiredLayer: dto.layer },
        });
      }
      let purpose: string | null = null;
      if (dto.layer === 'N2') {
        if (!dto.purpose) {
          throw new DetranError('DASH.EXPORT_PURPOSE_REQUIRED', {
            status: 400,
            context: { layer: dto.layer },
          });
        }
        purpose = await this.gate.validatePurpose(dto.purpose);
      }
      const layer = await this.gate.open(tx, req, {
        route: 'POST generated-reports',
        policy: 'dashboard:generated-report:request',
        requiredLayer: dto.layer,
        requestedLayer: dto.layer,
        filters: {
          reportType: dto.reportType,
          layer: dto.layer,
          ...(dto.filters ?? {}),
        },
        purpose,
      });
      const ctx = await this.gate.context(
        tx,
        req,
        'dashboard:generated-report:request',
      );
      const row = await this.reports.request(tx, dto, purpose, ctx);
      await this.gate.record(tx, layer, 0);
      res.status(201);
      res.setHeader('Location', `/v1/dashboard/generated-reports/${row.id}`);
      res.setHeader('ETag', etagOf(row.version));
      return reportView(row, roleLayer);
    });
  }

  @Post('generated-reports/:id/complete')
  @HttpCode(200)
  @Resource('dashboard:generated-report')
  @Action('complete')
  @Audit({
    action: 'DASH_REPORT_COMPLETE',
    entity: 'dashboard.generated_report',
  })
  async completeReport(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | string[] | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    const dto = parseWith(CompleteReportDto, body);
    return this.tx(async (tx) => {
      const ctx = await this.gate.context(
        tx,
        req,
        'dashboard:generated-report:complete',
      );
      const row = await this.reports.complete(
        tx,
        id,
        dto,
        headerValue(ifMatch),
        ctx,
      );
      res.setHeader('ETag', etagOf(row.version));
      return reportView(row, this.gate.roleLayerOf(req));
    });
  }

  @Post('generated-reports/:id/fail')
  @HttpCode(200)
  @Resource('dashboard:generated-report')
  @Action('fail')
  @Audit({ action: 'DASH_REPORT_FAIL', entity: 'dashboard.generated_report' })
  async failReport(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | string[] | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    const dto = parseWith(FailReportDto, body);
    return this.tx(async (tx) => {
      const ctx = await this.gate.context(
        tx,
        req,
        'dashboard:generated-report:fail',
      );
      const row = await this.reports.fail(
        tx,
        id,
        dto,
        headerValue(ifMatch),
        ctx,
      );
      res.setHeader('ETag', etagOf(row.version));
      return reportView(row, this.gate.roleLayerOf(req));
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
