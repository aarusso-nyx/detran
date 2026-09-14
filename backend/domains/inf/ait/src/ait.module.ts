// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
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
import { AitCommandsController } from './ait-commands.controller.js';
import { AIT_LIFECYCLE_PROVIDER } from './ait-lifecycle.provider.js';
import { NormativeModule } from '@detran/inf-normative';

@Module({
  imports: [NormativeModule],
  controllers: [
    AitController,
    AitVehicleController,
    AitPersonController,
    AitStatusHistoryController,
    AitCorrectionController,
    AitSignatureController,
    AitPrintEventController,
    AitCommandsController,
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
    AIT_LIFECYCLE_PROVIDER,
  ],
})
export class AitModule {}
