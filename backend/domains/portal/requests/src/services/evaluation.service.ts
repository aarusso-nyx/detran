// Generated from BP-PORTAL-REQUESTS-001 v1.0.1 sha256:7d0a55a7a82e70ee07788622c4eec34061cd514ce99ee2f768622565ca290904
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
