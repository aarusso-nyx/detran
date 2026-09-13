import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  type CorrectInconsistencyCommand,
  type DetectInconsistencyCommand,
  InconsistencyLifecycleService,
} from './inconsistency-lifecycle.service.js';

@Controller('v1/ch/inconsistencies')
@Resource('ch:inconsistency')
export class InconsistencyCommandsController {
  constructor(private readonly lifecycle: InconsistencyLifecycleService) {}

  @Post()
  @Action('create')
  @Audit({ action: 'CH_INCONSISTENCY_DETECTED', entity: 'ch.inconsistency' })
  detect(@Body() command: DetectInconsistencyCommand) {
    return this.lifecycle.detect(command);
  }

  @Patch(':id/notify')
  @Action('update')
  @Audit({ action: 'CH_INCONSISTENCY_NOTIFIED', entity: 'ch.inconsistency' })
  notify(@Param('id') id: string) {
    return this.lifecycle.notify(id);
  }

  @Patch(':id/correct')
  @Action('update')
  @Audit({ action: 'CH_INCONSISTENCY_CORRECTED', entity: 'ch.inconsistency' })
  correct(
    @Param('id') id: string,
    @Body() command: CorrectInconsistencyCommand,
  ) {
    return this.lifecycle.correct(id, command);
  }

  @Patch(':id/reprocess')
  @Action('update')
  @Audit({ action: 'CH_INCONSISTENCY_REPROCESSED', entity: 'ch.inconsistency' })
  reprocess(@Param('id') id: string) {
    return this.lifecycle.reprocess(id);
  }

  @Patch(':id/close')
  @Action('update')
  @Audit({ action: 'CH_INCONSISTENCY_CLOSED', entity: 'ch.inconsistency' })
  close(@Param('id') id: string) {
    return this.lifecycle.close(id);
  }
}
