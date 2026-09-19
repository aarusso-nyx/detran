// Generated from BP-PORTAL-INBOX-001 v1.0.2 sha256:c04ef2d9c11828696abb081206e353636a01f9f86c39e28acfc0ada5addf53da
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
import { PortalInboxController } from './handwritten/inbox.controller.js';
import { PortalSneEnrollmentController } from './handwritten/sne-enrollment.controller.js';
import { PortalInboxService } from './handwritten/inbox.service.js';
import { PortalSneEnrollmentService } from './handwritten/sne-enrollment.service.js';
import { IdentityModule } from '@detran/portal-identity';
import { RequestsModule } from '@detran/portal-requests';

@Module({
  imports: [IdentityModule, RequestsModule],
  controllers: [
    PortalInboxController,
    PortalSneEnrollmentController,
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
    PortalInboxService,
    PortalSneEnrollmentService,
  ],
  exports: [PortalSneEnrollmentService],
})
export class InboxModule {}
