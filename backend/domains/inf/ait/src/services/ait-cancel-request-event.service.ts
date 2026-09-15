// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
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
