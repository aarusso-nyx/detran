// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
