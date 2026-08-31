// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
import { Injectable } from '@nestjs/common';
import { BillingInvoiceRepository } from '../repositories/billing-invoice.repository.js';
import type { BillingInvoice } from '../entities/billing-invoice.entity.js';
import type { CreateBillingInvoiceDto } from '../dto/create-billing-invoice.dto.js';

@Injectable()
export class BillingInvoiceService {
  constructor(private readonly repository: BillingInvoiceRepository) {}
  findAll(): Promise<BillingInvoice[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<BillingInvoice> {
    return this.repository.findOne(id);
  }
  create(dto: CreateBillingInvoiceDto): Promise<BillingInvoice> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateBillingInvoiceDto>,
  ): Promise<BillingInvoice> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
