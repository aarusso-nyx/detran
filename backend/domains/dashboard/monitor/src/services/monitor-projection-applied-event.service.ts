// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { MonitorProjectionAppliedEventRepository } from '../repositories/monitor-projection-applied-event.repository.js';
import type { MonitorProjectionAppliedEvent } from '../entities/monitor-projection-applied-event.entity.js';
import type { CreateMonitorProjectionAppliedEventDto } from '../dto/create-monitor-projection-applied-event.dto.js';

@Injectable()
export class MonitorProjectionAppliedEventService {
  constructor(
    private readonly repository: MonitorProjectionAppliedEventRepository,
  ) {}
  findAll(): Promise<MonitorProjectionAppliedEvent[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<MonitorProjectionAppliedEvent> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateMonitorProjectionAppliedEventDto,
  ): Promise<MonitorProjectionAppliedEvent> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateMonitorProjectionAppliedEventDto>,
  ): Promise<MonitorProjectionAppliedEvent> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
