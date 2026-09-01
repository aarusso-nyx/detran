import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { Idempotent } from '@stynx-nyx/idempotency';
import { RateLimit } from '@stynx-nyx/ratelimit';
import { Action, Audit, Resource } from '@detran/shared';

import {
  PecProcessParametersService,
  type UpsertProcessParameterCommand,
} from './pec-process-parameters.service.js';

@Controller('v1/ch/admin/process-parameters')
@Resource('ch:process-parameter')
@RateLimit({ bucket: 'tenant', scope: 'ch.process-parameters' })
export class PecProcessParametersController {
  constructor(private readonly parameters: PecProcessParametersService) {}

  @Get()
  @Action('read')
  list() {
    return this.parameters.list();
  }

  @Put(':key')
  @Action('write')
  @Idempotent()
  @Audit({
    action: 'CH_PROCESS_PARAMETER_UPSERT',
    entity: 'tenancy.tenant_settings',
  })
  upsert(
    @Param('key') key: string,
    @Body() command: UpsertProcessParameterCommand,
  ) {
    return this.parameters.upsert(key, command);
  }

  @Delete(':key')
  @Action('write')
  @Idempotent()
  @Audit({
    action: 'CH_PROCESS_PARAMETER_DELETE',
    entity: 'tenancy.tenant_settings',
  })
  remove(@Param('key') key: string) {
    return this.parameters.remove(key);
  }
}
