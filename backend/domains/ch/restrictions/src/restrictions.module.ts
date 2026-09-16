// Generated from BP-CH-RESTRICTIONS-001 v1.0.0 sha256:05527c0aea012ece64e79955246e666899d444700b824e484f1800ff151769bf
import { Module } from '@nestjs/common';
import { RestrictionCodeController } from './controllers/restriction-code.controller.js';
import { RestrictionCodeService } from './services/restriction-code.service.js';
import { RestrictionCodeRepository } from './repositories/restriction-code.repository.js';
import { EncounterRestrictionController } from './controllers/encounter-restriction.controller.js';
import { EncounterRestrictionService } from './services/encounter-restriction.service.js';
import { EncounterRestrictionRepository } from './repositories/encounter-restriction.repository.js';
import { RestrictionCommandsController } from './restriction-commands.controller.js';
import { RestrictionLifecycleService } from './restriction-lifecycle.service.js';

@Module({
  controllers: [
    RestrictionCommandsController,
    RestrictionCodeController,
    EncounterRestrictionController,
  ],
  providers: [
    RestrictionCodeService,
    RestrictionCodeRepository,
    EncounterRestrictionService,
    EncounterRestrictionRepository,
    RestrictionLifecycleService,
  ],
})
export class RestrictionsModule {}
