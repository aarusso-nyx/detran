// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
import { Module } from '@nestjs/common';
import { RaitCaseController } from './controllers/rait-case.controller.js';
import { RaitCaseService } from './services/rait-case.service.js';
import { RaitCaseRepository } from './repositories/rait-case.repository.js';
import { RaitPartyController } from './controllers/rait-party.controller.js';
import { RaitPartyService } from './services/rait-party.service.js';
import { RaitPartyRepository } from './repositories/rait-party.repository.js';
import { RaitDocumentController } from './controllers/rait-document.controller.js';
import { RaitDocumentService } from './services/rait-document.service.js';
import { RaitDocumentRepository } from './repositories/rait-document.repository.js';
import { RaitPriorityAssessmentController } from './controllers/rait-priority-assessment.controller.js';
import { RaitPriorityAssessmentService } from './services/rait-priority-assessment.service.js';
import { RaitPriorityAssessmentRepository } from './repositories/rait-priority-assessment.repository.js';
import { RaitPriorityBasisController } from './controllers/rait-priority-basis.controller.js';
import { RaitPriorityBasisService } from './services/rait-priority-basis.service.js';
import { RaitPriorityBasisRepository } from './repositories/rait-priority-basis.repository.js';
import { RaitPendingContentController } from './controllers/rait-pending-content.controller.js';
import { RaitPendingContentService } from './services/rait-pending-content.service.js';
import { RaitPendingContentRepository } from './repositories/rait-pending-content.repository.js';
import { RaitRedirectController } from './controllers/rait-redirect.controller.js';
import { RaitRedirectService } from './services/rait-redirect.service.js';
import { RaitRedirectRepository } from './repositories/rait-redirect.repository.js';
import { RaitAdmissibilityController } from './controllers/rait-admissibility.controller.js';
import { RaitAdmissibilityService } from './services/rait-admissibility.service.js';
import { RaitAdmissibilityRepository } from './repositories/rait-admissibility.repository.js';
import { RaitDeadlineController } from './controllers/rait-deadline.controller.js';
import { RaitDeadlineService } from './services/rait-deadline.service.js';
import { RaitDeadlineRepository } from './repositories/rait-deadline.repository.js';
import { RaitInquiryController } from './controllers/rait-inquiry.controller.js';
import { RaitInquiryService } from './services/rait-inquiry.service.js';
import { RaitInquiryRepository } from './repositories/rait-inquiry.repository.js';
import { RaitInquiryDocumentController } from './controllers/rait-inquiry-document.controller.js';
import { RaitInquiryDocumentService } from './services/rait-inquiry-document.service.js';
import { RaitInquiryDocumentRepository } from './repositories/rait-inquiry-document.repository.js';
import { RaitPendingDocumentController } from './controllers/rait-pending-document.controller.js';
import { RaitPendingDocumentService } from './services/rait-pending-document.service.js';
import { RaitPendingDocumentRepository } from './repositories/rait-pending-document.repository.js';
import { RaitWithdrawalAttestationController } from './controllers/rait-withdrawal-attestation.controller.js';
import { RaitWithdrawalAttestationService } from './services/rait-withdrawal-attestation.service.js';
import { RaitWithdrawalAttestationRepository } from './repositories/rait-withdrawal-attestation.repository.js';
import { RaitDraftController } from './controllers/rait-draft.controller.js';
import { RaitDraftService } from './services/rait-draft.service.js';
import { RaitDraftRepository } from './repositories/rait-draft.repository.js';
import { RaitDecisionController } from './controllers/rait-decision.controller.js';
import { RaitDecisionService } from './services/rait-decision.service.js';
import { RaitDecisionRepository } from './repositories/rait-decision.repository.js';
import { RaitCommunicationController } from './controllers/rait-communication.controller.js';
import { RaitCommunicationService } from './services/rait-communication.service.js';
import { RaitCommunicationRepository } from './repositories/rait-communication.repository.js';
import { RaitCaseEventController } from './controllers/rait-case-event.controller.js';
import { RaitCaseEventService } from './services/rait-case-event.service.js';
import { RaitCaseEventRepository } from './repositories/rait-case-event.repository.js';
import { RaitCaseCommandsController } from './handwritten/rait-case-commands.controller.js';
import { RaitInquiryCommandsController } from './handwritten/rait-inquiry-commands.controller.js';
import { RaitCaseCommandService } from './handwritten/rait-case-command.service.js';
import { RaitInquiryCommandService } from './handwritten/rait-inquiry-command.service.js';
import { RaitDeadlineEngineFactory } from './handwritten/rait-case-command.service.js';
import { RaitDocumentTrustVerifier } from './handwritten/rait-document-trust.verifier.js';
import { DocumentTrustHttpAdapter } from './handwritten/rait-document-trust.verifier.js';
import { RaitOperationClock } from './handwritten/rait-operation-clock.js';

@Module({
  controllers: [
    RaitCaseController,
    RaitPartyController,
    RaitDocumentController,
    RaitPriorityAssessmentController,
    RaitPriorityBasisController,
    RaitPendingContentController,
    RaitRedirectController,
    RaitAdmissibilityController,
    RaitDeadlineController,
    RaitInquiryController,
    RaitInquiryDocumentController,
    RaitPendingDocumentController,
    RaitWithdrawalAttestationController,
    RaitDraftController,
    RaitDecisionController,
    RaitCommunicationController,
    RaitCaseEventController,
    RaitCaseCommandsController,
    RaitInquiryCommandsController,
  ],
  providers: [
    RaitCaseService,
    RaitCaseRepository,
    RaitPartyService,
    RaitPartyRepository,
    RaitDocumentService,
    RaitDocumentRepository,
    RaitPriorityAssessmentService,
    RaitPriorityAssessmentRepository,
    RaitPriorityBasisService,
    RaitPriorityBasisRepository,
    RaitPendingContentService,
    RaitPendingContentRepository,
    RaitRedirectService,
    RaitRedirectRepository,
    RaitAdmissibilityService,
    RaitAdmissibilityRepository,
    RaitDeadlineService,
    RaitDeadlineRepository,
    RaitInquiryService,
    RaitInquiryRepository,
    RaitInquiryDocumentService,
    RaitInquiryDocumentRepository,
    RaitPendingDocumentService,
    RaitPendingDocumentRepository,
    RaitWithdrawalAttestationService,
    RaitWithdrawalAttestationRepository,
    RaitDraftService,
    RaitDraftRepository,
    RaitDecisionService,
    RaitDecisionRepository,
    RaitCommunicationService,
    RaitCommunicationRepository,
    RaitCaseEventService,
    RaitCaseEventRepository,
    RaitCaseCommandService,
    RaitInquiryCommandService,
    RaitDeadlineEngineFactory,
    RaitDocumentTrustVerifier,
    DocumentTrustHttpAdapter,
    RaitOperationClock,
  ],
})
export class RaitCaseModule {}
