// Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01
import { Module } from '@nestjs/common';
import { RaitSessionController } from './controllers/rait-session.controller.js';
import { RaitSessionService } from './services/rait-session.service.js';
import { RaitSessionRepository } from './repositories/rait-session.repository.js';
import { RaitAgendaItemController } from './controllers/rait-agenda-item.controller.js';
import { RaitAgendaItemService } from './services/rait-agenda-item.service.js';
import { RaitAgendaItemRepository } from './repositories/rait-agenda-item.repository.js';
import { RaitAttendanceController } from './controllers/rait-attendance.controller.js';
import { RaitAttendanceService } from './services/rait-attendance.service.js';
import { RaitAttendanceRepository } from './repositories/rait-attendance.repository.js';
import { RaitVoteController } from './controllers/rait-vote.controller.js';
import { RaitVoteService } from './services/rait-vote.service.js';
import { RaitVoteRepository } from './repositories/rait-vote.repository.js';
import { RaitOralArgumentController } from './controllers/rait-oral-argument.controller.js';
import { RaitOralArgumentService } from './services/rait-oral-argument.service.js';
import { RaitOralArgumentRepository } from './repositories/rait-oral-argument.repository.js';
import { RaitMinutesController } from './controllers/rait-minutes.controller.js';
import { RaitMinutesService } from './services/rait-minutes.service.js';
import { RaitMinutesRepository } from './repositories/rait-minutes.repository.js';

@Module({
  controllers: [
    RaitSessionController,
    RaitAgendaItemController,
    RaitAttendanceController,
    RaitVoteController,
    RaitOralArgumentController,
    RaitMinutesController,
  ],
  providers: [
    RaitSessionService,
    RaitSessionRepository,
    RaitAgendaItemService,
    RaitAgendaItemRepository,
    RaitAttendanceService,
    RaitAttendanceRepository,
    RaitVoteService,
    RaitVoteRepository,
    RaitOralArgumentService,
    RaitOralArgumentRepository,
    RaitMinutesService,
    RaitMinutesRepository,
  ],
})
export class RaitSessionModule {}
