// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
import { Injectable } from '@nestjs/common';
import { AdministrativeTermRepository } from '../repositories/administrative-term.repository.js';
import type { AdministrativeTerm } from '../entities/administrative-term.entity.js';
import type { CreateAdministrativeTermDto } from '../dto/create-administrative-term.dto.js';

@Injectable()
export class AdministrativeTermService {
  constructor(private readonly repository: AdministrativeTermRepository) {}
  findAll(): Promise<AdministrativeTerm[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AdministrativeTerm> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAdministrativeTermDto): Promise<AdministrativeTerm> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAdministrativeTermDto>,
  ): Promise<AdministrativeTerm> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
