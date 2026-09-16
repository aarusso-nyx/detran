// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.2 sha256:5deaf3bb32dddcda371d363d5b4d7c5b8f3e0ec17cea92357ccf01a121943012
import { Module } from '@nestjs/common';
import { InfractionViewController } from './controllers/infraction-view.controller.js';
import { InfractionViewService } from './services/infraction-view.service.js';
import { InfractionViewRepository } from './repositories/infraction-view.repository.js';
import { ProcessTimelineController } from './controllers/process-timeline.controller.js';
import { ProcessTimelineService } from './services/process-timeline.service.js';
import { ProcessTimelineRepository } from './repositories/process-timeline.repository.js';
import { PointsViewController } from './controllers/points-view.controller.js';
import { PointsViewService } from './services/points-view.service.js';
import { PointsViewRepository } from './repositories/points-view.repository.js';
import { CrashViewController } from './controllers/crash-view.controller.js';
import { CrashViewService } from './services/crash-view.service.js';
import { CrashViewRepository } from './repositories/crash-view.repository.js';
import { ExamViewController } from './controllers/exam-view.controller.js';
import { ExamViewService } from './services/exam-view.service.js';
import { ExamViewRepository } from './repositories/exam-view.repository.js';
import { ProjectionAppliedEventController } from './controllers/projection-applied-event.controller.js';
import { ProjectionAppliedEventService } from './services/projection-applied-event.service.js';
import { ProjectionAppliedEventRepository } from './repositories/projection-applied-event.repository.js';
import { NationalReadCacheController } from './controllers/national-read-cache.controller.js';
import { NationalReadCacheService } from './services/national-read-cache.service.js';
import { NationalReadCacheRepository } from './repositories/national-read-cache.repository.js';
import { PortalAitsController } from './handwritten/aits.controller.js';
import { PortalDocumentsController } from './handwritten/documents.controller.js';
import { PortalCrashesController } from './handwritten/crashes.controller.js';
import { PortalExamsController } from './handwritten/exams.controller.js';
import { PortalProjectors } from './handwritten/projectors.service.js';
import { PortalNationalReadsService } from './handwritten/national-reads.service.js';
import { IdentityModule } from '@detran/portal-identity';

@Module({
  imports: [IdentityModule],
  controllers: [
    PortalAitsController,
    PortalDocumentsController,
    PortalCrashesController,
    PortalExamsController,
    InfractionViewController,
    ProcessTimelineController,
    PointsViewController,
    CrashViewController,
    ExamViewController,
    ProjectionAppliedEventController,
    NationalReadCacheController,
  ],
  providers: [
    InfractionViewService,
    InfractionViewRepository,
    ProcessTimelineService,
    ProcessTimelineRepository,
    PointsViewService,
    PointsViewRepository,
    CrashViewService,
    CrashViewRepository,
    ExamViewService,
    ExamViewRepository,
    ProjectionAppliedEventService,
    ProjectionAppliedEventRepository,
    NationalReadCacheService,
    NationalReadCacheRepository,
    PortalProjectors,
    PortalNationalReadsService,
  ],
  exports: [PortalProjectors],
})
export class ProjectionsModule {}
