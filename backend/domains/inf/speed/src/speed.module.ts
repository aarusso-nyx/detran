// Generated from BP-INF-SPEED-001 v1.0.0 sha256:621c9dd37f71bc7fbb14a32b3df72d186e5f6f5d513de297d5559c3ac37ae44e
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

@Module({
  controllers: [
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
