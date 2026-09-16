// CTG-0002 §1, §5.1, §5.4–§5.6 (R-0008, TASK-0005) — bootstrap móvel, turno e
// handoff de sessão, no prefixo `v1/ops/…` do route contract §4.
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import { FieldCommands } from './field-commands.js';
import type { CloseShiftInput } from './close-shift.command.js';
import type { HandoffSessionInput } from './handoff-session.command.js';
import type { MobileBootstrapQuery } from './mobile-bootstrap.service.js';
import type { OpenShiftInput } from './open-shift.command.js';

@Controller('v1/ops/mobile-bootstrap')
@Resource('ops:operational-device')
export class MobileBootstrapController {
  constructor(private readonly commands: FieldCommands) {}

  @Get()
  @Action('read')
  bootstrap(@Query() query: MobileBootstrapQuery) {
    return this.commands.bootstrap.read(query);
  }

  @Post('shifts')
  @Resource('ops:shift')
  @Action('create')
  @Audit({ action: 'OPS_SHIFT_OPEN', entity: 'ops.ops_shift' })
  openShift(@Body() body: OpenShiftInput) {
    return this.commands.openShift.execute(body);
  }

  @Post('shifts/:id/close')
  @HttpCode(200)
  @Action('close-shift')
  @Audit({ action: 'OPS_SHIFT_CLOSE', entity: 'ops.ops_shift' })
  closeShift(@Param('id') id: string, @Body() body: CloseShiftInput) {
    return this.commands.closeShift.execute(id, body);
  }

  @Post('sessions/handoff')
  @HttpCode(200)
  @Action('handoff-session')
  @Audit({ action: 'OPS_SESSION_HANDOFF', entity: 'ops.ops_session_handoff' })
  handoff(@Body() body: HandoffSessionInput) {
    return this.commands.handoffSession.execute(body);
  }
}
