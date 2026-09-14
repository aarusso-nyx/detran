// Generated from BP-INF-INFRACTION-001 v1.1.1 sha256:c9e1dec5067f8324003780a279b646761b2298bf7712019b3023acdf50746e4c
import { Module } from '@nestjs/common';
import { InfractionController } from './controllers/infraction.controller.js';
import { InfractionService } from './services/infraction.service.js';
import { InfractionRepository } from './repositories/infraction.repository.js';
import { InfractionTimerController } from './controllers/infraction-timer.controller.js';
import { InfractionTimerService } from './services/infraction-timer.service.js';
import { InfractionTimerRepository } from './repositories/infraction-timer.repository.js';
import { InfractionEventController } from './controllers/infraction-event.controller.js';
import { InfractionEventService } from './services/infraction-event.service.js';
import { InfractionEventRepository } from './repositories/infraction-event.repository.js';

@Module({
  controllers: [
    InfractionController,
    InfractionTimerController,
    InfractionEventController,
  ],
  providers: [
    InfractionService,
    InfractionRepository,
    InfractionTimerService,
    InfractionTimerRepository,
    InfractionEventService,
    InfractionEventRepository,
  ],
})
export class InfractionModule {}
