import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Audit, Action, Resource } from '@detran/shared';
import { FieldOperationsService } from './index.js';
@Controller('ops')
export class FieldOperationsController {
  constructor(private readonly service: FieldOperationsService) {}
  @Get('agents') @Resource('ops:agent-profile') @Action('read') agents() {
    return this.service.list('agents');
  }
  @Post('agents')
  @Resource('ops:agent-profile')
  @Action('create')
  @Audit({ action: 'OPS_AGENT_CREATE', entity: 'ops.agent_profile' })
  createAgent(@Body() dto: Record<string, unknown>) {
    return this.service.create('agents', dto);
  }
  @Get('devices')
  @Resource('ops:operational-device')
  @Action('read')
  devices() {
    return this.service.list('devices');
  }
  @Post('devices')
  @Resource('ops:operational-device')
  @Action('create')
  @Audit({ action: 'OPS_DEVICE_CREATE', entity: 'ops.operational_device' })
  createDevice(@Body() dto: Record<string, unknown>) {
    return this.service.create('devices', dto);
  }
  @Get('teams') @Resource('ops:team') @Action('read') teams() {
    return this.service.list('teams');
  }
  @Post('teams')
  @Resource('ops:team')
  @Action('create')
  @Audit({ action: 'OPS_TEAM_CREATE', entity: 'ops.team' })
  createTeam(@Body() dto: Record<string, unknown>) {
    return this.service.create('teams', dto);
  }
  @Get('shifts/:id') @Resource('ops:shift') @Action('read') shift(
    @Param('id') id: string,
  ) {
    return this.service.get('shifts', id);
  }
  @Post('shifts')
  @Resource('ops:shift')
  @Action('create')
  @Audit({ action: 'OPS_SHIFT_CREATE', entity: 'ops.shift' })
  createShift(@Body() dto: Record<string, unknown>) {
    return this.service.create('shifts', dto);
  }
  @Post('homologations')
  @Resource('ops:homologation')
  @Action('create')
  @Audit({ action: 'OPS_HOMOLOGATION_CREATE', entity: 'ops.homologation' })
  createHomologation(@Body() dto: Record<string, unknown>) {
    return this.service.create('homologations', dto);
  }
  @Post('app-versions')
  @Resource('ops:application-version')
  @Action('create')
  @Audit({
    action: 'OPS_APP_VERSION_CREATE',
    entity: 'ops.application_version',
  })
  createApplicationVersion(@Body() dto: Record<string, unknown>) {
    return this.service.create('app-versions', dto);
  }
}
// TODO(Phase 5): add @stynx-nyx/offline-sync controllers after its registry port lands.
