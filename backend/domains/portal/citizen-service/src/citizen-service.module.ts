// Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.0 sha256:adb8933e9c3c31077273c68bff12efa5e0bfefa8843cdc29798c6d43fa63a246
import { Module } from '@nestjs/common';
import { ManifestationController } from './controllers/manifestation.controller.js';
import { ManifestationService } from './services/manifestation.service.js';
import { ManifestationRepository } from './repositories/manifestation.repository.js';
import { ManifestationExtensionController } from './controllers/manifestation-extension.controller.js';
import { ManifestationExtensionService } from './services/manifestation-extension.service.js';
import { ManifestationExtensionRepository } from './repositories/manifestation-extension.repository.js';
import { ServiceCatalogController } from './controllers/service-catalog.controller.js';
import { ServiceCatalogService } from './services/service-catalog.service.js';
import { ServiceCatalogRepository } from './repositories/service-catalog.repository.js';

@Module({
  controllers: [
    ManifestationController,
    ManifestationExtensionController,
    ServiceCatalogController,
  ],
  providers: [
    ManifestationService,
    ManifestationRepository,
    ManifestationExtensionService,
    ManifestationExtensionRepository,
    ServiceCatalogService,
    ServiceCatalogRepository,
  ],
})
export class CitizenServiceModule {}
