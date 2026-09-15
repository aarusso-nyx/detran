// Generated from BP-INF-COLLECTION-001 v1.0.0 sha256:72e0af13a687dd9bcaa3931941707644a2214b4ece8daa63d55712fee4ad0243
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import type { CreatePaymentDto } from '../dto/create-payment.dto.js';
import { PaymentService } from '../services/payment.service.js';

@Controller('v1/inf/collection/payments')
@Resource('inf:payment')
export class PaymentController {
  constructor(private readonly service: PaymentService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_PAYMENT_CREATE', entity: 'inf.payment' })
  create(@Body() dto: CreatePaymentDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_PAYMENT_UPDATE', entity: 'inf.payment' })
  update(@Param('id') id: string, @Body() dto: Partial<CreatePaymentDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_PAYMENT_DELETE', entity: 'inf.payment' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
