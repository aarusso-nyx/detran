// CTG-0004 §7.3 (R-0008, TASK-0009, ADR-0020) — projeção de integrações.
import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import { loadSenatranConfig } from '@detran/senatran-adapter';

import { TeatIntegrationsService } from './teat-integrations.service.js';

@Controller('v1/ops/integrations')
@Resource('ops:integration')
export class TeatIntegrationsController {
  constructor(private readonly service: TeatIntegrationsService) {}

  @Get('outbox')
  @Action('read')
  list(@Query('system') system?: string, @Query('status') status?: string) {
    return this.service.list({ system, status });
  }

  @Post('outbox/:id/retry')
  @Action('retry')
  @Audit({ action: 'OPS_INTEGRATION_RETRY', entity: 'integration.outbox' })
  retry(@Param('id') id: string) {
    return this.service.retry(id);
  }

  @Get('health')
  @Action('read')
  health() {
    const config = loadSenatranConfig();
    return this.service.health(config);
  }
}
