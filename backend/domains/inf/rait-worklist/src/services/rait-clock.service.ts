// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
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
