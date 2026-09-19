// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:1861cc41e71895a553a106b4be9f7f02958d1829af65885904d1c8f6a9aeb07c
import { Injectable } from '@nestjs/common';
import { EvaluationRepository } from '../repositories/evaluation.repository.js';
import type { Evaluation } from '../entities/evaluation.entity.js';
import type { CreateEvaluationDto } from '../dto/create-evaluation.dto.js';

@Injectable()
export class EvaluationService {
  constructor(private readonly repository: EvaluationRepository) {}
  findAll(): Promise<Evaluation[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Evaluation> {
    return this.repository.findOne(id);
  }
  create(dto: CreateEvaluationDto): Promise<Evaluation> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateEvaluationDto>): Promise<Evaluation> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
