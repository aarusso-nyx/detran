// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
import { Controller } from '@nestjs/common';
import { Resource } from '@detran/shared';
import { CrashReportDocumentService } from '../services/crash-report-document.service.js';

@Controller('v1/est/crash/report-documents')
@Resource('est:crash-report-document')
export class CrashReportDocumentController {
  constructor(private readonly service: CrashReportDocumentService) {}
}
