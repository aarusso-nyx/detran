// `PUT /v1/portal/identity/preferences` — sem rotas nesta rodada
// (work/rounds/R-0009/contracts/CTG-0001.md §12; plan R-0009 M24):
// `@stynx-nyx/preferences` não é montado em CTG-0001 (`GET me` devolve
// `preferences: null`); a rota é CTG-0002 (TASK-0007). Guarda e recurso já
// declarados.
import { Controller, UseGuards } from '@nestjs/common';
import { Resource } from '@detran/shared';

import { PortalCitizenGuard } from './citizen.guard.js';

@Controller('v1/portal/identity/preferences')
@UseGuards(PortalCitizenGuard)
@Resource('portal:identity')
export class PortalPreferencesController {}
