// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
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
import type { CreateRaitIncidentDto } from '../dto/create-rait-incident.dto.js';
import { RaitIncidentService } from '../services/rait-incident.service.js';

@Controller('v1/inf/rait/incidents')
@Resource('inf:rait-incident')
export class RaitIncidentController {
  constructor(private readonly service: RaitIncidentService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_INCIDENT_CREATE', entity: 'inf.rait_incident' })
  create(@Body() dto: CreateRaitIncidentDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_INCIDENT_UPDATE', entity: 'inf.rait_incident' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitIncidentDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_INCIDENT_DELETE', entity: 'inf.rait_incident' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
