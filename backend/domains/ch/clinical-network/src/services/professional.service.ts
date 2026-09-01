// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.0 sha256:82e75f24c423a323e597e8da9f59db8f0ac0c54ce3edd34ae7e02895d71a176e
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
