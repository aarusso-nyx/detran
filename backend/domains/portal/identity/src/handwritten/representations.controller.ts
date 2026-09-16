// `/v1/portal/identity/representations` — sem rotas nesta rodada
// (work/rounds/R-0009/contracts/CTG-0001.md §12; plan R-0009 M24): `POST`,
// `GET` e `DELETE representations[/{id}]` (portal-route-contract.md §3,
// [WF-PORTAL-002]) são CTG-0002 (TASK-0007). Guarda e recurso já declarados.
import { Controller, UseGuards } from '@nestjs/common';
import { Resource } from '@detran/shared';

import { PortalCitizenGuard } from './citizen.guard.js';

@Controller('v1/portal/identity/representations')
@UseGuards(PortalCitizenGuard)
@Resource('portal:identity')
export class PortalRepresentationsController {}
