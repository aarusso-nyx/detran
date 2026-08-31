// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.0 sha256:6257f652f4d63bb50c213e96f5977765a32de34bf9f211bea0c1d69d6f2a54db
import { Injectable } from '@nestjs/common';
import { ProfessionalRepository } from '../repositories/professional.repository.js';
import type { Professional } from '../entities/professional.entity.js';
import type { CreateProfessionalDto } from '../dto/create-professional.dto.js';

@Injectable()
export class ProfessionalService {
  constructor(private readonly repository: ProfessionalRepository) {}
  findAll(): Promise<Professional[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Professional> {
    return this.repository.findOne(id);
  }
  create(dto: CreateProfessionalDto): Promise<Professional> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateProfessionalDto>,
  ): Promise<Professional> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
