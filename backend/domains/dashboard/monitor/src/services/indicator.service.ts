// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { IndicatorRepository } from '../repositories/indicator.repository.js';
import type { Indicator } from '../entities/indicator.entity.js';
import type { CreateIndicatorDto } from '../dto/create-indicator.dto.js';

@Injectable()
export class IndicatorService {
  constructor(private readonly repository: IndicatorRepository) {}
  findAll(): Promise<Indicator[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Indicator> {
    return this.repository.findOne(id);
  }
  create(dto: CreateIndicatorDto): Promise<Indicator> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateIndicatorDto>): Promise<Indicator> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
