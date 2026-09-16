// CTG-0002 §5.7–§5.9 (R-0008, TASK-0005) — postura do dispositivo e ciclo da
// homologação, em `v1/ops/field`.
import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import { FieldCommands } from './field-commands.js';
import type { CancelHomologationInput } from './cancel-homologation.command.js';
import type { DevicePostureInput } from './device-posture.command.js';
import type { RenewHomologationInput } from './renew-homologation.command.js';

@Controller('v1/ops/field')
export class FieldCommandsController {
  constructor(private readonly commands: FieldCommands) {}

  @Post('devices/:id/block')
  @HttpCode(200)
  @Resource('ops:operational-device')
  @Action('block')
  @Audit({
    action: 'OPS_DEVICE_BLOCK',
    entity: 'ops.ops_operational_device',
  })
  block(@Param('id') id: string, @Body() body: DevicePostureInput) {
    return this.commands.devicePosture.block(id, body);
  }

  @Post('devices/:id/unblock')
  @HttpCode(200)
  @Resource('ops:operational-device')
  @Action('unblock')
  @Audit({
    action: 'OPS_DEVICE_UNBLOCK',
    entity: 'ops.ops_operational_device',
  })
  unblock(@Param('id') id: string, @Body() body: DevicePostureInput) {
    return this.commands.devicePosture.unblock(id, body);
  }

  @Post('devices/:id/wipe')
  @HttpCode(200)
  @Resource('ops:operational-device')
  @Action('wipe')
  @Audit({
    action: 'OPS_DEVICE_WIPE',
    entity: 'ops.ops_operational_device',
  })
  wipe(@Param('id') id: string, @Body() body: DevicePostureInput) {
    return this.commands.devicePosture.wipe(id, body);
  }

  @Post('homologations/:id/renew')
  @HttpCode(200)
  @Resource('ops:homologation')
  @Action('renew')
  @Audit({ action: 'OPS_HOMOLOGATION_RENEW', entity: 'ops.ops_homologation' })
  renew(@Param('id') id: string, @Body() body: RenewHomologationInput) {
    return this.commands.renewHomologation.execute(id, body);
  }

  @Post('homologations/:id/cancel-by-audit')
  @HttpCode(200)
  @Resource('ops:homologation')
  @Action('cancel-by-audit')
  @Audit({ action: 'OPS_HOMOLOGATION_CANCEL', entity: 'ops.ops_homologation' })
  cancelByAudit(
    @Param('id') id: string,
    @Body() body: CancelHomologationInput,
  ) {
    return this.commands.cancelHomologation.execute(id, body);
  }
}
