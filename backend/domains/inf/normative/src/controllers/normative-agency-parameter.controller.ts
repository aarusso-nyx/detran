// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
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
import type { CreateNormativeAgencyParameterDto } from '../dto/create-normative-agency-parameter.dto.js';
import { NormativeAgencyParameterService } from '../services/normative-agency-parameter.service.js';

@Controller('v1/inf/normative/agency-parameters')
@Resource('inf:agency-parameter')
export class NormativeAgencyParameterController {
  constructor(private readonly service: NormativeAgencyParameterService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_NORMATIVE_AGENCY_PARAMETER_CREATE',
    entity: 'inf.normative_agency_parameter',
  })
  create(@Body() dto: CreateNormativeAgencyParameterDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_NORMATIVE_AGENCY_PARAMETER_UPDATE',
    entity: 'inf.normative_agency_parameter',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateNormativeAgencyParameterDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_NORMATIVE_AGENCY_PARAMETER_DELETE',
    entity: 'inf.normative_agency_parameter',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
