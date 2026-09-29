// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:ff9d218be3314b511ef2cdab143c94785c99ffe446405136e001f85f8978c1ad
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
}
