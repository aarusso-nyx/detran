// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
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
