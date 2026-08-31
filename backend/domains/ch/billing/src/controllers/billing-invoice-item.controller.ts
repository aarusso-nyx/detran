// Generated from BP-CH-BILLING-001 v1.0.0 sha256:b93ad2da6d0162ec02bff11759374782a27b26980a522e4c2c681e2daa1d9d53
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
import type { CreateBillingInvoiceItemDto } from '../dto/create-billing-invoice-item.dto.js';
import { BillingInvoiceItemService } from '../services/billing-invoice-item.service.js';

@Controller('v1/ch/billing/billing-invoice-item')
@Resource('ch:billing-invoice-item')
export class BillingInvoiceItemController {
  constructor(private readonly service: BillingInvoiceItemService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'CH_BILLING_INVOICE_ITEM_CREATE',
    entity: 'ch.billing_invoice_item',
  })
  create(@Body() dto: CreateBillingInvoiceItemDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'CH_BILLING_INVOICE_ITEM_UPDATE',
    entity: 'ch.billing_invoice_item',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateBillingInvoiceItemDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'CH_BILLING_INVOICE_ITEM_DELETE',
    entity: 'ch.billing_invoice_item',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
