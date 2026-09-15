// Generated from BP-OPS-AGENCY-001 v1.0.0 sha256:afec0eee717d2c38412377687b43b37d2bc04ae65291d2f8a69cd1c15189af7f
import { Injectable } from '@nestjs/common';
import { AgencyCompetenceRepository } from '../repositories/agency-competence.repository.js';
import type { AgencyCompetence } from '../entities/agency-competence.entity.js';
import type { CreateAgencyCompetenceDto } from '../dto/create-agency-competence.dto.js';

@Injectable()
export class AgencyCompetenceService {
  constructor(private readonly repository: AgencyCompetenceRepository) {}
  findAll(): Promise<AgencyCompetence[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AgencyCompetence> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAgencyCompetenceDto): Promise<AgencyCompetence> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAgencyCompetenceDto>,
  ): Promise<AgencyCompetence> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
