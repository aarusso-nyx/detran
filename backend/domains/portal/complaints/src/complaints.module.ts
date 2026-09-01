// Generated from BP-PORTAL-COMPLAINTS-001 v1.0.0 sha256:8c3bc3ce59e94126c71a50e9fad090538fbbb36536ce8c56fca3e2c64e93b60c
import { Module } from '@nestjs/common';
import { ComplaintController } from './controllers/complaint.controller.js';
import { ComplaintService } from './services/complaint.service.js';
import { ComplaintRepository } from './repositories/complaint.repository.js';
import { ComplaintCommandsController } from './complaint-commands.controller.js';
import { ComplaintLifecycleService } from './complaint-lifecycle.service.js';

@Module({
  controllers: [ComplaintController, ComplaintCommandsController],
  providers: [ComplaintService, ComplaintRepository, ComplaintLifecycleService],
})
export class ComplaintsModule {}
