// Generated from BP-INF-AIT-001 v1.2.0 sha256:7501ee3ae148ed392c384119fcce2158f0accb353d0ce4c4406b3863321a28ea
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
import type { CreateAitCancelRequestEventDto } from '../dto/create-ait-cancel-request-event.dto.js';
import { AitCancelRequestEventService } from '../services/ait-cancel-request-event.service.js';

@Controller('v1/inf/ait/cancel-request-events')
@Resource('inf:ait-cancel-request-event')
export class AitCancelRequestEventController {
  constructor(private readonly service: AitCancelRequestEventService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_AIT_CANCEL_REQUEST_EVENT_CREATE',
    entity: 'inf.ait_cancel_request_event',
  })
  create(@Body() dto: CreateAitCancelRequestEventDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_AIT_CANCEL_REQUEST_EVENT_UPDATE',
    entity: 'inf.ait_cancel_request_event',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAitCancelRequestEventDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_AIT_CANCEL_REQUEST_EVENT_DELETE',
    entity: 'inf.ait_cancel_request_event',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
