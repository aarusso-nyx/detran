// Generated from BP-CH-ENCOUNTERS-001 v1.2.1 sha256:0eae9fa8ccfb086eba21de22f3a9d379e0256092be9e903b2c7feea4c664ec92
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
