// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:9312d2d0009dca8a9a345b86aa4cda330d2bed8e98072f5036909160f5017d1c
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
import type { CreateNormativeDocumentTemplateDto } from '../dto/create-normative-document-template.dto.js';
import { NormativeDocumentTemplateService } from '../services/normative-document-template.service.js';

@Controller('v1/inf/normative/document-templates')
@Resource('inf:document-template')
export class NormativeDocumentTemplateController {
  constructor(private readonly service: NormativeDocumentTemplateService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_NORMATIVE_DOCUMENT_TEMPLATE_CREATE',
    entity: 'inf.normative_document_template',
  })
  create(@Body() dto: CreateNormativeDocumentTemplateDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_NORMATIVE_DOCUMENT_TEMPLATE_UPDATE',
    entity: 'inf.normative_document_template',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateNormativeDocumentTemplateDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_NORMATIVE_DOCUMENT_TEMPLATE_DELETE',
    entity: 'inf.normative_document_template',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
