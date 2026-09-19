// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:e739cf21c78ced39113911fbf0c9950d0c2091ab58cc4efedee4225786fe9eac
import { Module } from '@nestjs/common';
import { EvidenceController } from './controllers/evidence.controller.js';
import { EvidenceService } from './services/evidence.service.js';
import { EvidenceRepository } from './repositories/evidence.repository.js';
import { EvidenceLinkController } from './controllers/evidence-link.controller.js';
import { EvidenceLinkService } from './services/evidence-link.service.js';
import { EvidenceLinkRepository } from './repositories/evidence-link.repository.js';
import { CustodyEventController } from './controllers/custody-event.controller.js';
import { CustodyEventService } from './services/custody-event.service.js';
import { CustodyEventRepository } from './repositories/custody-event.repository.js';
import { ProbativePackageController } from './controllers/probative-package.controller.js';
import { ProbativePackageService } from './services/probative-package.service.js';
import { ProbativePackageRepository } from './repositories/probative-package.repository.js';
import { ProbativePackageItemController } from './controllers/probative-package-item.controller.js';
import { ProbativePackageItemService } from './services/probative-package-item.service.js';
import { ProbativePackageItemRepository } from './repositories/probative-package-item.repository.js';
import { EvidenceAccessRequestController } from './controllers/evidence-access-request.controller.js';
import { EvidenceAccessRequestService } from './services/evidence-access-request.service.js';
import { EvidenceAccessRequestRepository } from './repositories/evidence-access-request.repository.js';
import { StorageIntentController } from './controllers/storage-intent.controller.js';
import { StorageIntentService } from './services/storage-intent.service.js';
import { StorageIntentRepository } from './repositories/storage-intent.repository.js';
import { EvidenceCustodyController } from './handwritten/evidence-custody.controller.js';
import { EvidenceAccessController } from './handwritten/evidence-access.controller.js';
import { EVIDENCE_COMMANDS_PROVIDER } from './handwritten/evidence-commands.provider.js';

@Module({
  controllers: [
    EvidenceCustodyController,
    EvidenceAccessController,
    EvidenceController,
    EvidenceLinkController,
    CustodyEventController,
    ProbativePackageController,
    ProbativePackageItemController,
    EvidenceAccessRequestController,
    StorageIntentController,
  ],
  providers: [
    EvidenceService,
    EvidenceRepository,
    EvidenceLinkService,
    EvidenceLinkRepository,
    CustodyEventService,
    CustodyEventRepository,
    ProbativePackageService,
    ProbativePackageRepository,
    ProbativePackageItemService,
    ProbativePackageItemRepository,
    EvidenceAccessRequestService,
    EvidenceAccessRequestRepository,
    StorageIntentService,
    StorageIntentRepository,
    EVIDENCE_COMMANDS_PROVIDER,
  ],
})
export class EvidenceModule {}
