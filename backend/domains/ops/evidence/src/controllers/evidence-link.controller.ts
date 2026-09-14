// Generated from BP-OPS-EVIDENCE-001 v1.0.0 sha256:a8692e7ee4171aea45d3aa6a8ca457251f3005b1dc05d1b03e2aa5ebc8f1923f
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
import type { CreateEvidenceLinkDto } from '../dto/create-evidence-link.dto.js';
import { EvidenceLinkService } from '../services/evidence-link.service.js';

@Controller('v1/ops/evidence/links')
@Resource('ops:evidence-link')
export class EvidenceLinkController {
  constructor(private readonly service: EvidenceLinkService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'OPS_EVIDENCE_LINK_CREATE', entity: 'ops.evidence_link' })
  create(@Body() dto: CreateEvidenceLinkDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'OPS_EVIDENCE_LINK_UPDATE', entity: 'ops.evidence_link' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateEvidenceLinkDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'OPS_EVIDENCE_LINK_DELETE', entity: 'ops.evidence_link' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
