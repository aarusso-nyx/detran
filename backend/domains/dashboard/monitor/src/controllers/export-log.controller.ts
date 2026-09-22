// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
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
import type { CreateExportLogDto } from '../dto/create-export-log.dto.js';
import { ExportLogService } from '../services/export-log.service.js';

@Controller('v1/dashboard/exports')
@Resource('dashboard:export')
export class ExportLogController {
  constructor(private readonly service: ExportLogService) {}
}
