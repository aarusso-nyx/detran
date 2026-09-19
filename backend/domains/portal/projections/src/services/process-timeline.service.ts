// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.2 sha256:5deaf3bb32dddcda371d363d5b4d7c5b8f3e0ec17cea92357ccf01a121943012
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
