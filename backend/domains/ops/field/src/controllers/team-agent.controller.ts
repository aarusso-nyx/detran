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
import type { CreateTeamAgentDto } from '../dto/create-team-agent.dto.js';
import { TeamAgentService } from '../services/team-agent.service.js';

@Controller('v1/ops/field/team-agents')
@Resource('ops:team-agent')
export class TeamAgentController {
  constructor(private readonly service: TeamAgentService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'OPS_OPS_TEAM_AGENT_CREATE', entity: 'ops.ops_team_agent' })
  create(@Body() dto: CreateTeamAgentDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'OPS_OPS_TEAM_AGENT_UPDATE', entity: 'ops.ops_team_agent' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateTeamAgentDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'OPS_OPS_TEAM_AGENT_DELETE', entity: 'ops.ops_team_agent' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
