// Generated from BP-OPS-FIELD-001 v1.1.0 sha256:5a59c7ce8135a9525483148958cce1459ea0402e62977f6e952298cd8d4b281e
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
