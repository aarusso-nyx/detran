// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { IndicatorConfigRepository } from '../repositories/indicator-config.repository.js';
import type { IndicatorConfig } from '../entities/indicator-config.entity.js';
import type { CreateIndicatorConfigDto } from '../dto/create-indicator-config.dto.js';

@Injectable()
export class IndicatorConfigService {
  constructor(private readonly repository: IndicatorConfigRepository) {}
  findAll(): Promise<IndicatorConfig[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<IndicatorConfig> {
    return this.repository.findOne(id);
  }
  create(dto: CreateIndicatorConfigDto): Promise<IndicatorConfig> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateIndicatorConfigDto>,
  ): Promise<IndicatorConfig> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
