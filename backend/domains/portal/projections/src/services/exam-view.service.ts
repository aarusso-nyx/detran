// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.2 sha256:5deaf3bb32dddcda371d363d5b4d7c5b8f3e0ec17cea92357ccf01a121943012
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
