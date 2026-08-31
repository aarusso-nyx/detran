// Generated from BP-CH-REPORTS-001 v1.0.0 sha256:959226a383e0fb64d104a887fe34cb5dba462d875869163a39abc94227f6f966
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
import type { CreateClinicalDocumentDto } from '../dto/create-clinical-document.dto.js';
import { ClinicalDocumentService } from '../services/clinical-document.service.js';

@Controller('v1/ch/documents')
@Resource('ch:document')
export class ClinicalDocumentController {
  constructor(private readonly service: ClinicalDocumentService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
