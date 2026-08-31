// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:17207db7ca179e913375c7645edcf4c43c3e309891634856e04a72dd4a4d8f54
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
