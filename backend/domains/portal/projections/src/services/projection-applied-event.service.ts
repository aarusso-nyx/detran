// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.1 sha256:b30e4ad53da99d2d4e5fb17ef4f0c9c8cdf5814458a99505c92f04945c482281
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
