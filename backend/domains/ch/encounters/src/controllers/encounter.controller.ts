// Generated from BP-CH-ENCOUNTERS-001 v1.2.1 sha256:0eae9fa8ccfb086eba21de22f3a9d379e0256092be9e903b2c7feea4c664ec92
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
