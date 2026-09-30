// Generated from BP-CH-BILLING-001 v1.0.0 sha256:dbb379527f32d359e25dee36e8d7232af006c46466c5c86faef3d22de91db860
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
}
