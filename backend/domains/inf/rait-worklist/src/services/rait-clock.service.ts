// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
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
