import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  type StartTelehealthCommand,
  TelehealthLifecycleService,
} from './telehealth-lifecycle.service.js';

@Controller('v1/ch/telehealth/sessions')
@Resource('ch:telehealth-session')
export class TelehealthCommandsController {
  constructor(private readonly lifecycle: TelehealthLifecycleService) {}

  @Post()
  @Action('create')
  @Audit({ action: 'CH_TELEHEALTH_START', entity: 'ch.telehealth_session' })
  start(@Body() command: StartTelehealthCommand) {
    return this.lifecycle.start(command);
  }

  @Patch(':id/conclude')
  @Action('update')
  @Audit({ action: 'CH_TELEHEALTH_CONCLUDE', entity: 'ch.telehealth_session' })
  conclude(
    @Param('id') id: string,
    @Body()
    body: {
      conclusion: Record<string, unknown>;
      lfdPassed: boolean;
      createBillableItem?: boolean;
    },
  ) {
    return this.lifecycle.conclude(
      id,
      body.conclusion,
      body.lfdPassed,
      body.createBillableItem,
    );
  }
}
