// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
