// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import type { CreateSessionHandoffDto } from '../dto/create-session-handoff.dto.js';
import { SessionHandoffService } from '../services/session-handoff.service.js';

@Controller('v1/ops/field/session-handoffs')
@Resource('ops:session-handoff')
export class SessionHandoffController {
  constructor(private readonly service: SessionHandoffService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_OPS_SESSION_HANDOFF_CREATE',
    entity: 'ops.ops_session_handoff',
  })
  create(@Body() dto: CreateSessionHandoffDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_OPS_SESSION_HANDOFF_UPDATE',
    entity: 'ops.ops_session_handoff',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateSessionHandoffDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_OPS_SESSION_HANDOFF_DELETE',
    entity: 'ops.ops_session_handoff',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
