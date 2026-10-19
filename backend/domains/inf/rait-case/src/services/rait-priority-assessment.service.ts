// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
import { Injectable } from '@nestjs/common';
import { RaitPriorityAssessmentRepository } from '../repositories/rait-priority-assessment.repository.js';
import type { RaitPriorityAssessment } from '../entities/rait-priority-assessment.entity.js';
import type { CreateRaitPriorityAssessmentDto } from '../dto/create-rait-priority-assessment.dto.js';

@Injectable()
export class RaitPriorityAssessmentService {
  constructor(private readonly repository: RaitPriorityAssessmentRepository) {}
  findAll(): Promise<RaitPriorityAssessment[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitPriorityAssessment> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateRaitPriorityAssessmentDto,
  ): Promise<RaitPriorityAssessment> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitPriorityAssessmentDto>,
  ): Promise<RaitPriorityAssessment> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
