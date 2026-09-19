// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
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
