// Generated from BP-INF-AIT-001 v1.2.0 sha256:bbea1ddf9778bda02679f21a82457ea86830dad4f230eb271a51f14f05d22f6d
import { Injectable } from '@nestjs/common';
import { AitCancelRequestEventRepository } from '../repositories/ait-cancel-request-event.repository.js';
import type { AitCancelRequestEvent } from '../entities/ait-cancel-request-event.entity.js';
import type { CreateAitCancelRequestEventDto } from '../dto/create-ait-cancel-request-event.dto.js';

@Injectable()
export class AitCancelRequestEventService {
  constructor(private readonly repository: AitCancelRequestEventRepository) {}
  findAll(): Promise<AitCancelRequestEvent[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AitCancelRequestEvent> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAitCancelRequestEventDto): Promise<AitCancelRequestEvent> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAitCancelRequestEventDto>,
  ): Promise<AitCancelRequestEvent> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
