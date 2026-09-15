// Generated from BP-OPS-FIELD-001 v1.1.0 sha256:5a59c7ce8135a9525483148958cce1459ea0402e62977f6e952298cd8d4b281e
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
