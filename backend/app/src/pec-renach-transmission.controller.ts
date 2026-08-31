import { Controller, Post, Query } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import { PecRenachTransmissionService } from './pec-renach-transmission.service.js';

@Controller('v1/ch/transmissions')
@Resource('ch:transmission')
export class PecRenachTransmissionController {
  constructor(private readonly transmissions: PecRenachTransmissionService) {}

  @Post('dispatch')
  @Action('dispatch')
  @Audit({
    action: 'CH_RENACH_TRANSMISSION_DISPATCH',
    entity: 'integration.outbox',
  })
  dispatch(@Query('limit') limit?: string) {
    return this.transmissions.dispatchDue(limit ? Number(limit) : undefined);
  }
}
