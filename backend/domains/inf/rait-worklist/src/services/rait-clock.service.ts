// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
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
