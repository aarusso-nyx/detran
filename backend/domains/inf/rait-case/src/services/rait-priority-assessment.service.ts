// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
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
