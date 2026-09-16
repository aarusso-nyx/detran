// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380
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

@Module({
  controllers: [
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
  ],
})
export class ProjectionsModule {}
