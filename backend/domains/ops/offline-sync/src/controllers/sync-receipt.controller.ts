// Generated from BP-OPS-OFFLINE-SYNC-001 v1.2.0 sha256:caa6ee5fb47a5169864e22d9763e35d774009a12ac8d550129bacf8d39ac2cac
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
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'OPS_SYNC_RECEIPT_CREATE', entity: 'ops.sync_receipt' })
  create(@Body() dto: CreateSyncReceiptDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'OPS_SYNC_RECEIPT_UPDATE', entity: 'ops.sync_receipt' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateSyncReceiptDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'OPS_SYNC_RECEIPT_DELETE', entity: 'ops.sync_receipt' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
