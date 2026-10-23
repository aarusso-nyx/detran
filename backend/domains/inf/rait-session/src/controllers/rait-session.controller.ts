// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
import { Controller, Get, Param } from '@nestjs/common';
import { Action, Resource } from '@detran/shared';
import { RaitSessionService } from '../services/rait-session.service.js';

@Controller('v1/inf/rait/sessions')
@Resource('inf:rait-session')
export class RaitSessionController {
  constructor(private readonly service: RaitSessionService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
