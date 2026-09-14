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
import type { CreateAgencyJurisdictionDto } from '../dto/create-agency-jurisdiction.dto.js';
import { AgencyJurisdictionService } from '../services/agency-jurisdiction.service.js';

@Controller('v1/ops/agency/jurisdictions')
@Resource('ops:agency-jurisdiction')
export class AgencyJurisdictionController {
  constructor(private readonly service: AgencyJurisdictionService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_AGENCY_JURISDICTION_CREATE',
    entity: 'ops.agency_jurisdiction',
  })
  create(@Body() dto: CreateAgencyJurisdictionDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_AGENCY_JURISDICTION_UPDATE',
    entity: 'ops.agency_jurisdiction',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAgencyJurisdictionDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_AGENCY_JURISDICTION_DELETE',
    entity: 'ops.agency_jurisdiction',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
