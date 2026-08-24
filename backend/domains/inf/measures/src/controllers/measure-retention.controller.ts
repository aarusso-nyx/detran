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
import type { CreateMeasureRetentionDto } from '../dto/create-measure-retention.dto.js';
import { MeasureRetentionService } from '../services/measure-retention.service.js';

@Controller('v1/inf/measuresretentions')
@Resource('inf:measure-retention')
export class MeasureRetentionController {
  constructor(private readonly service: MeasureRetentionService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_MEASURE_RETENTION_CREATE',
    entity: 'inf.measure_retention',
  })
  create(@Body() dto: CreateMeasureRetentionDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_MEASURE_RETENTION_UPDATE',
    entity: 'inf.measure_retention',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateMeasureRetentionDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_MEASURE_RETENTION_DELETE',
    entity: 'inf.measure_retention',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
