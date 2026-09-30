// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
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
  @Post()
  @Action('create')
  @Audit({
    action: 'CH_BILLING_INVOICE_ITEM_CREATE',
    entity: 'ch.billing_invoice_item',
  })
  create(@Body() dto: CreateBillingInvoiceItemDto) {
    return this.service.create(dto);
  }
}
