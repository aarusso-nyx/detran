// Generated from BP-CH-BIOMETRICS-001 v1.1.0 sha256:23fc0416b68ed64cb3247e3a7945a7f7ae42043134403c34124d78f9a5dfd939
import { Module } from '@nestjs/common';
import { BiometricReferenceController } from './controllers/biometric-reference.controller.js';
import { BiometricReferenceService } from './services/biometric-reference.service.js';
import { BiometricReferenceRepository } from './repositories/biometric-reference.repository.js';
import { BiometricFingerConditionController } from './controllers/biometric-finger-condition.controller.js';
import { BiometricFingerConditionService } from './services/biometric-finger-condition.service.js';
import { BiometricFingerConditionRepository } from './repositories/biometric-finger-condition.repository.js';
import { BiometricCheckController } from './controllers/biometric-check.controller.js';
import { BiometricCheckService } from './services/biometric-check.service.js';
import { BiometricCheckRepository } from './repositories/biometric-check.repository.js';
import { BiometricExceptionController } from './controllers/biometric-exception.controller.js';
import { BiometricExceptionService } from './services/biometric-exception.service.js';
import { BiometricExceptionRepository } from './repositories/biometric-exception.repository.js';
import { BiometricCommandsController } from './biometric-commands.controller.js';
import { BiometricVerificationHttpAdapter } from './biometric-verification.http-adapter.js';
import { BiometricLifecycleService } from './biometric-lifecycle.service.js';

@Module({
  controllers: [
    BiometricCommandsController,
    BiometricReferenceController,
    BiometricFingerConditionController,
    BiometricCheckController,
    BiometricExceptionController,
  ],
  providers: [
    BiometricReferenceService,
    BiometricReferenceRepository,
    BiometricFingerConditionService,
    BiometricFingerConditionRepository,
    BiometricCheckService,
    BiometricCheckRepository,
    BiometricExceptionService,
    BiometricExceptionRepository,
    BiometricVerificationHttpAdapter,
    BiometricLifecycleService,
  ],
})
export class BiometricsModule {}
