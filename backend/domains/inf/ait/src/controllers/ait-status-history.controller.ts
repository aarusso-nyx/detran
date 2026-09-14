// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
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
import type { CreateAitStatusHistoryDto } from '../dto/create-ait-status-history.dto.js';
import { AitStatusHistoryService } from '../services/ait-status-history.service.js';

@Controller('v1/inf/ait/status-history')
@Resource('inf:ait-status-history')
export class AitStatusHistoryController {
  constructor(private readonly service: AitStatusHistoryService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_AIT_STATUS_HISTORY_CREATE',
    entity: 'inf.ait_status_history',
  })
  create(@Body() dto: CreateAitStatusHistoryDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_AIT_STATUS_HISTORY_UPDATE',
    entity: 'inf.ait_status_history',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAitStatusHistoryDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_AIT_STATUS_HISTORY_DELETE',
    entity: 'inf.ait_status_history',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
