// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
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
import type { CreateCrashReportDocumentDto } from '../dto/create-crash-report-document.dto.js';
import { CrashReportDocumentService } from '../services/crash-report-document.service.js';

@Controller('v1/est/crash/report-documents')
@Resource('est:crash-report-document')
export class CrashReportDocumentController {
  constructor(private readonly service: CrashReportDocumentService) {}
}
