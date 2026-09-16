// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:7c0a0e3e7c424b57f2ad54fff4a784959470ca1969c50cf0cc9e0af6daaa16c4
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
import { EVIDENCE_CUSTODY_PROVIDER } from './handwritten/evidence-custody.provider.js';

@Module({
  controllers: [
    EvidenceController,
    EvidenceLinkController,
    CustodyEventController,
    ProbativePackageController,
    ProbativePackageItemController,
    EvidenceAccessRequestController,
    StorageIntentController,
    EvidenceCustodyController,
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
    EVIDENCE_CUSTODY_PROVIDER,
  ],
})
export class EvidenceModule {}
