import { Controller, Param, Patch } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import { EncounterClosureService } from './encounter-closure.service.js';

@Controller('v1/ch/encounters')
@Resource('ch:encounter')
export class EncounterClosureController {
  constructor(private readonly closure: EncounterClosureService) {}

  @Patch(':id/close')
  @Action('close')
  @Audit({ action: 'CH_ENCOUNTER_CLOSE', entity: 'ch.encounter' })
  close(@Param('id') id: string) {
    return this.closure.close(id);
  }
}
