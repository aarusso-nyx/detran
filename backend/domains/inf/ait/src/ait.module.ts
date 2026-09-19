// Generated from BP-INF-AIT-001 v1.2.0 sha256:a92e771e8f034647144a60080673e25e807fdbc93a27c59a1da0fc32710fd2ea
import { Module } from '@nestjs/common';
import { AitController } from './controllers/ait.controller.js';
import { AitService } from './services/ait.service.js';
import { AitRepository } from './repositories/ait.repository.js';
import { AitCancelRequestController } from './controllers/ait-cancel-request.controller.js';
import { AitCancelRequestService } from './services/ait-cancel-request.service.js';
import { AitCancelRequestRepository } from './repositories/ait-cancel-request.repository.js';
import { AitCancelRequestEventController } from './controllers/ait-cancel-request-event.controller.js';
import { AitCancelRequestEventService } from './services/ait-cancel-request-event.service.js';
import { AitCancelRequestEventRepository } from './repositories/ait-cancel-request-event.repository.js';
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
import { AitCancelRequestsController } from './handwritten/ait-cancel-requests.controller.js';
import { AIT_LIFECYCLE_PROVIDER } from './ait-lifecycle.provider.js';
import { AIT_CANCEL_REQUESTS_PROVIDER } from './handwritten/ait-cancel-requests.provider.js';
import { AIT_SYNC_APPLIER_PROVIDER } from './handwritten/sync-applier.provider.js';
import { NormativeModule } from '@detran/inf-normative';

@Module({
  imports: [NormativeModule],
  controllers: [
    AitCommandsController,
    AitCancelRequestsController,
    AitController,
    AitCancelRequestController,
    AitCancelRequestEventController,
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
    AitCancelRequestService,
    AitCancelRequestRepository,
    AitCancelRequestEventService,
    AitCancelRequestEventRepository,
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
    AIT_CANCEL_REQUESTS_PROVIDER,
    AIT_SYNC_APPLIER_PROVIDER,
  ],
})
export class AitModule {}
