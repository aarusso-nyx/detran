// `/v1/portal/identity/representations` — apresentação, lista e revogação da
// procuração (work/rounds/R-0009/contracts/CTG-0002.md §2.1; plan R-0009 M6,
// M19, M20; [WF-PORTAL-002]). Nível do ato `procuracao` (`assertActLevel`,
// CTG-0001 §4) antes de gravar; validação/recusa não têm rota nesta rodada
// (OD-P37: `PortalIdentityService.validateRepresentation` interno). Sem
// `ETag`: `portal.representation` não tem `version` (D-CTG2-1).
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import { z } from 'zod';
import {
  Action,
  Audit,
  Resource,
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
  type PortalRepresentationResponse,
} from './identity.service.js';
import { parsePortalBody } from './validation.js';

export const REPRESENTATION_ACT_KEY = 'procuracao';
export const REPRESENTATIONS_ROUTE = '/v1/portal/identity/representations';

export const REPRESENTATION_BODY = z.strictObject({
  representedCpf: z.string().regex(/^\d{11}$/),
  representedName: z.string().min(1),
  instrumentDocumentId: z.uuid(),
  scope: z.enum(['ait', 'all']),
  validUntil: z.iso.date().optional(),
});

type CitizenRequest = RequestLike & PortalIdentityRequest;

@Controller('v1/portal/identity/representations')
@UseGuards(PortalCitizenGuard)
@Resource('portal:identity')
export class PortalRepresentationsController {
  constructor(
    private readonly identity: PortalIdentityService,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Post()
  @Action('represent')
  @Audit({
    action: 'PORTAL_REPRESENTATION_CREATE',
    entity: 'portal.representation',
  })
  create(
    @Req() request: CitizenRequest,
    @Body() body: unknown,
  ): Promise<PortalRepresentationResponse> {
    const identity = portalIdentityOf(request);
    const input = parsePortalBody(REPRESENTATION_BODY, body);
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      await this.identity.assertActLevel(
        tx,
        identity,
        REPRESENTATION_ACT_KEY,
        REPRESENTATIONS_ROUTE,
      );
      const subject = await this.identity.upsertSubject(tx, identity, null);
      return this.identity.createRepresentation(
        tx,
        identity,
        subject.subjectId,
        input,
      );
    });
  }

  @Get()
  @Action('read')
  list(
    @Req() request: CitizenRequest,
  ): Promise<PortalRepresentationResponse[]> {
    const identity = portalIdentityOf(request);
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const subject = await this.identity.upsertSubject(tx, identity, null);
      return this.identity.listRepresentations(tx, subject.subjectId);
    });
  }

  @Delete(':id')
  @HttpCode(200)
  @Action('represent')
  @Audit({
    action: 'PORTAL_REPRESENTATION_DELETE',
    entity: 'portal.representation',
  })
  revoke(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
  ): Promise<
    Pick<PortalRepresentationResponse, 'id' | 'state' | 'validUntil'>
  > {
    const identity = portalIdentityOf(request);
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const subject = await this.identity.upsertSubject(tx, identity, null);
      return this.identity.revokeRepresentation(tx, subject.subjectId, id);
    });
  }
}
