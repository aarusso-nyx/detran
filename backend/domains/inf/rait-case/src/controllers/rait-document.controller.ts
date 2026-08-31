// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:9d98d9786bc2f4b27bd75cb5516d4a00b6d74e520f3dbc52c39f33effb27f60e
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

@Controller('v1/inf/raitdocuments')
@Resource('inf:rait-document')
export class RaitDocumentController {
  constructor(private readonly service: RaitDocumentService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_DOCUMENT_CREATE', entity: 'inf.rait_document' })
  create(@Body() dto: CreateRaitDocumentDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_DOCUMENT_UPDATE', entity: 'inf.rait_document' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitDocumentDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_DOCUMENT_DELETE', entity: 'inf.rait_document' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
