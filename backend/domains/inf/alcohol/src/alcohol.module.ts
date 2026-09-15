// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:18decd0fa5855e93f40ce052c3ffb2ec4ad022530cd5da983fadf681a45bd246
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

@Module({
  controllers: [
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
  ],
})
export class AlcoholModule {}
