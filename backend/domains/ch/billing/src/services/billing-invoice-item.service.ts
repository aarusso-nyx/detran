// Generated from BP-CH-BILLING-001 v1.0.0 sha256:b93ad2da6d0162ec02bff11759374782a27b26980a522e4c2c681e2daa1d9d53
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
  findOne(id: string): Promise<BillingInvoiceItem> {
    return this.repository.findOne(id);
  }
  create(dto: CreateBillingInvoiceItemDto): Promise<BillingInvoiceItem> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateBillingInvoiceItemDto>,
  ): Promise<BillingInvoiceItem> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
