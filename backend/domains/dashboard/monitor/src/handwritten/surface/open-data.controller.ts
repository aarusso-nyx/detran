// `/v1/dashboard/{datasets,open-data/{dataset}}` (CTG-0002 §3.7, §10.6;
// plan M22). "Público" neste CTG é o N0 autenticado de `policy.ts` (OD-D39);
// `open-data` não admite query string ([RN-DASH-161] verificação 5) e serve só
// pré-agregados publicados com supressão §9.5 e marca d'água.
import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import {
  Action,
  DetranError,
  Resource,
  withTenantContext,
  type RequestLike,
} from '@detran/shared';

import type { DashboardSqlTransaction } from '../projection-contract.js';
import {
  DashboardLayerGate,
  ownStateFreshness,
  type ResponseLike,
} from './layer-gate.js';
import { DashboardOpenDataService } from './open-data.service.js';

@Controller('v1/dashboard')
@Resource('dashboard:dataset')
export class DashboardOpenDataController {
  constructor(
    private readonly openData: DashboardOpenDataService,
    private readonly gate: DashboardLayerGate,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Get('datasets')
  @Action('read')
  async datasets(@Req() req: RequestLike): Promise<Record<string, unknown>> {
    return this.tx(async (tx) => {
      const layer = await this.gate.open(tx, req, {
        route: 'GET datasets',
        policy: 'dashboard:dataset:read',
        requiredLayer: 'N0',
      });
      const items = await this.openData.datasets(tx, this.gate.tenantId());
      await this.gate.record(tx, layer, items.length);
      return {
        items,
        total: items.length,
        meta: {
          freshness: ownStateFreshness(this.gate.now()),
          total: items.length,
        },
      };
    });
  }

  @Get('open-data/:dataset')
  @Action('read')
  async openDataset(
    @Req() req: RequestLike,
    @Param('dataset') dataset: string,
    @Query() query: Record<string, unknown> | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    if (query && Object.keys(query).length > 0) {
      throw new DetranError('DASH.OPEN_DATA_PARAMETERIZED_FORBIDDEN', {
        status: 400,
        context: { dataset, parameters: Object.keys(query).sort() },
      });
    }
    return this.tx(async (tx) => {
      const layer = await this.gate.open(tx, req, {
        route: 'GET open-data/{dataset}',
        policy: 'dashboard:dataset:read',
        requiredLayer: 'N0',
        filters: { dataset },
      });
      const body = await this.openData.openData(
        tx,
        this.gate.tenantId(),
        dataset,
        {
          id: layer.userRef,
          role: layer.userRole,
        },
      );
      const rows = body.rows as unknown[];
      await this.gate.record(tx, layer, rows.length);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return {
        ...body,
        meta: { freshness: ownStateFreshness(this.gate.now()) },
      };
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
