// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.0 sha256:6257f652f4d63bb50c213e96f5977765a32de34bf9f211bea0c1d69d6f2a54db
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
    ClinicController,
    ProfessionalController,
    BiometricStationController,
    ProfessionalCommandsController,
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
