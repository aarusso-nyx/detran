// Generated from BP-CH-EXAMS-001 v1.1.0 sha256:bc8c0fd1f8e0a5a9684ebb7d2165df727ebdb3730cb7cf8f3bb8b106f2990fa9
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
