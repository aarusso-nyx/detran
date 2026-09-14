// Generated from BP-OPS-AGENCY-001 v1.0.0 sha256:afec0eee717d2c38412377687b43b37d2bc04ae65291d2f8a69cd1c15189af7f
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
import type { CreateAgencyCompetenceDto } from '../dto/create-agency-competence.dto.js';
import { AgencyCompetenceService } from '../services/agency-competence.service.js';

@Controller('v1/ops/agency/competences')
@Resource('ops:agency-competence')
export class AgencyCompetenceController {
  constructor(private readonly service: AgencyCompetenceService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_AGENCY_COMPETENCE_CREATE',
    entity: 'ops.agency_competence',
  })
  create(@Body() dto: CreateAgencyCompetenceDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_AGENCY_COMPETENCE_UPDATE',
    entity: 'ops.agency_competence',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAgencyCompetenceDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_AGENCY_COMPETENCE_DELETE',
    entity: 'ops.agency_competence',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
