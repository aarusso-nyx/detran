// Generated from BP-PORTAL-INBOX-001 v1.0.1 sha256:1ddffdafcda20768cbaa66e39e4ee4f5346513517e6bb95c6216878d42314ccd
import { Module } from '@nestjs/common';
import { InboxItemController } from './controllers/inbox-item.controller.js';
import { InboxItemService } from './services/inbox-item.service.js';
import { InboxItemRepository } from './repositories/inbox-item.repository.js';
import { AcknowledgementEvidenceController } from './controllers/acknowledgement-evidence.controller.js';
import { AcknowledgementEvidenceService } from './services/acknowledgement-evidence.service.js';
import { AcknowledgementEvidenceRepository } from './repositories/acknowledgement-evidence.repository.js';
import { SneEnrollmentController } from './controllers/sne-enrollment.controller.js';
import { SneEnrollmentService } from './services/sne-enrollment.service.js';
import { SneEnrollmentRepository } from './repositories/sne-enrollment.repository.js';
import { PushSubscriptionController } from './controllers/push-subscription.controller.js';
import { PushSubscriptionService } from './services/push-subscription.service.js';
import { PushSubscriptionRepository } from './repositories/push-subscription.repository.js';

@Module({
  controllers: [
    InboxItemController,
    AcknowledgementEvidenceController,
    SneEnrollmentController,
    PushSubscriptionController,
  ],
  providers: [
    InboxItemService,
    InboxItemRepository,
    AcknowledgementEvidenceService,
    AcknowledgementEvidenceRepository,
    SneEnrollmentService,
    SneEnrollmentRepository,
    PushSubscriptionService,
    PushSubscriptionRepository,
  ],
})
export class InboxModule {}
