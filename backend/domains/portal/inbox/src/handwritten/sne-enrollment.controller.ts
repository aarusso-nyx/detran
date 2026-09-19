// `/v1/portal/sne/enrollment` — leitura, adesão e cancelamento do SNE
// (work/rounds/R-0009/contracts/CTG-0002.md §2.4, §4, §6.2; plan R-0009 M9,
// M15, M19, M20, adendas A1(a), A4(a)). A adesão é rota M9: `@NoIdempotent()`
// anula o interceptor do kernel e o handler assume a idempotência com
// `PortalIdempotencyService` (400 `PORTAL.VALIDATION_FAILED { fields:
// ['Idempotency-Key'] }` na ausência; replay com `Idempotency-Replayed: true`;
// 409 `IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY` em corpo divergente). O
// cancelamento usa a idempotência do kernel.
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { z } from 'zod';
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
  PortalIdentityService,
  parsePortalBody,
  portalIdentityOf,
  type PortalIdentityClaims,
  type PortalIdentityRequest,
  type PortalSubjectRecord,
} from '@detran/portal-identity';
import { PortalIdempotencyService } from '@detran/portal-requests';

import {
  PortalSneEnrollmentService,
  type SneEnrollmentView,
} from './sne-enrollment.service.js';

/** Forma mínima da resposta para status e cabeçalhos (padrão de `inf/ait`). */
interface ResponseLike {
  setHeader(name: string, value: string): unknown;
  status(code: number): unknown;
}

type CitizenRequest = RequestLike & PortalIdentityRequest;
type PortalHeaders = Record<string, string | string[] | undefined>;

const REPLAYED_HEADER = 'Idempotency-Replayed';

/** Rota M9 como o §4 a grava (`${METHOD} ${template}`). */
export const SNE_ENROLLMENT_ROUTE_KEY = 'POST /v1/portal/sne/enrollment';

/** Corpo opcional do cancelamento (route contract §5.1 `cancelamento_sne`). */
const CANCEL_BODY = z.strictObject({ reason: z.string().max(2000).optional() });

export interface SneCancelView extends SneEnrollmentView {
  cancelledAt: string;
}

@Controller('v1/portal/sne')
@UseGuards(PortalCitizenGuard)
@Resource('portal:sne-enrollment')
export class PortalSneEnrollmentController {
  constructor(
    private readonly enrollment: PortalSneEnrollmentService,
    private readonly identity: PortalIdentityService,
    private readonly idempotency: PortalIdempotencyService,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Get('enrollment')
  @Action('read')
  get(@Req() request: CitizenRequest): Promise<SneEnrollmentView> {
    return this.withSubject(portalIdentityOf(request), (tx, subject) =>
      this.enrollment.get(tx, subject),
    );
  }

  @Post('enrollment')
  @Action('enroll')
  @NoIdempotent()
  @Audit({
    action: 'PORTAL_SNE_ENROLLMENT_ENROLL',
    entity: 'portal.sne_enrollment',
  })
  async enroll(
    @Req() request: CitizenRequest,
    @Body() body: unknown,
    @Headers() headers: PortalHeaders,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<SneEnrollmentView> {
    const identity = portalIdentityOf(request);
    const outcome = await this.withSubject(
      identity,
      async (
        tx,
        subject,
      ): Promise<{
        status: number;
        body: SneEnrollmentView;
        replayed: boolean;
      }> => {
        const begun = await this.idempotency.begin(tx, {
          scope: subject.subjectId,
          header: headers['idempotency-key'],
          route: SNE_ENROLLMENT_ROUTE_KEY,
          body,
        });
        if (begun.replay) {
          return {
            status: begun.replay.status,
            body: begun.replay.body as SneEnrollmentView,
            replayed: true,
          };
        }
        const enrolled = await this.enrollment.enroll(
          tx,
          subject,
          identity,
          body,
        );
        const view: SneEnrollmentView = {
          enrolled: enrolled.enrolled,
          since: enrolled.since,
          channel: enrolled.channel,
          cancelable: enrolled.cancelable,
        };
        await begun.record(201, view);
        return { status: 201, body: view, replayed: false };
      },
    );
    res.status(outcome.status);
    if (outcome.replayed) res.setHeader(REPLAYED_HEADER, 'true');
    return outcome.body;
  }

  @Delete('enrollment')
  @Action('cancel')
  @Audit({
    action: 'PORTAL_SNE_ENROLLMENT_CANCEL',
    entity: 'portal.sne_enrollment',
  })
  cancel(
    @Req() request: CitizenRequest,
    @Body() body: unknown,
  ): Promise<SneCancelView> {
    const identity = portalIdentityOf(request);
    const input = parsePortalBody(CANCEL_BODY, body);
    return this.withSubject(identity, async (tx, subject) => {
      const cancelled = await this.enrollment.cancel(
        tx,
        subject,
        identity,
        input.reason,
      );
      return {
        enrolled: cancelled.enrolled,
        since: cancelled.since,
        channel: cancelled.channel,
        cancelable: cancelled.cancelable,
        cancelledAt: cancelled.cancelledAt,
      };
    });
  }

  /** Transação única de tenant por rota (§0) com o sujeito garantido. */
  private withSubject<T>(
    identity: PortalIdentityClaims,
    work: (tx: Transaction, subject: PortalSubjectRecord) => Promise<T>,
  ): Promise<T> {
    return withTenantContext(this.database, this.requestContext, async (tx) =>
      work(tx, await this.identity.upsertSubject(tx, identity, null)),
    );
  }
}
