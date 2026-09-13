import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import { Idempotent } from '@stynx-nyx/idempotency';

import {
  PecUserAdminService,
  type PecUserAdminCommand,
  type PecUserAdminQuery,
} from './pec-user-admin.service.js';

@Controller('v1/admin/users')
@Resource('platform:user')
export class PecUserAdminController {
  constructor(private readonly service: PecUserAdminService) {}
  @Get() @Action('read') list(@Query() query: PecUserAdminQuery) {
    return this.service.list(query);
  }
  @Post()
  @Action('create')
  @Idempotent()
  @Audit({ action: 'PLATFORM_USER_CREATE', entity: 'auth.users' })
  create(@Body() command: PecUserAdminCommand) {
    return this.service.create(command);
  }
  @Patch(':id')
  @Action('update')
  @Idempotent()
  @Audit({ action: 'PLATFORM_USER_UPDATE', entity: 'auth.users' })
  update(
    @Param('id') id: string,
    @Body() command: Partial<PecUserAdminCommand>,
  ) {
    return this.service.update(id, command);
  }
  @Delete(':id')
  @Action('delete')
  @Idempotent()
  @Audit({ action: 'PLATFORM_USER_DEACTIVATE', entity: 'auth.users' })
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
