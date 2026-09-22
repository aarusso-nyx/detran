// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
import { Module } from '@nestjs/common';
import { AlertController } from './controllers/alert.controller.js';
import { AlertService } from './services/alert.service.js';
import { AlertRepository } from './repositories/alert.repository.js';
import { AlertTrailController } from './controllers/alert-trail.controller.js';
import { AlertTrailService } from './services/alert-trail.service.js';
import { AlertTrailRepository } from './repositories/alert-trail.repository.js';
import { DutyController } from './controllers/duty.controller.js';
import { DutyService } from './services/duty.service.js';
import { DutyRepository } from './repositories/duty.repository.js';
import { DutyCycleController } from './controllers/duty-cycle.controller.js';
import { DutyCycleService } from './services/duty-cycle.service.js';
import { DutyCycleRepository } from './repositories/duty-cycle.repository.js';
import { IndicatorController } from './controllers/indicator.controller.js';
import { IndicatorService } from './services/indicator.service.js';
import { IndicatorRepository } from './repositories/indicator.repository.js';
import { IndicatorConfigController } from './controllers/indicator-config.controller.js';
import { IndicatorConfigService } from './services/indicator-config.service.js';
import { IndicatorConfigRepository } from './repositories/indicator-config.repository.js';
import { BiPanelController } from './controllers/bi-panel.controller.js';
import { BiPanelService } from './services/bi-panel.service.js';
import { BiPanelRepository } from './repositories/bi-panel.repository.js';
import { GeneratedReportController } from './controllers/generated-report.controller.js';
import { GeneratedReportService } from './services/generated-report.service.js';
import { GeneratedReportRepository } from './repositories/generated-report.repository.js';
import { ExportLogController } from './controllers/export-log.controller.js';
import { ExportLogService } from './services/export-log.service.js';
import { ExportLogRepository } from './repositories/export-log.repository.js';
import { SourceController } from './controllers/source.controller.js';
import { SourceService } from './services/source.service.js';
import { SourceRepository } from './repositories/source.repository.js';
import { TransparencyAuditController } from './controllers/transparency-audit.controller.js';
import { TransparencyAuditService } from './services/transparency-audit.service.js';
import { TransparencyAuditRepository } from './repositories/transparency-audit.repository.js';
import { DatasetController } from './controllers/dataset.controller.js';
import { DatasetService } from './services/dataset.service.js';
import { DatasetRepository } from './repositories/dataset.repository.js';
import { MonitorProjectionAppliedEventController } from './controllers/monitor-projection-applied-event.controller.js';
import { MonitorProjectionAppliedEventService } from './services/monitor-projection-applied-event.service.js';
import { MonitorProjectionAppliedEventRepository } from './repositories/monitor-projection-applied-event.repository.js';
import { PrescriptionRiskController } from './controllers/prescription-risk.controller.js';
import { PrescriptionRiskService } from './services/prescription-risk.service.js';
import { PrescriptionRiskRepository } from './repositories/prescription-risk.repository.js';
import { ProductionController } from './controllers/production.controller.js';
import { ProductionService } from './services/production.service.js';
import { ProductionRepository } from './repositories/production.repository.js';
import { IntegrationHealthController } from './controllers/integration-health.controller.js';
import { IntegrationHealthService } from './services/integration-health.service.js';
import { IntegrationHealthRepository } from './repositories/integration-health.repository.js';
import { PecDeadlinesController } from './controllers/pec-deadlines.controller.js';
import { PecDeadlinesService } from './services/pec-deadlines.service.js';
import { PecDeadlinesRepository } from './repositories/pec-deadlines.repository.js';
import { TeatMeasuresController } from './controllers/teat-measures.controller.js';
import { TeatMeasuresService } from './services/teat-measures.service.js';
import { TeatMeasuresRepository } from './repositories/teat-measures.repository.js';
import { PortalServiceMetricsController } from './controllers/portal-service-metrics.controller.js';
import { PortalServiceMetricsService } from './services/portal-service-metrics.service.js';
import { PortalServiceMetricsRepository } from './repositories/portal-service-metrics.repository.js';
import { DutyEvidenceController } from './controllers/duty-evidence.controller.js';
import { DutyEvidenceService } from './services/duty-evidence.service.js';
import { DutyEvidenceRepository } from './repositories/duty-evidence.repository.js';
import { DASHBOARD_MONITOR_PROJECTORS } from './handwritten/projectors.js';

@Module({
  controllers: [
    AlertController,
    AlertTrailController,
    DutyController,
    DutyCycleController,
    IndicatorController,
    IndicatorConfigController,
    BiPanelController,
    GeneratedReportController,
    ExportLogController,
    SourceController,
    TransparencyAuditController,
    DatasetController,
    MonitorProjectionAppliedEventController,
    PrescriptionRiskController,
    ProductionController,
    IntegrationHealthController,
    PecDeadlinesController,
    TeatMeasuresController,
    PortalServiceMetricsController,
    DutyEvidenceController,
  ],
  providers: [
    AlertService,
    AlertRepository,
    AlertTrailService,
    AlertTrailRepository,
    DutyService,
    DutyRepository,
    DutyCycleService,
    DutyCycleRepository,
    IndicatorService,
    IndicatorRepository,
    IndicatorConfigService,
    IndicatorConfigRepository,
    BiPanelService,
    BiPanelRepository,
    GeneratedReportService,
    GeneratedReportRepository,
    ExportLogService,
    ExportLogRepository,
    SourceService,
    SourceRepository,
    TransparencyAuditService,
    TransparencyAuditRepository,
    DatasetService,
    DatasetRepository,
    MonitorProjectionAppliedEventService,
    MonitorProjectionAppliedEventRepository,
    PrescriptionRiskService,
    PrescriptionRiskRepository,
    ProductionService,
    ProductionRepository,
    IntegrationHealthService,
    IntegrationHealthRepository,
    PecDeadlinesService,
    PecDeadlinesRepository,
    TeatMeasuresService,
    TeatMeasuresRepository,
    PortalServiceMetricsService,
    PortalServiceMetricsRepository,
    DutyEvidenceService,
    DutyEvidenceRepository,
    DASHBOARD_MONITOR_PROJECTORS,
  ],
})
export class MonitorModule {}
