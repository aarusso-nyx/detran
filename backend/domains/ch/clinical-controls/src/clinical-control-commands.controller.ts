import { Body, Controller, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  ClinicalControlLifecycleService,
  type RecordClinicalControlCommand,
} from './clinical-control-lifecycle.service.js';

@Controller('v1/ch/clinical-controls/events')
@Resource('ch:clinical-control-event')
export class ClinicalControlCommandsController {
  constructor(private readonly lifecycle: ClinicalControlLifecycleService) {}

  @Post()
  @Action('create')
  @Audit({
    action: 'CH_CLINICAL_CONTROL_RECORDED',
    entity: 'ch.clinical_control_event',
  })
  record(@Body() command: RecordClinicalControlCommand) {
    return this.lifecycle.record(command);
  }
}
