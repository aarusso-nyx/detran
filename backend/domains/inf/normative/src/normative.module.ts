// Generated from BP-INF-NORMATIVE-001 v1.2.0 sha256:ce4605cd48d6677dc9c5dd6373c5e2500e57fbd2f114d497422e06914a937588
import { Module } from '@nestjs/common';
import { NormativeCatalogController } from './controllers/normative-catalog.controller.js';
import { NormativeCatalogService } from './services/normative-catalog.service.js';
import { NormativeCatalogRepository } from './repositories/normative-catalog.repository.js';
import { NormativeFramingController } from './controllers/normative-framing.controller.js';
import { NormativeFramingService } from './services/normative-framing.service.js';
import { NormativeFramingRepository } from './repositories/normative-framing.repository.js';
import { NormativeMetrologicalTableController } from './controllers/normative-metrological-table.controller.js';
import { NormativeMetrologicalTableService } from './services/normative-metrological-table.service.js';
import { NormativeMetrologicalTableRepository } from './repositories/normative-metrological-table.repository.js';
import { NormativeValidationRuleController } from './controllers/normative-validation-rule.controller.js';
import { NormativeValidationRuleService } from './services/normative-validation-rule.service.js';
import { NormativeValidationRuleRepository } from './repositories/normative-validation-rule.repository.js';
import { NormativeAgencyParameterController } from './controllers/normative-agency-parameter.controller.js';
import { NormativeAgencyParameterService } from './services/normative-agency-parameter.service.js';
import { NormativeAgencyParameterRepository } from './repositories/normative-agency-parameter.repository.js';
import { NormativeDocumentTemplateController } from './controllers/normative-document-template.controller.js';
import { NormativeDocumentTemplateService } from './services/normative-document-template.service.js';
import { NormativeDocumentTemplateRepository } from './repositories/normative-document-template.repository.js';
import { SignaturePolicyController } from './controllers/signature-policy.controller.js';
import { SignaturePolicyService } from './services/signature-policy.service.js';
import { SignaturePolicyRepository } from './repositories/signature-policy.repository.js';
import { MobileNormativePackageController } from './controllers/mobile-normative-package.controller.js';
import { MobileNormativePackageService } from './services/mobile-normative-package.service.js';
import { MobileNormativePackageRepository } from './repositories/mobile-normative-package.repository.js';
import { NormativeCommandsController } from './normative-commands.controller.js';
import { NormativeLifecycleService } from './normative-lifecycle.service.js';
import { NORMATIVE_COMMANDS_PROVIDER } from './handwritten/normative-commands.provider.js';

@Module({
  controllers: [
    NormativeCommandsController,
    NormativeCatalogController,
    NormativeFramingController,
    NormativeMetrologicalTableController,
    NormativeValidationRuleController,
    NormativeAgencyParameterController,
    NormativeDocumentTemplateController,
    SignaturePolicyController,
    MobileNormativePackageController,
  ],
  providers: [
    NormativeCatalogService,
    NormativeCatalogRepository,
    NormativeFramingService,
    NormativeFramingRepository,
    NormativeMetrologicalTableService,
    NormativeMetrologicalTableRepository,
    NormativeValidationRuleService,
    NormativeValidationRuleRepository,
    NormativeAgencyParameterService,
    NormativeAgencyParameterRepository,
    NormativeDocumentTemplateService,
    NormativeDocumentTemplateRepository,
    SignaturePolicyService,
    SignaturePolicyRepository,
    MobileNormativePackageService,
    MobileNormativePackageRepository,
    NormativeLifecycleService,
    NORMATIVE_COMMANDS_PROVIDER,
  ],
  exports: [NormativeLifecycleService],
})
export class NormativeModule {}
