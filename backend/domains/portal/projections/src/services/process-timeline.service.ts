// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380
import { Injectable } from '@nestjs/common';
import { ProcessTimelineRepository } from '../repositories/process-timeline.repository.js';
import type { ProcessTimeline } from '../entities/process-timeline.entity.js';
import type { CreateProcessTimelineDto } from '../dto/create-process-timeline.dto.js';

@Injectable()
export class ProcessTimelineService {
  constructor(private readonly repository: ProcessTimelineRepository) {}
  findAll(): Promise<ProcessTimeline[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ProcessTimeline> {
    return this.repository.findOne(id);
  }
  create(dto: CreateProcessTimelineDto): Promise<ProcessTimeline> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateProcessTimelineDto>,
  ): Promise<ProcessTimeline> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
