// Generated from BP-CH-EXAMS-001 v1.0.0 sha256:4768197f351ea702628ed5198543624eb79b54621bfc8fb4c6383ecc414b17b9
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
