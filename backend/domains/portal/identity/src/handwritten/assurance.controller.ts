// `POST /v1/portal/identity/assurance/elevations[/{id}/complete]`
// (work/rounds/R-0009/contracts/CTG-0002.md §2.1; plan R-0009 M19, M20;
// ADR-0024 §Consequences, OD-P15). Nesta rodada não há cliente OIDC gov.br:
// depois da forma (400) as duas rotas respondem 422 `PORTAL.SERVICE_UNAVAILABLE
// { unavailableReason: 'elevacao_govbr_pendente_r0014' }`; nada é armazenado
// e `NIVEL_ASSINATURA_ELEVADO` (events.ts) só será publicado pelo `complete`
// real (R-0014). As rotas existem para a matriz política ⇔ rotas fechar (§10).
import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { Action, Audit, Resource } from '@detran/shared';

import { PortalCitizenGuard } from './citizen.guard.js';
import { PortalError } from './errors.js';
import { PORTAL_ELEVATION_METHODS } from './identity.service.js';
import { parsePortalBody } from './validation.js';

export const ELEVATION_UNAVAILABLE_REASON = 'elevacao_govbr_pendente_r0014';

export const ELEVATION_BODY = z.strictObject({
  targetLevel: z.literal('avancada'),
  method: z.enum(PORTAL_ELEVATION_METHODS),
  resumeRoute: z.string().min(1).startsWith('/'),
});

export const ELEVATION_COMPLETE_BODY = z.strictObject({
  resumeToken: z.string().min(1),
});

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function elevationUnavailable(): PortalError {
  return new PortalError('PORTAL.SERVICE_UNAVAILABLE', {
    status: 422,
    context: {
      unavailableReason: ELEVATION_UNAVAILABLE_REASON,
      alternativeChannelNote: null,
    },
  });
}

@Controller('v1/portal/identity/assurance')
@UseGuards(PortalCitizenGuard)
@Resource('portal:identity')
export class PortalAssuranceController {
  @Post('elevations')
  @Action('elevate')
  @Audit({ action: 'PORTAL_IDENTITY_ELEVATE', entity: 'portal.subject' })
  createElevation(@Body() body: unknown): never {
    parsePortalBody(ELEVATION_BODY, body);
    throw elevationUnavailable();
  }

  @Post('elevations/:id/complete')
  @Action('elevate')
  @Audit({ action: 'PORTAL_IDENTITY_ELEVATE', entity: 'portal.subject' })
  completeElevation(@Param('id') id: string, @Body() body: unknown): never {
    if (!UUID_RE.test(id)) {
      throw new PortalError('PORTAL.VALIDATION_FAILED', {
        status: 400,
        context: { fields: ['id'] },
      });
    }
    parsePortalBody(ELEVATION_COMPLETE_BODY, body);
    throw elevationUnavailable();
  }
}
