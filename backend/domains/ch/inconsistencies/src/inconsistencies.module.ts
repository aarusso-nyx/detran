// Generated from BP-CH-INCONSISTENCIES-001 v1.0.0 sha256:8d41845822fa8f12974a6647c408a271a91454cc1edf96a2d24a695385b1f72e
import { Module } from '@nestjs/common';
import { InconsistencyController } from './controllers/inconsistency.controller.js';
import { InconsistencyService } from './services/inconsistency.service.js';
import { InconsistencyRepository } from './repositories/inconsistency.repository.js';
import { InconsistencyCommandsController } from './inconsistency-commands.controller.js';
import { InconsistencyLifecycleService } from './inconsistency-lifecycle.service.js';

@Module({
  controllers: [InconsistencyController, InconsistencyCommandsController],
  providers: [
    InconsistencyService,
    InconsistencyRepository,
    InconsistencyLifecycleService,
  ],
})
export class InconsistenciesModule {}
