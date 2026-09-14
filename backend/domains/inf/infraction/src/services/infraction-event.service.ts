// Generated from BP-INF-INFRACTION-001 v1.1.1 sha256:c9e1dec5067f8324003780a279b646761b2298bf7712019b3023acdf50746e4c
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
