// Generated from BP-INF-INFRACTION-001 v1.1.1 sha256:c9e1dec5067f8324003780a279b646761b2298bf7712019b3023acdf50746e4c
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
