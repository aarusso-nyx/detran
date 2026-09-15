// Generated from BP-INF-COLLECTION-001 v1.0.1 sha256:eb2537783873c7670d66ebe362abad2fe79a9d8e834a0fd30145389f995741d6
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
import type { CreateRefundOrderDto } from '../dto/create-refund-order.dto.js';
import { RefundOrderService } from '../services/refund-order.service.js';

@Controller('v1/inf/collection/refund-orders')
@Resource('inf:refund-order')
export class RefundOrderController {
  constructor(private readonly service: RefundOrderService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_REFUND_ORDER_CREATE', entity: 'inf.refund_order' })
  create(@Body() dto: CreateRefundOrderDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_REFUND_ORDER_UPDATE', entity: 'inf.refund_order' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRefundOrderDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_REFUND_ORDER_DELETE', entity: 'inf.refund_order' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
