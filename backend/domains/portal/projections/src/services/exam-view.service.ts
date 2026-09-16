// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.1 sha256:b30e4ad53da99d2d4e5fb17ef4f0c9c8cdf5814458a99505c92f04945c482281
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
