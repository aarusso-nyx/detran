// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
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
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_AGENDA_ITEM_CREATE',
    entity: 'inf.rait_agenda_item',
  })
  create(@Body() dto: CreateRaitAgendaItemDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_AGENDA_ITEM_UPDATE',
    entity: 'inf.rait_agenda_item',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitAgendaItemDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_AGENDA_ITEM_DELETE',
    entity: 'inf.rait_agenda_item',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
