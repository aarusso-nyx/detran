// Generated from BP-CH-JUNTAS-001 v1.0.0 sha256:5c7e357c88ac5886f460c789a7607211ada27acd49d6f9fd47df0da89ad064f2
import { Module } from '@nestjs/common';
import { JuntaCaseController } from './controllers/junta-case.controller.js';
import { JuntaCaseService } from './services/junta-case.service.js';
import { JuntaCaseRepository } from './repositories/junta-case.repository.js';
import { JuntaBoardController } from './controllers/junta-board.controller.js';
import { JuntaBoardService } from './services/junta-board.service.js';
import { JuntaBoardRepository } from './repositories/junta-board.repository.js';
import { JuntaBoardMemberController } from './controllers/junta-board-member.controller.js';
import { JuntaBoardMemberService } from './services/junta-board-member.service.js';
import { JuntaBoardMemberRepository } from './repositories/junta-board-member.repository.js';
import { JuntaDecisionController } from './controllers/junta-decision.controller.js';
import { JuntaDecisionService } from './services/junta-decision.service.js';
import { JuntaDecisionRepository } from './repositories/junta-decision.repository.js';
import { JuntaAppealController } from './controllers/junta-appeal.controller.js';
import { JuntaAppealService } from './services/junta-appeal.service.js';
import { JuntaAppealRepository } from './repositories/junta-appeal.repository.js';
import { JuntaCommandsController } from './junta-commands.controller.js';
import { JuntaLifecycleService } from './junta-lifecycle.service.js';
import { JuntaSigningAdapter } from './junta-signing.adapter.js';

@Module({
  controllers: [
    JuntaCommandsController,
    JuntaCaseController,
    JuntaBoardController,
    JuntaBoardMemberController,
    JuntaDecisionController,
    JuntaAppealController,
  ],
  providers: [
    JuntaCaseService,
    JuntaCaseRepository,
    JuntaBoardService,
    JuntaBoardRepository,
    JuntaBoardMemberService,
    JuntaBoardMemberRepository,
    JuntaDecisionService,
    JuntaDecisionRepository,
    JuntaAppealService,
    JuntaAppealRepository,
    JuntaLifecycleService,
    JuntaSigningAdapter,
  ],
})
export class JuntasModule {}
