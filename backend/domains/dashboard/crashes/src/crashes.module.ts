// Generated from BP-DASHBOARD-CRASHES-001 v1.0.0 sha256:45f272c2e89a665bb7a2cfecc671d0b26d136439df8f239f51adf116bd65b241
import { Module } from '@nestjs/common';
import { CrashAggregateController } from './controllers/crash-aggregate.controller.js';
import { CrashAggregateService } from './services/crash-aggregate.service.js';
import { CrashAggregateRepository } from './repositories/crash-aggregate.repository.js';
import { CrashProjectionAppliedEventController } from './controllers/crash-projection-applied-event.controller.js';
import { CrashProjectionAppliedEventService } from './services/crash-projection-applied-event.service.js';
import { CrashProjectionAppliedEventRepository } from './repositories/crash-projection-applied-event.repository.js';
import { DashboardCrashesProjection } from './handwritten/dashboard-crashes.projection.js';

@Module({
  controllers: [
    CrashAggregateController,
    CrashProjectionAppliedEventController,
  ],
  providers: [
    CrashAggregateService,
    CrashAggregateRepository,
    CrashProjectionAppliedEventService,
    CrashProjectionAppliedEventRepository,
    DashboardCrashesProjection,
  ],
})
export class CrashesModule {}
