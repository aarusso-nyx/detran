// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
