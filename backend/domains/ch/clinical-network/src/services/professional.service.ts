// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.1 sha256:cf3ec339cc0ca843606bd21a0fdf72f4b789898c5953117bfb9bf4fef54c191d
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
