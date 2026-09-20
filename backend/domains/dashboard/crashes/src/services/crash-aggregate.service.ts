// Generated from BP-DASHBOARD-CRASHES-001 v1.0.0 sha256:45f272c2e89a665bb7a2cfecc671d0b26d136439df8f239f51adf116bd65b241
import { Injectable } from '@nestjs/common';
import { CrashAggregateRepository } from '../repositories/crash-aggregate.repository.js';
import type { CrashAggregate } from '../entities/crash-aggregate.entity.js';
import type { CreateCrashAggregateDto } from '../dto/create-crash-aggregate.dto.js';

@Injectable()
export class CrashAggregateService {
  constructor(private readonly repository: CrashAggregateRepository) {}
  findAll(): Promise<CrashAggregate[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CrashAggregate> {
    return this.repository.findOne(id);
  }
  create(dto: CreateCrashAggregateDto): Promise<CrashAggregate> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateCrashAggregateDto>,
  ): Promise<CrashAggregate> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
