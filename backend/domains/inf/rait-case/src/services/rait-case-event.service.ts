// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
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
