// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:aa7b398ec04e8ec20dddff316e606e4dc5b3dcad6348495f967681cbaf63f107
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
import { RaitAdmissibilityController } from './controllers/rait-admissibility.controller.js';
import { RaitAdmissibilityService } from './services/rait-admissibility.service.js';
import { RaitAdmissibilityRepository } from './repositories/rait-admissibility.repository.js';
import { RaitDeadlineController } from './controllers/rait-deadline.controller.js';
import { RaitDeadlineService } from './services/rait-deadline.service.js';
import { RaitDeadlineRepository } from './repositories/rait-deadline.repository.js';
import { RaitInquiryController } from './controllers/rait-inquiry.controller.js';
import { RaitInquiryService } from './services/rait-inquiry.service.js';
import { RaitInquiryRepository } from './repositories/rait-inquiry.repository.js';
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
    RaitAdmissibilityController,
    RaitDeadlineController,
    RaitInquiryController,
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
    RaitAdmissibilityService,
    RaitAdmissibilityRepository,
    RaitDeadlineService,
    RaitDeadlineRepository,
    RaitInquiryService,
    RaitInquiryRepository,
    RaitDecisionService,
    RaitDecisionRepository,
    RaitCommunicationService,
    RaitCommunicationRepository,
    RaitCaseEventService,
    RaitCaseEventRepository,
  ],
})
export class RaitCaseModule {}
