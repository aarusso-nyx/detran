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
import type { CreateMeasureStatusHistoryDto } from '../dto/create-measure-status-history.dto.js';
import { MeasureStatusHistoryService } from '../services/measure-status-history.service.js';

@Controller('v1/inf/measures/status-history')
@Resource('inf:measure-status-history')
export class MeasureStatusHistoryController {
  constructor(private readonly service: MeasureStatusHistoryService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_MEASURE_STATUS_HISTORY_CREATE',
    entity: 'inf.measure_status_history',
  })
  create(@Body() dto: CreateMeasureStatusHistoryDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_MEASURE_STATUS_HISTORY_UPDATE',
    entity: 'inf.measure_status_history',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateMeasureStatusHistoryDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_MEASURE_STATUS_HISTORY_DELETE',
    entity: 'inf.measure_status_history',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
