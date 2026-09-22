// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
