// Generated from BP-CH-ENCOUNTERS-001 v1.1.0 sha256:7931238eb7e2720ab74ab9e327a65f946e9feb0fd555a8658cbf413e7db8b48b
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
