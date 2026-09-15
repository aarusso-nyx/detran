// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
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
