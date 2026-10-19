// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
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
