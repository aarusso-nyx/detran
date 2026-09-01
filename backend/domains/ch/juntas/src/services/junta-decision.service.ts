// Generated from BP-CH-JUNTAS-001 v1.0.0 sha256:5c7e357c88ac5886f460c789a7607211ada27acd49d6f9fd47df0da89ad064f2
import { Injectable } from '@nestjs/common';
import { JuntaDecisionRepository } from '../repositories/junta-decision.repository.js';
import type { JuntaDecision } from '../entities/junta-decision.entity.js';
import type { CreateJuntaDecisionDto } from '../dto/create-junta-decision.dto.js';

@Injectable()
export class JuntaDecisionService {
  constructor(private readonly repository: JuntaDecisionRepository) {}
  findAll(): Promise<JuntaDecision[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<JuntaDecision> {
    return this.repository.findOne(id);
  }
  create(dto: CreateJuntaDecisionDto): Promise<JuntaDecision> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateJuntaDecisionDto>,
  ): Promise<JuntaDecision> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
