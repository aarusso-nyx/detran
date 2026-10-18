// Generated from BP-CH-BILLING-001 v1.0.0 sha256:dbb379527f32d359e25dee36e8d7232af006c46466c5c86faef3d22de91db860
import { Injectable } from '@nestjs/common';
import { BillingItemRepository } from '../repositories/billing-item.repository.js';
import type { BillingItem } from '../entities/billing-item.entity.js';
import type { CreateBillingItemDto } from '../dto/create-billing-item.dto.js';

@Injectable()
export class BillingItemService {
  constructor(private readonly repository: BillingItemRepository) {}
  findAll(): Promise<BillingItem[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<BillingItem> {
    return this.repository.findOne(id);
  }
  create(dto: CreateBillingItemDto): Promise<BillingItem> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateBillingItemDto>): Promise<BillingItem> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
