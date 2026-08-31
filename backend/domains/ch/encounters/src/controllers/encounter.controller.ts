// Generated from BP-CH-ENCOUNTERS-001 v1.1.0 sha256:7931238eb7e2720ab74ab9e327a65f946e9feb0fd555a8658cbf413e7db8b48b
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
