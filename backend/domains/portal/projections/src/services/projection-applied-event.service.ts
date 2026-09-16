// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380
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
