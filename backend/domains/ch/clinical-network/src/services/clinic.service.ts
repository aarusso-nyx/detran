// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.1 sha256:cf3ec339cc0ca843606bd21a0fdf72f4b789898c5953117bfb9bf4fef54c191d
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
