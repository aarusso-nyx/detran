// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
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
