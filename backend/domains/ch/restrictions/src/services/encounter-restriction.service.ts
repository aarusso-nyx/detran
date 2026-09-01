// Generated from BP-CH-RESTRICTIONS-001 v1.0.0 sha256:05527c0aea012ece64e79955246e666899d444700b824e484f1800ff151769bf
import { Injectable } from '@nestjs/common';
import { EncounterRestrictionRepository } from '../repositories/encounter-restriction.repository.js';
import type { EncounterRestriction } from '../entities/encounter-restriction.entity.js';
import type { CreateEncounterRestrictionDto } from '../dto/create-encounter-restriction.dto.js';

@Injectable()
export class EncounterRestrictionService {
  constructor(private readonly repository: EncounterRestrictionRepository) {}
  findAll(): Promise<EncounterRestriction[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<EncounterRestriction> {
    return this.repository.findOne(id);
  }
  create(dto: CreateEncounterRestrictionDto): Promise<EncounterRestriction> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateEncounterRestrictionDto>,
  ): Promise<EncounterRestriction> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
