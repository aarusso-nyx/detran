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
  PecCognitoAdminService,
  type CognitoAdminListQuery,
} from './pec-cognito-admin.service.js';

@Controller('v1/admin/users/cognito')
@Resource('platform:user')
export class PecCognitoAdminController {
  constructor(private readonly service: PecCognitoAdminService) {}
  @Get() @Action('read') list(@Query() query: CognitoAdminListQuery) {
    return this.service.list(query);
  }
  @Get('groups/all') @Action('read') allGroups(
    @Query() query: { limit?: number; token?: string },
  ) {
    return this.service.listAllGroups(query);
  }
  @Get(':username') @Action('read') get(@Param('username') username: string) {
    return this.service.get(username);
  }
  @Get(':username/groups') @Action('read') groups(
    @Param('username') username: string,
  ) {
    return this.service.listGroups(username);
  }
  @Patch(':username')
  @Action('update')
  @Idempotent()
  @Audit({ action: 'COGNITO_USER_UPDATE', entity: 'external.cognito_user' })
  update(
    @Param('username') username: string,
    @Body()
    body: {
      email?: string;
      phone_number?: string;
      custom?: Record<string, string>;
    },
  ) {
    return this.service.update(username, body);
  }
  @Post(':username/block') @Action('update') @Idempotent() block(
    @Param('username') username: string,
  ) {
    return this.service.disable(username);
  }
  @Post(':username/unblock') @Action('update') @Idempotent() unblock(
    @Param('username') username: string,
  ) {
    return this.service.enable(username);
  }
  @Post(':username/groups/:group') @Action('update') @Idempotent() addToGroup(
    @Param('username') username: string,
    @Param('group') group: string,
  ) {
    return this.service.addToGroup(username, group);
  }
  @Delete(':username/groups/:group')
  @Action('update')
  @Idempotent()
  removeFromGroup(
    @Param('username') username: string,
    @Param('group') group: string,
  ) {
    return this.service.removeFromGroup(username, group);
  }
  @Post(':username/verify') @Action('update') @Idempotent() verify(
    @Param('username') username: string,
    @Body() body: { email?: boolean; phone?: boolean },
  ) {
    return this.service.verify(username, body);
  }
  @Post(':username/reset-password')
  @Action('update')
  @Idempotent()
  resetPassword(@Param('username') username: string) {
    return this.service.resetPassword(username);
  }
}
