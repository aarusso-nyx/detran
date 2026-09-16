// Generated from BP-EST-CRASH-001 v1.0.0 sha256:b47af7c82f17c4a1fa3e3eefb69f476ee022559780b97f30285d2582d18c8231
import { Module } from '@nestjs/common';
import { CrashRecordController } from './controllers/crash-record.controller.js';
import { CrashRecordService } from './services/crash-record.service.js';
import { CrashRecordRepository } from './repositories/crash-record.repository.js';
import { CrashVehicleController } from './controllers/crash-vehicle.controller.js';
import { CrashVehicleService } from './services/crash-vehicle.service.js';
import { CrashVehicleRepository } from './repositories/crash-vehicle.repository.js';
import { CrashPersonController } from './controllers/crash-person.controller.js';
import { CrashPersonService } from './services/crash-person.service.js';
import { CrashPersonRepository } from './repositories/crash-person.repository.js';
import { CrashVictimController } from './controllers/crash-victim.controller.js';
import { CrashVictimService } from './services/crash-victim.service.js';
import { CrashVictimRepository } from './repositories/crash-victim.repository.js';
import { CrashSceneDutyController } from './controllers/crash-scene-duty.controller.js';
import { CrashSceneDutyService } from './services/crash-scene-duty.service.js';
import { CrashSceneDutyRepository } from './repositories/crash-scene-duty.repository.js';
import { CrashDamageController } from './controllers/crash-damage.controller.js';
import { CrashDamageService } from './services/crash-damage.service.js';
import { CrashDamageRepository } from './repositories/crash-damage.repository.js';
import { CrashWitnessController } from './controllers/crash-witness.controller.js';
import { CrashWitnessService } from './services/crash-witness.service.js';
import { CrashWitnessRepository } from './repositories/crash-witness.repository.js';
import { CrashSketchController } from './controllers/crash-sketch.controller.js';
import { CrashSketchService } from './services/crash-sketch.service.js';
import { CrashSketchRepository } from './repositories/crash-sketch.repository.js';
import { CrashLinkController } from './controllers/crash-link.controller.js';
import { CrashLinkService } from './services/crash-link.service.js';
import { CrashLinkRepository } from './repositories/crash-link.repository.js';
import { CrashRenaestSubmissionController } from './controllers/crash-renaest-submission.controller.js';
import { CrashRenaestSubmissionService } from './services/crash-renaest-submission.service.js';
import { CrashRenaestSubmissionRepository } from './repositories/crash-renaest-submission.repository.js';
import { CrashSubjectRequestController } from './controllers/crash-subject-request.controller.js';
import { CrashSubjectRequestService } from './services/crash-subject-request.service.js';
import { CrashSubjectRequestRepository } from './repositories/crash-subject-request.repository.js';

@Module({
  controllers: [
    CrashRecordController,
    CrashVehicleController,
    CrashPersonController,
    CrashVictimController,
    CrashSceneDutyController,
    CrashDamageController,
    CrashWitnessController,
    CrashSketchController,
    CrashLinkController,
    CrashRenaestSubmissionController,
    CrashSubjectRequestController,
  ],
  providers: [
    CrashRecordService,
    CrashRecordRepository,
    CrashVehicleService,
    CrashVehicleRepository,
    CrashPersonService,
    CrashPersonRepository,
    CrashVictimService,
    CrashVictimRepository,
    CrashSceneDutyService,
    CrashSceneDutyRepository,
    CrashDamageService,
    CrashDamageRepository,
    CrashWitnessService,
    CrashWitnessRepository,
    CrashSketchService,
    CrashSketchRepository,
    CrashLinkService,
    CrashLinkRepository,
    CrashRenaestSubmissionService,
    CrashRenaestSubmissionRepository,
    CrashSubjectRequestService,
    CrashSubjectRequestRepository,
  ],
})
export class CrashModule {}
