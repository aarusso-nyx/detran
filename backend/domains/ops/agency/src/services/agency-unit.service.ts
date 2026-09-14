// Generated from BP-OPS-AGENCY-001 v1.0.0 sha256:afec0eee717d2c38412377687b43b37d2bc04ae65291d2f8a69cd1c15189af7f
import { Injectable } from '@nestjs/common';
import { AgencyUnitRepository } from '../repositories/agency-unit.repository.js';
import type { AgencyUnit } from '../entities/agency-unit.entity.js';
import type { CreateAgencyUnitDto } from '../dto/create-agency-unit.dto.js';

@Injectable()
export class AgencyUnitService {
  constructor(private readonly repository: AgencyUnitRepository) {}
  findAll(): Promise<AgencyUnit[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AgencyUnit> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAgencyUnitDto): Promise<AgencyUnit> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateAgencyUnitDto>): Promise<AgencyUnit> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
