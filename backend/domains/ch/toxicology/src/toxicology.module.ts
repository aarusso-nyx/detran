// Generated from BP-CH-TOXICOLOGY-001 v1.0.0 sha256:9bd4b4e46865f6ee6a771bb9c561b1dddfdf2c684b8dc7b2d45a1fb3fbcb5062
import { Module } from '@nestjs/common';
import { PeriodicToxicologyResultController } from './controllers/periodic-toxicology-result.controller.js';
import { PeriodicToxicologyResultService } from './services/periodic-toxicology-result.service.js';
import { PeriodicToxicologyResultRepository } from './repositories/periodic-toxicology-result.repository.js';
import { ToxicologySuspensionController } from './controllers/toxicology-suspension.controller.js';
import { ToxicologySuspensionService } from './services/toxicology-suspension.service.js';
import { ToxicologySuspensionRepository } from './repositories/toxicology-suspension.repository.js';

@Module({
  controllers: [
    PeriodicToxicologyResultController,
    ToxicologySuspensionController,
  ],
  providers: [
    PeriodicToxicologyResultService,
    PeriodicToxicologyResultRepository,
    ToxicologySuspensionService,
    ToxicologySuspensionRepository,
  ],
})
export class ToxicologyModule {}
