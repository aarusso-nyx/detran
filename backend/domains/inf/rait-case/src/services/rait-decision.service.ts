// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
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
