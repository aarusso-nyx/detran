// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.2 sha256:5deaf3bb32dddcda371d363d5b4d7c5b8f3e0ec17cea92357ccf01a121943012
import { Injectable } from '@nestjs/common';
import { ProjectionAppliedEventRepository } from '../repositories/projection-applied-event.repository.js';
import type { ProjectionAppliedEvent } from '../entities/projection-applied-event.entity.js';
import type { CreateProjectionAppliedEventDto } from '../dto/create-projection-applied-event.dto.js';

@Injectable()
export class ProjectionAppliedEventService {
  constructor(private readonly repository: ProjectionAppliedEventRepository) {}
  findAll(): Promise<ProjectionAppliedEvent[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ProjectionAppliedEvent> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateProjectionAppliedEventDto,
  ): Promise<ProjectionAppliedEvent> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateProjectionAppliedEventDto>,
  ): Promise<ProjectionAppliedEvent> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
