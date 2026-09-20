// Generated from BP-DASHBOARD-CRASHES-001 v1.0.0 sha256:45f272c2e89a665bb7a2cfecc671d0b26d136439df8f239f51adf116bd65b241
import { Injectable } from '@nestjs/common';
import { CrashProjectionAppliedEventRepository } from '../repositories/crash-projection-applied-event.repository.js';
import type { CrashProjectionAppliedEvent } from '../entities/crash-projection-applied-event.entity.js';
import type { CreateCrashProjectionAppliedEventDto } from '../dto/create-crash-projection-applied-event.dto.js';

@Injectable()
export class CrashProjectionAppliedEventService {
  constructor(
    private readonly repository: CrashProjectionAppliedEventRepository,
  ) {}
  findAll(): Promise<CrashProjectionAppliedEvent[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CrashProjectionAppliedEvent> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateCrashProjectionAppliedEventDto,
  ): Promise<CrashProjectionAppliedEvent> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateCrashProjectionAppliedEventDto>,
  ): Promise<CrashProjectionAppliedEvent> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
