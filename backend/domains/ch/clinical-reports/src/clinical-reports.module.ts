// Generated from BP-CH-REPORTS-001 v1.3.0 sha256:223e3b4e60807d8ac51bcd6d9e1294a65ca305509b8ff1dc2f93649c7f3aa1a5
import { Module } from '@nestjs/common';
import { ReportController } from './controllers/report.controller.js';
import { ReportService } from './services/report.service.js';
import { ReportRepository } from './repositories/report.repository.js';
import { ReportAddendumController } from './controllers/report-addendum.controller.js';
import { ReportAddendumService } from './services/report-addendum.service.js';
import { ReportAddendumRepository } from './repositories/report-addendum.repository.js';
import { ReportAddendumApprovalController } from './controllers/report-addendum-approval.controller.js';
import { ReportAddendumApprovalService } from './services/report-addendum-approval.service.js';
import { ReportAddendumApprovalRepository } from './repositories/report-addendum-approval.repository.js';
import { RegistrationBlockNoticeController } from './controllers/registration-block-notice.controller.js';
import { RegistrationBlockNoticeService } from './services/registration-block-notice.service.js';
import { RegistrationBlockNoticeRepository } from './repositories/registration-block-notice.repository.js';
import { FeedbackRequestController } from './controllers/feedback-request.controller.js';
import { FeedbackRequestService } from './services/feedback-request.service.js';
import { FeedbackRequestRepository } from './repositories/feedback-request.repository.js';
import { EpisodeExportController } from './controllers/episode-export.controller.js';
import { EpisodeExportService } from './services/episode-export.service.js';
import { EpisodeExportRepository } from './repositories/episode-export.repository.js';
import { ClinicalDocumentController } from './controllers/clinical-document.controller.js';
import { ClinicalDocumentService } from './services/clinical-document.service.js';
import { ClinicalDocumentRepository } from './repositories/clinical-document.repository.js';
import { ReportCommandsController } from './report-commands.controller.js';
import { CandidateDossierController } from './candidate-dossier.controller.js';
import { EncounterClosureController } from './encounter-closure.controller.js';
import { PadesSigningHttpAdapter } from './pades-signing.http-adapter.js';
import { ReportLifecycleService } from './report-lifecycle.service.js';
import { CandidateDossierService } from './candidate-dossier.service.js';
import { EncounterClosureService } from './encounter-closure.service.js';

@Module({
  controllers: [
    ReportController,
    ReportAddendumController,
    ReportAddendumApprovalController,
    RegistrationBlockNoticeController,
    FeedbackRequestController,
    EpisodeExportController,
    ClinicalDocumentController,
    ReportCommandsController,
    CandidateDossierController,
    EncounterClosureController,
  ],
  providers: [
    ReportService,
    ReportRepository,
    ReportAddendumService,
    ReportAddendumRepository,
    ReportAddendumApprovalService,
    ReportAddendumApprovalRepository,
    RegistrationBlockNoticeService,
    RegistrationBlockNoticeRepository,
    FeedbackRequestService,
    FeedbackRequestRepository,
    EpisodeExportService,
    EpisodeExportRepository,
    ClinicalDocumentService,
    ClinicalDocumentRepository,
    PadesSigningHttpAdapter,
    ReportLifecycleService,
    CandidateDossierService,
    EncounterClosureService,
  ],
})
export class ClinicalReportsModule {}
