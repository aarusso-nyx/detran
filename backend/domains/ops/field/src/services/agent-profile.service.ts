// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
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
