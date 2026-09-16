// Generated from BP-OPS-PARAMETER-001 v1.0.0 sha256:3259251ebb1dfaccd776e889a446ca45db209b824d7760cc132d20c015e3e39e
import { Module } from '@nestjs/common';
import { ParameterController } from './controllers/parameter.controller.js';
import { ParameterService } from './services/parameter.service.js';
import { ParameterRepository } from './repositories/parameter.repository.js';
import { ParameterCommandController } from './handwritten/parameter-command.controller.js';
import { OpsParameterService } from './handwritten/parameter.service.js';
import { SystemParameterClock } from './handwritten/parameter.service.js';
import { NullParameterCache } from './handwritten/parameter.service.js';
import { SqlParameterOutbox } from './handwritten/parameter.service.js';

@Module({
  controllers: [ParameterCommandController, ParameterController],
  providers: [
    ParameterService,
    ParameterRepository,
    OpsParameterService,
    SystemParameterClock,
    NullParameterCache,
    SqlParameterOutbox,
  ],
  exports: [OpsParameterService],
})
export class ParameterModule {}
