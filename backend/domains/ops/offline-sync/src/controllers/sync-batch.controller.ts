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
import type { CreateSyncBatchDto } from '../dto/create-sync-batch.dto.js';
import { SyncBatchService } from '../services/sync-batch.service.js';

@Controller('v1/ops/offline-sync/sync-batches')
@Resource('ops:sync-batch')
export class SyncBatchController {
  constructor(private readonly service: SyncBatchService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'OPS_SYNC_BATCH_CREATE', entity: 'ops.sync_batch' })
  create(@Body() dto: CreateSyncBatchDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'OPS_SYNC_BATCH_UPDATE', entity: 'ops.sync_batch' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateSyncBatchDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'OPS_SYNC_BATCH_DELETE', entity: 'ops.sync_batch' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
