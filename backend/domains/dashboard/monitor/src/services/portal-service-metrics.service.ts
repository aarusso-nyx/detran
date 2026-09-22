// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { PortalServiceMetricsRepository } from '../repositories/portal-service-metrics.repository.js';
import type { PortalServiceMetrics } from '../entities/portal-service-metrics.entity.js';
import type { CreatePortalServiceMetricsDto } from '../dto/create-portal-service-metrics.dto.js';

@Injectable()
export class PortalServiceMetricsService {
  constructor(private readonly repository: PortalServiceMetricsRepository) {}
  findAll(): Promise<PortalServiceMetrics[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<PortalServiceMetrics> {
    return this.repository.findOne(id);
  }
  create(dto: CreatePortalServiceMetricsDto): Promise<PortalServiceMetrics> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreatePortalServiceMetricsDto>,
  ): Promise<PortalServiceMetrics> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
