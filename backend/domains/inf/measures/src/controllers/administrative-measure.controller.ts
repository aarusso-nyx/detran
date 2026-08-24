// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
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
import type { CreateAdministrativeMeasureDto } from '../dto/create-administrative-measure.dto.js';
import { AdministrativeMeasureService } from '../services/administrative-measure.service.js';

@Controller('v1/inf/measuresadministrative-measures')
@Resource('inf:administrative-measure')
export class AdministrativeMeasureController {
  constructor(private readonly service: AdministrativeMeasureService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_ADMINISTRATIVE_MEASURE_CREATE',
    entity: 'inf.administrative_measure',
  })
  create(@Body() dto: CreateAdministrativeMeasureDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_ADMINISTRATIVE_MEASURE_UPDATE',
    entity: 'inf.administrative_measure',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAdministrativeMeasureDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_ADMINISTRATIVE_MEASURE_DELETE',
    entity: 'inf.administrative_measure',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
