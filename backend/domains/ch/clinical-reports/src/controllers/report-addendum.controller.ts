// Generated from BP-CH-REPORTS-001 v1.0.0 sha256:959226a383e0fb64d104a887fe34cb5dba462d875869163a39abc94227f6f966
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
import type { CreateReportAddendumDto } from '../dto/create-report-addendum.dto.js';
import { ReportAddendumService } from '../services/report-addendum.service.js';

@Controller('v1/ch/report-addenda')
@Resource('ch:report-addendum')
export class ReportAddendumController {
  constructor(private readonly service: ReportAddendumService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
