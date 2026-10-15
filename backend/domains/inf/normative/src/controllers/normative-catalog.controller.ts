// Generated from BP-INF-NORMATIVE-001 v1.2.0 sha256:ce4605cd48d6677dc9c5dd6373c5e2500e57fbd2f114d497422e06914a937588
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
import type { CreateNormativeCatalogDto } from '../dto/create-normative-catalog.dto.js';
import { NormativeCatalogService } from '../services/normative-catalog.service.js';

@Controller('v1/inf/normative/catalogs')
@Resource('inf:normative-catalog')
export class NormativeCatalogController {
  constructor(private readonly service: NormativeCatalogService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_NORMATIVE_CATALOG_CREATE',
    entity: 'inf.normative_catalog',
  })
  create(@Body() dto: CreateNormativeCatalogDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_NORMATIVE_CATALOG_UPDATE',
    entity: 'inf.normative_catalog',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateNormativeCatalogDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_NORMATIVE_CATALOG_DELETE',
    entity: 'inf.normative_catalog',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
