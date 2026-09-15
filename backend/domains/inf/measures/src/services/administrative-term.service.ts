// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
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
