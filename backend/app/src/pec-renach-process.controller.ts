import { Body, Controller, Param, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  type OpenRenachProcessCommand,
  PecRenachProcessService,
} from './pec-renach-process.service.js';

@Controller('v1/ch/encounters')
@Resource('ch:encounter')
export class PecRenachProcessController {
  constructor(private readonly processes: PecRenachProcessService) {}

  @Post(':id/renach-process')
  @Action('update')
  @Audit({ action: 'CH_RENACH_PROCESS_OPEN', entity: 'ch.encounter' })
  open(
    @Param('id') encounterId: string,
    @Body() command: OpenRenachProcessCommand,
  ) {
    return this.processes.openAndBind(encounterId, command);
  }
}
