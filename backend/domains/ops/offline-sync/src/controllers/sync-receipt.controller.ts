// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:56d0c4dd4d9f1a20f38bbcc7372af113898d34e435e79b5cccc2ab1e077d0479
import { Controller, Get } from '@nestjs/common';
import { Action, Resource } from '@detran/shared';
import { SyncReceiptService } from '../services/sync-receipt.service.js';

@Controller('v1/ops/offline-sync/receipts')
@Resource('ops:sync-receipt')
export class SyncReceiptController {
  constructor(private readonly service: SyncReceiptService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
}
