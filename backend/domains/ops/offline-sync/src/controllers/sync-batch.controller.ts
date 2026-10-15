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
