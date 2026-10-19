// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
import { Injectable } from '@nestjs/common';
import { RaitScheduleSlotRepository } from '../repositories/rait-schedule-slot.repository.js';
import type { RaitScheduleSlot } from '../entities/rait-schedule-slot.entity.js';
import type { CreateRaitScheduleSlotDto } from '../dto/create-rait-schedule-slot.dto.js';

@Injectable()
export class RaitScheduleSlotService {
  constructor(private readonly repository: RaitScheduleSlotRepository) {}
  findAll(): Promise<RaitScheduleSlot[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitScheduleSlot> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitScheduleSlotDto): Promise<RaitScheduleSlot> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitScheduleSlotDto>,
  ): Promise<RaitScheduleSlot> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
