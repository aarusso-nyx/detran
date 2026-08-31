import {
  Body,
  Controller,
  Headers,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Action, Audit, Public, Resource } from '@detran/shared';

import {
  type RenachAcknowledgementInput,
  PecRenachTransmissionService,
} from './pec-renach-transmission.service.js';
import { RenachWebhookGuard } from './renach-webhook.guard.js';

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

  @Post('callbacks/renach')
  @Public()
  @UseGuards(RenachWebhookGuard)
  @Audit({
    action: 'CH_RENACH_ACK_RECEIVED',
    entity: 'integration.inbox_receipt',
  })
  acknowledge(
    @Headers('x-renach-event-id') eventId: string,
    @Req() request: { rawBody?: Buffer },
    @Body() input: RenachAcknowledgementInput,
  ) {
    return this.transmissions.recordAcknowledgement(
      eventId,
      request.rawBody as Buffer,
      input,
    );
  }
}
