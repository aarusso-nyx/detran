// Generated from BP-INF-AIT-001 v1.0.0 sha256:ef69813e9ad97641c04b7bbbdb8110fe97446523d552fdf17da429d55de0b510
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
import type { CreateAitPrintEventDto } from '../dto/create-ait-print-event.dto.js';
import { AitPrintEventService } from '../services/ait-print-event.service.js';

@Controller('v1/inf/ait/print-events')
@Resource('inf:ait-print-event')
export class AitPrintEventController {
  constructor(private readonly service: AitPrintEventService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_AIT_PRINT_EVENT_CREATE',
    entity: 'inf.ait_print_event',
  })
  create(@Body() dto: CreateAitPrintEventDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_AIT_PRINT_EVENT_UPDATE',
    entity: 'inf.ait_print_event',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAitPrintEventDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_AIT_PRINT_EVENT_DELETE',
    entity: 'inf.ait_print_event',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
