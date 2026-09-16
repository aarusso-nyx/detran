// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:e739cf21c78ced39113911fbf0c9950d0c2091ab58cc4efedee4225786fe9eac
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
import type { CreateEvidenceAccessRequestDto } from '../dto/create-evidence-access-request.dto.js';
import { EvidenceAccessRequestService } from '../services/evidence-access-request.service.js';

@Controller('v1/ops/evidence/evidence-access-requests')
@Resource('ops:evidence-access-request')
export class EvidenceAccessRequestController {
  constructor(private readonly service: EvidenceAccessRequestService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
