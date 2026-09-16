// Generated from BP-OPS-SNAPSHOTS-001 v1.1.0 sha256:c995962d248172eeb08cd92993fc4cafac0eada70cdbf240c54a4c69ce94edc4
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
}
