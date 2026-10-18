// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
import type { CreateRaitAdmissibilityDto } from '../dto/create-rait-admissibility.dto.js';
import { RaitAdmissibilityService } from '../services/rait-admissibility.service.js';

@Controller('v1/inf/rait/admissibility')
@Resource('inf:rait-admissibility')
export class RaitAdmissibilityController {
  constructor(private readonly service: RaitAdmissibilityService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
