import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Audit, Public, Resource } from '@detran/shared';

import { PecToxicologyInboundService } from './pec-toxicology-inbound.service.js';
import { RenachWebhookGuard } from './renach-webhook.guard.js';

@Controller('v1/ch/transmissions/callbacks')
@Resource('ch:tox')
export class PecToxicologyInboundController {
  constructor(private readonly toxicology: PecToxicologyInboundService) {}

  @Post('toxicology')
  @Public()
  @UseGuards(RenachWebhookGuard)
  @Audit({
    action: 'CH_RENACH_TOXICOLOGY_RECEIVED',
    entity: 'integration.inbox_receipt',
  })
  receive(
    @Headers('x-renach-event-id') eventId: string,
    @Req() request: { rawBody?: Buffer },
    @Body() input: unknown,
  ) {
    return this.toxicology.receive(eventId, request.rawBody as Buffer, input);
  }
}
