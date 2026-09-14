// Generated from BP-OPS-OFFLINE-SYNC-001 v1.0.0 sha256:21bcd6e203b7ff643de48a32fe2947a4e7ad1f7b62b66209c60e24c97da59ce9
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
