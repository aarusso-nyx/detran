// Generated from BP-CH-RETENTION-001 v1.0.0 sha256:8a74485eaee2a6dbb8cbc10772396a77b465cdd84cc5a57db0c90035ef24ea78
import { Controller, Get, Param } from '@nestjs/common';
import { Action, Resource } from '@detran/shared';
import { RetentionHoldService } from '../services/retention-hold.service.js';

@Controller('v1/ch/retention/holds')
@Resource('ch:retention')
export class RetentionHoldController {
  constructor(private readonly service: RetentionHoldService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
