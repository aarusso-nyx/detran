// Generated from BP-INF-COLLECTION-001 v1.0.2 sha256:10fb057463797bde8609b1b2a33435d80259cd90c69c2e991c5f42e355f924cd
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
import { CollectionCommandsController } from './handwritten/collection-commands.controller.js';
import { BANK_PORT } from './handwritten/index.js';

@Module({
  controllers: [
    CollectionCommandsController,
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
