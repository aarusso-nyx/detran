// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.1 sha256:b30e4ad53da99d2d4e5fb17ef4f0c9c8cdf5814458a99505c92f04945c482281
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
