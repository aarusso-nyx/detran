// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
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
