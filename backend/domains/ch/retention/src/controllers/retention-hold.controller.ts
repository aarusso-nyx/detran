// Generated from BP-CH-RETENTION-001 v1.0.0 sha256:8a74485eaee2a6dbb8cbc10772396a77b465cdd84cc5a57db0c90035ef24ea78
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import type { CreateRetentionHoldDto } from '../dto/create-retention-hold.dto.js';
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
