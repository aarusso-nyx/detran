// Generated from BP-CH-ENCOUNTERS-001 v1.0.0 sha256:856ef95ad10256551df6d941644741a6c8521555366f02c422508f242704addd
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
