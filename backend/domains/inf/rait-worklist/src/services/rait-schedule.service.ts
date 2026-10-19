// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
import { Injectable } from '@nestjs/common';
import { RaitScheduleRepository } from '../repositories/rait-schedule.repository.js';
import type { RaitSchedule } from '../entities/rait-schedule.entity.js';
import type { CreateRaitScheduleDto } from '../dto/create-rait-schedule.dto.js';

@Injectable()
export class RaitScheduleService {
  constructor(private readonly repository: RaitScheduleRepository) {}
  findAll(): Promise<RaitSchedule[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitSchedule> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitScheduleDto): Promise<RaitSchedule> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitScheduleDto>,
  ): Promise<RaitSchedule> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
