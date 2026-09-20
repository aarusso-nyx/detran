// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
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
