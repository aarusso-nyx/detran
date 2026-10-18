// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
import type { CreateRaitCaseEventDto } from '../dto/create-rait-case-event.dto.js';
import { RaitCaseEventService } from '../services/rait-case-event.service.js';

@Controller('v1/inf/rait/events')
@Resource('inf:rait-case-event')
export class RaitCaseEventController {
  constructor(private readonly service: RaitCaseEventService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_CASE_EVENT_CREATE',
    entity: 'inf.rait_case_event',
  })
  create(@Body() dto: CreateRaitCaseEventDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_CASE_EVENT_UPDATE',
    entity: 'inf.rait_case_event',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitCaseEventDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_CASE_EVENT_DELETE',
    entity: 'inf.rait_case_event',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
