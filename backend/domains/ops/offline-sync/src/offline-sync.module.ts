// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:ff9d218be3314b511ef2cdab143c94785c99ffe446405136e001f85f8978c1ad
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
import { OfflineSyncController } from './handwritten/offline-sync.controller.js';
import { OFFLINE_SYNC_PROVIDER } from './handwritten/offline-sync.provider.js';
import { ParameterModule } from '@detran/ops-parameter';

@Module({
  imports: [ParameterModule],
  controllers: [
    OfflineSyncController,
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
    OFFLINE_SYNC_PROVIDER,
  ],
})
export class OfflineSyncModule {}
