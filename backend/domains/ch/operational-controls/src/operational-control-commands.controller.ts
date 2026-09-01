import { Body, Controller, Get, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  OperationalControlService,
  type RecordOperationalControlCommand,
  type ValidateClinicLocationCommand,
} from './operational-control.service.js';

@Controller('v1/ch/operational-controls')
@Resource('ch:operational-control')
export class OperationalControlCommandsController {
  constructor(private readonly controls: OperationalControlService) {}

  @Post('records')
  @Action('write')
  @Audit({
    action: 'CH_OPERATIONAL_RECORD_CREATE',
    entity: 'ch.operational_record',
  })
  record(@Body() command: RecordOperationalControlCommand) {
    return this.controls.record(command);
  }

  @Post('clinic-location/validate')
  @Action('write')
  @Audit({
    action: 'CH_CLINIC_LOCATION_VALIDATE',
    entity: 'ch.operational_record',
  })
  validateClinicLocation(@Body() command: ValidateClinicLocationCommand) {
    return this.controls.validateClinicLocation(command);
  }

  @Get('dashboard')
  @Action('read')
  dashboard() {
    return this.controls.dashboard();
  }
}
