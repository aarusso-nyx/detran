// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:5473ac653449e703579b07347c595f918249dd6308961a12198eab656de781ae
import { Module } from '@nestjs/common';
import { RequestController } from './controllers/request.controller.js';
import { RequestService } from './services/request.service.js';
import { RequestRepository } from './repositories/request.repository.js';
import { RequestDraftController } from './controllers/request-draft.controller.js';
import { RequestDraftService } from './services/request-draft.service.js';
import { RequestDraftRepository } from './repositories/request-draft.repository.js';
import { RequestAttachmentController } from './controllers/request-attachment.controller.js';
import { RequestAttachmentService } from './services/request-attachment.service.js';
import { RequestAttachmentRepository } from './repositories/request-attachment.repository.js';
import { ProtocolController } from './controllers/protocol.controller.js';
import { ProtocolService } from './services/protocol.service.js';
import { ProtocolRepository } from './repositories/protocol.repository.js';
import { ConsequenceAckController } from './controllers/consequence-ack.controller.js';
import { ConsequenceAckService } from './services/consequence-ack.service.js';
import { ConsequenceAckRepository } from './repositories/consequence-ack.repository.js';
import { EvaluationController } from './controllers/evaluation.controller.js';
import { EvaluationService } from './services/evaluation.service.js';
import { EvaluationRepository } from './repositories/evaluation.repository.js';
import { IdempotencyRecordController } from './controllers/idempotency-record.controller.js';
import { IdempotencyRecordService } from './services/idempotency-record.service.js';
import { IdempotencyRecordRepository } from './repositories/idempotency-record.repository.js';
import { PortalRequestsController } from './handwritten/requests.controller.js';
import { PortalRequestsService } from './handwritten/requests.service.js';
import { RequestDelegationService } from './handwritten/delegation/delegation.service.js';
import { PortalIdempotencyService } from './handwritten/idempotency.service.js';
import { IdentityModule } from '@detran/portal-identity';

@Module({
  imports: [IdentityModule],
  controllers: [
    PortalRequestsController,
    RequestController,
    RequestDraftController,
    RequestAttachmentController,
    ProtocolController,
    ConsequenceAckController,
    EvaluationController,
    IdempotencyRecordController,
  ],
  providers: [
    RequestService,
    RequestRepository,
    RequestDraftService,
    RequestDraftRepository,
    RequestAttachmentService,
    RequestAttachmentRepository,
    ProtocolService,
    ProtocolRepository,
    ConsequenceAckService,
    ConsequenceAckRepository,
    EvaluationService,
    EvaluationRepository,
    IdempotencyRecordService,
    IdempotencyRecordRepository,
    PortalRequestsService,
    RequestDelegationService,
    PortalIdempotencyService,
  ],
  exports: [PortalIdempotencyService, PortalRequestsService],
})
export class RequestsModule {}
