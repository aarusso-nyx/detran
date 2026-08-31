// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:9d98d9786bc2f4b27bd75cb5516d4a00b6d74e520f3dbc52c39f33effb27f60e
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
