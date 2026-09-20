// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
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
import type { CreateRaitAgendaItemDto } from '../dto/create-rait-agenda-item.dto.js';
import { RaitAgendaItemService } from '../services/rait-agenda-item.service.js';

@Controller('v1/inf/rait/agenda-items')
@Resource('inf:rait-agenda-item')
export class RaitAgendaItemController {
  constructor(private readonly service: RaitAgendaItemService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
