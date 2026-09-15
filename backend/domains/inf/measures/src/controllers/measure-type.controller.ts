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
import type { CreateMeasureTypeDto } from '../dto/create-measure-type.dto.js';
import { MeasureTypeService } from '../services/measure-type.service.js';

@Controller('v1/inf/measures/types')
@Resource('inf:measure-type')
export class MeasureTypeController {
  constructor(private readonly service: MeasureTypeService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_MEASURE_TYPE_CREATE', entity: 'inf.measure_type' })
  create(@Body() dto: CreateMeasureTypeDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_MEASURE_TYPE_UPDATE', entity: 'inf.measure_type' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateMeasureTypeDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_MEASURE_TYPE_DELETE', entity: 'inf.measure_type' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
