// Generated from BP-CH-PROCESS-BLOCKS-001 v1.0.0 sha256:4e56ae0c6ab4db581d4cd4f3b88014f634c022cc45f8f991a54976b7da46feab
import { Module } from '@nestjs/common';
import { ProcessBlockController } from './controllers/process-block.controller.js';
import { ProcessBlockService } from './services/process-block.service.js';
import { ProcessBlockRepository } from './repositories/process-block.repository.js';
import { ProcessBlockCommandsController } from './process-block-commands.controller.js';
import { ProcessBlockLifecycleService } from './process-block-lifecycle.service.js';

@Module({
  controllers: [ProcessBlockController, ProcessBlockCommandsController],
  providers: [
    ProcessBlockService,
    ProcessBlockRepository,
    ProcessBlockLifecycleService,
  ],
})
export class ProcessBlocksModule {}
