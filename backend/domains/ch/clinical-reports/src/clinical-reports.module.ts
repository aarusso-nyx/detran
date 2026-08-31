// Generated from BP-CH-REPORTS-001 v1.1.0 sha256:beee4caafe2a85a62db62a7c64f47b7e234388f5606028dbc331786eb1e2f350
import { Module } from '@nestjs/common';
import { ReportController } from './controllers/report.controller.js';
import { ReportService } from './services/report.service.js';
import { ReportRepository } from './repositories/report.repository.js';
import { ReportAddendumController } from './controllers/report-addendum.controller.js';
import { ReportAddendumService } from './services/report-addendum.service.js';
import { ReportAddendumRepository } from './repositories/report-addendum.repository.js';
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
