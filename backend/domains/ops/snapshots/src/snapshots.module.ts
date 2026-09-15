// Generated from BP-OPS-SNAPSHOTS-001 v1.0.0 sha256:bebc10f45ae4f8887acc821ee7211894780dd9bd4b5a67d1edfbd371f54a21c4
import { Module } from '@nestjs/common';
import { PersonController } from './controllers/person.controller.js';
import { PersonService } from './services/person.service.js';
import { PersonRepository } from './repositories/person.repository.js';
import { PersonDocumentController } from './controllers/person-document.controller.js';
import { PersonDocumentService } from './services/person-document.service.js';
import { PersonDocumentRepository } from './repositories/person-document.repository.js';
import { VehicleController } from './controllers/vehicle.controller.js';
import { VehicleService } from './services/vehicle.service.js';
import { VehicleRepository } from './repositories/vehicle.repository.js';
import { ExternalQueryController } from './controllers/external-query.controller.js';
import { ExternalQueryService } from './services/external-query.service.js';
import { ExternalQueryRepository } from './repositories/external-query.repository.js';
import { VehicleSnapshotController } from './controllers/vehicle-snapshot.controller.js';
import { VehicleSnapshotService } from './services/vehicle-snapshot.service.js';
import { VehicleSnapshotRepository } from './repositories/vehicle-snapshot.repository.js';
import { FrozenSnapshotController } from './handwritten/frozen-snapshot.controller.js';
import { FROZEN_SNAPSHOT_PROVIDER } from './handwritten/frozen-snapshot.provider.js';

@Module({
  controllers: [
    PersonController,
    PersonDocumentController,
    VehicleController,
    ExternalQueryController,
    VehicleSnapshotController,
    FrozenSnapshotController,
  ],
  providers: [
    PersonService,
    PersonRepository,
    PersonDocumentService,
    PersonDocumentRepository,
    VehicleService,
    VehicleRepository,
    ExternalQueryService,
    ExternalQueryRepository,
    VehicleSnapshotService,
    VehicleSnapshotRepository,
    FROZEN_SNAPSHOT_PROVIDER,
  ],
})
export class SnapshotsModule {}
