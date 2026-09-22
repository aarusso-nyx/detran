import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { Action, Audit, Resource, withTenantContext } from '@detran/shared';
import type { CreateRaitReconciliationDto } from '../dto/create-rait-reconciliation.dto.js';
import { RaitReconciliationService } from '../services/rait-reconciliation.service.js';

type Tx = Pick<Transaction, 'query'>;

@Controller('v1/inf/rait/integrations')
@Resource('inf:rait-integration')
export class RaitIntegrationCommandsController {
  constructor(
    private readonly reconciliations: RaitReconciliationService,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}
  private actorId(): string {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId) throw new Error('Authenticated actor required');
    return actorId;
  }

  @Get('outbox')
  @Action('read')
  async outbox() {
    return withTenantContext(
      this.database,
      this.requestContext,
      async (rawTx) => ({
        data: (
          await (rawTx as Tx).query(
            'select id,topic,aggregate_type,aggregate_id,status,attempts,available_at,created_at from integration.outbox order by created_at desc limit 500',
          )
        ).rows,
      }),
    );
  }

  @Post('outbox/:id/retry')
  @HttpCode(200)
  @Action('retry')
  @Audit({ action: 'INF_RAIT_INTEGRATION_RETRY', entity: 'integration.outbox' })
  async retry(@Param('id') id: string) {
    return withTenantContext(
      this.database,
      this.requestContext,
      async (rawTx) => {
        const result = await (rawTx as Tx).query(
          "update integration.outbox set status = 'pending', available_at = clock_timestamp(), updated_at = clock_timestamp() where id = $1 and status = 'error' returning id,topic,status,attempts",
          [id],
        );
        if (!result.rows[0]) throw new Error('Outbox item is not retryable');
        return { data: result.rows[0], events: [] };
      },
    );
  }

  @Post('reconciliations')
  @HttpCode(201)
  @Action('reconcile')
  @Audit({
    action: 'INF_RAIT_INTEGRATION_RECONCILE',
    entity: 'inf.rait_reconciliation',
  })
  async reconcile(@Body() body: CreateRaitReconciliationDto) {
    const data = await this.reconciliations.create({
      ...body,
      requested_by: this.actorId(),
    });
    return { data, events: [] };
  }
}
