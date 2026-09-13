// Generated from BP-CH-RESTRICTIONS-001 v1.0.0 sha256:05527c0aea012ece64e79955246e666899d444700b824e484f1800ff151769bf
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
import type { CreateRestrictionCodeDto } from '../dto/create-restriction-code.dto.js';
import { RestrictionCodeService } from '../services/restriction-code.service.js';

@Controller('v1/ch/restrictions/codes')
@Resource('ch:restriction')
export class RestrictionCodeController {
  constructor(private readonly service: RestrictionCodeService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
