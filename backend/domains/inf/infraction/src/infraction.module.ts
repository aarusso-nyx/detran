// Generated from BP-INF-INFRACTION-001 v1.1.2 sha256:59e421dbbb90b291b45408217601e9d6a86b992d9c75c00e5f73b17c5b2e21dd
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
import { InfractionCommandsController } from './handwritten/infraction-commands.controller.js';
import { InfractionCommandService } from './handwritten/infraction-command.service.js';
import { InfractionEventConsumer } from './handwritten/infraction-event.consumer.js';
import { InfractionDeadlineSweep } from './handwritten/infraction-deadline.sweep.js';

@Module({
  controllers: [
    InfractionCommandsController,
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
    InfractionCommandService,
    InfractionEventConsumer,
    InfractionDeadlineSweep,
  ],
})
export class InfractionModule {}
