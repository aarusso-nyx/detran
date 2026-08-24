// Generated from BP-INF-AIT-001 v1.0.0 sha256:ef69813e9ad97641c04b7bbbdb8110fe97446523d552fdf17da429d55de0b510
import { Module } from '@nestjs/common';
import { AitController } from './controllers/ait.controller.js';
import { AitService } from './services/ait.service.js';
import { AitRepository } from './repositories/ait.repository.js';
import { AitVehicleController } from './controllers/ait-vehicle.controller.js';
import { AitVehicleService } from './services/ait-vehicle.service.js';
import { AitVehicleRepository } from './repositories/ait-vehicle.repository.js';
import { AitPersonController } from './controllers/ait-person.controller.js';
import { AitPersonService } from './services/ait-person.service.js';
import { AitPersonRepository } from './repositories/ait-person.repository.js';
import { AitStatusHistoryController } from './controllers/ait-status-history.controller.js';
import { AitStatusHistoryService } from './services/ait-status-history.service.js';
import { AitStatusHistoryRepository } from './repositories/ait-status-history.repository.js';
import { AitCorrectionController } from './controllers/ait-correction.controller.js';
import { AitCorrectionService } from './services/ait-correction.service.js';
import { AitCorrectionRepository } from './repositories/ait-correction.repository.js';
import { AitSignatureController } from './controllers/ait-signature.controller.js';
import { AitSignatureService } from './services/ait-signature.service.js';
import { AitSignatureRepository } from './repositories/ait-signature.repository.js';
import { AitPrintEventController } from './controllers/ait-print-event.controller.js';
import { AitPrintEventService } from './services/ait-print-event.service.js';
import { AitPrintEventRepository } from './repositories/ait-print-event.repository.js';

@Module({
  controllers: [
    AitController,
    AitVehicleController,
    AitPersonController,
    AitStatusHistoryController,
    AitCorrectionController,
    AitSignatureController,
    AitPrintEventController,
  ],
  providers: [
    AitService,
    AitRepository,
    AitVehicleService,
    AitVehicleRepository,
    AitPersonService,
    AitPersonRepository,
    AitStatusHistoryService,
    AitStatusHistoryRepository,
    AitCorrectionService,
    AitCorrectionRepository,
    AitSignatureService,
    AitSignatureRepository,
    AitPrintEventService,
    AitPrintEventRepository,
  ],
})
export class AitModule {}
