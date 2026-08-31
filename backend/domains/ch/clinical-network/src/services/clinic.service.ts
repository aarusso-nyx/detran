// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:98288e4c3b1f3ff28eef48c4d363085a60a99484a1feac9cb173c792d0ac6a3e
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
