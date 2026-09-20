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
