// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
import { Module } from '@nestjs/common';
import { MeasureTypeController } from './controllers/measure-type.controller.js';
import { MeasureTypeService } from './services/measure-type.service.js';
import { MeasureTypeRepository } from './repositories/measure-type.repository.js';
import { AdministrativeMeasureController } from './controllers/administrative-measure.controller.js';
import { AdministrativeMeasureService } from './services/administrative-measure.service.js';
import { AdministrativeMeasureRepository } from './repositories/administrative-measure.repository.js';
import { AdministrativeTermController } from './controllers/administrative-term.controller.js';
import { AdministrativeTermService } from './services/administrative-term.service.js';
import { AdministrativeTermRepository } from './repositories/administrative-term.repository.js';
import { MeasureRetentionController } from './controllers/measure-retention.controller.js';
import { MeasureRetentionService } from './services/measure-retention.service.js';
import { MeasureRetentionRepository } from './repositories/measure-retention.repository.js';
import { MeasureRemovalController } from './controllers/measure-removal.controller.js';
import { MeasureRemovalService } from './services/measure-removal.service.js';
import { MeasureRemovalRepository } from './repositories/measure-removal.repository.js';
import { VehicleInventoryController } from './controllers/vehicle-inventory.controller.js';
import { VehicleInventoryService } from './services/vehicle-inventory.service.js';
import { VehicleInventoryRepository } from './repositories/vehicle-inventory.repository.js';
import { TowProviderController } from './controllers/tow-provider.controller.js';
import { TowProviderService } from './services/tow-provider.service.js';
import { TowProviderRepository } from './repositories/tow-provider.repository.js';
import { YardController } from './controllers/yard.controller.js';
import { YardService } from './services/yard.service.js';
import { YardRepository } from './repositories/yard.repository.js';
import { MeasureStatusHistoryController } from './controllers/measure-status-history.controller.js';
import { MeasureStatusHistoryService } from './services/measure-status-history.service.js';
import { MeasureStatusHistoryRepository } from './repositories/measure-status-history.repository.js';

@Module({
  controllers: [
    MeasureTypeController,
    AdministrativeMeasureController,
    AdministrativeTermController,
    MeasureRetentionController,
    MeasureRemovalController,
    VehicleInventoryController,
    TowProviderController,
    YardController,
    MeasureStatusHistoryController,
  ],
  providers: [
    MeasureTypeService,
    MeasureTypeRepository,
    AdministrativeMeasureService,
    AdministrativeMeasureRepository,
    AdministrativeTermService,
    AdministrativeTermRepository,
    MeasureRetentionService,
    MeasureRetentionRepository,
    MeasureRemovalService,
    MeasureRemovalRepository,
    VehicleInventoryService,
    VehicleInventoryRepository,
    TowProviderService,
    TowProviderRepository,
    YardService,
    YardRepository,
    MeasureStatusHistoryService,
    MeasureStatusHistoryRepository,
  ],
})
export class MeasuresModule {}
