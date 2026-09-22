// `/v1/dashboard/exports` (CTG-0002 §3.5, §9; plan M21). O corpo bruto é
// examinado antes do `.strict()` (regra 4 de §9.1: recorte só-N3 → 403);
// `approve` não tem `If-Match` (`export_log` sem `version`, OD-D37). O status
// 201/202 vem do serviço (`res.status`, padrão `manifestations.controller.ts`).
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import {
  Action,
  Audit,
  Resource,
  withTenantContext,
  type RequestLike,
} from '@detran/shared';

import type { DashboardSqlTransaction } from '../projection-contract.js';
import { ApproveExportDto, CreateExportDto } from './dto.js';
import { DashboardExportService, assertExportNotN3 } from './export.service.js';
import {
  DashboardLayerGate,
  parseWith,
  type ResponseLike,
} from './layer-gate.js';

@Controller('v1/dashboard/exports')
@Resource('dashboard:export')
export class DashboardExportsController {
  constructor(
    private readonly exports: DashboardExportService,
    private readonly gate: DashboardLayerGate,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Post()
  @Action('create')
  @Audit({ action: 'DASH_EXPORT_CREATE', entity: 'dashboard.export_log' })
  async create(
    @Req() req: RequestLike,
    @Body() body: unknown,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    assertExportNotN3(body);
    const dto = parseWith(CreateExportDto, body);
    return this.tx(async (tx) => {
      const ctx = await this.gate.context(tx, req, 'dashboard:export:create');
      const response = await this.exports.create(tx, req, dto, ctx);
      res.status(response.status);
      return response.body;
    });
  }

  @Post(':id/approve')
  @HttpCode(200)
  @Action('approve')
  @Audit({ action: 'DASH_EXPORT_APPROVE', entity: 'dashboard.export_log' })
  async approve(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<Record<string, unknown>> {
    const dto = parseWith(ApproveExportDto, body);
    return this.tx(async (tx) => {
      const ctx = await this.gate.context(tx, req, 'dashboard:export:approve');
      return this.exports.approve(tx, id, dto, req, ctx);
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
