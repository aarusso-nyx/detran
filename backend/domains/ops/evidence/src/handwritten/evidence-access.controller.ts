// CTG-0003 §4.9…§4.11 (RN-TEAT-142, R-0008, TASK-0007) — `POST
// /v1/ops/evidence-access-requests` e as três decisões. A rota do route
// contract §4.4 é irmã de `evidence`, não filha (§4).
import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import type { CreateAccessRequestInput } from './create-access-request.command.js';
import type { DecideAccessRequestInput } from './decide-access-request.command.js';
import type { DeliverAccessRequestInput } from './deliver-access-request.command.js';
import { EvidenceCommandsService } from './evidence-commands.service.js';

@Controller('v1/ops/evidence-access-requests')
@Resource('ops:evidence-access-request')
export class EvidenceAccessController {
  constructor(private readonly commands: EvidenceCommandsService) {}

  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_EVIDENCE_ACCESS_REQUEST',
    entity: 'ops.evidence_access_request',
  })
  create(@Body() body: CreateAccessRequestInput) {
    return this.commands.requestAccess(body);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @Action('approve')
  @Audit({
    action: 'OPS_EVIDENCE_ACCESS_APPROVE',
    entity: 'ops.evidence_access_request',
  })
  approve(@Param('id') id: string, @Body() body: DecideAccessRequestInput) {
    return this.commands.decideAccess(id, 'approve', body ?? {});
  }

  @Post(':id/deny')
  @HttpCode(200)
  @Action('deny')
  @Audit({
    action: 'OPS_EVIDENCE_ACCESS_DENY',
    entity: 'ops.evidence_access_request',
  })
  deny(@Param('id') id: string, @Body() body: DecideAccessRequestInput) {
    return this.commands.decideAccess(id, 'deny', body ?? {});
  }

  @Post(':id/deliver')
  @HttpCode(200)
  @Action('deliver')
  @Audit({
    action: 'OPS_EVIDENCE_ACCESS_DELIVER',
    entity: 'ops.evidence_access_request',
  })
  deliver(@Param('id') id: string, @Body() body: DeliverAccessRequestInput) {
    return this.commands.deliverAccess(id, body);
  }
}
