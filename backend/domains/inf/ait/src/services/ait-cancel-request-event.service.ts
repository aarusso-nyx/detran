// Generated from BP-INF-AIT-001 v1.2.0 sha256:a92e771e8f034647144a60080673e25e807fdbc93a27c59a1da0fc32710fd2ea
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
