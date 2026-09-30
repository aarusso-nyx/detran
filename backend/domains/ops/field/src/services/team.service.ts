// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
import { Injectable } from '@nestjs/common';
import { TeamRepository } from '../repositories/team.repository.js';
import type { Team } from '../entities/team.entity.js';
import type { CreateTeamDto } from '../dto/create-team.dto.js';

@Injectable()
export class TeamService {
  constructor(private readonly repository: TeamRepository) {}
  findAll(): Promise<Team[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Team> {
    return this.repository.findOne(id);
  }
  create(dto: CreateTeamDto): Promise<Team> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateTeamDto>): Promise<Team> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
