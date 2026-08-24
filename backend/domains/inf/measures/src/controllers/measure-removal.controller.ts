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
import type { CreateMeasureRemovalDto } from '../dto/create-measure-removal.dto.js';
import { MeasureRemovalService } from '../services/measure-removal.service.js';

@Controller('v1/inf/measuresremovals')
@Resource('inf:measure-removal')
export class MeasureRemovalController {
  constructor(private readonly service: MeasureRemovalService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_MEASURE_REMOVAL_CREATE',
    entity: 'inf.measure_removal',
  })
  create(@Body() dto: CreateMeasureRemovalDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_MEASURE_REMOVAL_UPDATE',
    entity: 'inf.measure_removal',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateMeasureRemovalDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_MEASURE_REMOVAL_DELETE',
    entity: 'inf.measure_removal',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
