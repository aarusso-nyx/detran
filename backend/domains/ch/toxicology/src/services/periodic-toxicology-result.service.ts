// Generated from BP-CH-TOXICOLOGY-001 v1.0.0 sha256:9bd4b4e46865f6ee6a771bb9c561b1dddfdf2c684b8dc7b2d45a1fb3fbcb5062
import { Injectable } from '@nestjs/common';
import { PeriodicToxicologyResultRepository } from '../repositories/periodic-toxicology-result.repository.js';
import type { PeriodicToxicologyResult } from '../entities/periodic-toxicology-result.entity.js';
import type { CreatePeriodicToxicologyResultDto } from '../dto/create-periodic-toxicology-result.dto.js';

@Injectable()
export class PeriodicToxicologyResultService {
  constructor(
    private readonly repository: PeriodicToxicologyResultRepository,
  ) {}
  findAll(): Promise<PeriodicToxicologyResult[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<PeriodicToxicologyResult> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreatePeriodicToxicologyResultDto,
  ): Promise<PeriodicToxicologyResult> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreatePeriodicToxicologyResultDto>,
  ): Promise<PeriodicToxicologyResult> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
