// Generated from BP-INF-COLLECTION-001 v1.0.0 sha256:9553391da82dfaf5acf236128822deb730f18b660ab5416e12bdbb0014ca1c7f
import { Module } from '@nestjs/common';
import { CollectionDocumentController } from './controllers/collection-document.controller.js';
import { CollectionDocumentService } from './services/collection-document.service.js';
import { CollectionDocumentRepository } from './repositories/collection-document.repository.js';
import { PaymentController } from './controllers/payment.controller.js';
import { PaymentService } from './services/payment.service.js';
import { PaymentRepository } from './repositories/payment.repository.js';
import { RefundOrderController } from './controllers/refund-order.controller.js';
import { RefundOrderService } from './services/refund-order.service.js';
import { RefundOrderRepository } from './repositories/refund-order.repository.js';
import { DebtHandoffController } from './controllers/debt-handoff.controller.js';
import { DebtHandoffService } from './services/debt-handoff.service.js';
import { DebtHandoffRepository } from './repositories/debt-handoff.repository.js';
import { BANK_PORT } from './handwritten/index.js';

@Module({
  controllers: [
    CollectionDocumentController,
    PaymentController,
    RefundOrderController,
    DebtHandoffController,
  ],
  providers: [
    CollectionDocumentService,
    CollectionDocumentRepository,
    PaymentService,
    PaymentRepository,
    RefundOrderService,
    RefundOrderRepository,
    DebtHandoffService,
    DebtHandoffRepository,
    BANK_PORT,
  ],
})
export class CollectionModule {}
