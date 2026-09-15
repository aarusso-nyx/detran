// Generated from BP-OPS-EVIDENCE-001 v1.0.0 sha256:a8692e7ee4171aea45d3aa6a8ca457251f3005b1dc05d1b03e2aa5ebc8f1923f
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
