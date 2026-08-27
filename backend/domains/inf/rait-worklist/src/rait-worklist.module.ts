// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:2297f42351909b6ac68f4a18e7c8b535508fa219dfdaa0f9b087f1ca3b745234
import { Module } from '@nestjs/common';
import { RaitPoolController } from './controllers/rait-pool.controller.js';
import { RaitPoolService } from './services/rait-pool.service.js';
import { RaitPoolRepository } from './repositories/rait-pool.repository.js';
import { RaitPoolMemberController } from './controllers/rait-pool-member.controller.js';
import { RaitPoolMemberService } from './services/rait-pool-member.service.js';
import { RaitPoolMemberRepository } from './repositories/rait-pool-member.repository.js';
import { RaitAssignmentController } from './controllers/rait-assignment.controller.js';
import { RaitAssignmentService } from './services/rait-assignment.service.js';
import { RaitAssignmentRepository } from './repositories/rait-assignment.repository.js';
import { RaitImpedimentController } from './controllers/rait-impediment.controller.js';
import { RaitImpedimentService } from './services/rait-impediment.service.js';
import { RaitImpedimentRepository } from './repositories/rait-impediment.repository.js';
import { RaitClockController } from './controllers/rait-clock.controller.js';
import { RaitClockService } from './services/rait-clock.service.js';
import { RaitClockRepository } from './repositories/rait-clock.repository.js';
import { RaitClockAlertController } from './controllers/rait-clock-alert.controller.js';
import { RaitClockAlertService } from './services/rait-clock-alert.service.js';
import { RaitClockAlertRepository } from './repositories/rait-clock-alert.repository.js';

@Module({
  controllers: [
    RaitPoolController,
    RaitPoolMemberController,
    RaitAssignmentController,
    RaitImpedimentController,
    RaitClockController,
    RaitClockAlertController,
  ],
  providers: [
    RaitPoolService,
    RaitPoolRepository,
    RaitPoolMemberService,
    RaitPoolMemberRepository,
    RaitAssignmentService,
    RaitAssignmentRepository,
    RaitImpedimentService,
    RaitImpedimentRepository,
    RaitClockService,
    RaitClockRepository,
    RaitClockAlertService,
    RaitClockAlertRepository,
  ],
})
export class RaitWorklistModule {}
