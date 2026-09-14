import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import { FieldOperationsService } from './field-operations.service.js';

@Controller('ops')
export class FieldOperationsController {
  constructor(private readonly service: FieldOperationsService) {}

  @Get('agents') @Resource('ops:agent-profile') @Action('read') agents() {
    return this.service.list('agents');
  }

  @Post('agents')
  @Resource('ops:agent-profile')
  @Action('create')
  @Audit({ action: 'OPS_AGENT_CREATE', entity: 'ops.ops_agent_profile' })
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
  @Audit({ action: 'OPS_DEVICE_CREATE', entity: 'ops.ops_operational_device' })
  createDevice(@Body() dto: Record<string, unknown>) {
    return this.service.create('devices', dto);
  }

  @Get('teams') @Resource('ops:team') @Action('read') teams() {
    return this.service.list('teams');
  }

  @Post('teams')
  @Resource('ops:team')
  @Action('create')
  @Audit({ action: 'OPS_TEAM_CREATE', entity: 'ops.ops_team' })
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
  @Audit({ action: 'OPS_SHIFT_CREATE', entity: 'ops.ops_shift' })
  createShift(@Body() dto: Record<string, unknown>) {
    return this.service.create('shifts', dto);
  }

  @Get('homologations')
  @Resource('ops:homologation')
  @Action('read')
  homologations() {
    return this.service.list('homologations');
  }

  @Post('homologations')
  @Resource('ops:homologation')
  @Action('create')
  @Audit({ action: 'OPS_HOMOLOGATION_CREATE', entity: 'ops.ops_homologation' })
  createHomologation(@Body() dto: Record<string, unknown>) {
    return this.service.create('homologations', dto);
  }

  @Get('app-versions')
  @Resource('ops:application-version')
  @Action('read')
  applicationVersions() {
    return this.service.list('app-versions');
  }

  @Post('app-versions')
  @Resource('ops:application-version')
  @Action('create')
  @Audit({
    action: 'OPS_APP_VERSION_CREATE',
    entity: 'ops.ops_application_version',
  })
  createApplicationVersion(@Body() dto: Record<string, unknown>) {
    return this.service.create('app-versions', dto);
  }
}
