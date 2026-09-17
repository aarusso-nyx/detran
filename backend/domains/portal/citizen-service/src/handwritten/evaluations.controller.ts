// `POST /v1/portal/evaluations` (work/rounds/R-0009/contracts/CTG-0002.md §2.6,
// §4; plan R-0009 M9, M19, M20, adenda A4(a)). Rota M9: `@NoIdempotent()` e o
// serviço assume a idempotência; `Idempotency-Replayed: true` no replay.
import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import {
  Action,
  Audit,
  NoIdempotent,
  Resource,
  withTenantContext,
  type RequestLike,
} from '@detran/shared';
import {
  PortalCitizenGuard,
  portalIdentityOf,
  type PortalIdentityRequest,
} from '@detran/portal-identity';

import {
  PortalEvaluationService,
  type EvaluationResponse,
} from './evaluation.service.js';
import {
  isReplayedResponse,
  type PortalHeaders,
} from './manifestation.service.js';

/** Forma mínima da resposta para status e cabeçalhos (padrão de `inf/ait`). */
interface ResponseLike {
  setHeader(name: string, value: string): unknown;
  status(code: number): unknown;
}

type CitizenRequest = RequestLike & PortalIdentityRequest;

const REPLAYED_HEADER = 'Idempotency-Replayed';

@Controller('v1/portal/evaluations')
@UseGuards(PortalCitizenGuard)
@Resource('portal:evaluation')
export class PortalEvaluationsController {
  constructor(
    private readonly evaluations: PortalEvaluationService,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Post()
  @Action('evaluate')
  @NoIdempotent()
  @Audit({ action: 'PORTAL_EVALUATION_EVALUATE', entity: 'portal.evaluation' })
  async evaluate(
    @Req() request: CitizenRequest,
    @Body() body: unknown,
    @Headers() headers: PortalHeaders,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<EvaluationResponse> {
    const identity = portalIdentityOf(request);
    const response = await withTenantContext(
      this.database,
      this.requestContext,
      (tx) => this.evaluations.evaluate(tx, identity, body, headers),
    );
    res.status(201);
    if (isReplayedResponse(response)) res.setHeader(REPLAYED_HEADER, 'true');
    return response;
  }
}
