// Generated from BP-CH-ENCOUNTERS-001 v1.0.0 sha256:a45f4d9aa68b80d085d4e052deb019f227158b561404fdd7e02b5260b8347912
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
