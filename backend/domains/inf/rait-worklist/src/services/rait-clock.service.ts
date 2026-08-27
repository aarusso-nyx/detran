// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:2297f42351909b6ac68f4a18e7c8b535508fa219dfdaa0f9b087f1ca3b745234
import { Injectable } from '@nestjs/common';
import { RaitClockRepository } from '../repositories/rait-clock.repository.js';
import type { RaitClock } from '../entities/rait-clock.entity.js';
import type { CreateRaitClockDto } from '../dto/create-rait-clock.dto.js';

@Injectable()
export class RaitClockService {
  constructor(private readonly repository: RaitClockRepository) {}
  findAll(): Promise<RaitClock[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitClock> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitClockDto): Promise<RaitClock> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRaitClockDto>): Promise<RaitClock> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
