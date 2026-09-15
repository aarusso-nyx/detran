// Generated from BP-OPS-OFFLINE-SYNC-001 v1.0.0 sha256:21bcd6e203b7ff643de48a32fe2947a4e7ad1f7b62b66209c60e24c97da59ce9
import { Module } from '@nestjs/common';
import { AitNumberingRangeController } from './controllers/ait-numbering-range.controller.js';
import { AitNumberingRangeService } from './services/ait-numbering-range.service.js';
import { AitNumberingRangeRepository } from './repositories/ait-numbering-range.repository.js';
import { NumberingReservationController } from './controllers/numbering-reservation.controller.js';
import { NumberingReservationService } from './services/numbering-reservation.service.js';
import { NumberingReservationRepository } from './repositories/numbering-reservation.repository.js';
import { NumberingConsumptionController } from './controllers/numbering-consumption.controller.js';
import { NumberingConsumptionService } from './services/numbering-consumption.service.js';
import { NumberingConsumptionRepository } from './repositories/numbering-consumption.repository.js';
import { SyncBatchController } from './controllers/sync-batch.controller.js';
import { SyncBatchService } from './services/sync-batch.service.js';
import { SyncBatchRepository } from './repositories/sync-batch.repository.js';
import { SyncQueueItemController } from './controllers/sync-queue-item.controller.js';
import { SyncQueueItemService } from './services/sync-queue-item.service.js';
import { SyncQueueItemRepository } from './repositories/sync-queue-item.repository.js';
import { SyncReceiptController } from './controllers/sync-receipt.controller.js';
import { SyncReceiptService } from './services/sync-receipt.service.js';
import { SyncReceiptRepository } from './repositories/sync-receipt.repository.js';
import { SyncConflictController } from './controllers/sync-conflict.controller.js';
import { SyncConflictService } from './services/sync-conflict.service.js';
import { SyncConflictRepository } from './repositories/sync-conflict.repository.js';

@Module({
  controllers: [
    AitNumberingRangeController,
    NumberingReservationController,
    NumberingConsumptionController,
    SyncBatchController,
    SyncQueueItemController,
    SyncReceiptController,
    SyncConflictController,
  ],
  providers: [
    AitNumberingRangeService,
    AitNumberingRangeRepository,
    NumberingReservationService,
    NumberingReservationRepository,
    NumberingConsumptionService,
    NumberingConsumptionRepository,
    SyncBatchService,
    SyncBatchRepository,
    SyncQueueItemService,
    SyncQueueItemRepository,
    SyncReceiptService,
    SyncReceiptRepository,
    SyncConflictService,
    SyncConflictRepository,
  ],
})
export class OfflineSyncModule {}
