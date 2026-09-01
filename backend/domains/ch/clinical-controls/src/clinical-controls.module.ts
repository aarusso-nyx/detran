// Generated from BP-CH-CLINICAL-CONTROLS-001 v1.0.0 sha256:0fc842b8a5a36fe3ca506127d7341f9c7bf183f2956d1c77485c5e3f6a8db18c
import { Module } from '@nestjs/common';
import { ClinicalControlEventController } from './controllers/clinical-control-event.controller.js';
import { ClinicalControlEventService } from './services/clinical-control-event.service.js';
import { ClinicalControlEventRepository } from './repositories/clinical-control-event.repository.js';
import { ClinicalControlCommandsController } from './clinical-control-commands.controller.js';
import { ClinicalControlLifecycleService } from './clinical-control-lifecycle.service.js';

@Module({
  controllers: [
    ClinicalControlEventController,
    ClinicalControlCommandsController,
  ],
  providers: [
    ClinicalControlEventService,
    ClinicalControlEventRepository,
    ClinicalControlLifecycleService,
  ],
})
export class ClinicalControlsModule {}
