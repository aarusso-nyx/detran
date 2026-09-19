// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
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
import { RaitSessionMinutesSnapshotController } from './controllers/rait-session-minutes-snapshot.controller.js';
import { RaitSessionMinutesSnapshotService } from './services/rait-session-minutes-snapshot.service.js';
import { RaitSessionMinutesSnapshotRepository } from './repositories/rait-session-minutes-snapshot.repository.js';
import { RaitSessionMinutesManifestController } from './controllers/rait-session-minutes-manifest.controller.js';
import { RaitSessionMinutesManifestService } from './services/rait-session-minutes-manifest.service.js';
import { RaitSessionMinutesManifestRepository } from './repositories/rait-session-minutes-manifest.repository.js';
import { RaitMinutesRequiredSignerController } from './controllers/rait-minutes-required-signer.controller.js';
import { RaitMinutesRequiredSignerService } from './services/rait-minutes-required-signer.service.js';
import { RaitMinutesRequiredSignerRepository } from './repositories/rait-minutes-required-signer.repository.js';
import { RaitMinutesSignatureReceiptController } from './controllers/rait-minutes-signature-receipt.controller.js';
import { RaitMinutesSignatureReceiptService } from './services/rait-minutes-signature-receipt.service.js';
import { RaitMinutesSignatureReceiptRepository } from './repositories/rait-minutes-signature-receipt.repository.js';
import { RaitSessionCommandsController } from './handwritten/rait-session-commands.controller.js';
import { RaitSessionCommandService } from './handwritten/rait-session-command.service.js';

@Module({
  controllers: [
    RaitSessionController,
    RaitAgendaItemController,
    RaitAttendanceController,
    RaitVoteController,
    RaitOralArgumentController,
    RaitMinutesController,
    RaitSessionMinutesSnapshotController,
    RaitSessionMinutesManifestController,
    RaitMinutesRequiredSignerController,
    RaitMinutesSignatureReceiptController,
    RaitSessionCommandsController,
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
    RaitSessionMinutesSnapshotService,
    RaitSessionMinutesSnapshotRepository,
    RaitSessionMinutesManifestService,
    RaitSessionMinutesManifestRepository,
    RaitMinutesRequiredSignerService,
    RaitMinutesRequiredSignerRepository,
    RaitMinutesSignatureReceiptService,
    RaitMinutesSignatureReceiptRepository,
    RaitSessionCommandService,
  ],
})
export class RaitSessionModule {}
