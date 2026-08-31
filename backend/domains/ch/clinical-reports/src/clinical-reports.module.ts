// Generated from BP-CH-REPORTS-001 v1.2.0 sha256:5045696b00b62bf7bd1c4ae7976e61f61de9954c392aed7987edaa45ba169501
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
import { EpisodeExportController } from './controllers/episode-export.controller.js';
import { EpisodeExportService } from './services/episode-export.service.js';
import { EpisodeExportRepository } from './repositories/episode-export.repository.js';
import { ClinicalDocumentController } from './controllers/clinical-document.controller.js';
import { ClinicalDocumentService } from './services/clinical-document.service.js';
import { ClinicalDocumentRepository } from './repositories/clinical-document.repository.js';
import { ReportCommandsController } from './report-commands.controller.js';
import { EncounterClosureController } from './encounter-closure.controller.js';
import { PadesSigningHttpAdapter } from './pades-signing.http-adapter.js';
import { ReportLifecycleService } from './report-lifecycle.service.js';
import { EncounterClosureService } from './encounter-closure.service.js';

@Module({
  controllers: [
    ReportController,
    ReportAddendumController,
    ReportAddendumApprovalController,
    EpisodeExportController,
    ClinicalDocumentController,
    ReportCommandsController,
    EncounterClosureController,
  ],
  providers: [
    ReportService,
    ReportRepository,
    ReportAddendumService,
    ReportAddendumRepository,
    ReportAddendumApprovalService,
    ReportAddendumApprovalRepository,
    EpisodeExportService,
    EpisodeExportRepository,
    ClinicalDocumentService,
    ClinicalDocumentRepository,
    PadesSigningHttpAdapter,
    ReportLifecycleService,
    EncounterClosureService,
  ],
})
export class ClinicalReportsModule {}
