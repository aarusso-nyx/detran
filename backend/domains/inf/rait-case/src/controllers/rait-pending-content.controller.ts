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
import type { CreateRaitPendingContentDto } from '../dto/create-rait-pending-content.dto.js';
import { RaitPendingContentService } from '../services/rait-pending-content.service.js';

@Controller('v1/inf/rait/pending-contents')
@Resource('inf:rait-pending-content')
export class RaitPendingContentController {
  constructor(private readonly service: RaitPendingContentService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_PENDING_CONTENT_CREATE',
    entity: 'inf.rait_pending_content',
  })
  create(@Body() dto: CreateRaitPendingContentDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_PENDING_CONTENT_UPDATE',
    entity: 'inf.rait_pending_content',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitPendingContentDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_PENDING_CONTENT_DELETE',
    entity: 'inf.rait_pending_content',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
