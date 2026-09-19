// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
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
