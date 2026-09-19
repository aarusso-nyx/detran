// CTG-0002 §1, §5.10–§5.13 (R-0008, TASK-0005) — rotas manuscritas do
// protocolo de sincronização, no prefixo `v1/ops/…` que todo controlador
// gerado e o route contract §4 usam. O método só extrai parâmetro e chama o
// comando (CODESTYLE §Backend).
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import type { ReconcileNumberingInput } from './reconcile-numbering.command.js';
import type { ReserveNumberingInput } from './reserve-numbering.command.js';
import type { ResolveSyncConflictInput } from './resolve-conflict.command.js';
import type { SettleNumberingInput } from './settle-numbering.command.js';
import type { SubmitSyncBatchInput } from './submit-batch.command.js';
import type { SyncListFilters } from './offline-sync.reads.js';
import { OfflineSyncCommands } from './offline-sync.commands.js';

@Controller('v1/ops/offline-sync')
export class OfflineSyncController {
  constructor(private readonly commands: OfflineSyncCommands) {}

  @Post('sync-batches')
  @HttpCode(200)
  @Resource('ops:sync-batch')
  @Action('submit')
  @Audit({ action: 'OPS_SYNC_BATCH_SUBMIT', entity: 'ops.sync_batch' })
  submit(@Body() body: SubmitSyncBatchInput) {
    return this.commands.submitBatch.execute(body);
  }

  @Post('numbering-reservations/reserve')
  @Resource('ops:numbering-reservation')
  @Action('reserve')
  @Audit({
    action: 'OPS_NUMBERING_RESERVE',
    entity: 'ops.numbering_reservation',
  })
  reserve(@Body() body: ReserveNumberingInput) {
    return this.commands.reserveNumbering.execute(body);
  }

  @Post('numbering-reservations/:id/cancel')
  @HttpCode(200)
  @Resource('ops:numbering-reservation')
  @Action('cancel')
  @Audit({
    action: 'OPS_NUMBERING_CANCEL',
    entity: 'ops.numbering_reservation',
  })
  cancelReservation(
    @Param('id') id: string,
    @Body() body: SettleNumberingInput,
  ) {
    return this.commands.settleNumbering.cancel(id, body);
  }

  @Post('numbering-reservations/:id/block')
  @HttpCode(200)
  @Resource('ops:numbering-reservation')
  @Action('cancel')
  @Audit({ action: 'OPS_NUMBERING_BLOCK', entity: 'ops.numbering_reservation' })
  blockReservation(
    @Param('id') id: string,
    @Body() body: SettleNumberingInput,
  ) {
    return this.commands.settleNumbering.block(id, body);
  }

  @Post('numbering-reservations/:id/close')
  @HttpCode(200)
  @Resource('ops:numbering-reservation')
  @Action('cancel')
  @Audit({ action: 'OPS_NUMBERING_CLOSE', entity: 'ops.numbering_reservation' })
  closeReservation(
    @Param('id') id: string,
    @Body() body: SettleNumberingInput,
  ) {
    return this.commands.settleNumbering.close(id, body);
  }

  @Post('numbering-reservations/:id/reconcile')
  @HttpCode(200)
  @Resource('ops:numbering-reservation')
  @Action('reserve')
  @Audit({
    action: 'OPS_NUMBERING_RECONCILE',
    entity: 'ops.numbering_consumption',
  })
  reconcile(@Param('id') id: string, @Body() body: ReconcileNumberingInput) {
    return this.commands.reconcileNumbering.execute(id, body);
  }

  @Get('numbering-reservations/:id/consumption')
  @Resource('ops:numbering-reservation')
  @Action('read')
  consumption(@Param('id') id: string) {
    return this.commands.reconcileNumbering.consumption(id);
  }

  @Get('receipts/:tenantId/by-idempotency/:key')
  @Resource('ops:sync-receipt')
  @Action('read')
  receiptByIdempotency(
    @Param('tenantId') tenantId: string,
    @Param('key') key: string,
  ) {
    return this.commands.receipts.findByIdempotencyKey(tenantId, key);
  }

  @Get('receipts/:tenantId')
  @Resource('ops:sync-receipt')
  @Action('read')
  listReceipts(
    @Param('tenantId') tenantId: string,
    @Query() filters: SyncListFilters,
  ) {
    return this.commands.receipts.list(tenantId, filters);
  }

  @Get('sync-queue-items')
  @Resource('ops:sync-queue-item')
  @Action('read')
  listQueueItems(@Query() filters: SyncListFilters) {
    return this.commands.queueItems.list(filters);
  }

  @Get('sync-conflicts')
  @Resource('ops:sync-conflict')
  @Action('read')
  listConflicts(@Query() filters: SyncListFilters) {
    return this.commands.conflicts.list(filters);
  }

  @Post('sync-conflicts/:id/resolve')
  @HttpCode(200)
  @Resource('ops:sync-conflict')
  @Action('resolve')
  @Audit({ action: 'OPS_SYNC_CONFLICT_RESOLVE', entity: 'ops.sync_conflict' })
  resolve(@Param('id') id: string, @Body() body: ResolveSyncConflictInput) {
    return this.commands.resolveConflict.execute(id, body);
  }
}
