import { Controller, Get, Param, Req } from '@nestjs/common';
import { Resource, Action, NoIdempotent } from '@detran/shared';
import { RaitCaseRiskService } from './rait-case-risk.service.js';
import type { RaitScopeRequest } from './rait-case-scope.service.js';
@Controller('v1/inf/rait')
export class RaitCaseRiskController {
  constructor(private readonly service: RaitCaseRiskService) {}
  @Get('cases/:id/risk')
  @Resource('inf:rait-case')
  @Action('read')
  @NoIdempotent()
  read(@Param('id') id: string, @Req() request: RaitScopeRequest) {
    return this.service.read(id, request.principal);
  }
}
