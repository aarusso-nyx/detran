// Generated from BP-INF-NOTIFICATION-001 v1.1.1 sha256:4c103efb85b586bbe1d79e0fc7367ae2e566e53d551fa0e41fd4635207283be6
import { Module } from '@nestjs/common';
import { NoticeController } from './controllers/notice.controller.js';
import { NoticeService } from './services/notice.service.js';
import { NoticeRepository } from './repositories/notice.repository.js';
import { NoticeAcknowledgementController } from './controllers/notice-acknowledgement.controller.js';
import { NoticeAcknowledgementService } from './services/notice-acknowledgement.service.js';
import { NoticeAcknowledgementRepository } from './repositories/notice-acknowledgement.repository.js';
import { NoticeDeliveryAttemptController } from './controllers/notice-delivery-attempt.controller.js';
import { NoticeDeliveryAttemptService } from './services/notice-delivery-attempt.service.js';
import { NoticeDeliveryAttemptRepository } from './repositories/notice-delivery-attempt.repository.js';

@Module({
  controllers: [
    NoticeController,
    NoticeAcknowledgementController,
    NoticeDeliveryAttemptController,
  ],
  providers: [
    NoticeService,
    NoticeRepository,
    NoticeAcknowledgementService,
    NoticeAcknowledgementRepository,
    NoticeDeliveryAttemptService,
    NoticeDeliveryAttemptRepository,
  ],
})
export class NotificationModule {}
