// `/v1/portal/inbox`, `/v1/portal/inbox/{id}/read` e `/v1/portal/push-subscriptions`
// (work/rounds/R-0009/contracts/CTG-0002.md §2.4; plan R-0009 M15, M19, M20).
// O controlador só extrai identidade, parâmetros e corpo, abre a transação
// de tenant (`withTenantContext`, ADR-0002), garante o sujeito (upsert
// idempotente, CTG-0001 §8) e delega a `PortalInboxService`. A inscrição push
// é M9: anula o interceptor do kernel e usa `PortalIdempotencyService`, para
// preservar replay e o conflito Portal canônico (§4 do CTG-0004).
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
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
  portalIdentityOf,
  type PortalIdentityClaims,
  type PortalIdentityRequest,
  type PortalPagedResponse,
  type PortalSubjectRecord,
} from '@detran/portal-identity';
import { PortalIdempotencyService } from '@detran/portal-requests';

import {
  PortalInboxService,
  type InboxItemResponse,
  type InboxReadResponse,
  type PortalInboxQuery,
  type PushSubscriptionResponse,
} from './inbox.service.js';

type CitizenRequest = RequestLike & PortalIdentityRequest;
type PortalHeaders = Record<string, string | string[] | undefined>;

interface ResponseLike {
  setHeader(name: string, value: string): unknown;
  status(code: number): unknown;
}

const PUSH_SUBSCRIPTION_ROUTE_KEY = 'POST /v1/portal/push-subscriptions';
const REPLAYED_HEADER = 'Idempotency-Replayed';

@Controller('v1/portal')
@UseGuards(PortalCitizenGuard)
@Resource('portal:inbox')
export class PortalInboxController {
  constructor(
    private readonly inbox: PortalInboxService,
    private readonly identity: PortalIdentityService,
    private readonly idempotency: PortalIdempotencyService,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Get('inbox')
  @Action('read')
  list(
    @Req() request: CitizenRequest,
    @Query() query: PortalInboxQuery,
  ): Promise<PortalPagedResponse<InboxItemResponse>> {
    return this.withSubject(portalIdentityOf(request), (tx, subject) =>
      this.inbox.list(tx, subject, query ?? {}),
    );
  }

  @Post('inbox/:id/read')
  @HttpCode(200)
  @Action('acknowledge')
  @Audit({ action: 'PORTAL_INBOX_ACKNOWLEDGE', entity: 'portal.inbox_item' })
  read(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
  ): Promise<InboxReadResponse> {
    return this.withSubject(portalIdentityOf(request), (tx, subject) =>
      this.inbox.read(tx, subject, id),
    );
  }

  @Post('push-subscriptions')
  @Resource('portal:push-subscription')
  @Action('create')
  @NoIdempotent()
  @Audit({
    action: 'PORTAL_PUSH_SUBSCRIPTION_CREATE',
    entity: 'portal.push_subscription',
  })
  async subscribePush(
    @Req() request: CitizenRequest,
    @Body() body: unknown,
    @Headers() headers: PortalHeaders,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<PushSubscriptionResponse> {
    const outcome = await this.withSubject(
      portalIdentityOf(request),
      async (tx, subject) => {
        const begun = await this.idempotency.begin(tx, {
          scope: subject.subjectId,
          header: headers['idempotency-key'],
          route: PUSH_SUBSCRIPTION_ROUTE_KEY,
          body,
        });
        if (begun.replay) {
          return {
            body: begun.replay.body as PushSubscriptionResponse,
            replayed: true,
            status: begun.replay.status,
          };
        }
        const subscription = await this.inbox.subscribePush(tx, subject, body);
        await begun.record(201, subscription);
        return { body: subscription, replayed: false, status: 201 };
      },
    );
    res.status(outcome.status);
    if (outcome.replayed) res.setHeader(REPLAYED_HEADER, 'true');
    return outcome.body;
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
