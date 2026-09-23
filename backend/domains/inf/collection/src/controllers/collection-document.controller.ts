// Generated from BP-INF-COLLECTION-001 v1.0.2 sha256:10fb057463797bde8609b1b2a33435d80259cd90c69c2e991c5f42e355f924cd
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
