// Generated from BP-INF-INFRACTION-001 v1.1.2 sha256:59e421dbbb90b291b45408217601e9d6a86b992d9c75c00e5f73b17c5b2e21dd
import { Injectable } from '@nestjs/common';
import { InfractionEventRepository } from '../repositories/infraction-event.repository.js';
import type { InfractionEvent } from '../entities/infraction-event.entity.js';
import type { CreateInfractionEventDto } from '../dto/create-infraction-event.dto.js';

@Injectable()
export class InfractionEventService {
  constructor(private readonly repository: InfractionEventRepository) {}
  findAll(): Promise<InfractionEvent[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<InfractionEvent> {
    return this.repository.findOne(id);
  }
  create(dto: CreateInfractionEventDto): Promise<InfractionEvent> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateInfractionEventDto>,
  ): Promise<InfractionEvent> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
