// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.0 sha256:82e75f24c423a323e597e8da9f59db8f0ac0c54ce3edd34ae7e02895d71a176e
import { Injectable } from '@nestjs/common';
import { ClinicRepository } from '../repositories/clinic.repository.js';
import type { Clinic } from '../entities/clinic.entity.js';
import type { CreateClinicDto } from '../dto/create-clinic.dto.js';

@Injectable()
export class ClinicService {
  constructor(private readonly repository: ClinicRepository) {}
  findAll(): Promise<Clinic[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Clinic> {
    return this.repository.findOne(id);
  }
  create(dto: CreateClinicDto): Promise<Clinic> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateClinicDto>): Promise<Clinic> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
