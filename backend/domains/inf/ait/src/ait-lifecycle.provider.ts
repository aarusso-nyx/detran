import type { Provider } from '@nestjs/common';
import { NormativeLifecycleService } from '@detran/inf-normative';
import { TEAT_EVENT_OUTBOX, type TeatEventOutbox } from '@detran/shared';

import { AitLifecycleService } from './ait-lifecycle.service.js';
import { AitRepository } from './repositories/ait.repository.js';
import { AitVehicleRepository } from './repositories/ait-vehicle.repository.js';
import { AitPersonRepository } from './repositories/ait-person.repository.js';
import { AitStatusHistoryRepository } from './repositories/ait-status-history.repository.js';
import { AitCorrectionRepository } from './repositories/ait-correction.repository.js';
import { AitSignatureRepository } from './repositories/ait-signature.repository.js';
import { AitPrintEventRepository } from './repositories/ait-print-event.repository.js';

/**
 * Nest provider for the handwritten AIT lifecycle: the service takes its
 * repositories as one object (kept for the e2e fixtures), so the module builds
 * it from the generated repositories and the normative reference port exported
 * by `NormativeModule` (WP-T0). `TEAT_EVENT_OUTBOX` (M16, provided by
 * `AIT_CANCEL_REQUESTS_PROVIDER` in the same module) is injected explicitly;
 * the service also has a dependency-free `SqlTeatEventOutbox` fallback for
 * callers that construct it directly (tests, CTG-0001 §8/§9).
 */
export const AIT_LIFECYCLE_PROVIDER: Provider = {
  provide: AitLifecycleService,
  useFactory: (
    ait: AitRepository,
    vehicles: AitVehicleRepository,
    people: AitPersonRepository,
    history: AitStatusHistoryRepository,
    corrections: AitCorrectionRepository,
    signatures: AitSignatureRepository,
    printEvents: AitPrintEventRepository,
    normative: NormativeLifecycleService,
    outbox: TeatEventOutbox,
  ) =>
    new AitLifecycleService(
      { ait, vehicles, people, history, corrections, signatures, printEvents },
      normative,
      { outbox },
    ),
  inject: [
    AitRepository,
    AitVehicleRepository,
    AitPersonRepository,
    AitStatusHistoryRepository,
    AitCorrectionRepository,
    AitSignatureRepository,
    AitPrintEventRepository,
    NormativeLifecycleService,
    TEAT_EVENT_OUTBOX,
  ],
};
