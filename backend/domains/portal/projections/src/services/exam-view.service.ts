// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380
import { Injectable } from '@nestjs/common';
import { ExamViewRepository } from '../repositories/exam-view.repository.js';
import type { ExamView } from '../entities/exam-view.entity.js';
import type { CreateExamViewDto } from '../dto/create-exam-view.dto.js';

@Injectable()
export class ExamViewService {
  constructor(private readonly repository: ExamViewRepository) {}
  findAll(): Promise<ExamView[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ExamView> {
    return this.repository.findOne(id);
  }
  create(dto: CreateExamViewDto): Promise<ExamView> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateExamViewDto>): Promise<ExamView> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
