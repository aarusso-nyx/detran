// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:060a1bba7bd902d60194a1ee2fe169a4b0972602bd54e5330083d9c518641e52
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
import type { CreateSyncQueueItemDto } from '../dto/create-sync-queue-item.dto.js';
import { SyncQueueItemService } from '../services/sync-queue-item.service.js';

@Controller('v1/ops/offline-sync/sync-queue-items')
@Resource('ops:sync-queue-item')
export class SyncQueueItemController {
  constructor(private readonly service: SyncQueueItemService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_SYNC_QUEUE_ITEM_CREATE',
    entity: 'ops.sync_queue_item',
  })
  create(@Body() dto: CreateSyncQueueItemDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_SYNC_QUEUE_ITEM_UPDATE',
    entity: 'ops.sync_queue_item',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateSyncQueueItemDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_SYNC_QUEUE_ITEM_DELETE',
    entity: 'ops.sync_queue_item',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
