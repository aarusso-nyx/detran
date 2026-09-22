// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { TimerRepository } from '../repositories/timer.repository.js';
import type { Timer } from '../entities/timer.entity.js';
import type { CreateTimerDto } from '../dto/create-timer.dto.js';

@Injectable()
export class TimerService {
  constructor(private readonly repository: TimerRepository) {}
  findAll(): Promise<Timer[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Timer> {
    return this.repository.findOne(id);
  }
  create(dto: CreateTimerDto): Promise<Timer> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateTimerDto>): Promise<Timer> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
