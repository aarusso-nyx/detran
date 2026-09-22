// Generated from BP-INF-INFRACTION-001 v1.1.2 sha256:59e421dbbb90b291b45408217601e9d6a86b992d9c75c00e5f73b17c5b2e21dd
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
import type { CreateInfractionEventDto } from '../dto/create-infraction-event.dto.js';
import { InfractionEventService } from '../services/infraction-event.service.js';

@Controller('v1/inf/infraction/events')
@Resource('inf:infraction-event')
export class InfractionEventController {
  constructor(private readonly service: InfractionEventService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_INFRACTION_EVENT_CREATE',
    entity: 'inf.infraction_event',
  })
  create(@Body() dto: CreateInfractionEventDto) {
    return this.service.create(dto);
  }
}
