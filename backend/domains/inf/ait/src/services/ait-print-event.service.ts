// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
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
