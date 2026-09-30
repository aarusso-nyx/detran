// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
import { Injectable } from '@nestjs/common';
import { AgentProfileRepository } from '../repositories/agent-profile.repository.js';
import type { AgentProfile } from '../entities/agent-profile.entity.js';
import type { CreateAgentProfileDto } from '../dto/create-agent-profile.dto.js';

@Injectable()
export class AgentProfileService {
  constructor(private readonly repository: AgentProfileRepository) {}
  findAll(): Promise<AgentProfile[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AgentProfile> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAgentProfileDto): Promise<AgentProfile> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAgentProfileDto>,
  ): Promise<AgentProfile> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
