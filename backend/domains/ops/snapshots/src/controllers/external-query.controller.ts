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
import type { CreateExternalQueryDto } from '../dto/create-external-query.dto.js';
import { ExternalQueryService } from '../services/external-query.service.js';

@Controller('v1/ops/snapshots/external-queries')
@Resource('ops:external-query')
export class ExternalQueryController {
  constructor(private readonly service: ExternalQueryService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_SNAPSHOTS_EXTERNAL_QUERY_CREATE',
    entity: 'ops.snapshots_external_query',
  })
  create(@Body() dto: CreateExternalQueryDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_SNAPSHOTS_EXTERNAL_QUERY_UPDATE',
    entity: 'ops.snapshots_external_query',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateExternalQueryDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_SNAPSHOTS_EXTERNAL_QUERY_DELETE',
    entity: 'ops.snapshots_external_query',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
