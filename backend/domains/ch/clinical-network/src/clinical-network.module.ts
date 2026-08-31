// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:98288e4c3b1f3ff28eef48c4d363085a60a99484a1feac9cb173c792d0ac6a3e
import { Module } from '@nestjs/common';
import { ClinicController } from './controllers/clinic.controller.js';
import { ClinicService } from './services/clinic.service.js';
import { ClinicRepository } from './repositories/clinic.repository.js';
import { ProfessionalController } from './controllers/professional.controller.js';
import { ProfessionalService } from './services/professional.service.js';
import { ProfessionalRepository } from './repositories/professional.repository.js';
import { BiometricStationController } from './controllers/biometric-station.controller.js';
import { BiometricStationService } from './services/biometric-station.service.js';
import { BiometricStationRepository } from './repositories/biometric-station.repository.js';

@Module({
  controllers: [
    ClinicController,
    ProfessionalController,
    BiometricStationController,
  ],
  providers: [
    ClinicService,
    ClinicRepository,
    ProfessionalService,
    ProfessionalRepository,
    BiometricStationService,
    BiometricStationRepository,
  ],
})
export class ClinicalNetworkModule {}
