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
import type { CreateRaitDraftDto } from '../dto/create-rait-draft.dto.js';
import { RaitDraftService } from '../services/rait-draft.service.js';

@Controller('v1/inf/rait/drafts')
@Resource('inf:rait-draft')
export class RaitDraftController {
  constructor(private readonly service: RaitDraftService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_DRAFT_CREATE', entity: 'inf.rait_draft' })
  create(@Body() dto: CreateRaitDraftDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_DRAFT_UPDATE', entity: 'inf.rait_draft' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitDraftDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_DRAFT_DELETE', entity: 'inf.rait_draft' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
