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
import type { CreateMedicalExamDto } from '../dto/create-medical-exam.dto.js';
import { MedicalExamService } from '../services/medical-exam.service.js';

@Controller('v1/ch/exams/medical')
@Resource('ch:exam')
export class MedicalExamController {
  constructor(private readonly service: MedicalExamService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
