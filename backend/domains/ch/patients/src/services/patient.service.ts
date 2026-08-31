// Generated from BP-CH-PATIENTS-001 v1.0.0 sha256:fd85a6f24243cbbe4dc9776184762d2ce9698f1b3d0a6b3dad88bbc31ba43d65
import { Injectable } from '@nestjs/common';
import { PatientRepository } from '../repositories/patient.repository.js';
import type { Patient } from '../entities/patient.entity.js';
import type { CreatePatientDto } from '../dto/create-patient.dto.js';

@Injectable()
export class PatientService {
  constructor(private readonly repository: PatientRepository) {}
  findAll(): Promise<Patient[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Patient> {
    return this.repository.findOne(id);
  }
  create(dto: CreatePatientDto): Promise<Patient> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreatePatientDto>): Promise<Patient> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
