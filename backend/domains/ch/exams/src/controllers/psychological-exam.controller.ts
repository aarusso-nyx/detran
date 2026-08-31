// Generated from BP-CH-EXAMS-001 v1.0.0 sha256:b8585266a2e5ca4734d9b60ec5bade83fc01a1b209d3b3dbd1729a16a6b03734
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
import type { CreatePsychologicalExamDto } from '../dto/create-psychological-exam.dto.js';
import { PsychologicalExamService } from '../services/psychological-exam.service.js';

@Controller('v1/ch/exams/psychological')
@Resource('ch:exam')
export class PsychologicalExamController {
  constructor(private readonly service: PsychologicalExamService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
