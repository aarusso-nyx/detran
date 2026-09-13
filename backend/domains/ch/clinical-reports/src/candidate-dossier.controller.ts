import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  CandidateDossierService,
  type CompleteFeedbackInput,
  type ScheduleFeedbackInput,
} from './candidate-dossier.service.js';

@Controller('v1/ch/candidate-dossier')
@Resource('ch:candidate-dossier')
export class CandidateDossierController {
  constructor(private readonly dossier: CandidateDossierService) {}

  @Get(':encounterId')
  @Action('read')
  @Audit({ action: 'CH_CANDIDATE_DOSSIER_READ', entity: 'ch.encounter' })
  getOwn(@Param('encounterId') encounterId: string) {
    return this.dossier.getOwn(encounterId);
  }

  @Post(':encounterId/feedback-requests')
  @Action('feedback-request')
  @Audit({ action: 'CH_FEEDBACK_REQUEST', entity: 'ch.feedback_request' })
  requestFeedback(@Param('encounterId') encounterId: string) {
    return this.dossier.requestFeedback(encounterId);
  }

  @Post('feedback-requests/:id/schedule')
  @Action('feedback-schedule')
  @Audit({ action: 'CH_FEEDBACK_SCHEDULE', entity: 'ch.feedback_request' })
  scheduleFeedback(
    @Param('id') id: string,
    @Body() input: ScheduleFeedbackInput,
  ) {
    return this.dossier.scheduleFeedback(id, input);
  }

  @Post('feedback-requests/:id/complete')
  @Action('feedback-complete')
  @Audit({ action: 'CH_FEEDBACK_COMPLETE', entity: 'ch.feedback_request' })
  completeFeedback(
    @Param('id') id: string,
    @Body() input: CompleteFeedbackInput,
  ) {
    return this.dossier.completeFeedback(id, input);
  }
}
