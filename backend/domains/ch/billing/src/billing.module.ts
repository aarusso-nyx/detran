// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
import { Module } from '@nestjs/common';
import { FederalExamPublicPriceController } from './controllers/federal-exam-public-price.controller.js';
import { FederalExamPublicPriceService } from './services/federal-exam-public-price.service.js';
import { FederalExamPublicPriceRepository } from './repositories/federal-exam-public-price.repository.js';
import { BillingItemController } from './controllers/billing-item.controller.js';
import { BillingItemService } from './services/billing-item.service.js';
import { BillingItemRepository } from './repositories/billing-item.repository.js';
import { BillingInvoiceController } from './controllers/billing-invoice.controller.js';
import { BillingInvoiceService } from './services/billing-invoice.service.js';
import { BillingInvoiceRepository } from './repositories/billing-invoice.repository.js';
import { BillingDivergenceController } from './controllers/billing-divergence.controller.js';
import { BillingDivergenceService } from './services/billing-divergence.service.js';
import { BillingDivergenceRepository } from './repositories/billing-divergence.repository.js';
import { BillingInvoiceItemController } from './controllers/billing-invoice-item.controller.js';
import { BillingInvoiceItemService } from './services/billing-invoice-item.service.js';
import { BillingInvoiceItemRepository } from './repositories/billing-invoice-item.repository.js';
import { BillingCommandsController } from './billing-commands.controller.js';
import { BillingLifecycleService } from './billing-lifecycle.service.js';

@Module({
  controllers: [
    FederalExamPublicPriceController,
    BillingItemController,
    BillingInvoiceController,
    BillingDivergenceController,
    BillingInvoiceItemController,
    BillingCommandsController,
  ],
  providers: [
    FederalExamPublicPriceService,
    FederalExamPublicPriceRepository,
    BillingItemService,
    BillingItemRepository,
    BillingInvoiceService,
    BillingInvoiceRepository,
    BillingDivergenceService,
    BillingDivergenceRepository,
    BillingInvoiceItemService,
    BillingInvoiceItemRepository,
    BillingLifecycleService,
  ],
})
export class BillingModule {}
