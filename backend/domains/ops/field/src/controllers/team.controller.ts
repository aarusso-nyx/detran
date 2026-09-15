// Generated from BP-OPS-FIELD-001 v1.1.0 sha256:5a59c7ce8135a9525483148958cce1459ea0402e62977f6e952298cd8d4b281e
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
import type { CreateTeamDto } from '../dto/create-team.dto.js';
import { TeamService } from '../services/team.service.js';

@Controller('v1/ops/field/teams')
@Resource('ops:team')
export class TeamController {
  constructor(private readonly service: TeamService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'OPS_OPS_TEAM_CREATE', entity: 'ops.ops_team' })
  create(@Body() dto: CreateTeamDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'OPS_OPS_TEAM_UPDATE', entity: 'ops.ops_team' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateTeamDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'OPS_OPS_TEAM_DELETE', entity: 'ops.ops_team' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
