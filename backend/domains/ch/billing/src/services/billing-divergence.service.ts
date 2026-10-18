// Generated from BP-CH-BILLING-001 v1.0.0 sha256:dbb379527f32d359e25dee36e8d7232af006c46466c5c86faef3d22de91db860
import { Injectable } from '@nestjs/common';
import { BillingDivergenceRepository } from '../repositories/billing-divergence.repository.js';
import type { BillingDivergence } from '../entities/billing-divergence.entity.js';
import type { CreateBillingDivergenceDto } from '../dto/create-billing-divergence.dto.js';

@Injectable()
export class BillingDivergenceService {
  constructor(private readonly repository: BillingDivergenceRepository) {}
  findAll(): Promise<BillingDivergence[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<BillingDivergence> {
    return this.repository.findOne(id);
  }
  create(dto: CreateBillingDivergenceDto): Promise<BillingDivergence> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateBillingDivergenceDto>,
  ): Promise<BillingDivergence> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
