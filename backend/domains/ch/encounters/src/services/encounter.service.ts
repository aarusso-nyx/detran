// Generated from BP-CH-ENCOUNTERS-001 v1.0.0 sha256:a45f4d9aa68b80d085d4e052deb019f227158b561404fdd7e02b5260b8347912
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
