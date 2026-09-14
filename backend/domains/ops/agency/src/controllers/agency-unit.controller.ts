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
import type { CreateAgencyUnitDto } from '../dto/create-agency-unit.dto.js';
import { AgencyUnitService } from '../services/agency-unit.service.js';

@Controller('v1/ops/agency/units')
@Resource('ops:agency-unit')
export class AgencyUnitController {
  constructor(private readonly service: AgencyUnitService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'OPS_AGENCY_UNIT_CREATE', entity: 'ops.agency_unit' })
  create(@Body() dto: CreateAgencyUnitDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'OPS_AGENCY_UNIT_UPDATE', entity: 'ops.agency_unit' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateAgencyUnitDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'OPS_AGENCY_UNIT_DELETE', entity: 'ops.agency_unit' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
