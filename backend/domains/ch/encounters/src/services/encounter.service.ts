// Generated from BP-CH-ENCOUNTERS-001 v1.2.1 sha256:0eae9fa8ccfb086eba21de22f3a9d379e0256092be9e903b2c7feea4c664ec92
import { Injectable } from '@nestjs/common';
import { EncounterRepository } from '../repositories/encounter.repository.js';
import type { Encounter } from '../entities/encounter.entity.js';
import type { CreateEncounterDto } from '../dto/create-encounter.dto.js';

@Injectable()
export class EncounterService {
  constructor(private readonly repository: EncounterRepository) {}
  findAll(): Promise<Encounter[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Encounter> {
    return this.repository.findOne(id);
  }
  create(dto: CreateEncounterDto): Promise<Encounter> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateEncounterDto>): Promise<Encounter> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
