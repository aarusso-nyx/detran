// Generated from BP-CH-EXAMS-001 v1.1.0 sha256:bc8c0fd1f8e0a5a9684ebb7d2165df727ebdb3730cb7cf8f3bb8b106f2990fa9
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
