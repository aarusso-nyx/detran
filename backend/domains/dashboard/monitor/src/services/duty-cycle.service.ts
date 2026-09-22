// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { DutyCycleRepository } from '../repositories/duty-cycle.repository.js';
import type { DutyCycle } from '../entities/duty-cycle.entity.js';
import type { CreateDutyCycleDto } from '../dto/create-duty-cycle.dto.js';

@Injectable()
export class DutyCycleService {
  constructor(private readonly repository: DutyCycleRepository) {}
  findAll(): Promise<DutyCycle[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<DutyCycle> {
    return this.repository.findOne(id);
  }
  create(dto: CreateDutyCycleDto): Promise<DutyCycle> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateDutyCycleDto>): Promise<DutyCycle> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
