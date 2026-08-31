// Generated from BP-CH-EXAMS-001 v1.0.0 sha256:b8585266a2e5ca4734d9b60ec5bade83fc01a1b209d3b3dbd1729a16a6b03734
import { Injectable } from '@nestjs/common';
import { PsychologicalExamRepository } from '../repositories/psychological-exam.repository.js';
import type { PsychologicalExam } from '../entities/psychological-exam.entity.js';
import type { CreatePsychologicalExamDto } from '../dto/create-psychological-exam.dto.js';

@Injectable()
export class PsychologicalExamService {
  constructor(private readonly repository: PsychologicalExamRepository) {}
  findAll(): Promise<PsychologicalExam[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<PsychologicalExam> {
    return this.repository.findOne(id);
  }
  create(dto: CreatePsychologicalExamDto): Promise<PsychologicalExam> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreatePsychologicalExamDto>,
  ): Promise<PsychologicalExam> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
