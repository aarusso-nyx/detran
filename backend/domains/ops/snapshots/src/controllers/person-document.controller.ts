// Generated from BP-OPS-SNAPSHOTS-001 v1.0.0 sha256:bebc10f45ae4f8887acc821ee7211894780dd9bd4b5a67d1edfbd371f54a21c4
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
import type { CreatePersonDocumentDto } from '../dto/create-person-document.dto.js';
import { PersonDocumentService } from '../services/person-document.service.js';

@Controller('v1/ops/snapshots/person-documents')
@Resource('ops:person-document')
export class PersonDocumentController {
  constructor(private readonly service: PersonDocumentService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_SNAPSHOTS_PERSON_DOCUMENT_CREATE',
    entity: 'ops.snapshots_person_document',
  })
  create(@Body() dto: CreatePersonDocumentDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_SNAPSHOTS_PERSON_DOCUMENT_UPDATE',
    entity: 'ops.snapshots_person_document',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreatePersonDocumentDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_SNAPSHOTS_PERSON_DOCUMENT_DELETE',
    entity: 'ops.snapshots_person_document',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
