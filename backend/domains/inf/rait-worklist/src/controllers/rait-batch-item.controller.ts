// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
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
import type { CreateRaitBatchItemDto } from '../dto/create-rait-batch-item.dto.js';
import { RaitBatchItemService } from '../services/rait-batch-item.service.js';

@Controller('v1/inf/rait/batch-items')
@Resource('inf:rait-batch-item')
export class RaitBatchItemController {
  constructor(private readonly service: RaitBatchItemService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_BATCH_ITEM_CREATE',
    entity: 'inf.rait_batch_item',
  })
  create(@Body() dto: CreateRaitBatchItemDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_BATCH_ITEM_UPDATE',
    entity: 'inf.rait_batch_item',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitBatchItemDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_BATCH_ITEM_DELETE',
    entity: 'inf.rait_batch_item',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
