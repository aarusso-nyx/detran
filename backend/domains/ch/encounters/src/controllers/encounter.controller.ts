// Generated from BP-CH-ENCOUNTERS-001 v1.2.1 sha256:b72b0b7aad32b908d777d9b44b885244d74a7a214c442fecc03551811f18b2fd
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
import type { CreateEncounterDto } from '../dto/create-encounter.dto.js';
import { EncounterService } from '../services/encounter.service.js';

@Controller('v1/ch/encounters')
@Resource('ch:encounter')
export class EncounterController {
  constructor(private readonly service: EncounterService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
