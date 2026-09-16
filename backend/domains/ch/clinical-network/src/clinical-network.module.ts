// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.1 sha256:cf3ec339cc0ca843606bd21a0fdf72f4b789898c5953117bfb9bf4fef54c191d
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
import { ProfessionalCommandsController } from './professional-commands.controller.js';
import { CouncilVerificationHttpAdapter } from './council-verification.http-adapter.js';
import { ProfessionalLifecycleService } from './professional-lifecycle.service.js';

@Module({
  controllers: [
    ProfessionalCommandsController,
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
    CouncilVerificationHttpAdapter,
    ProfessionalLifecycleService,
  ],
})
export class ClinicalNetworkModule {}
