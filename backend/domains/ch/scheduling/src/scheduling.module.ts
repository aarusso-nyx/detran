// Generated from BP-CH-SCHEDULING-001 v1.0.0 sha256:fdbac09747b1d01ea1aa90821a792d537064443364d6a193ca6df5575d591513
import { Module } from '@nestjs/common';
import { ProfessionalScheduleController } from './controllers/professional-schedule.controller.js';
import { ProfessionalScheduleService } from './services/professional-schedule.service.js';
import { ProfessionalScheduleRepository } from './repositories/professional-schedule.repository.js';
import { AppointmentAssignmentDrawController } from './controllers/appointment-assignment-draw.controller.js';
import { AppointmentAssignmentDrawService } from './services/appointment-assignment-draw.service.js';
import { AppointmentAssignmentDrawRepository } from './repositories/appointment-assignment-draw.repository.js';
import { SchedulingCommandsController } from './scheduling-commands.controller.js';
import { AppointmentDistributionService } from './appointment-distribution.service.js';

@Module({
  controllers: [
    SchedulingCommandsController,
    ProfessionalScheduleController,
    AppointmentAssignmentDrawController,
  ],
  providers: [
    ProfessionalScheduleService,
    ProfessionalScheduleRepository,
    AppointmentAssignmentDrawService,
    AppointmentAssignmentDrawRepository,
    AppointmentDistributionService,
  ],
})
export class SchedulingModule {}
