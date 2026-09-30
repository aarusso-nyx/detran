// Generated from BP-CH-BILLING-001 v1.0.0 sha256:dbb379527f32d359e25dee36e8d7232af006c46466c5c86faef3d22de91db860
import { Injectable } from '@nestjs/common';
import { BillingInvoiceItemRepository } from '../repositories/billing-invoice-item.repository.js';
import type { BillingInvoiceItem } from '../entities/billing-invoice-item.entity.js';
import type { CreateBillingInvoiceItemDto } from '../dto/create-billing-invoice-item.dto.js';

@Injectable()
export class BillingInvoiceItemService {
  constructor(private readonly repository: BillingInvoiceItemRepository) {}
  findAll(): Promise<BillingInvoiceItem[]> {
    return this.repository.findAll();
  }
  create(dto: CreateBillingInvoiceItemDto): Promise<BillingInvoiceItem> {
    return this.repository.create(dto);
  }
}
