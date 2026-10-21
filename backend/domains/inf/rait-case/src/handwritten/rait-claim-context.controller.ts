import { Controller, Get, Query, Req } from '@nestjs/common';
import { Action, Resource, NoIdempotent } from '@detran/shared';
import { RaitClaimContextService } from './rait-claim-context.service.js';
import type { RaitScopeRequest } from './rait-case-scope.service.js';
@Controller('v1/inf/rait')
export class RaitClaimContextController {
  constructor(private readonly service: RaitClaimContextService) {}
  @Get('claim-context')
  @Resource('inf:rait-case')
  @Action('claim-next')
  @NoIdempotent()
  read(
    @Query() query: Record<string, unknown>,
    @Req() request: RaitScopeRequest,
  ) {
    return this.service.read(query, request.principal);
  }
}
