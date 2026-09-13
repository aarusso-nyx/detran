import { Body, Controller, Param, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  type CreateProcessBlockCommand,
  ProcessBlockLifecycleService,
} from './process-block-lifecycle.service.js';

@Controller('v1/ch/process-blocks')
@Resource('ch:process-block')
export class ProcessBlockCommandsController {
  constructor(private readonly lifecycle: ProcessBlockLifecycleService) {}

  @Post()
  @Action('create')
  @Audit({ action: 'CH_PROCESS_BLOCK_CREATE', entity: 'ch.process_block' })
  create(@Body() command: CreateProcessBlockCommand) {
    return this.lifecycle.create(command);
  }

  @Post(':id/resolve')
  @Action('update')
  @Audit({ action: 'CH_PROCESS_BLOCK_RESOLVE', entity: 'ch.process_block' })
  resolve(@Param('id') id: string) {
    return this.lifecycle.resolve(id);
  }
}
