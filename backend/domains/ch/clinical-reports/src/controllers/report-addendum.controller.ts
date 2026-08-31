// Generated from BP-CH-REPORTS-001 v1.1.0 sha256:beee4caafe2a85a62db62a7c64f47b7e234388f5606028dbc331786eb1e2f350
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
