// Generated from BP-INF-ALCOHOL-001 v1.2.0 sha256:f54fa6e2f04e73d65b7b187ded6fe373d6b14c80f840688310d1f09b9420e20f
import { Module } from '@nestjs/common';
import { AlcoholProcedureController } from './controllers/alcohol-procedure.controller.js';
import { AlcoholProcedureService } from './services/alcohol-procedure.service.js';
import { AlcoholProcedureRepository } from './repositories/alcohol-procedure.repository.js';
import { BreathalyzerController } from './controllers/breathalyzer.controller.js';
import { BreathalyzerService } from './services/breathalyzer.service.js';
import { BreathalyzerRepository } from './repositories/breathalyzer.repository.js';
import { AlcoholTestController } from './controllers/alcohol-test.controller.js';
import { AlcoholTestService } from './services/alcohol-test.service.js';
import { AlcoholTestRepository } from './repositories/alcohol-test.repository.js';
import { AlcoholRefusalController } from './controllers/alcohol-refusal.controller.js';
import { AlcoholRefusalService } from './services/alcohol-refusal.service.js';
import { AlcoholRefusalRepository } from './repositories/alcohol-refusal.repository.js';
import { PsychomotorSignController } from './controllers/psychomotor-sign.controller.js';
import { PsychomotorSignService } from './services/psychomotor-sign.service.js';
import { PsychomotorSignRepository } from './repositories/psychomotor-sign.repository.js';
import { AlcoholForwardingController } from './controllers/alcohol-forwarding.controller.js';
import { AlcoholForwardingService } from './services/alcohol-forwarding.service.js';
import { AlcoholForwardingRepository } from './repositories/alcohol-forwarding.repository.js';
import { AlcoholCommandsController } from './alcohol-commands.controller.js';
import { ALCOHOL_LIFECYCLE_PROVIDER } from './handwritten/alcohol-lifecycle.provider.js';

@Module({
  controllers: [
    AlcoholCommandsController,
    AlcoholProcedureController,
    BreathalyzerController,
    AlcoholTestController,
    AlcoholRefusalController,
    PsychomotorSignController,
    AlcoholForwardingController,
  ],
  providers: [
    AlcoholProcedureService,
    AlcoholProcedureRepository,
    BreathalyzerService,
    BreathalyzerRepository,
    AlcoholTestService,
    AlcoholTestRepository,
    AlcoholRefusalService,
    AlcoholRefusalRepository,
    PsychomotorSignService,
    PsychomotorSignRepository,
    AlcoholForwardingService,
    AlcoholForwardingRepository,
    ALCOHOL_LIFECYCLE_PROVIDER,
  ],
})
export class AlcoholModule {}
