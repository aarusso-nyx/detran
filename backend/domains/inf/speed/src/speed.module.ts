// Generated from BP-INF-SPEED-001 v1.1.0 sha256:a7576a43ce5eca2a2e93dd79ac603a578aa6e7b0127a6dc276c749cd38b02411
import { Module } from '@nestjs/common';
import { SpeedMeterController } from './controllers/speed-meter.controller.js';
import { SpeedMeterService } from './services/speed-meter.service.js';
import { SpeedMeterRepository } from './repositories/speed-meter.repository.js';
import { SpeedMeterCertificateController } from './controllers/speed-meter-certificate.controller.js';
import { SpeedMeterCertificateService } from './services/speed-meter-certificate.service.js';
import { SpeedMeterCertificateRepository } from './repositories/speed-meter-certificate.repository.js';
import { SpeedMeasurementController } from './controllers/speed-measurement.controller.js';
import { SpeedMeasurementService } from './services/speed-measurement.service.js';
import { SpeedMeasurementRepository } from './repositories/speed-measurement.repository.js';
import { SpeedCommandsController } from './handwritten/speed-commands.controller.js';

@Module({
  controllers: [
    SpeedCommandsController,
    SpeedMeterController,
    SpeedMeterCertificateController,
    SpeedMeasurementController,
  ],
  providers: [
    SpeedMeterService,
    SpeedMeterRepository,
    SpeedMeterCertificateService,
    SpeedMeterCertificateRepository,
    SpeedMeasurementService,
    SpeedMeasurementRepository,
  ],
})
export class SpeedModule {}
