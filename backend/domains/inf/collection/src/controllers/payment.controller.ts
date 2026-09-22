// Generated from BP-INF-COLLECTION-001 v1.0.2 sha256:10fb057463797bde8609b1b2a33435d80259cd90c69c2e991c5f42e355f924cd
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
