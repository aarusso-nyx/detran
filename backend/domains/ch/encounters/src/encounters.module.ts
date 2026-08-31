// Generated from BP-CH-ENCOUNTERS-001 v1.0.0 sha256:a45f4d9aa68b80d085d4e052deb019f227158b561404fdd7e02b5260b8347912
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
