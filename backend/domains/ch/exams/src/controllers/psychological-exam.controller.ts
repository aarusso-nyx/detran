// Generated from BP-CH-EXAMS-001 v1.0.0 sha256:4768197f351ea702628ed5198543624eb79b54621bfc8fb4c6383ecc414b17b9
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
