// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
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

@Controller('v1/inf/measures/retentions')
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
