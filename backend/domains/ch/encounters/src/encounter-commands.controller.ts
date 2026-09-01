import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  EncounterLifecycleService,
  type OpenEncounterInput,
} from './encounter-lifecycle.service.js';

interface CancelEncounterInput {
  reason: string;
}

@Controller('v1/ch/encounters')
@Resource('ch:encounter')
export class EncounterCommandsController {
  constructor(private readonly lifecycle: EncounterLifecycleService) {}

  @Post()
  @Action('create')
  @Audit({ action: 'CH_ENCOUNTER_OPEN', entity: 'ch.encounter' })
  open(@Body() input: OpenEncounterInput) {
    return this.lifecycle.open(input);
  }

  @Patch(':id/cancel')
  @Action('cancel')
  @Audit({ action: 'CH_ENCOUNTER_CANCEL', entity: 'ch.encounter' })
  cancel(@Param('id') id: string, @Body() input: CancelEncounterInput) {
    return this.lifecycle.cancel(id, input.reason);
  }
}
