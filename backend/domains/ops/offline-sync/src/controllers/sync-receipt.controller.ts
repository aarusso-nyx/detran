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
import type { CreateSyncReceiptDto } from '../dto/create-sync-receipt.dto.js';
import { SyncReceiptService } from '../services/sync-receipt.service.js';

@Controller('v1/ops/offline-sync/receipts')
@Resource('ops:sync-receipt')
export class SyncReceiptController {
  constructor(private readonly service: SyncReceiptService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
}
