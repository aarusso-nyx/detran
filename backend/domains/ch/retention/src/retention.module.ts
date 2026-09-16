// Generated from BP-CH-RETENTION-001 v1.0.0 sha256:8a74485eaee2a6dbb8cbc10772396a77b465cdd84cc5a57db0c90035ef24ea78
import { Module } from '@nestjs/common';
import { RetentionCaseController } from './controllers/retention-case.controller.js';
import { RetentionCaseService } from './services/retention-case.service.js';
import { RetentionCaseRepository } from './repositories/retention-case.repository.js';
import { RetentionHoldController } from './controllers/retention-hold.controller.js';
import { RetentionHoldService } from './services/retention-hold.service.js';
import { RetentionHoldRepository } from './repositories/retention-hold.repository.js';
import { RetentionDispositionController } from './controllers/retention-disposition.controller.js';
import { RetentionDispositionService } from './services/retention-disposition.service.js';
import { RetentionDispositionRepository } from './repositories/retention-disposition.repository.js';
import { RetentionCommandsController } from './retention-commands.controller.js';
import { RetentionLifecycleService } from './retention-lifecycle.service.js';

@Module({
  controllers: [
    RetentionCommandsController,
    RetentionCaseController,
    RetentionHoldController,
    RetentionDispositionController,
  ],
  providers: [
    RetentionCaseService,
    RetentionCaseRepository,
    RetentionHoldService,
    RetentionHoldRepository,
    RetentionDispositionService,
    RetentionDispositionRepository,
    RetentionLifecycleService,
  ],
})
export class RetentionModule {}
