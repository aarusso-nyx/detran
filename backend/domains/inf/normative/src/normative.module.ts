// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
import { Module } from '@nestjs/common';
import { NormativeCatalogController } from './controllers/normative-catalog.controller.js';
import { NormativeCatalogService } from './services/normative-catalog.service.js';
import { NormativeCatalogRepository } from './repositories/normative-catalog.repository.js';
import { NormativeFramingController } from './controllers/normative-framing.controller.js';
import { NormativeFramingService } from './services/normative-framing.service.js';
import { NormativeFramingRepository } from './repositories/normative-framing.repository.js';
import { NormativeValidationRuleController } from './controllers/normative-validation-rule.controller.js';
import { NormativeValidationRuleService } from './services/normative-validation-rule.service.js';
import { NormativeValidationRuleRepository } from './repositories/normative-validation-rule.repository.js';
import { NormativeAgencyParameterController } from './controllers/normative-agency-parameter.controller.js';
import { NormativeAgencyParameterService } from './services/normative-agency-parameter.service.js';
import { NormativeAgencyParameterRepository } from './repositories/normative-agency-parameter.repository.js';
import { NormativeDocumentTemplateController } from './controllers/normative-document-template.controller.js';
import { NormativeDocumentTemplateService } from './services/normative-document-template.service.js';
import { NormativeDocumentTemplateRepository } from './repositories/normative-document-template.repository.js';
import { MobileNormativePackageController } from './controllers/mobile-normative-package.controller.js';
import { MobileNormativePackageService } from './services/mobile-normative-package.service.js';
import { MobileNormativePackageRepository } from './repositories/mobile-normative-package.repository.js';
import { NormativeCommandsController } from './normative-commands.controller.js';
import { NormativeLifecycleService } from './normative-lifecycle.service.js';

@Module({
  controllers: [
    NormativeCatalogController,
    NormativeFramingController,
    NormativeValidationRuleController,
    NormativeAgencyParameterController,
    NormativeDocumentTemplateController,
    MobileNormativePackageController,
    NormativeCommandsController,
  ],
  providers: [
    NormativeCatalogService,
    NormativeCatalogRepository,
    NormativeFramingService,
    NormativeFramingRepository,
    NormativeValidationRuleService,
    NormativeValidationRuleRepository,
    NormativeAgencyParameterService,
    NormativeAgencyParameterRepository,
    NormativeDocumentTemplateService,
    NormativeDocumentTemplateRepository,
    MobileNormativePackageService,
    MobileNormativePackageRepository,
    NormativeLifecycleService,
  ],
  exports: [NormativeLifecycleService],
})
export class NormativeModule {}
