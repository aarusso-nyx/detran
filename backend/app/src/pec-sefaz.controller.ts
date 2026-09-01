import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { Action, Resource } from '@detran/shared';

import { PecSefazService } from './pec-sefaz.service.js';

export interface ValidateSefazPaymentCommand {
  referenceNumber: string;
  cpf: string;
  renachNumber?: string;
  clinicId?: string;
}

@Controller('v1/ch/integrations/sefaz')
@Resource('ch:sefaz')
export class PecSefazController {
  constructor(private readonly service: PecSefazService) {}

  @Post('payment/validate')
  @HttpCode(200)
  @Action('validate')
  validatePayment(
    @Body() command: ValidateSefazPaymentCommand,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    return this.service.validatePayment(command.referenceNumber, correlationId);
  }
}
