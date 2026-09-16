// Generated from BP-PORTAL-IDENTITY-001 v1.0.1 sha256:1a840b3372310d8bdecab94f05cd0978fdb1f53e677cc55361bf6d6f479c723c
import { Module } from '@nestjs/common';
import { SubjectController } from './controllers/subject.controller.js';
import { SubjectService } from './services/subject.service.js';
import { SubjectRepository } from './repositories/subject.repository.js';
import { RepresentationController } from './controllers/representation.controller.js';
import { RepresentationService } from './services/representation.service.js';
import { RepresentationRepository } from './repositories/representation.repository.js';
import { ActLevelPolicyController } from './controllers/act-level-policy.controller.js';
import { ActLevelPolicyService } from './services/act-level-policy.service.js';
import { ActLevelPolicyRepository } from './repositories/act-level-policy.repository.js';
import { EntitlementController } from './controllers/entitlement.controller.js';
import { EntitlementService } from './services/entitlement.service.js';
import { EntitlementRepository } from './repositories/entitlement.repository.js';
import { PortalPublicController } from './handwritten/public.controller.js';
import { PortalMeController } from './handwritten/me.controller.js';
import { PortalAssuranceController } from './handwritten/assurance.controller.js';
import { PortalRepresentationsController } from './handwritten/representations.controller.js';
import { PortalPreferencesController } from './handwritten/preferences.controller.js';
import { PortalIdentityService } from './handwritten/identity.service.js';
import { PortalCitizenGuard } from './handwritten/citizen.guard.js';
import { PortalClock } from './handwritten/clock.js';

@Module({
  controllers: [
    PortalPublicController,
    PortalMeController,
    PortalAssuranceController,
    PortalRepresentationsController,
    PortalPreferencesController,
    SubjectController,
    RepresentationController,
    ActLevelPolicyController,
    EntitlementController,
  ],
  providers: [
    SubjectService,
    SubjectRepository,
    RepresentationService,
    RepresentationRepository,
    ActLevelPolicyService,
    ActLevelPolicyRepository,
    EntitlementService,
    EntitlementRepository,
    PortalIdentityService,
    PortalCitizenGuard,
    PortalClock,
  ],
  exports: [PortalIdentityService, PortalCitizenGuard, PortalClock],
})
export class IdentityModule {}
