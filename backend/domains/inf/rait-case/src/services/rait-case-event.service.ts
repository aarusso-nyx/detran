// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:9d98d9786bc2f4b27bd75cb5516d4a00b6d74e520f3dbc52c39f33effb27f60e
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
