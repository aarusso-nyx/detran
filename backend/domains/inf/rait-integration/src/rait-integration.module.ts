// Generated from BP-INF-RAIT-INTEGRATION-001 v1.0.1 sha256:2d42a37638b7f6930d1b8ac07d6cd13218f965f5c2857948e0afeea8df277caf
import { Module } from '@nestjs/common';
import { RaitReconciliationController } from './controllers/rait-reconciliation.controller.js';
import { RaitReconciliationService } from './services/rait-reconciliation.service.js';
import { RaitReconciliationRepository } from './repositories/rait-reconciliation.repository.js';
import { RaitIntegrationCommandsController } from './handwritten/rait-integration-commands.controller.js';

@Module({
  controllers: [
    RaitIntegrationCommandsController,
    RaitReconciliationController,
  ],
  providers: [RaitReconciliationService, RaitReconciliationRepository],
})
export class RaitIntegrationModule {}
