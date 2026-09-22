// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
import type { CreateGeneratedReportDto } from '../dto/create-generated-report.dto.js';
import { GeneratedReportService } from '../services/generated-report.service.js';

@Controller('v1/dashboard/generated-reports')
@Resource('dashboard:generated-report')
export class GeneratedReportController {
  constructor(private readonly service: GeneratedReportService) {}
}
