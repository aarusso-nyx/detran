// Generated from BP-OPS-FIELD-001 v1.0.0 sha256:b5a54db524ac2a7fb0bb450442e2aef89132ee0ff1592f87be4837294e197177
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
