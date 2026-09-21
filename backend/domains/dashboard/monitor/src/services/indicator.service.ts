// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
