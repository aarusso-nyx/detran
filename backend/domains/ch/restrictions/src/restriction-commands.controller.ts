import { Body, Controller, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  type ApplyRestrictionInput,
  RestrictionLifecycleService,
} from './restriction-lifecycle.service.js';

@Controller('v1/ch/restrictions')
@Resource('ch:restriction')
export class RestrictionCommandsController {
  constructor(private readonly lifecycle: RestrictionLifecycleService) {}

  @Post('applied')
  @Action('create')
  @Audit({
    action: 'CH_ENCOUNTER_RESTRICTION_APPLY',
    entity: 'ch.encounter_restriction',
  })
  apply(@Body() input: ApplyRestrictionInput) {
    return this.lifecycle.apply(input);
  }
}
