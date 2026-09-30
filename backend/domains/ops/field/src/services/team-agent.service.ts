// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
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
