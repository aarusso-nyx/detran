// Generated from BP-CH-INCONSISTENCIES-001 v1.0.0 sha256:8d41845822fa8f12974a6647c408a271a91454cc1edf96a2d24a695385b1f72e
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
import type { CreateInconsistencyDto } from '../dto/create-inconsistency.dto.js';
import { InconsistencyService } from '../services/inconsistency.service.js';

@Controller('v1/ch/inconsistencies/records')
@Resource('ch:inconsistency')
export class InconsistencyController {
  constructor(private readonly service: InconsistencyService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
