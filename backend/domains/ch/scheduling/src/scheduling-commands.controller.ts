import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  AppointmentDistributionService,
  type CreateDistributedAppointmentInput,
} from './appointment-distribution.service.js';

interface RerollInput {
  reason: string;
}

@Controller('v1/ch/appointments')
@Resource('ch:appointment')
export class SchedulingCommandsController {
  constructor(private readonly distribution: AppointmentDistributionService) {}

  @Post()
  @Action('create')
  @Audit({ action: 'CH_APPOINTMENT_DISTRIBUTE', entity: 'ch.appointment' })
  create(@Body() input: CreateDistributedAppointmentInput) {
    return this.distribution.create(input);
  }

  @Post(':id/reroll')
  @Action('reroll')
  @Audit({
    action: 'CH_APPOINTMENT_DISTRIBUTION_REROLL',
    entity: 'ch.appointment_assignment_draw',
  })
  reroll(@Param('id') id: string, @Body() input: RerollInput) {
    return this.distribution.reroll(id, input.reason);
  }

  @Patch(':id/no-show')
  @Action('no-show')
  @Audit({ action: 'CH_APPOINTMENT_NO_SHOW', entity: 'ch.appointment' })
  markNoShow(@Param('id') id: string) {
    return this.distribution.markNoShow(id);
  }

  @Patch(':id/cancel')
  @Action('cancel')
  @Audit({ action: 'CH_APPOINTMENT_CANCEL', entity: 'ch.appointment' })
  cancel(@Param('id') id: string) {
    return this.distribution.cancel(id);
  }
}
