// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { ProductionRepository } from '../repositories/production.repository.js';
import type { Production } from '../entities/production.entity.js';
import type { CreateProductionDto } from '../dto/create-production.dto.js';

@Injectable()
export class ProductionService {
  constructor(private readonly repository: ProductionRepository) {}
  findAll(): Promise<Production[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Production> {
    return this.repository.findOne(id);
  }
  create(dto: CreateProductionDto): Promise<Production> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateProductionDto>): Promise<Production> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
