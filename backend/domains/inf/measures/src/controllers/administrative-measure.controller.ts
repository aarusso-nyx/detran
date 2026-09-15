// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
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

@Controller('v1/inf/measures/administrative-measures')
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
