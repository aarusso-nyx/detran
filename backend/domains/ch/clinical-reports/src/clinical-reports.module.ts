// Generated from BP-CH-REPORTS-001 v1.0.0 sha256:959226a383e0fb64d104a887fe34cb5dba462d875869163a39abc94227f6f966
import { Module } from '@nestjs/common';
import { ReportController } from './controllers/report.controller.js';
import { ReportService } from './services/report.service.js';
import { ReportRepository } from './repositories/report.repository.js';
import { ReportAddendumController } from './controllers/report-addendum.controller.js';
import { ReportAddendumService } from './services/report-addendum.service.js';
import { ReportAddendumRepository } from './repositories/report-addendum.repository.js';
import { ClinicalDocumentController } from './controllers/clinical-document.controller.js';
import { ClinicalDocumentService } from './services/clinical-document.service.js';
import { ClinicalDocumentRepository } from './repositories/clinical-document.repository.js';
import { ReportCommandsController } from './report-commands.controller.js';
import { PadesSigningHttpAdapter } from './pades-signing.http-adapter.js';
import { ReportLifecycleService } from './report-lifecycle.service.js';

@Module({
  controllers: [
    ReportController,
    ReportAddendumController,
    ClinicalDocumentController,
    ReportCommandsController,
  ],
  providers: [
    ReportService,
    ReportRepository,
    ReportAddendumService,
    ReportAddendumRepository,
    ClinicalDocumentService,
    ClinicalDocumentRepository,
    PadesSigningHttpAdapter,
    ReportLifecycleService,
  ],
})
export class ClinicalReportsModule {}
