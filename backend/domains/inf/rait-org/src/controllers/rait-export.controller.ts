// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
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
import type { CreateRaitExportDto } from '../dto/create-rait-export.dto.js';
import { RaitExportService } from '../services/rait-export.service.js';

@Controller('v1/inf/rait/exports')
@Resource('inf:rait-export')
export class RaitExportController {
  constructor(private readonly service: RaitExportService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_EXPORT_CREATE', entity: 'inf.rait_export' })
  create(@Body() dto: CreateRaitExportDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_EXPORT_UPDATE', entity: 'inf.rait_export' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitExportDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_EXPORT_DELETE', entity: 'inf.rait_export' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
