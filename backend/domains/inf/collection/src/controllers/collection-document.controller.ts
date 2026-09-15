// Generated from BP-INF-COLLECTION-001 v1.0.0 sha256:72e0af13a687dd9bcaa3931941707644a2214b4ece8daa63d55712fee4ad0243
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
import type { CreateCollectionDocumentDto } from '../dto/create-collection-document.dto.js';
import { CollectionDocumentService } from '../services/collection-document.service.js';

@Controller('v1/inf/collection/collection-documents')
@Resource('inf:collection-document')
export class CollectionDocumentController {
  constructor(private readonly service: CollectionDocumentService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_COLLECTION_DOCUMENT_CREATE',
    entity: 'inf.collection_document',
  })
  create(@Body() dto: CreateCollectionDocumentDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_COLLECTION_DOCUMENT_UPDATE',
    entity: 'inf.collection_document',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateCollectionDocumentDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_COLLECTION_DOCUMENT_DELETE',
    entity: 'inf.collection_document',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
