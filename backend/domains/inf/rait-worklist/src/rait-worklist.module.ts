// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
import { Module } from '@nestjs/common';
import { RaitUnitController } from './controllers/rait-unit.controller.js';
import { RaitUnitService } from './services/rait-unit.service.js';
import { RaitUnitRepository } from './repositories/rait-unit.repository.js';
import { RaitPoolController } from './controllers/rait-pool.controller.js';
import { RaitPoolService } from './services/rait-pool.service.js';
import { RaitPoolRepository } from './repositories/rait-pool.repository.js';
import { RaitPoolMemberController } from './controllers/rait-pool-member.controller.js';
import { RaitPoolMemberService } from './services/rait-pool-member.service.js';
import { RaitPoolMemberRepository } from './repositories/rait-pool-member.repository.js';
import { RaitScheduleController } from './controllers/rait-schedule.controller.js';
import { RaitScheduleService } from './services/rait-schedule.service.js';
import { RaitScheduleRepository } from './repositories/rait-schedule.repository.js';
import { RaitScheduleSlotController } from './controllers/rait-schedule-slot.controller.js';
import { RaitScheduleSlotService } from './services/rait-schedule-slot.service.js';
import { RaitScheduleSlotRepository } from './repositories/rait-schedule-slot.repository.js';
import { RaitBatchController } from './controllers/rait-batch.controller.js';
import { RaitBatchService } from './services/rait-batch.service.js';
import { RaitBatchRepository } from './repositories/rait-batch.repository.js';
import { RaitBatchItemController } from './controllers/rait-batch-item.controller.js';
import { RaitBatchItemService } from './services/rait-batch-item.service.js';
import { RaitBatchItemRepository } from './repositories/rait-batch-item.repository.js';
import { RaitAssignmentController } from './controllers/rait-assignment.controller.js';
import { RaitAssignmentService } from './services/rait-assignment.service.js';
import { RaitAssignmentRepository } from './repositories/rait-assignment.repository.js';
import { RaitImpedimentController } from './controllers/rait-impediment.controller.js';
import { RaitImpedimentService } from './services/rait-impediment.service.js';
import { RaitImpedimentRepository } from './repositories/rait-impediment.repository.js';
import { RaitSubstituteDutyController } from './controllers/rait-substitute-duty.controller.js';
import { RaitSubstituteDutyService } from './services/rait-substitute-duty.service.js';
import { RaitSubstituteDutyRepository } from './repositories/rait-substitute-duty.repository.js';
import { RaitBenchController } from './controllers/rait-bench.controller.js';
import { RaitBenchService } from './services/rait-bench.service.js';
import { RaitBenchRepository } from './repositories/rait-bench.repository.js';
import { RaitClockController } from './controllers/rait-clock.controller.js';
import { RaitClockService } from './services/rait-clock.service.js';
import { RaitClockRepository } from './repositories/rait-clock.repository.js';
import { RaitClockAlertController } from './controllers/rait-clock-alert.controller.js';
import { RaitClockAlertService } from './services/rait-clock-alert.service.js';
import { RaitClockAlertRepository } from './repositories/rait-clock-alert.repository.js';

@Module({
  controllers: [
    RaitUnitController,
    RaitPoolController,
    RaitPoolMemberController,
    RaitScheduleController,
    RaitScheduleSlotController,
    RaitBatchController,
    RaitBatchItemController,
    RaitAssignmentController,
    RaitImpedimentController,
    RaitSubstituteDutyController,
    RaitBenchController,
    RaitClockController,
    RaitClockAlertController,
  ],
  providers: [
    RaitUnitService,
    RaitUnitRepository,
    RaitPoolService,
    RaitPoolRepository,
    RaitPoolMemberService,
    RaitPoolMemberRepository,
    RaitScheduleService,
    RaitScheduleRepository,
    RaitScheduleSlotService,
    RaitScheduleSlotRepository,
    RaitBatchService,
    RaitBatchRepository,
    RaitBatchItemService,
    RaitBatchItemRepository,
    RaitAssignmentService,
    RaitAssignmentRepository,
    RaitImpedimentService,
    RaitImpedimentRepository,
    RaitSubstituteDutyService,
    RaitSubstituteDutyRepository,
    RaitBenchService,
    RaitBenchRepository,
    RaitClockService,
    RaitClockRepository,
    RaitClockAlertService,
    RaitClockAlertRepository,
  ],
})
export class RaitWorklistModule {}
