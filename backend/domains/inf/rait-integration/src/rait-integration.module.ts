// Generated from BP-INF-RAIT-INTEGRATION-001 v1.0.0 sha256:ddd770d620f969774d0560bb02a8ebae3a43c42b4340a4092a1a7828963820a5
import { Module } from '@nestjs/common';
import { RaitReconciliationController } from './controllers/rait-reconciliation.controller.js';
import { RaitReconciliationService } from './services/rait-reconciliation.service.js';
import { RaitReconciliationRepository } from './repositories/rait-reconciliation.repository.js';

@Module({
  controllers: [RaitReconciliationController],
  providers: [RaitReconciliationService, RaitReconciliationRepository],
})
export class RaitIntegrationModule {}
