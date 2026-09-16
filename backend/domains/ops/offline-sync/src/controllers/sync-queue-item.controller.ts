// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:c35fb9b7cf739cf06c18b8cc02b1ec4cd968c63916ffd149c79d29937faa2c67
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
