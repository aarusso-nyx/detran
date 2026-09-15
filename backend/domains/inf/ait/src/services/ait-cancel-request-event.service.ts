// Generated from BP-INF-AIT-001 v1.1.0 sha256:de3a429b81e860fb45d3abba728570d01cdfd3b886f55ff770273d4d6fff365f
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
