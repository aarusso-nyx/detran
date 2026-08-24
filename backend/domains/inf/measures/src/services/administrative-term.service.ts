// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
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
