// `PUT /v1/portal/identity/preferences` (work/rounds/R-0009/contracts/
// CTG-0002.md §2.1; plan R-0009 M9, M19, M20; OD-P38). `@stynx-nyx/preferences`
// não é montado nesta rodada (CTG-0001 §8 `preferences: null`): depois da
// forma (400) e do `If-Match` (428 antes de qualquer leitura) a rota responde
// 422 `PORTAL.SERVICE_UNAVAILABLE { unavailableReason:
// 'preferences_substrato_pendente' }`. `sne_enrollment.channel` (§2.4) é
// outro regime ([WF-PORTAL-003]).
import { Body, Controller, Headers, Put, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { Action, Audit, Resource } from '@detran/shared';

import { PortalCitizenGuard } from './citizen.guard.js';
import { PortalError } from './errors.js';
import { parsePortalBody } from './validation.js';

export const PREFERENCES_UNAVAILABLE_REASON = 'preferences_substrato_pendente';

export const PREFERENCES_BODY = z.strictObject({
  channel: z.enum(['push', 'email', 'sne']),
  pushSubscription: z
    .strictObject({
      endpoint: z.url(),
      keys: z.strictObject({ p256dh: z.string(), auth: z.string() }),
    })
    .optional(),
});

@Controller('v1/portal/identity/preferences')
@UseGuards(PortalCitizenGuard)
@Resource('portal:identity')
export class PortalPreferencesController {
  @Put()
  @Action('update')
  @Audit({ action: 'PORTAL_PREFERENCES_UPDATE', entity: 'portal.subject' })
  update(
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | undefined,
  ): never {
    parsePortalBody(PREFERENCES_BODY, body);
    if (!ifMatch || ifMatch.trim() === '') {
      throw new PortalError('PORTAL.IF_MATCH_REQUIRED', {
        status: 428,
        context: {},
      });
    }
    throw new PortalError('PORTAL.SERVICE_UNAVAILABLE', {
      status: 422,
      context: {
        unavailableReason: PREFERENCES_UNAVAILABLE_REASON,
        alternativeChannelNote: null,
      },
    });
  }
}
