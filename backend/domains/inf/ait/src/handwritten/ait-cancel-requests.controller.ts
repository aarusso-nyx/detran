import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  Action,
  Audit,
  Resource,
  assertIfMatch,
  etagOf,
  getPrincipalFromRequest,
  type RequestLike,
} from '@detran/shared';

import { AitLifecycleService } from '../ait-lifecycle.service.js';
import type { CreateCancelRequestInput } from '../ait-lifecycle.service.js';

/** Minimal response shape needed for status/`ETag` (see `ait-commands.controller.ts`). */
interface ResponseLike {
  setHeader(name: string, value: string): unknown;
  status(code: number): unknown;
}

interface CreateAitCancelRequestBody {
  localId?: string;
  entityType: 'ait-cancel-request' | 'ait-cancel-posfinal-request';
  trafficAgencyId?: string;
  agentId?: string;
  deviceId?: string;
  shiftId?: string;
  idempotencyKey?: string;
  targetLocalActId: string;
  targetAitId?: string;
  targetReservedNumber?: number;
  targetContentHash?: string;
  originStatus: string;
  justification: string;
  requestedAt?: string;
  requestedBy?: string;
  addressedTo?: 'traffic-authority' | 'diretoria-fiscalizacao';
  legalBasisNote?: string;
  location?: Record<string, unknown>;
}

interface DecideAitCancelRequestBody {
  decision: 'approve' | 'deny';
  decision_note: string;
  decision_body?: 'traffic-authority' | 'diretoria-fiscalizacao';
  decided_by?: string;
  decided_at?: string;
  decision_legal_basis?: string;
  actor_role?: string;
  linked_measure_decision?: string;
}

/**
 * `POST v1/inf/ait/cancel-requests` and satellites (M4/UC-TEAT-011, CTG-0001
 * §4.15–§4.18 + §12 adenda). Not a satellite of `aits/{id}` — its own
 * controller/resource per the route contract §3.2.
 */
@Controller('v1/inf/ait/cancel-requests')
@Resource('inf:ait-cancel-request')
export class AitCancelRequestsController {
  constructor(private readonly lifecycle: AitLifecycleService) {}

  @Post()
  @Action('create')
  @Audit({ action: 'INF_AIT_CANCEL_REQUEST', entity: 'inf.ait_cancel_request' })
  async create(
    @Body() body: CreateAitCancelRequestBody,
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    // If-Match is only required when `targetAitId` is informed AND the kind
    // is post_final (CTG-0001 §4.15): the transition touches `ait_ait`.
    const kind =
      body.entityType === 'ait-cancel-request' ? 'draft' : 'post_final';
    if (body.targetAitId && kind === 'post_final') {
      const currentVersion = await this.lifecycle.getVersion(body.targetAitId);
      assertIfMatch(ifMatch, currentVersion, 'TEAT');
    }
    const input: CreateCancelRequestInput = body;
    const result = await this.lifecycle.createCancelRequest(input);
    res.status(result.httpStatus);
    if (result.aitVersion !== undefined) {
      res.setHeader('ETag', etagOf(result.aitVersion));
    }
    return result;
  }

  @Post(':id/review')
  @HttpCode(200)
  @Action('review')
  @Audit({ action: 'INF_AIT_CANCEL_REVIEW', entity: 'inf.ait_cancel_request' })
  async review(
    @Param('id') id: string,
    @Body() body: { user_ref?: string },
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    // §13 item 2: `If-Match`/`ETag` are unconditional — `ait_ait.version`
    // when `ait_id` exists, else `ait_cancel_request.version` — never only
    // "when ait_id is present" (delivery-review ciclo 2).
    const summary = await this.lifecycle.getCancelRequestSummary(id);
    assertIfMatch(ifMatch, summary.version, 'TEAT');
    const result = await this.lifecycle.reviewCancelRequest(id, body.user_ref);
    // `review` never transitions the AIT, so when `ait_id` is present the
    // version it answers with is the same `ait_ait.version` it checked;
    // when `ait_id` is null, `reviewCancelRequest` bumps the cancel
    // request's own version and returns it.
    res.setHeader(
      'ETag',
      etagOf(summary.aitId ? summary.version : result.version),
    );
    return result;
  }

  @Post(':id/decide')
  @HttpCode(200)
  @Action('decide')
  @Audit({ action: 'INF_AIT_CANCEL_DECIDE', entity: 'inf.ait_cancel_request' })
  async decide(
    @Param('id') id: string,
    @Body() body: DecideAitCancelRequestBody,
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
    @Req() req: RequestLike,
  ) {
    const principal = getPrincipalFromRequest(req);
    // §13 item 2: unconditional, same as `review` above.
    const summary = await this.lifecycle.getCancelRequestSummary(id);
    assertIfMatch(ifMatch, summary.version, 'TEAT');
    const result = await this.lifecycle.decideCancelRequest(
      id,
      body.decision,
      body.decision_note,
      body.decided_by ?? principal?.id,
      {
        decidedAt: body.decided_at,
        decisionLegalBasis: body.decision_legal_basis,
        decisionBody: body.decision_body,
        linkedMeasureDecision: body.linked_measure_decision,
        actorRole: body.actor_role,
        principal,
      },
    );
    // With `ait_id` present, the ETag reflects `ait_ait.version`
    // (`result.ait.version`, incremented by the transition); when null,
    // `result.version` is the cancel request's own incremented version.
    res.setHeader('ETag', etagOf(result.ait?.version ?? result.version));
    return result;
  }

  @Get('outcomes/:targetLocalActId')
  @Action('read')
  outcomes(@Param('targetLocalActId') targetLocalActId: string) {
    return this.lifecycle.getCancelRequestOutcomes(targetLocalActId);
  }
}
