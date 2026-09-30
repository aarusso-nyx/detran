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
import type { CreateAgentProfileDto } from '../dto/create-agent-profile.dto.js';
import { AgentProfileService } from '../services/agent-profile.service.js';

@Controller('v1/ops/field/agents')
@Resource('ops:agent-profile')
export class AgentProfileController {
  constructor(private readonly service: AgentProfileService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_OPS_AGENT_PROFILE_CREATE',
    entity: 'ops.ops_agent_profile',
  })
  create(@Body() dto: CreateAgentProfileDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_OPS_AGENT_PROFILE_UPDATE',
    entity: 'ops.ops_agent_profile',
  })
  update(@Param('id') id: string, @Body() dto: Partial<CreateAgentProfileDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_OPS_AGENT_PROFILE_DELETE',
    entity: 'ops.ops_agent_profile',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
