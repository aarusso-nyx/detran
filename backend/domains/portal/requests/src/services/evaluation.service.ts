// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:5473ac653449e703579b07347c595f918249dd6308961a12198eab656de781ae
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
