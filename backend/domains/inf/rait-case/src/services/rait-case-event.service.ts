// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
import { Injectable } from '@nestjs/common';
import { RaitCaseEventRepository } from '../repositories/rait-case-event.repository.js';
import type { RaitCaseEvent } from '../entities/rait-case-event.entity.js';
import type { CreateRaitCaseEventDto } from '../dto/create-rait-case-event.dto.js';

@Injectable()
export class RaitCaseEventService {
  constructor(private readonly repository: RaitCaseEventRepository) {}
  findAll(): Promise<RaitCaseEvent[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitCaseEvent> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitCaseEventDto): Promise<RaitCaseEvent> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitCaseEventDto>,
  ): Promise<RaitCaseEvent> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
