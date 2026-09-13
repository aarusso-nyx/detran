import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  type DecideJuntaInput,
  type DesignateBoardInput,
  type FileAppealInput,
  JuntaLifecycleService,
  type SubmitJuntaCaseInput,
} from './junta-lifecycle.service.js';

@Controller('v1/ch/juntas')
@Resource('ch:junta')
export class JuntaCommandsController {
  constructor(private readonly lifecycle: JuntaLifecycleService) {}

  @Post('cases')
  @Action('create')
  @Audit({ action: 'CH_JUNTA_REQUEST', entity: 'ch.junta_case' })
  submit(@Body() input: SubmitJuntaCaseInput) {
    return this.lifecycle.submit(input);
  }

  @Post('cases/:id/second-board')
  @Action('designate')
  @Audit({ action: 'CH_JUNTA_DESIGNATE', entity: 'ch.junta_board' })
  designateSecond(@Param('id') id: string, @Body() input: DesignateBoardInput) {
    return this.lifecycle.designateSecond(id, input);
  }

  @Post('cases/:id/special-board')
  @Action('designate-special')
  @Audit({ action: 'CH_JUNTA_SPECIAL_DESIGNATE', entity: 'ch.junta_board' })
  designateSpecial(
    @Param('id') id: string,
    @Body() input: DesignateBoardInput,
  ) {
    return this.lifecycle.designateSpecial(id, input);
  }

  @Post('boards/:id/decisions')
  @Action('decide')
  @Audit({ action: 'CH_JUNTA_DECIDE', entity: 'ch.junta_decision' })
  decide(@Param('id') id: string, @Body() input: DecideJuntaInput) {
    return this.lifecycle.decide(id, input);
  }

  @Post('cases/:id/appeals')
  @Action('appeal')
  @Audit({ action: 'CH_JUNTA_APPEAL', entity: 'ch.junta_appeal' })
  appeal(@Param('id') id: string, @Body() input: FileAppealInput) {
    return this.lifecycle.fileAppeal(id, input);
  }

  @Patch('appeals/:id/forward')
  @Action('forward')
  @Audit({ action: 'CH_JUNTA_APPEAL_FORWARD', entity: 'ch.junta_appeal' })
  forward(@Param('id') id: string, @Body() input: { forwardedAt: string }) {
    return this.lifecycle.forwardAppeal(id, input.forwardedAt);
  }
}
