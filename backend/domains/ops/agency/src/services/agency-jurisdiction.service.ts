// Generated from BP-OPS-AGENCY-001 v1.0.0 sha256:afec0eee717d2c38412377687b43b37d2bc04ae65291d2f8a69cd1c15189af7f
import { Injectable } from '@nestjs/common';
import { AgencyJurisdictionRepository } from '../repositories/agency-jurisdiction.repository.js';
import type { AgencyJurisdiction } from '../entities/agency-jurisdiction.entity.js';
import type { CreateAgencyJurisdictionDto } from '../dto/create-agency-jurisdiction.dto.js';

@Injectable()
export class AgencyJurisdictionService {
  constructor(private readonly repository: AgencyJurisdictionRepository) {}
  findAll(): Promise<AgencyJurisdiction[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AgencyJurisdiction> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAgencyJurisdictionDto): Promise<AgencyJurisdiction> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAgencyJurisdictionDto>,
  ): Promise<AgencyJurisdiction> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
