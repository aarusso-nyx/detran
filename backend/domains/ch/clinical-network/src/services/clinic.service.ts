// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:243dd2a69921d6544f3664d22ea24b32a34148a32d18659ca5d926815bfbe154
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
