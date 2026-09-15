// Generated from BP-OPS-FIELD-001 v1.1.0 sha256:5a59c7ce8135a9525483148958cce1459ea0402e62977f6e952298cd8d4b281e
import { Injectable } from '@nestjs/common';
import { TeamAgentRepository } from '../repositories/team-agent.repository.js';
import type { TeamAgent } from '../entities/team-agent.entity.js';
import type { CreateTeamAgentDto } from '../dto/create-team-agent.dto.js';

@Injectable()
export class TeamAgentService {
  constructor(private readonly repository: TeamAgentRepository) {}
  findAll(): Promise<TeamAgent[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<TeamAgent> {
    return this.repository.findOne(id);
  }
  create(dto: CreateTeamAgentDto): Promise<TeamAgent> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateTeamAgentDto>): Promise<TeamAgent> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
