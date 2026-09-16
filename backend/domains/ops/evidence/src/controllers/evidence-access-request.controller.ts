// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:7c0a0e3e7c424b57f2ad54fff4a784959470ca1969c50cf0cc9e0af6daaa16c4
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
