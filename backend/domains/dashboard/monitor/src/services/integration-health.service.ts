// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { IntegrationHealthRepository } from '../repositories/integration-health.repository.js';
import type { IntegrationHealth } from '../entities/integration-health.entity.js';
import type { CreateIntegrationHealthDto } from '../dto/create-integration-health.dto.js';

@Injectable()
export class IntegrationHealthService {
  constructor(private readonly repository: IntegrationHealthRepository) {}
  findAll(): Promise<IntegrationHealth[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<IntegrationHealth> {
    return this.repository.findOne(id);
  }
  create(dto: CreateIntegrationHealthDto): Promise<IntegrationHealth> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateIntegrationHealthDto>,
  ): Promise<IntegrationHealth> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
