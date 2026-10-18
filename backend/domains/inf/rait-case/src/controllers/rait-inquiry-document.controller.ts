// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
