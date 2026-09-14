// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:9b6f79a3cdcad0f477ef759231f4effedede012dda39fe184dad78a5196f11ca
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
