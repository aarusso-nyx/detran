// `/v1/dashboard/alerts` (CTG-0002 §3.1; route contract §2; plan M17/M18).
// O controller só extrai params/cabeçalhos/corpo, abre a transação de tenant
// (`withTenantContext`), passa pelo `DashboardLayerGate` (§4.4 ordem: política
// → camada/finalidade/escopo → `If-Match`/zod → guarda do comando) e chama o
// ciclo (`DashboardAlertService`, §14.1) — a lista (`GET alerts`) é o recorte
// `alerts` de `export.service.ts` (§9.2). `access_log` em toda leitura (§5.4.2).
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
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
  type DashboardLayer,
  type RequestLike,
} from '@detran/shared';

import {
  AckAlertSchema,
  CloseAlertSchema,
  DashboardAlertService,
  RootCauseSchema,
  TreatAlertSchema,
  type CycleContext,
} from '../cycle/index.js';
import type { DashboardSqlTransaction } from '../projection-contract.js';
import { DashboardCatalogService } from './catalog.service.js';
import { AlertsQuery, type AlertsQueryInput } from './dto.js';
import { listAlerts } from './export.service.js';
import {
  DashboardLayerGate,
  assertNotN3,
  headerValue,
  parseWith,
  type LayerContext,
  type ResponseLike,
} from './layer-gate.js';

const STRICT = {
  ack: AckAlertSchema.strict(),
  treat: TreatAlertSchema.strict(),
  close: CloseAlertSchema.strict(),
  rootCause: RootCauseSchema.strict(),
};

interface AlertHead extends Record<string, unknown> {
  id: string;
  state: string;
  source_app: string;
  object_layer: DashboardLayer;
  indicator_code: string;
  version: number;
}

