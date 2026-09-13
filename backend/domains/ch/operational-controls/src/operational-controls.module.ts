// Generated from BP-CH-OPERATIONAL-CONTROLS-001 v1.0.0 sha256:41855aeaa3c52f966b5c30807e1fe3d821258e6c626a32b72238986d291880da
import { Module } from '@nestjs/common';
import { OperationalRecordController } from './controllers/operational-record.controller.js';
import { OperationalRecordService } from './services/operational-record.service.js';
import { OperationalRecordRepository } from './repositories/operational-record.repository.js';
import { OperationalControlCommandsController } from './operational-control-commands.controller.js';
import { OperationalControlService } from './operational-control.service.js';

@Module({
  controllers: [
    OperationalRecordController,
    OperationalControlCommandsController,
  ],
  providers: [
    OperationalRecordService,
    OperationalRecordRepository,
    OperationalControlService,
  ],
})
export class OperationalControlsModule {}
