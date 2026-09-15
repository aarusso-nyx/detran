// Generated from BP-INF-AIT-001 v1.2.0 sha256:7501ee3ae148ed392c384119fcce2158f0accb353d0ce4c4406b3863321a28ea
import { Injectable } from '@nestjs/common';
import { AitPrintEventRepository } from '../repositories/ait-print-event.repository.js';
import type { AitPrintEvent } from '../entities/ait-print-event.entity.js';
import type { CreateAitPrintEventDto } from '../dto/create-ait-print-event.dto.js';

@Injectable()
export class AitPrintEventService {
  constructor(private readonly repository: AitPrintEventRepository) {}
  findAll(): Promise<AitPrintEvent[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AitPrintEvent> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAitPrintEventDto): Promise<AitPrintEvent> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAitPrintEventDto>,
  ): Promise<AitPrintEvent> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