@Controller('v1/dashboard/alerts')
@Resource('dashboard:alert')
export class DashboardAlertsController {
  constructor(
    private readonly alerts: DashboardAlertService,
    private readonly catalog: DashboardCatalogService,
    private readonly gate: DashboardLayerGate,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Get()
  @Action('read')
  async list(
    @Req() req: RequestLike,
    @Query() rawQuery: unknown,
  ): Promise<Record<string, unknown>> {
    assertNotN3(rawQuery);
    const query: AlertsQueryInput = parseWith(AlertsQuery, rawQuery);
    return this.tx(async (tx) => {
      const layer = await this.gate.open(tx, req, {
        route: 'GET alerts',
        policy: 'dashboard:alert:read',
        requiredLayer: 'N1',
        requestedLayer: query.layer,
        ceiling: 'N1',
        app: query.app,
        filters: query,
      });
      const { layer: _layer, ...filters } = query;
      const listed = await listAlerts(
        tx,
        this.gate.tenantId(),
        filters,
        layer.servedLayer,
        layer.domains,
      );
      const freshness = await this.catalog.freshnessFor(
        tx,
        this.gate.tenantId(),
        listed.indicatorCodes,
      );
      await this.gate.record(tx, layer, listed.items.length);
      return {
        items: listed.items,
        page: listed.page,
        pageSize: listed.pageSize,
        total: listed.total,
        meta: {
          freshness,
          page: listed.page,
          pageSize: listed.pageSize,
          total: listed.total,
          ...(query.unit !== undefined ? { sourcePending: 'OD-D38' } : {}),
        },
      };
    });
  }

  @Get(':id')
  @Action('read')
  @Audit({ action: 'DASH_ALERT_READ', entity: 'dashboard.alert' })
  async get(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    return this.tx(async (tx) => {
      const head = await this.head(tx, id);
      const layer = await this.gate.open(tx, req, {
        route: 'GET alerts/{id}',
        policy: 'dashboard:alert:read',
        requiredLayer: 'N1',
        ceiling: head.object_layer,
        app: head.source_app,
        indicator: head.indicator_code,
        filters: { id },
      });
      const view = await this.view(tx, id, layer.servedLayer);
      await this.gate.record(tx, layer, 1);
      res.setHeader('ETag', etagOf(Number(view.version)));
      return view;
    });
  }

  @Get(':id/incident')
  @Resource('dashboard:incident')
  @Action('read')
  async incident(
    @Req() req: RequestLike,
    @Param('id') id: string,
  ): Promise<Record<string, unknown>> {
    return this.tx(async (tx) => {
      const head = await this.head(tx, id);
      const layer = await this.gate.open(tx, req, {
        route: 'GET alerts/{id}/incident',
        policy: 'dashboard:incident:read',
        requiredLayer: 'N1',
        ceiling: head.object_layer,
        app: head.source_app,
        indicator: head.indicator_code,
        filters: { id },
      });
      if (head.state !== 'INCIDENTE_REGISTRADO') {
        throw new DetranError('DASH.ALERT_INCIDENT_NOT_FOUND', {
          status: 404,
          context: { alertId: id, currentState: head.state },
        });
      }
      const incident = await this.alerts.getIncident(
        tx,
        id,
        layer.servedLayer === 'N2' ? 'N2' : 'N1',
      );
      if (!incident) {
        throw new DetranError('DASH.ALERT_INCIDENT_NOT_FOUND', {
          status: 404,
          context: { alertId: id },
        });
      }
      await this.gate.record(tx, layer, 1);
      return incident as unknown as Record<string, unknown>;
    });
  }

  @Post(':id/ack')
  @HttpCode(200)
  @Action('ack')
  @Audit({ action: 'DASH_ALERT_ACK', entity: 'dashboard.alert' })
  async ack(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | string[] | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    const dto = parseWith(STRICT.ack, body);
    return this.command(req, id, 'dashboard:alert:ack', res, (tx, ctx) =>
      this.alerts.ack(tx, id, dto, headerValue(ifMatch), ctx),
    );
  }

  @Post(':id/treating')
  @HttpCode(200)
  @Action('treat')
  @Audit({ action: 'DASH_ALERT_TREAT', entity: 'dashboard.alert' })
  async treating(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | string[] | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    const dto = parseWith(STRICT.treat, body);
    return this.command(req, id, 'dashboard:alert:treat', res, (tx, ctx) =>
      this.alerts.treat(tx, id, dto, headerValue(ifMatch), ctx),
    );
  }

  @Post(':id/close')
  @HttpCode(200)
  @Action('close')
  @Audit({ action: 'DASH_ALERT_CLOSE', entity: 'dashboard.alert' })
  async close(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | string[] | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    const dto = parseWith(STRICT.close, body);
    return this.command(req, id, 'dashboard:alert:close', res, (tx, ctx) =>
      this.alerts.close(tx, id, dto, headerValue(ifMatch), ctx),
    );
  }

  @Post(':id/root-cause')
  @HttpCode(200)
  @Action('annotate')
  @Audit({ action: 'DASH_ALERT_ANNOTATE', entity: 'dashboard.alert' })
  async rootCause(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | string[] | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    const dto = parseWith(STRICT.rootCause, body);
    return this.command(req, id, 'dashboard:alert:annotate', res, (tx, ctx) =>
      this.alerts.annotateRootCause(tx, id, dto, headerValue(ifMatch), ctx),
    );
  }

  /** Comando (§3.1): 404 → gate N1 → ciclo (`If-Match` + guarda) → resposta = `GET alerts/{id}` na camada do papel (§5.2: sem `X-Purpose`, sem `access_log` — comando não é leitura N2). */
  private command(
    req: RequestLike,
    id: string,
    policy: string,
    res: ResponseLike,
    run: (tx: DashboardSqlTransaction, ctx: CycleContext) => Promise<unknown>,
  ): Promise<Record<string, unknown>> {
    return this.tx(async (tx) => {
      const head = await this.head(tx, id);
      const layer: LayerContext = await this.gate.open(tx, req, {
        route: `${policyRoute(policy)}`,
        policy,
        requiredLayer: 'N1',
        ceiling: head.object_layer,
        filters: { id },
        command: true,
      });
      const ctx = await this.gate.context(tx, req, policy);
      await run(tx, ctx);
      const view = await this.view(tx, id, layer.servedLayer);
      res.setHeader('ETag', etagOf(Number(view.version)));
      return view;
    });
  }

  private async head(
    tx: DashboardSqlTransaction,
    id: string,
  ): Promise<AlertHead> {
    const result = await tx.query<AlertHead>(
      `select id, state, source_app, object_layer, indicator_code, version
         from dashboard.alert where tenant_id = $1 and id = $2::uuid`,
      [this.gate.tenantId(), id],
    );
    const row = result.rows[0];
    if (!row) {
      throw new DetranError('DASH.TENANT_MISMATCH', {
        status: 404,
        context: { alertId: id },
      });
    }
    return row;
  }

  private async view(
    tx: DashboardSqlTransaction,
    id: string,
    servedLayer: DashboardLayer,
  ): Promise<Record<string, unknown>> {
    const view = await this.alerts.getView(
      tx,
      id,
      servedLayer === 'N2' ? 'N2' : 'N1',
    );
    if (!view) {
      throw new DetranError('DASH.TENANT_MISMATCH', {
        status: 404,
        context: { alertId: id },
      });
    }
    return view as unknown as Record<string, unknown>;
  }

  /** Transação única de tenant por comando/leitura (§14.2). */
  private tx<T>(work: (tx: DashboardSqlTransaction) => Promise<T>): Promise<T> {
    return withTenantContext(
      this.database,
      this.requestContext,
      (transaction: Transaction) =>
        work(transaction as unknown as DashboardSqlTransaction),
    );
  }
}

/** `POST alerts/{id}/<ação>` para o `access_log` do comando (§2.2 forma do recurso). */
function policyRoute(policy: string): string {
  const action = policy.split(':')[2] ?? '';
  const path: Record<string, string> = {
    ack: 'ack',
    treat: 'treating',
    close: 'close',
    annotate: 'root-cause',
  };
  return `POST alerts/{id}/${path[action] ?? action}`;
}
