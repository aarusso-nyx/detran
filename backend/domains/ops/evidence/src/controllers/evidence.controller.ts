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
import type { CreateEvidenceDto } from '../dto/create-evidence.dto.js';
import { EvidenceService } from '../services/evidence.service.js';

@Controller('v1/ops/evidence/evidence')
@Resource('ops:evidence')
export class EvidenceController {
  constructor(private readonly service: EvidenceService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_EVIDENCE_EVIDENCE_CREATE',
    entity: 'ops.evidence_evidence',
  })
  create(@Body() dto: CreateEvidenceDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_EVIDENCE_EVIDENCE_UPDATE',
    entity: 'ops.evidence_evidence',
  })
  update(@Param('id') id: string, @Body() dto: Partial<CreateEvidenceDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_EVIDENCE_EVIDENCE_DELETE',
    entity: 'ops.evidence_evidence',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
