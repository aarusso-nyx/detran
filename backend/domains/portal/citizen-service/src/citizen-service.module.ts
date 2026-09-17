// Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.1 sha256:81c05ec48ec8ab36465ae1b250c4a59f59931b99835bfd1ef52f3b10520f9029
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
import { PortalManifestationsController } from './handwritten/manifestations.controller.js';
import { PortalEvaluationsController } from './handwritten/evaluations.controller.js';
import { PortalServiceCharterController } from './handwritten/service-charter.controller.js';
import { PortalManifestationService } from './handwritten/manifestation.service.js';
import { PortalEvaluationService } from './handwritten/evaluation.service.js';
import { IdentityModule } from '@detran/portal-identity';
import { RequestsModule } from '@detran/portal-requests';

@Module({
  imports: [IdentityModule, RequestsModule],
  controllers: [
    PortalManifestationsController,
    PortalEvaluationsController,
    PortalServiceCharterController,
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
    PortalManifestationService,
    PortalEvaluationService,
  ],
})
export class CitizenServiceModule {}
