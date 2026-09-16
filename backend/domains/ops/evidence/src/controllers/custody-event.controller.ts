// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:e739cf21c78ced39113911fbf0c9950d0c2091ab58cc4efedee4225786fe9eac
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
import type { CreateCustodyEventDto } from '../dto/create-custody-event.dto.js';
import { CustodyEventService } from '../services/custody-event.service.js';

@Controller('v1/ops/evidence/custody-events')
@Resource('ops:custody-event')
export class CustodyEventController {
  constructor(private readonly service: CustodyEventService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_EVIDENCE_CUSTODY_EVENT_CREATE',
    entity: 'ops.evidence_custody_event',
  })
  create(@Body() dto: CreateCustodyEventDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_EVIDENCE_CUSTODY_EVENT_UPDATE',
    entity: 'ops.evidence_custody_event',
  })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCustodyEventDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_EVIDENCE_CUSTODY_EVENT_DELETE',
    entity: 'ops.evidence_custody_event',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
