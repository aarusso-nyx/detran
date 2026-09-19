// `GET /v1/portal/service-charter/{serviceKey}/deadline` — prazo máximo por
// serviço da Carta (Lei 13.460 art. 7º §2º IV; work/rounds/R-0009/contracts/
// CTG-0002.md §2.6; plan R-0009 M12, M19). Leitura de `portal.service_catalog`
// do tenant por `service_key` (comparação literal); ausente → 404
// `PORTAL.NOT_FOUND { kind: 'service' }`.
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import { Action, Resource, withTenantContext } from '@detran/shared';
import { PortalCitizenGuard, PortalError } from '@detran/portal-identity';

export interface ServiceCharterDeadlineResponse {
  serviceKey: string;
  legalDeadline: string;
  normativeReference: string;
  availability: 'available' | 'partially_available' | 'unavailable';
}

interface CharterRow extends Record<string, unknown> {
  service_key: string;
  legal_deadline: string;
  normative_reference: string;
  availability: ServiceCharterDeadlineResponse['availability'];
}

const CHARTER_SQL = `select service_key, legal_deadline, normative_reference, availability
     from portal.service_catalog
    where service_key = $1
    limit 1`;

@Controller('v1/portal/service-charter')
@UseGuards(PortalCitizenGuard)
@Resource('portal:service-charter')
export class PortalServiceCharterController {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Get(':serviceKey/deadline')
  @Action('read')
  deadline(
    @Param('serviceKey') serviceKey: string,
  ): Promise<ServiceCharterDeadlineResponse> {
    return withTenantContext(
      this.database,
      this.requestContext,
      async (tx) => {
        const row = (await tx.query<CharterRow>(CHARTER_SQL, [serviceKey]))
          .rows[0];
        if (!row) {
          throw new PortalError('PORTAL.NOT_FOUND', {
            status: 404,
            context: { kind: 'service' },
          });
        }
        return {
          serviceKey: row.service_key,
          legalDeadline: row.legal_deadline,
          normativeReference: row.normative_reference,
          availability: row.availability,
        };
      },
      { readonly: true },
    );
  }
}
