// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:e739cf21c78ced39113911fbf0c9950d0c2091ab58cc4efedee4225786fe9eac
import { Injectable } from '@nestjs/common';
import { CustodyEventRepository } from '../repositories/custody-event.repository.js';
import type { CustodyEvent } from '../entities/custody-event.entity.js';
import type { CreateCustodyEventDto } from '../dto/create-custody-event.dto.js';

@Injectable()
export class CustodyEventService {
  constructor(private readonly repository: CustodyEventRepository) {}
  findAll(): Promise<CustodyEvent[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CustodyEvent> {
    return this.repository.findOne(id);
  }
  create(dto: CreateCustodyEventDto): Promise<CustodyEvent> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateCustodyEventDto>,
  ): Promise<CustodyEvent> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
