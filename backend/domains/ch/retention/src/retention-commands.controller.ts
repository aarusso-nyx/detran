import { Body, Controller, Param, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  type RetentionDestination,
  RetentionLifecycleService,
} from './retention-lifecycle.service.js';

@Controller('v1/ch/retention')
@Resource('ch:retention')
export class RetentionCommandsController {
  constructor(private readonly lifecycle: RetentionLifecycleService) {}

  @Post('patients/:patientId/assess')
  @Action('assess')
  @Audit({ action: 'CH_RETENTION_ASSESS', entity: 'ch.retention_case' })
  assess(@Param('patientId') patientId: string) {
    return this.lifecycle.assess(patientId);
  }

  @Post('cases/:caseId/holds')
  @Action('hold')
  @Audit({ action: 'CH_RETENTION_HOLD', entity: 'ch.retention_hold' })
  imposeHold(
    @Param('caseId') caseId: string,
    @Body() body: { reason: string },
  ) {
    return this.lifecycle.imposeHold(caseId, body.reason);
  }

  @Post('holds/:holdId/release')
  @Action('hold')
  @Audit({ action: 'CH_RETENTION_HOLD_RELEASE', entity: 'ch.retention_hold' })
  releaseHold(@Param('holdId') holdId: string) {
    return this.lifecycle.releaseHold(holdId);
  }

  @Post('cases/:caseId/dispositions')
  @Action('propose')
  @Audit({
    action: 'CH_RETENTION_DISPOSITION_PROPOSE',
    entity: 'ch.retention_disposition',
  })
  propose(
    @Param('caseId') caseId: string,
    @Body()
    body: { destination: RetentionDestination; justification: string },
  ) {
    return this.lifecycle.propose(caseId, body.destination, body.justification);
  }

  @Post('dispositions/:dispositionId/review')
  @Action('review')
  @Audit({
    action: 'CH_RETENTION_DISPOSITION_DPO_REVIEW',
    entity: 'ch.retention_disposition',
  })
  review(@Param('dispositionId') dispositionId: string) {
    return this.lifecycle.review(dispositionId);
  }
}
