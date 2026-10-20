import { Injectable } from '@nestjs/common';
import {
  RaitCaseRiskService,
  type RaitScopePrincipal,
} from '@detran/inf-rait-case';
/** A projection of CASE's public current-risk reader; no second risk implementation. */
@Injectable()
export class RaitRiskProjectionService {
  constructor(private readonly risk: RaitCaseRiskService) {}
  read(caseId: string, principal: RaitScopePrincipal | undefined) {
    return this.risk.read(caseId, principal);
  }
}
