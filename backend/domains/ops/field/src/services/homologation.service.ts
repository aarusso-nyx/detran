// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
import { Injectable } from '@nestjs/common';
import { HomologationRepository } from '../repositories/homologation.repository.js';
import type { Homologation } from '../entities/homologation.entity.js';
import type { CreateHomologationDto } from '../dto/create-homologation.dto.js';

@Injectable()
export class HomologationService {
  constructor(private readonly repository: HomologationRepository) {}
  findAll(): Promise<Homologation[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Homologation> {
    return this.repository.findOne(id);
  }
  create(dto: CreateHomologationDto): Promise<Homologation> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateHomologationDto>,
  ): Promise<Homologation> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
