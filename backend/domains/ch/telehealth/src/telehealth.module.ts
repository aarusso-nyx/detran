// Generated from BP-CH-TELEHEALTH-001 v1.0.0 sha256:1702fef12182de18153031eed0b113c29e2eaa1406ccd4477fea59340ea96206
import { Module } from '@nestjs/common';
import { TelehealthSessionController } from './controllers/telehealth-session.controller.js';
import { TelehealthSessionService } from './services/telehealth-session.service.js';
import { TelehealthSessionRepository } from './repositories/telehealth-session.repository.js';
import { TelehealthCommandsController } from './telehealth-commands.controller.js';
import { TelehealthLifecycleService } from './telehealth-lifecycle.service.js';

@Module({
  controllers: [TelehealthSessionController, TelehealthCommandsController],
  providers: [
    TelehealthSessionService,
    TelehealthSessionRepository,
    TelehealthLifecycleService,
  ],
})
export class TelehealthModule {}
