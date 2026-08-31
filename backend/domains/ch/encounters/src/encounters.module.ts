// Generated from BP-CH-ENCOUNTERS-001 v1.2.0 sha256:91731d0164806f1b137025d46dbb65f5fc8ac203fbc84cf8c9affcf81be9a4b5
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
    AppointmentController,
    EncounterController,
    EncounterCommandsController,
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
