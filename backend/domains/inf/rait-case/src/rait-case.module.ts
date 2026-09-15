// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
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

@Module({
  controllers: [
    RaitCaseController,
    RaitPartyController,
    RaitDocumentController,
    RaitPendingContentController,
    RaitRedirectController,
    RaitAdmissibilityController,
    RaitDeadlineController,
    RaitInquiryController,
    RaitDraftController,
    RaitDecisionController,
    RaitCommunicationController,
    RaitCaseEventController,
  ],
  providers: [
    RaitCaseService,
    RaitCaseRepository,
    RaitPartyService,
    RaitPartyRepository,
    RaitDocumentService,
    RaitDocumentRepository,
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
    RaitDraftService,
    RaitDraftRepository,
    RaitDecisionService,
    RaitDecisionRepository,
    RaitCommunicationService,
    RaitCommunicationRepository,
    RaitCaseEventService,
    RaitCaseEventRepository,
  ],
})
export class RaitCaseModule {}
