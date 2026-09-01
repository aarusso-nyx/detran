// Generated from BP-CH-PATIENTS-001 v1.1.0 sha256:0d66678ac2689c982108492124f246cf667b4a6004a170339d827cb56e0c95e9
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
