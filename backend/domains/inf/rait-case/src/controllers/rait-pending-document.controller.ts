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
import type { CreateRaitPendingDocumentDto } from '../dto/create-rait-pending-document.dto.js';
import { RaitPendingDocumentService } from '../services/rait-pending-document.service.js';

@Controller('v1/inf/rait/internal/pending-documents')
@Resource('inf:rait-pending-document')
export class RaitPendingDocumentController {
  constructor(private readonly service: RaitPendingDocumentService) {}
}
