// Generated from BP-INF-AIT-001 v1.2.0 sha256:bbea1ddf9778bda02679f21a82457ea86830dad4f230eb271a51f14f05d22f6d
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
