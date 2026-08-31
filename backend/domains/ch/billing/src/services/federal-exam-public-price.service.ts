// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
import { Injectable } from '@nestjs/common';
import { FederalExamPublicPriceRepository } from '../repositories/federal-exam-public-price.repository.js';
import type { FederalExamPublicPrice } from '../entities/federal-exam-public-price.entity.js';
import type { CreateFederalExamPublicPriceDto } from '../dto/create-federal-exam-public-price.dto.js';

@Injectable()
export class FederalExamPublicPriceService {
  constructor(private readonly repository: FederalExamPublicPriceRepository) {}
  findAll(): Promise<FederalExamPublicPrice[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<FederalExamPublicPrice> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateFederalExamPublicPriceDto,
  ): Promise<FederalExamPublicPrice> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateFederalExamPublicPriceDto>,
  ): Promise<FederalExamPublicPrice> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
