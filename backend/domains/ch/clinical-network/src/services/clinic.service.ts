// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:9e9bbc2f438a9fcb8207678f2c0927e3013d7ec0f104563fbebaf3ac446c8f7a
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
