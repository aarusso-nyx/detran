// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
