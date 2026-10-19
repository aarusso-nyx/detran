// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
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
import type { CreateRaitDocumentDto } from '../dto/create-rait-document.dto.js';
import { RaitDocumentService } from '../services/rait-document.service.js';

@Controller('v1/inf/rait/documents')
@Resource('inf:rait-document')
export class RaitDocumentController {
  constructor(private readonly service: RaitDocumentService) {}
}
