// Generated from BP-CH-ENCOUNTERS-001 v1.2.1 sha256:b72b0b7aad32b908d777d9b44b885244d74a7a214c442fecc03551811f18b2fd
import { Module } from '@nestjs/common';
import { AppointmentController } from './controllers/appointment.controller.js';
import { AppointmentService } from './services/appointment.service.js';
import { AppointmentRepository } from './repositories/appointment.repository.js';
import { EncounterController } from './controllers/encounter.controller.js';
import { EncounterService } from './services/encounter.service.js';
import { EncounterRepository } from './repositories/encounter.repository.js';
import { EncounterCommandsController } from './encounter-commands.controller.js';
import { EncounterLifecycleService } from './encounter-lifecycle.service.js';

@Module({
  controllers: [
    EncounterCommandsController,
    AppointmentController,
    EncounterController,
  ],
  providers: [
    AppointmentService,
    AppointmentRepository,
    EncounterService,
    EncounterRepository,
    EncounterLifecycleService,
  ],
})
export class EncountersModule {}
