// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
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
import type { CreateRaitInquiryDocumentDto } from '../dto/create-rait-inquiry-document.dto.js';
import { RaitInquiryDocumentService } from '../services/rait-inquiry-document.service.js';

@Controller('v1/inf/rait/internal/inquiry-documents')
@Resource('inf:rait-inquiry-document')
export class RaitInquiryDocumentController {
  constructor(private readonly service: RaitInquiryDocumentService) {}
}
