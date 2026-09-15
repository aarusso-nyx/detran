// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
import { Injectable } from '@nestjs/common';
import { RaitDecisionRepository } from '../repositories/rait-decision.repository.js';
import type { RaitDecision } from '../entities/rait-decision.entity.js';
import type { CreateRaitDecisionDto } from '../dto/create-rait-decision.dto.js';

@Injectable()
export class RaitDecisionService {
  constructor(private readonly repository: RaitDecisionRepository) {}
  findAll(): Promise<RaitDecision[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitDecision> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitDecisionDto): Promise<RaitDecision> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitDecisionDto>,
  ): Promise<RaitDecision> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
