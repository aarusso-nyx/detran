// `/v1/portal/inbox`, `/v1/portal/inbox/{id}/read` e `/v1/portal/push-subscriptions`
// (work/rounds/R-0009/contracts/CTG-0002.md §2.4; plan R-0009 M15, M19, M20).
// O controlador só extrai identidade, parâmetros e corpo, abre a transação
// de tenant (`withTenantContext`, ADR-0002), garante o sujeito (upsert
// idempotente, CTG-0001 §8) e delega a `PortalInboxService`. `Idempotency-Key`
// das duas mutações é do kernel (`@Action` ⇒ `@Idempotent()`); a leitura é
// idempotente por desenho (§6.1).
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import {
  Action,
  Audit,
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

import {
  PortalInboxService,
  type InboxItemResponse,
  type InboxReadResponse,
  type PortalInboxQuery,
  type PushSubscriptionResponse,
} from './inbox.service.js';

type CitizenRequest = RequestLike & PortalIdentityRequest;

@Controller('v1/portal')
@UseGuards(PortalCitizenGuard)
@Resource('portal:inbox')
export class PortalInboxController {
  constructor(
    private readonly inbox: PortalInboxService,
    private readonly identity: PortalIdentityService,
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
  @Audit({
    action: 'PORTAL_PUSH_SUBSCRIPTION_CREATE',
    entity: 'portal.push_subscription',
  })
  subscribePush(
    @Req() request: CitizenRequest,
    @Body() body: unknown,
  ): Promise<PushSubscriptionResponse> {
    return this.withSubject(portalIdentityOf(request), (tx, subject) =>
      this.inbox.subscribePush(tx, subject, body),
    );
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
