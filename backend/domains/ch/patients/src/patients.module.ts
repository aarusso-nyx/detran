// Generated from BP-CH-PATIENTS-001 v1.0.0 sha256:fd85a6f24243cbbe4dc9776184762d2ce9698f1b3d0a6b3dad88bbc31ba43d65
import { Module } from '@nestjs/common';
import { PatientController } from './controllers/patient.controller.js';
import { PatientService } from './services/patient.service.js';
import { PatientRepository } from './repositories/patient.repository.js';

@Module({
  controllers: [PatientController],
  providers: [PatientService, PatientRepository],
})
export class PatientsModule {}
