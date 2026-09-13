import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  ComplaintLifecycleService,
  type CreateComplaintCommand,
  type TransitionComplaintCommand,
} from './complaint-lifecycle.service.js';

@Controller('v1/portal/complaints')
@Resource('portal:complaint')
export class ComplaintCommandsController {
  constructor(private readonly lifecycle: ComplaintLifecycleService) {}

  @Post()
  @Action('create')
  @Audit({ action: 'PORTAL_COMPLAINT_CREATE', entity: 'portal.complaint' })
  create(@Body() command: CreateComplaintCommand) {
    return this.lifecycle.create(command);
  }

  @Patch(':id/status')
  @Action('update')
  @Audit({ action: 'PORTAL_COMPLAINT_TRANSITION', entity: 'portal.complaint' })
  transition(
    @Param('id') id: string,
    @Body() command: TransitionComplaintCommand,
  ) {
    return this.lifecycle.transition(id, command);
  }
}
