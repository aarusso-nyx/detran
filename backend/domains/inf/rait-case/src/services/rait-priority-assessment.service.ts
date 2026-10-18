// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
