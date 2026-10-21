// Generated from BP-INF-AIT-001 v1.2.0 sha256:bbea1ddf9778bda02679f21a82457ea86830dad4f230eb271a51f14f05d22f6d
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
