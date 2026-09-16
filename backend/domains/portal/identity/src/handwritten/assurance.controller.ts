// `POST /v1/portal/identity/assurance/elevations[/{id}/complete]` — sem rotas
// nesta rodada (work/rounds/R-0009/contracts/CTG-0001.md §12; plan R-0009
// M24): as rotas de elevação (portal-route-contract.md §3) são CTG-0002
// (TASK-0007). A classe já declara a guarda de identidade e o recurso para
// que TASK-0007 não os esqueça; sem handlers, `verify:decorators` não a reprova.
import { Controller, UseGuards } from '@nestjs/common';
import { Resource } from '@detran/shared';

import { PortalCitizenGuard } from './citizen.guard.js';

@Controller('v1/portal/identity/assurance')
@UseGuards(PortalCitizenGuard)
@Resource('portal:identity')
export class PortalAssuranceController {}
