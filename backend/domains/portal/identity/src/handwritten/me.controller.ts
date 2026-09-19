// `GET /v1/portal/identity/me` (work/rounds/R-0009/contracts/CTG-0001.md §8;
// portal-route-contract.md §3; plan R-0009 M4, M6, M20). Leitura de dado
// pessoal: `@Audit` obrigatório (RN-PORTAL-118 4). O controlador só extrai a
// identidade validada pela guarda e delega ao serviço numa única transação
// de tenant (`withTenantContext`, ADR-0002).
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import {
  Action,
  Audit,
  Resource,
  getPrincipalFromRequest,
  withTenantContext,
  type RequestLike,
} from '@detran/shared';

import {
  PortalCitizenGuard,
  portalIdentityOf,
  type PortalIdentityRequest,
} from './citizen.guard.js';
import {
  PortalIdentityService,
  type PortalMeResponse,
} from './identity.service.js';

@Controller('v1/portal/identity')
@UseGuards(PortalCitizenGuard)
@Resource('portal:identity')
export class PortalMeController {
  constructor(
    private readonly identity: PortalIdentityService,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Get('me')
  @Action('read')
  @Audit({ action: 'PORTAL_IDENTITY_READ', entity: 'portal.subject' })
  me(
    @Req() request: RequestLike & PortalIdentityRequest,
  ): Promise<PortalMeResponse> {
    const identity = portalIdentityOf(request);
    // Claim OIDC `name` quando string (§7.1; mapeamento gov.br source_pending, OD-P15).
    const name = getPrincipalFromRequest(request)?.claims?.name;
    return withTenantContext(this.database, this.requestContext, (tx) =>
      this.identity.readMe(
        tx,
        identity,
        typeof name === 'string' ? name : null,
      ),
    );
  }
}
