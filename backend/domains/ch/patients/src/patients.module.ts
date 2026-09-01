// Generated from BP-CH-PATIENTS-001 v1.1.0 sha256:0d66678ac2689c982108492124f246cf667b4a6004a170339d827cb56e0c95e9
import { Module } from '@nestjs/common';
import { PatientController } from './controllers/patient.controller.js';
import { PatientService } from './services/patient.service.js';
import { PatientRepository } from './repositories/patient.repository.js';

@Module({
  controllers: [PatientController],
  providers: [PatientService, PatientRepository],
})
export class PatientsModule {}
