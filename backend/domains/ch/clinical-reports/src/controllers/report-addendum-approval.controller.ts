// Generated from BP-CH-REPORTS-001 v1.2.0 sha256:5045696b00b62bf7bd1c4ae7976e61f61de9954c392aed7987edaa45ba169501
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
import type { CreateReportAddendumApprovalDto } from '../dto/create-report-addendum-approval.dto.js';
import { ReportAddendumApprovalService } from '../services/report-addendum-approval.service.js';

@Controller('v1/ch/report-addendum-approvals')
@Resource('ch:report-addendum-approval')
export class ReportAddendumApprovalController {
  constructor(private readonly service: ReportAddendumApprovalService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
